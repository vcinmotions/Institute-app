import { Request, Response, NextFunction } from "express";
import { USER_TIERS, DEFAULT_TIER_MULTIPLIERS } from "../utils/userTiers";
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
  userTierMultipliers: Record<string, number>; // price multiplier per login-count tier
};

export const DEFAULT_SETTINGS: GlobalSettings = {
  announcementActive: false,
  announcementText: "",
  supportEmail: "",
  supportPhone: "",
  renewalReminderDays: 7,
  minAppVersion: "",
  userTierMultipliers: DEFAULT_TIER_MULTIPLIERS,
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
  if ("userTierMultipliers" in body) {
    const out: Record<string, number> = {};
    for (const t of USER_TIERS) {
      const n = Number(body.userTierMultipliers?.[String(t)]);
      if (!(n > 0) || n > 1000) return { ok: false, error: `Multiplier for ${t} user(s) must be greater than 0` };
      out[String(t)] = n;
    }
    v.userTierMultipliers = out;
  }
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

// ---------- Registered / subscribed institutes ----------

export async function listInstitutes(_req: Request, res: Response) {
  const prisma = getCentralPrisma();
  const [tenants, subs, payments] = await Promise.all([
    prisma.tenant.findMany({
      select: {
        tenantId: true, instituteName: true, name: true, email: true, businessEmail: true,
        contact: true, city: true, state: true, country: true, createdAt: true, parentTenantId: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.portalSubscription.findMany(),
    prisma.portalPayment.findMany({ where: { status: "PAID" } }),
  ]);

  const subByEmail = new Map(subs.map((s) => [s.email, s]));
  const paidByEmail = new Map<string, number>();
  for (const p of payments) paidByEmail.set(p.email, (paidByEmail.get(p.email) ?? 0) + p.amount);

  const now = new Date();
  const rows = tenants.map((t) => {
    const s = t.email ? subByEmail.get(t.email) : undefined;
    const subscribed = !!s && s.plan !== "NONE";
    let status: "ACTIVE" | "EXPIRED" | "SUSPENDED" | "REVOKED" | "NOT_SUBSCRIBED" = "NOT_SUBSCRIBED";
    if (s && subscribed) {
      if (s.status === "ACTIVE") status = s.expiryDate > now ? "ACTIVE" : "EXPIRED";
      else status = s.status as any;
    }
    return {
      ...t,
      isCompany: !!t.parentTenantId, // legacy company logins follow their master's subscription
      plan: subscribed ? s!.plan : null,
      status,
      startDate: subscribed ? s!.startDate : null,
      expiryDate: subscribed ? s!.expiryDate : null,
      totalPaid: t.email ? paidByEmail.get(t.email) ?? 0 : 0,
    };
  });

  res.json(rows);
}


/**
 * SaaS admin: switch an institute active / inactive and set its expiry date and time.
 * Inactive = SUSPENDED, so the desktop app locks (view only) at its next licence check.
 */
export async function updateInstituteSubscription(req: Request, res: Response) {
  const prisma = getCentralPrisma();
  const tenant = await prisma.tenant.findUnique({ where: { tenantId: String(req.params.tenantId) } });
  if (!tenant || !tenant.email) return res.status(404).json({ error: "Institute not found" });
  if (tenant.parentTenantId) {
    return res.status(400).json({ error: "This is a company login. It follows its master institute's subscription." });
  }

  const wantStatus = req.body?.status;
  if (wantStatus !== undefined && wantStatus !== "ACTIVE" && wantStatus !== "SUSPENDED") {
    return res.status(400).json({ error: "Status must be ACTIVE or SUSPENDED." });
  }
  let expiry: Date | undefined;
  if (req.body?.expiryDate !== undefined && req.body?.expiryDate !== null && req.body?.expiryDate !== "") {
    expiry = new Date(req.body.expiryDate);
    if (isNaN(+expiry)) return res.status(400).json({ error: "Enter a valid expiry date and time." });
  }

  const sub =
    (await prisma.portalSubscription.findUnique({ where: { email: tenant.email } })) ??
    (await prisma.portalSubscription.create({
      data: { email: tenant.email, clientId: tenant.tenantId, plan: "NONE", status: "EXPIRED" },
    }));

  const nextExpiry = expiry ?? sub.expiryDate;
  const now = new Date();
  let nextStatus: string = wantStatus ?? sub.status;
  // Extending a lapsed (non-suspended) subscription into the future makes it active again.
  if (!wantStatus && sub.status === "EXPIRED" && sub.plan !== "NONE" && nextExpiry > now) nextStatus = "ACTIVE";
  if (nextStatus === "ACTIVE" && nextExpiry <= now) {
    return res.status(400).json({ error: "To make an institute active, set an expiry date and time in the future." });
  }

  const firstActivation = sub.plan === "NONE" && nextStatus === "ACTIVE";
  const updated = await prisma.portalSubscription.update({
    where: { email: tenant.email },
    data: {
      status: nextStatus,
      expiryDate: nextExpiry,
      ...(firstActivation ? { plan: "MANUAL", startDate: now } : {}),
    },
  });
  console.log(`SaaS admin set ${tenant.instituteName}: ${updated.status}, expires ${updated.expiryDate.toISOString()}`);

  const subscribed = updated.plan !== "NONE";
  const status = !subscribed
    ? "NOT_SUBSCRIBED"
    : updated.status === "ACTIVE"
      ? updated.expiryDate > now ? "ACTIVE" : "EXPIRED"
      : updated.status;
  res.json({
    tenantId: tenant.tenantId,
    plan: subscribed ? updated.plan : null,
    status,
    startDate: subscribed ? updated.startDate : null,
    expiryDate: subscribed ? updated.expiryDate : null,
  });
}
