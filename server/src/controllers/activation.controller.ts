import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { getCentralPrisma } from "../prisma-client/central-client";
import { signJson } from "../services/licenseCrypto";
import { hashClientKey, normalizeKey } from "../services/clientKey";
import { instituteDb } from "../utils/institute";

/**
 * HOSTED PORTAL side of activation.
 *
 * ONE activation key per institute (kind INSTITUTE), created automatically. The same key:
 *   - activates the server PC of every company of the institute (unlimited PCs unless the SaaS admin sets a limit),
 *   - is typed once on every client PC / laptop that connects to a server. Client PCs are checked by the local
 *     server against a hash inside the server's signed licence, so they work offline; the portal never counts them.
 * The server obtains the key when it is set up (see claimServer) - nobody has to type it there.
 * Older installs still hold per-company SERVER keys; they keep working, and their licences now accept the
 * institute key on client PCs. Old per-company CLIENT keys are no longer issued.
 */
const STANDALONE_DAYS = 364;
const DAY = 24 * 60 * 60 * 1000;

const normKey = normalizeKey;

export function generateKey(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
  const part = () =>
    Array.from(crypto.randomBytes(4), (b) => alphabet[b % alphabet.length]).join("");
  return `VCIN-${part()}-${part()}-${part()}-${part()}`;
}

/** Legacy keys (made by hand, not tied to a company) share one pseudo company for their Client key. */
const LEGACY_COMPANY = "legacy";
/** companyId marker of the one institute-wide key (kind INSTITUTE). */
const INSTITUTE_SCOPE = "INSTITUTE";

/** The institute's one activation key. Created on first use; safe to call repeatedly. */
export async function ensureInstituteKey(prisma: any, master: { id: string; instituteName: string }): Promise<any> {
  const where = { tenantId: master.id, companyId: INSTITUTE_SCOPE, kind: "INSTITUTE" };
  const found = await prisma.activationKey.findFirst({ where });
  if (found) return found;
  try {
    return await prisma.activationKey.create({
      data: {
        ...where, key: generateKey(), instituteName: master.instituteName, companyName: master.instituteName,
        maxActivations: 0, // 0 = unlimited PCs
        transferLimit: 3,
      },
    });
  } catch (e: any) {
    if (e?.code === "P2002") return prisma.activationKey.findFirst({ where }); // raced
    throw e;
  }
}

const unlimited = (k: any) => k.kind === "CLIENT" || (k.kind === "INSTITUTE" && !k.maxActivations);

/** Creates the company's Server + Client keys if they do not exist yet. Safe to call repeatedly. */
export async function ensureCompanyKeys(
  prisma: any,
  master: { id: string; instituteName: string },
  companyId: string,
  companyName: string
): Promise<{ server: any; client: any }> {
  const make = async (kind: "SERVER" | "CLIENT") => {
    const found = await prisma.activationKey.findFirst({ where: { tenantId: master.id, companyId, kind } });
    if (found) return found;
    try {
      return await prisma.activationKey.create({
        data: {
          key: generateKey(), tenantId: master.id, instituteName: master.instituteName, companyName,
          companyId, kind, maxActivations: kind === "SERVER" ? 1 : 0, // 0 = unlimited (client key)
          transferLimit: 3,
        },
      });
    } catch (e: any) {
      if (e?.code === "P2002") return prisma.activationKey.findFirst({ where: { tenantId: master.id, companyId, kind } }); // raced
      throw e;
    }
  };
  return { server: await make("SERVER"), client: await make("CLIENT") };
}

/** Standalone validity = later of (first activation + 364 days) and the institute's paid expiry. Suspended = now. */
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

/** The Client key that goes with a Server key (created on demand for legacy keys). */
async function clientKeyFor(prisma: any, serverKey: any) {
  const companyId = serverKey.companyId ?? LEGACY_COMPANY;
  const found = await prisma.activationKey.findFirst({ where: { tenantId: serverKey.tenantId, companyId, kind: "CLIENT" } });
  if (found) return found;
  return prisma.activationKey.create({
    data: {
      key: generateKey(), tenantId: serverKey.tenantId, instituteName: serverKey.instituteName,
      companyName: serverKey.companyName, companyId, kind: "CLIENT", maxActivations: 0, transferLimit: 3,
    },
  });
}

type CompanyRef = { id?: string | null; name?: string | null };

