import crypto from "crypto";
import { Request } from "express";
import { getCentralPrisma } from "../prisma-client/central-client";
import { readLicenseInfo } from "./activation.service";
import { hashClientKey, sha256 } from "./clientKey";

/**
 * Client PCs / laptops that connect to this company server.
 *
 * Each one must confirm the company's CLIENT key once. The key is checked against a hash that lives inside this
 * server's portal-signed licence, so it works with no internet and cannot be edited in the local database.
 * A confirmed PC gets a random token (kept as a hash here) that it sends with every request. The number of client
 * PCs is unlimited, but each is listed (name, PC id, last seen) and can be blocked, e.g. a lost laptop.
 */
export const isLoopback = (req: Request) => {
  const a = String(req.socket?.remoteAddress ?? "");
  return a === "127.0.0.1" || a === "::1" || a === "::ffff:127.0.0.1";
};

export async function confirmClientKey(input: {
  key: string; deviceId: string; deviceName: string; os: string; ip?: string;
}): Promise<{ ok: true; token: string } | { ok: false; error: string; code: number }> {
  const lic = readLicenseInfo();
  if (!lic) return { ok: false, code: 409, error: "This server is not activated yet. The Super Admin must set it up first." };
  if (!lic.clientKeyHash || !lic.clientKeyId) {
    return { ok: false, code: 409, error: "This server has no Client key yet. Open the server once while it is online so it can receive it." };
  }
  const given = Buffer.from(hashClientKey(input.key, lic.clientKeyId));
  const want = Buffer.from(lic.clientKeyHash);
  if (given.length !== want.length || !crypto.timingSafeEqual(given, want)) {
    return { ok: false, code: 403, error: "That Client key is not correct for this company." };
  }
  const db = getCentralPrisma();
  const existing = await db.clientDevice.findUnique({ where: { deviceId: input.deviceId } });
  if (existing?.status === "REVOKED") {
    return { ok: false, code: 403, error: "This PC was blocked by the Super Admin." };
  }
  const token = crypto.randomBytes(32).toString("hex");
  const data = { deviceName: input.deviceName.slice(0, 80), os: input.os.slice(0, 80), tokenHash: sha256(token), lastSeenAt: new Date(), lastIp: input.ip ?? null };
  if (existing) await db.clientDevice.update({ where: { id: existing.id }, data });
  else await db.clientDevice.create({ data: { deviceId: input.deviceId, ...data } });
  return { ok: true, token };
}

const touched = new Map<string, number>();

/** True when the token belongs to a confirmed, not-blocked client PC. */
export async function verifyClientToken(token: unknown, ip?: string): Promise<boolean> {
  if (typeof token !== "string" || token.length < 32 || token.length > 128) return false;
  const h = sha256(token);
  const row = await getCentralPrisma().clientDevice.findFirst({ where: { tokenHash: h, status: "ACTIVE" } });
  if (!row) return false;
  const now = Date.now();
  if (now - (touched.get(row.id) ?? 0) > 60_000) {
    touched.set(row.id, now);
    getCentralPrisma().clientDevice.update({ where: { id: row.id }, data: { lastSeenAt: new Date(), lastIp: ip ?? row.lastIp } }).catch(() => {});
  }
  return true;
}

export const listClientDevices = () =>
  getCentralPrisma().clientDevice.findMany({
    select: { id: true, deviceId: true, deviceName: true, os: true, status: true, confirmedAt: true, lastSeenAt: true, lastIp: true },
    orderBy: { confirmedAt: "desc" },
  });

export async function setClientDeviceStatus(id: string, status: "ACTIVE" | "REVOKED") {
  return getCentralPrisma().clientDevice.update({ where: { id }, data: { status } });
}
