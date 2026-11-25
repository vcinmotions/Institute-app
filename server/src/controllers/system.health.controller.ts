import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import { getCentralPrisma } from "../prisma-client/central-client";
import { getTenantPrisma } from "../prisma-client/tenant-client";
import { getState } from "../services/subscription.service";
import { getActivationState } from "../services/activation.service";
import { getMode, apiBase } from "../services/buildConfig.service";
import { backupStatus } from "../services/backup.service";
import { getDeviceInfo } from "../services/device.service";

/** System Health for the Master (Institute Super) Admin: one screen for troubleshooting. */
async function probe<T>(fn: () => Promise<T>): Promise<{ ok: boolean; value?: T; error?: string; ms: number }> {
  const t = Date.now();
  try {
    return { ok: true, value: await fn(), ms: Date.now() - t };
  } catch (e: any) {
    return { ok: false, error: String(e?.message ?? e).split("\n").pop()?.slice(0, 160), ms: Date.now() - t };
  }
}

function appVersion(): string {
  if (process.env.APP_VERSION) return process.env.APP_VERSION;
  try {
    return JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../package.json"), "utf8")).version;
  } catch {
    return "unknown";
  }
}

async function internetReachable(): Promise<boolean> {
  const target = apiBase() || "https://www.google.com";
  try {
    await fetch(target, { method: "HEAD", signal: AbortSignal.timeout(4000) });
    return true; // any HTTP answer means the network path works
  } catch {
    return false;
  }
}

export async function systemHealthController(req: Request, res: Response) {
  if ((req.user as any)?.role !== "MASTER_ADMIN") return res.status(403).json({ error: "Unauthorized" });

  const central = await probe(async () => {
    const p = getCentralPrisma();
    await p.$queryRawUnsafe("SELECT 1");
    const tenants = await p.tenant.findMany({ select: { id: true, instituteName: true, name: true, dbUrl: true } });
    return tenants;
  });

  const institutes: { name: string; ok: boolean; ms: number; error?: string; sqliteVersion?: string }[] = [];
  for (const t of central.value ?? []) {
    const r = await probe(async () => {
      const p = getTenantPrisma(t.dbUrl);
      const v: any = await p.$queryRawUnsafe("select sqlite_version() as v").catch(() => [{ v: undefined }]);
      await p.$queryRawUnsafe("SELECT 1");
      return v?.[0]?.v as string | undefined;
    });
    institutes.push({ name: t.name || t.instituteName, ok: r.ok, ms: r.ms, error: r.error, sqliteVersion: r.value });
  }

  const [online, sub] = await Promise.all([internetReachable(), Promise.resolve(getState())]);
  const act = getActivationState();
  const bk = backupStatus();

  res.json({
    checkedAt: new Date().toISOString(),
    server: { ok: true, uptimeSeconds: Math.round(process.uptime()), node: process.version, platform: process.platform },
    database: {
      central: { ok: central.ok, ms: central.ms, error: central.error },
      institutes,
      version: institutes.find((i) => i.sqliteVersion)?.sqliteVersion ? `SQLite ${institutes.find((i) => i.sqliteVersion)!.sqliteVersion}` : "SQLite",
    },
    app: { version: appVersion(), mode: getMode() },
    subscription: {
      status: sub.status, locked: sub.locked, expiryDate: sub.expiryDate, daysLeft: sub.daysLeft,
      plan: sub.plan, lastLicenseVerification: sub.lastSyncAt ?? act.lastVerifiedAt, message: sub.message,
    },
    activation: {
      status: act.status, institute: act.institute, company: act.company, activatedAt: act.activatedAt,
      validUntil: act.validUntil, lastVerifiedAt: act.lastVerifiedAt, device: getDeviceInfo(),
    },
    backup: { lastSuccess: bk.lastSuccess, openFailure: bk.openFailure, enabled: bk.config.enabled },
    network: { internet: online, operatingMode: online ? "Online" : "Offline" },
  });
}