async function issueLicense(prisma: any, key: any, device: any, nonce?: string, company?: CompanyRef) {
  const validUntil = await licenseValidUntil(prisma, key);
  // Client PCs confirm with the institute key. (A legacy server without a company id keeps its own Client key.)
  const instituteKey = key.kind === "INSTITUTE"
    ? key
    : key.kind === "SERVER" && key.companyId
      ? await ensureInstituteKey(prisma, { id: key.tenantId, instituteName: key.instituteName })
      : null;
  const client = instituteKey ?? (key.kind === "SERVER" ? await clientKeyFor(prisma, key) : null);
  const institute = key.kind === "INSTITUTE";
  return signJson("ACTIVATION", {
    keyId: key.id,
    institute: key.instituteName,
    // The institute key is not tied to one company: the server PC tells which company it serves.
    company: institute ? String(company?.name || key.companyName).slice(0, 120) : key.companyName,
    companyId: institute ? (company?.id ? String(company.id).slice(0, 64) : null) : key.companyId ?? null,
    role: "SERVER",
    // Only a hash: the server can check a typed Client key but cannot be edited into accepting another one.
    clientKeyId: client?.id ?? null,
    clientKeyHash: client ? hashClientKey(client.key, client.id) : null,
    deviceId: device.deviceId,
    deviceName: device.deviceName,
    activatedAt: device.activatedAt.toISOString(),
    validUntil: validUntil.toISOString(),
    maxDevices: key.maxActivations,
    issuedAt: new Date().toISOString(), // trusted server time
    nonce: nonce ? String(nonce).slice(0, 64) : undefined,
  });
}

type Registered =
  | { code: 200; key: any; device: any }
  | { code: number; error: string; reason?: string };

/** Registers a server PC on the institute key (or a legacy per-company SERVER key). Atomic. */
async function registerServerDevice(prisma: any, where: any, deviceId: string, deviceName: string, os: string): Promise<Registered> {
  return prisma.$transaction(async (tx: any) => {
    const row = await tx.activationKey.findFirst({ where });
    if (!row || row.status !== "ACTIVE") return { code: 403, error: "Invalid or revoked activation key." };
    if (row.kind === "CLIENT") {
      return { code: 403, error: "This is an old Client key. Use your institute's activation key (shown in the portal).", reason: "CLIENT_KEY" };
    }
    const instituteKey = row.kind === "INSTITUTE";
    let device = await tx.activationDevice.findUnique({
      where: { activationKeyId_deviceId: { activationKeyId: row.id, deviceId } },
    });
    if (device?.status === "INACTIVE") {
      return { code: 403, error: "This PC was deactivated. Ask your Super Admin to reassign the activation.", reason: "DEVICE_DEACTIVATED" };
    }
    if (!device && !instituteKey) {
      // Legacy per-company key: one PC can be the server of only ONE company of an institute.
      const other = await tx.activationDevice.findFirst({
        where: { deviceId, status: "ACTIVE", NOT: { activationKeyId: row.id }, activationKey: { tenantId: row.tenantId, kind: "SERVER" } },
        include: { activationKey: true },
      });
      if (other) {
        return {
          code: 409,
          error: `This PC is already the server of ${other.activationKey.companyName}. One server PC serves one company. Use another PC for ${row.companyName}.`,
          reason: "ALREADY_SERVER",
        };
      }
    }
    if (!device) {
      const active = await tx.activationDevice.findMany({ where: { activationKeyId: row.id, status: "ACTIVE" } });
      if (instituteKey && row.maxActivations > 0 && active.length >= row.maxActivations) {
        return {
          code: 409,
          error: `This activation key is already used on ${active.length} PC(s), the limit for your institute. Deactivate an old PC in the portal first.`,
          reason: "LIMIT",
        };
      }
      if (!instituteKey && active.length >= row.maxActivations) {
        const who = active[0]?.deviceName ? ` (${active[0].deviceName})` : "";
        return {
          code: 409,
          error: `${row.companyName} already has its server activated on another PC${who}. A company has one server. The Super Admin can deactivate the old server in the portal first.`,
          reason: "LIMIT",
        };
      }
      device = await tx.activationDevice.create({ data: { activationKeyId: row.id, deviceId, deviceName, os } });
    } else {
      device = await tx.activationDevice.update({ where: { id: device.id }, data: { deviceName, os, lastVerifiedAt: new Date() } });
    }
    const k = row.firstActivatedAt ? row : await tx.activationKey.update({ where: { id: row.id }, data: { firstActivatedAt: new Date() } });
    return { code: 200, key: k, device };
  });
}

const deviceBody = (req: Request) => ({
  deviceId: String(req.body?.deviceId ?? "").trim(),
  deviceName: String(req.body?.deviceName ?? "Unknown PC").slice(0, 80),
  os: String(req.body?.os ?? "").slice(0, 80),
});
const validDeviceId = (id: string) => /^[a-f0-9]{16,64}$/i.test(id);

