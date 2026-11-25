import crypto from "crypto";
import { Request, Response } from "express";
import { getCentralPrisma } from "../prisma-client/central-client";
import { signJson } from "../services/licenseCrypto";

/**
 * HOSTED PORTAL side of EXE activation.
 *  - SaaS admin creates activation keys (bound to an institute + company, with a PC limit).
 *  - The EXE activates with the key: the portal registers the PC and returns a SIGNED licence.
 *  - Institute super admin / SaaS admin can deactivate an old PC (limited by transferLimit) so
 *    its slot can be used by a new one.
 */
const STANDALONE_DAYS = 364;
const DAY = 24 * 60 * 60 * 1000;

const normKey = (k: unknown) => String(k ?? "").trim().toUpperCase();

export function generateKey(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
  const part = () =>
    Array.from(crypto.randomBytes(4), (b) => alphabet[b % alphabet.length]).join("");
  return `VCIN-${part()}-${part()}-${part()}-${part()}`;
}

/**
 * Standalone validity = the later of (first activation + 364 days) and the institute's
 * paid subscription expiry. A SUSPENDED subscription ends validity immediately.
 * Renewing online (payment or SaaS admin) therefore restores access at the next licence refresh.
 */
export async function licenseValidUntil(prisma: any, key: any): Promise<Date> {
  const first: Date = key.firstActivatedAt ?? new Date();
  let until = new Date(first.getTime() + STANDALONE_DAYS * DAY);
  const tenant = await prisma.tenant.findUnique({ where: { id: key.tenantId } });
  if (tenant?.email) {
    const sub = await prisma.portalSubscription.findUnique({ where: { email: tenant.email } });
    if (sub) {
      if (sub.status === "SUSPENDED" || sub.status === "REVOKED") return new Date(0);
      if (sub.status === "ACTIVE" && sub.plan !== "NONE" && sub.expiryDate > until) until = sub.expiryDate;
    }
  }
  return until;
}

async function issueLicense(prisma: any, key: any, device: any, nonce?: string) {
  const validUntil = await licenseValidUntil(prisma, key);
  return signJson("ACTIVATION", {
    keyId: key.id,
    institute: key.instituteName,
    company: key.companyName,
    deviceId: device.deviceId,
    deviceName: device.deviceName,
    activatedAt: device.activatedAt.toISOString(),
    validUntil: validUntil.toISOString(),
    maxDevices: key.maxActivations,
    issuedAt: new Date().toISOString(), // trusted server time
    nonce: nonce ? String(nonce).slice(0, 64) : undefined,
  });
}

// ---------------- EXE-facing (public, rate limited) ----------------

export async function activateDevice(req: Request, res: Response) {
  const key = normKey(req.body?.key);
  const deviceId = String(req.body?.deviceId ?? "").trim();
  const deviceName = String(req.body?.deviceName ?? "Unknown PC").slice(0, 80);
  const os = String(req.body?.os ?? "").slice(0, 80);
  if (!key || !/^[a-f0-9]{16,64}$/i.test(deviceId)) {
    return res.status(400).json({ error: "Activation key and device id are required." });
  }
  try {
    const prisma = getCentralPrisma();
    const out: any = await prisma.$transaction(async (tx: any) => {
      const row = await tx.activationKey.findUnique({ where: { key } });
      if (!row || row.status !== "ACTIVE") return { code: 403, error: "Invalid or revoked activation key." };

      let device = await tx.activationDevice.findUnique({
        where: { activationKeyId_deviceId: { activationKeyId: row.id, deviceId } },
      });
      if (device?.status === "INACTIVE") {
        return { code: 403, error: "This PC was deactivated. Ask your Super Admin to reassign the activation.", reason: "DEVICE_DEACTIVATED" };
      }
      if (!device) {
        const active = await tx.activationDevice.count({ where: { activationKeyId: row.id, status: "ACTIVE" } });
        if (active >= row.maxActivations) {
          return { code: 409, error: `Activation limit reached (${active} of ${row.maxActivations} PCs). Deactivate an old PC from the portal first.`, reason: "LIMIT" };
        }
        device = await tx.activationDevice.create({
          data: { activationKeyId: row.id, deviceId, deviceName, os },
        });
      } else {
        device = await tx.activationDevice.update({
          where: { id: device.id },
          data: { deviceName, os, lastVerifiedAt: new Date() },
        });
      }
      const k = row.firstActivatedAt
        ? row
        : await tx.activationKey.update({ where: { id: row.id }, data: { firstActivatedAt: new Date() } });
      return { code: 200, key: k, device };
    });
    if (out.code !== 200) return res.status(out.code).json({ error: out.error, reason: out.reason });
    res.json(await issueLicense(prisma, out.key, out.device, req.body?.nonce));
  } catch (e) {
    console.error("activation failed:", e);
    res.status(500).json({ error: "Activation failed. Please try again." });
  }
}

