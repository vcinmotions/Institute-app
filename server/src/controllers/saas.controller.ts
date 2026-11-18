import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getCentralPrisma } from "../prisma-client/central-client";

/**
 * SaaS Super Admin (hosted portal only): sign in at /saas/login, set
 * subscription plans and the global settings shared by all EXE clients.
 */

// ---------- Auth ----------

export function saasAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Please sign in" });
  try {
    const d = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (d.role !== "SAAS_ADMIN" || !d.id) return res.status(403).json({ error: "SaaS admin only" });
    (req as any).saasAdmin = d;
    next();
  } catch {
    res.status(401).json({ error: "Session expired, please sign in again" });
  }
}

export async function saasLogin(req: Request, res: Response) {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");
  const admin = email
    ? await getCentralPrisma().saasAdmin.findUnique({ where: { email } })
    : null;
  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const token = jwt.sign(
    { id: admin.id, email: admin.email, role: "SAAS_ADMIN" },
    process.env.JWT_SECRET!,
    { expiresIn: "8h" }
  );
  res.json({ token, name: admin.name, email: admin.email, role: "SAAS_ADMIN" });
}

export async function saasMe(req: Request, res: Response) {
  const admin = await getCentralPrisma().saasAdmin.findUnique({
    where: { id: (req as any).saasAdmin.id },
    select: { name: true, email: true },
  });
  if (!admin) return res.status(401).json({ error: "Account not found" });
  res.json({ ...admin, role: "SAAS_ADMIN" });
}

// ---------- Global settings (common to every EXE client) ----------

export type GlobalSettings = {
  announcementActive: boolean;
  announcementText: string;
  supportEmail: string;
  supportPhone: string;
  renewalReminderDays: number; // show the expiry banner this many days before
  minAppVersion: string; // EXEs older than this show an "update available" notice
};

export const DEFAULT_SETTINGS: GlobalSettings = {
  announcementActive: false,
  announcementText: "",
  supportEmail: "",
  supportPhone: "",
  renewalReminderDays: 7,
  minAppVersion: "",
};

export async function readSettings(): Promise<GlobalSettings> {
  const rows = await getCentralPrisma().appSetting.findMany();
  const out: any = { ...DEFAULT_SETTINGS };
  for (const r of rows) {
    if (!(r.key in DEFAULT_SETTINGS)) continue;
    try {
      out[r.key] = JSON.parse(r.value);
    } catch {
      /* keep default */
    }
  }
  return out;
}

function clean(body: any): { ok: true; value: Partial<GlobalSettings> } | { ok: false; error: string } {
  const v: Partial<GlobalSettings> = {};
  if ("announcementActive" in body) v.announcementActive = !!body.announcementActive;
  if ("announcementText" in body) v.announcementText = String(body.announcementText).slice(0, 500);
  if ("supportEmail" in body) v.supportEmail = String(body.supportEmail).trim().slice(0, 120);
  if ("supportPhone" in body) v.supportPhone = String(body.supportPhone).trim().slice(0, 30);
  if ("minAppVersion" in body) v.minAppVersion = String(body.minAppVersion).trim().slice(0, 20);
  if ("renewalReminderDays" in body) {
    const n = Number(body.renewalReminderDays);
    if (!Number.isInteger(n) || n < 0 || n > 90) {
      return { ok: false, error: "Reminder days must be a whole number from 0 to 90" };
    }
    v.renewalReminderDays = n;
  }
  return { ok: true, value: v };
}

// Public: EXE clients and the website read this.
export async function getPublicSettings(_req: Request, res: Response) {
  try {
    res.json(await readSettings());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load settings" });
  }
}

export async function getSettingsAdmin(_req: Request, res: Response) {
  try {
    res.json(await readSettings());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load settings" });
  }
}

export async function updateSettings(req: Request, res: Response) {
  const parsed = clean(req.body ?? {});
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });
  try {
    const prisma = getCentralPrisma();
    for (const [key, val] of Object.entries(parsed.value)) {
      const value = JSON.stringify(val);
      await prisma.appSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
    }
    res.json(await readSettings());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to save settings" });
  }
}