// ---------------- EXE-facing (public, rate limited) ----------------

/** Typed-key activation of a server (re-install / older installs). */
export async function activateDevice(req: Request, res: Response) {
  const key = normKey(req.body?.key);
  const { deviceId, deviceName, os } = deviceBody(req);
  if (!key || !validDeviceId(deviceId)) {
    return res.status(400).json({ error: "Activation key and device id are required." });
  }
  try {
    const prisma = getCentralPrisma();
    const out = await registerServerDevice(prisma, { key }, deviceId, deviceName, os);
    if (out.code !== 200) return res.status(out.code).json({ error: (out as any).error, reason: (out as any).reason });
    res.json(await issueLicense(prisma, (out as any).key, (out as any).device, req.body?.nonce));
  } catch (e) {
    console.error("activation failed:", e);
    res.status(500).json({ error: "Activation failed. Please try again." });
  }
}

/**
 * First-time server setup: the Super Admin signs in, chooses the company this server is for, and this call
 * registers the PC on that company's SERVER key and returns the signed licence plus both keys.
 */
export async function claimServer(req: Request, res: Response) {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");
  const companyId = String(req.body?.companyId ?? "");
  const { deviceId, deviceName, os } = deviceBody(req);
  if (!email || !password || !companyId || !validDeviceId(deviceId)) {
    return res.status(400).json({ error: "Sign-in details, company and device are required." });
  }
  try {
    const prisma = getCentralPrisma();
    const tenant = await prisma.tenant.findUnique({ where: { email } });
    if (!tenant?.password || !(await bcrypt.compare(password, tenant.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    if (tenant.parentTenantId) return res.status(403).json({ error: "Only the Master Institute Super Admin can set up a server." });

    const company = await instituteDb(tenant).clientAdmin.findUnique({ where: { id: companyId } });
    if (!company) return res.status(404).json({ error: "That company was not found." });

    const instKey = await ensureInstituteKey(prisma, tenant);
    const out = await registerServerDevice(prisma, { id: instKey.id }, deviceId, deviceName, os);
    if (out.code !== 200) return res.status(out.code).json({ error: (out as any).error, reason: (out as any).reason });
    const companyName = company.instituteName || company.name;
    const signed = await issueLicense(prisma, (out as any).key, (out as any).device, req.body?.nonce, { id: company.id, name: companyName });
    res.json({
      ...signed,
      // One key for everything: the server holds it, and client PCs type the same key.
      serverKey: instKey.key,
      clientKey: instKey.key,
      company: { id: company.id, name: company.name, instituteName: company.instituteName },
    });
  } catch (e) {
    console.error("claim server failed:", e);
    res.status(500).json({ error: "Could not activate this server. Please try again." });
  }
}

/** Periodic check from the server EXE: still active? Returns a fresh signed licence (carries renewals). */
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
    res.json(await issueLicense(prisma, key, updated, req.body?.nonce, { id: req.body?.companyId, name: req.body?.company }));
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
  id: k.id, key: k.key, kind: k.kind ?? "SERVER", companyId: k.companyId ?? null,
  instituteName: k.instituteName, companyName: k.companyName,
  maxActivations: k.maxActivations, unlimited: unlimited(k),
  activatedPCs: (k.devices ?? []).filter((d: any) => d.status === "ACTIVE").length,
  transferLimit: k.transferLimit, transfersUsed: k.transfersUsed, status: k.status,
  firstActivatedAt: k.firstActivatedAt, createdAt: k.createdAt, devices: (k.devices ?? []).map(deviceView),
});

// ---------------- SaaS admin ----------------

export async function saasListKeys(_req: Request, res: Response) {
  const keys = await getCentralPrisma().activationKey.findMany({ include: { devices: true }, orderBy: [{ instituteName: "asc" }, { companyName: "asc" }, { kind: "asc" }] });
  res.json({ keys: keys.map(keyView) });
}

/** SaaS admin: creates (or returns) the institute's activation key. */
export async function saasCreateKey(req: Request, res: Response) {
  const prisma = getCentralPrisma();
  const tenant = await prisma.tenant.findUnique({ where: { tenantId: String(req.body?.tenantId ?? "") } });
  if (!tenant) return res.status(404).json({ error: "Institute not found." });
  const master = tenant.parentTenantId ? await prisma.tenant.findUnique({ where: { id: tenant.parentTenantId } }) : tenant;
  if (!master) return res.status(404).json({ error: "Institute not found." });
  try {
    const out = await ensureInstituteKeys(prisma, master);
    res.status(201).json({ keys: out.map(keyView) });
  } catch (e) {
    console.error("create keys failed:", e);
    res.status(500).json({ error: "Could not create the keys." });
  }
}

/**
 * Ensures the institute has its activation key; returns the keys to show: the institute key first, then
 * legacy per-company server keys that still have PCs (so old servers can be seen and deactivated).
 * Old per-company Client keys are not shown any more.
 */
export async function ensureInstituteKeys(prisma: any, master: any) {
  await ensureInstituteKey(prisma, master);
  const all = await prisma.activationKey.findMany({ where: { tenantId: master.id }, include: { devices: true }, orderBy: [{ companyName: "asc" }, { kind: "asc" }] });
  const inst = all.filter((k: any) => k.kind === "INSTITUTE");
  const legacy = all.filter((k: any) => k.kind === "SERVER" && k.devices.length > 0);
  return [...inst, ...legacy];
}

export async function saasUpdateKey(req: Request, res: Response) {
  const prisma = getCentralPrisma();
  const data: any = {};
  const existing = await prisma.activationKey.findUnique({ where: { id: String(req.params.id) } });
  if (!existing) return res.status(404).json({ error: "Key not found." });
  if (req.body?.maxActivations !== undefined && existing.kind !== "CLIENT") {
    // Institute key: 0 = unlimited PCs. Legacy server key: at least 1.
    const min = existing.kind === "INSTITUTE" ? 0 : 1;
    data.maxActivations = Math.max(min, Math.min(500, Number(req.body.maxActivations) || min));
  }
  if (req.body?.transferLimit !== undefined) data.transferLimit = Math.max(0, Math.min(100, Number(req.body.transferLimit) || 0));
  if (req.body?.status === "ACTIVE" || req.body?.status === "REVOKED") data.status = req.body.status;
  const k = await prisma.activationKey.update({ where: { id: existing.id }, data, include: { devices: true } });
  res.json(keyView(k));
}

/** SaaS admin may deactivate (no transfer cost) or re-activate a server PC. */
export async function saasSetDeviceStatus(req: Request, res: Response) {
  const status = req.body?.status === "ACTIVE" ? "ACTIVE" : "INACTIVE";
  const prisma = getCentralPrisma();
  const d = await prisma.activationDevice.findUnique({ where: { id: String(req.params.id) }, include: { activationKey: true } });
  if (!d) return res.status(404).json({ error: "Device not found." });
  if (status === "ACTIVE") {
    const active = await prisma.activationDevice.count({ where: { activationKeyId: d.activationKeyId, status: "ACTIVE" } });
    const limit = d.activationKey.maxActivations;
    if (!unlimited(d.activationKey) && active >= limit) {
      return res.status(409).json({ error: d.activationKey.kind === "INSTITUTE" ? `The key's PC limit (${limit}) is reached.` : "This company's server is already active on another PC." });
    }
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
  const master = me.parentTenantId ? await prisma.tenant.findUnique({ where: { id: me.parentTenantId } }) : me;
  if (!master) return { prisma, keys: [] as any[] };
  const keys = await ensureInstituteKeys(prisma, master); // companies created earlier get their keys here
  return { prisma, keys };
}

export async function portalListKeys(req: Request, res: Response) {
  const { keys } = await ownKeys((req as any).portalEmail);
  res.json({ keys: keys.map(keyView) });
}

/** Deactivate an old PC (e.g. replaced or lost). Counts against the key's transfer limit. */
export async function portalDeactivateDevice(req: Request, res: Response) {
  const { prisma, keys } = await ownKeys((req as any).portalEmail);
  const key = keys.find((k: any) => k.devices.some((d: any) => d.id === req.params.id));
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

/**
 * SaaS admin: a renewal code for a PC running in local mode (offline renewal). The code is signed, bound to that PC's id
 * and usable once. Send it to the customer; they paste it under System Settings.
 */
export async function saasIssueLocalRenewal(req: Request, res: Response) {
  const deviceId = String(req.body?.deviceId ?? "").trim().toLowerCase();
  const months = Number(req.body?.months ?? 6);
  if (!/^[a-f0-9]{16,64}$/.test(deviceId)) return res.status(400).json({ error: "Enter the PC id shown in the customer's System Settings." });
  if (!Number.isInteger(months) || months < 1 || months > 60) return res.status(400).json({ error: "Months must be a whole number from 1 to 60." });
  const signed = signJson("LOCAL_RENEWAL", {
    deviceId, months, issuedAt: new Date().toISOString(), nonce: crypto.randomBytes(12).toString("hex"),
  });
  res.json({ code: Buffer.from(JSON.stringify(signed)).toString("base64"), deviceId, months });
}