/** Periodic check from the EXE: still active? Returns a fresh signed licence (carries renewals). */
export async function verifyDevice(req: Request, res: Response) {
  const keyId = String(req.body?.keyId ?? "");
  const deviceId = String(req.body?.deviceId ?? "");
  if (!keyId || !deviceId) return res.status(400).json({ error: "keyId and deviceId required." });
  try {
    const prisma = getCentralPrisma();
    const key = await prisma.activationKey.findUnique({ where: { id: keyId } });
    const device = key
      ? await prisma.activationDevice.findUnique({ where: { activationKeyId_deviceId: { activationKeyId: keyId, deviceId } } })
      : null;
    if (!key || !device) return res.status(404).json({ error: "Activation not found.", reason: "NOT_FOUND" });
    if (key.status !== "ACTIVE" || device.status !== "ACTIVE") {
      return res.status(403).json({ error: "This PC's activation is no longer active.", reason: "DEVICE_DEACTIVATED" });
    }
    const updated = await prisma.activationDevice.update({ where: { id: device.id }, data: { lastVerifiedAt: new Date() } });
    res.json(await issueLicense(prisma, key, updated, req.body?.nonce));
  } catch (e) {
    console.error("verify failed:", e);
    res.status(500).json({ error: "Verification failed." });
  }
}

// ---------------- views ----------------

const deviceView = (d: any) => ({
  id: d.id, deviceId: d.deviceId, deviceName: d.deviceName, os: d.os, status: d.status,
  activatedAt: d.activatedAt, lastVerifiedAt: d.lastVerifiedAt, deactivatedAt: d.deactivatedAt,
});
const keyView = (k: any) => ({
  id: k.id, key: k.key, instituteName: k.instituteName, companyName: k.companyName,
  maxActivations: k.maxActivations, activatedPCs: (k.devices ?? []).filter((d: any) => d.status === "ACTIVE").length,
  transferLimit: k.transferLimit, transfersUsed: k.transfersUsed, status: k.status,
  firstActivatedAt: k.firstActivatedAt, createdAt: k.createdAt, devices: (k.devices ?? []).map(deviceView),
});

// ---------------- SaaS admin ----------------

export async function saasListKeys(_req: Request, res: Response) {
  const keys = await getCentralPrisma().activationKey.findMany({ include: { devices: true }, orderBy: { createdAt: "desc" } });
  res.json({ keys: keys.map(keyView) });
}

export async function saasCreateKey(req: Request, res: Response) {
  const prisma = getCentralPrisma();
  const tenant = await prisma.tenant.findUnique({ where: { tenantId: String(req.body?.tenantId ?? "") } });
  if (!tenant) return res.status(404).json({ error: "Institute not found." });
  const master = tenant.parentTenantId ? await prisma.tenant.findUnique({ where: { id: tenant.parentTenantId } }) : tenant;
  const owner = master ?? tenant;
  const companyName = String(req.body?.companyName || tenant.name || tenant.instituteName).slice(0, 120);
  const maxActivations = Math.max(1, Math.min(500, Number(req.body?.maxActivations) || 1));
  const transferLimit = Math.max(0, Math.min(100, Number(req.body?.transferLimit ?? 3)));
  const k = await prisma.activationKey.create({
    data: { key: generateKey(), tenantId: owner.id, instituteName: owner.instituteName, companyName, maxActivations, transferLimit },
    include: { devices: true },
  });
  res.status(201).json(keyView(k));
}

export async function saasUpdateKey(req: Request, res: Response) {
  const prisma = getCentralPrisma();
  const data: any = {};
  if (req.body?.maxActivations !== undefined) data.maxActivations = Math.max(1, Math.min(500, Number(req.body.maxActivations) || 1));
  if (req.body?.transferLimit !== undefined) data.transferLimit = Math.max(0, Math.min(100, Number(req.body.transferLimit) || 0));
  if (req.body?.status === "ACTIVE" || req.body?.status === "REVOKED") data.status = req.body.status;
  try {
    const k = await prisma.activationKey.update({ where: { id: String(req.params.id) }, data, include: { devices: true } });
    res.json(keyView(k));
  } catch {
    res.status(404).json({ error: "Key not found." });
  }
}

/** SaaS admin may deactivate (no transfer cost) or re-activate a device. */
export async function saasSetDeviceStatus(req: Request, res: Response) {
  const status = req.body?.status === "ACTIVE" ? "ACTIVE" : "INACTIVE";
  const prisma = getCentralPrisma();
  const d = await prisma.activationDevice.findUnique({ where: { id: String(req.params.id) }, include: { activationKey: true } });
  if (!d) return res.status(404).json({ error: "Device not found." });
  if (status === "ACTIVE") {
    const active = await prisma.activationDevice.count({ where: { activationKeyId: d.activationKeyId, status: "ACTIVE" } });
    if (active >= d.activationKey.maxActivations) return res.status(409).json({ error: "Activation limit reached." });
  }
  const u = await prisma.activationDevice.update({
    where: { id: d.id },
    data: { status, deactivatedAt: status === "INACTIVE" ? new Date() : null },
  });
  res.json(deviceView(u));
}

// ---------------- Institute super admin (portal login) ----------------

async function ownKeys(email: string) {
  const prisma = getCentralPrisma();
  const me = await prisma.tenant.findUnique({ where: { email } });
  if (!me) return { prisma, keys: [] as any[] };
  const masterId = me.parentTenantId ?? me.id;
  const keys = await prisma.activationKey.findMany({ where: { tenantId: masterId }, include: { devices: true }, orderBy: { createdAt: "desc" } });
  return { prisma, keys };
}

export async function portalListKeys(req: Request, res: Response) {
  const { keys } = await ownKeys((req as any).portalEmail);
  res.json({ keys: keys.map(keyView) });
}

/** Deactivate an old PC so the slot can be reused. Counts against the key's transfer limit. */
export async function portalDeactivateDevice(req: Request, res: Response) {
  const { prisma, keys } = await ownKeys((req as any).portalEmail);
  const key = keys.find((k) => k.devices.some((d: any) => d.id === req.params.id));
  if (!key) return res.status(404).json({ error: "Device not found." });
  const dev = key.devices.find((d: any) => d.id === req.params.id);
  if (dev.status === "INACTIVE") return res.json(deviceView(dev));
  if (key.transfersUsed >= key.transferLimit) {
    return res.status(403).json({ error: `Device transfer limit reached (${key.transferLimit}). Contact support.` });
  }
  const [u] = await prisma.$transaction([
    prisma.activationDevice.update({ where: { id: dev.id }, data: { status: "INACTIVE", deactivatedAt: new Date() } }),
    prisma.activationKey.update({ where: { id: key.id }, data: { transfersUsed: { increment: 1 } } }),
  ]);
  res.json(deviceView(u));
}
