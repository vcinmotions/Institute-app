import { readTierPrices, resolvePlanPrice } from "./plan.controller";
import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getCentralPrisma } from "../prisma-client/central-client";
import { createTenant } from "../utils/createTenant";
import { instituteDb, ensureMasterCompany, createCompanyRow } from "../utils/institute";
import { normalizeTenantInput } from "../utils/normalizer/tenantNormalizer";
import { parseMaxUsers } from "../utils/userTiers";
import { readSettings } from "./saas.controller";
import { signPayload, SubscriptionPayload } from "../services/subscription.service";

/**
 * Web portal (hosted instance only): register -> pay (Razorpay) -> subscription.
 * Subscriptions are bought and renewed ONLY here, never in the Windows EXE.
 */

const sha256 = (v: string) => crypto.createHash("sha256").update(v).digest("hex");
const normEmail = (v: unknown) => String(v ?? "").trim().toLowerCase();

function addMonths(d: Date, months: number) {
  const r = new Date(d);
  r.setMonth(r.getMonth() + months);
  return r;
}

// Free trial for new customers: one per business email / phone number, ever.
export const TRIAL_PLAN = "TRIAL";
const TRIAL_MONTHS = Number(process.env.TRIAL_MONTHS) || 1;
const trialKeys = (businessEmail: string | null, contact: string | null) =>
  [
    businessEmail ? `trial:email:${businessEmail.toLowerCase()}` : "",
    contact ? `trial:phone:${String(contact).replace(/\D/g, "").slice(-10)}` : "",
  ].filter(Boolean);

function portalToken(email: string) {
  return jwt.sign({ role: "PORTAL", email }, process.env.JWT_SECRET!, { expiresIn: "2h" });
}

export function portalAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Please sign in" });
  try {
    const d = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (d.role !== "PORTAL" || !d.email) return res.status(403).json({ error: "Not allowed" });
    (req as any).portalEmail = d.email;
    next();
  } catch {
    res.status(401).json({ error: "Session expired, please sign in again" });
  }
}

/**
 * A company is a tenant whose parentTenantId points at its master institute.
 * Companies share the master's subscription (one payment covers all of them).
 */
async function resolveOwner(email: string) {
  const prisma = getCentralPrisma();
  const tenant = await prisma.tenant.findUnique({ where: { email } });
  if (!tenant) return { tenant: null, master: null, ownerEmail: email };
  if (!tenant.parentTenantId) return { tenant, master: tenant, ownerEmail: email };
  const master = await prisma.tenant.findUnique({ where: { id: tenant.parentTenantId } });
  return { tenant, master, ownerEmail: master?.email ?? email };
}

/** Only the master institute may buy plans or manage companies. */
export async function masterOnly(req: Request, res: Response, next: NextFunction) {
  const { tenant } = await resolveOwner((req as any).portalEmail);
  if (!tenant) return res.status(404).json({ error: "Account not found" });
  if (tenant.parentTenantId) {
    return res.status(403).json({ error: "This is managed by the master institute." });
  }
  next();
}

// ---------- Registration / login ----------

export async function registerInstitute(req: Request, res: Response) {
  const n = normalizeTenantInput(req.body);
  const required = [
    n.name, n.instituteName, n.email, n.password, n.contact, n.country,
    n.state, n.city, n.zipCode, n.fullAddress, n.financialStartDate, n.financialEndDate,
  ];
  if (required.some((v) => !v)) return res.status(400).json({ error: "Missing required fields." });
  if (!n.businessEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(n.businessEmail)) {
    return res.status(400).json({ error: "Please enter a valid business email." });
  }
  if (String(n.password).length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long." });
  }

  const wantsTrial = req.body?.trial === true || req.body?.trial === "true";

  try {
    const prisma = getCentralPrisma();
    if (await prisma.tenant.findUnique({ where: { email: n.email! } })) {
      return res.status(409).json({ error: "Username already exists. Please choose a different username." });
    }
    if (await prisma.tenant.findUnique({ where: { instituteName: n.instituteName! } })) {
      return res.status(409).json({ error: "Institute name already exists. Please choose a different institute name." });
    }

    // Checked BEFORE anything is created, so a refused trial leaves nothing behind.
    const keys = trialKeys(n.businessEmail, n.contact);
    if (wantsTrial) {
      const used = await prisma.appSetting.findMany({ where: { key: { in: keys } } });
      if (used.length > 0) {
        return res.status(409).json({
          error: "A free trial was already used with this business email or phone number. Please choose a plan to continue.",
        });
      }
    }

    await createTenant(
      n.name!, n.instituteName!, n.email!, n.password!, n.contact!, n.country!,
      n.state!, n.city!, n.zipCode!, n.fullAddress!, n.financialStartDate!, n.financialEndDate!,
      "", "", "", n.certificateName ?? "", n.businessEmail
    );

    const tenant = await prisma.tenant.findUnique({ where: { email: n.email! } });
    await prisma.portalSubscription.upsert({
      where: { email: n.email! },
      update: {},
      create: {
        email: n.email!,
        clientId: tenant?.tenantId ?? "",
        ...(wantsTrial
          ? { plan: TRIAL_PLAN, status: "ACTIVE", startDate: new Date(), expiryDate: addMonths(new Date(), TRIAL_MONTHS) }
          : { status: "EXPIRED" }),
        maxUsers: parseMaxUsers(req.body?.maxUsers),
      },
    });

    if (wantsTrial) {
      for (const key of keys) {
        await prisma.appSetting.upsert({ where: { key }, update: { value: n.email! }, create: { key, value: n.email! } });
      }
    }

    res.status(201).json({ token: portalToken(n.email!), email: n.email, trial: wantsTrial });
  } catch (e: any) {
    console.error("portal register failed:", e);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
}

export async function portalLogin(req: Request, res: Response) {
  const email = normEmail(req.body?.email);
  const password = String(req.body?.password ?? "");
  const tenant = email ? await getCentralPrisma().tenant.findUnique({ where: { email } }) : null;
  if (!tenant?.password || !(await bcrypt.compare(password, tenant.password))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  res.json({ token: portalToken(email), email });
}

// ---------- First-time EXE setup: who is this institute? ----------

/**
 * Called by the desktop EXE during first-time setup. Only the MASTER institute's own
 * credentials work (a company or normal user cannot authorise an installation).
 * Returns the institute identity, its companies and its subscription status.
 * Nothing secret is returned: the EXE keeps its own hash of the password.
 */
export async function portalIdentity(req: Request, res: Response) {
  const email = normEmail(req.body?.email);
  const password = String(req.body?.password ?? "");
  const prisma = getCentralPrisma();
  const tenant = email ? await prisma.tenant.findUnique({ where: { email } }) : null;
  if (!tenant?.password || !(await bcrypt.compare(password, tenant.password))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  if (tenant.parentTenantId) {
    return res.status(403).json({ error: "Only the Master Institute Super Admin can set up an installation." });
  }
  try {
    const db = instituteDb(tenant);
    await ensureMasterCompany(db);
    const companies = await db.clientAdmin.findMany({
      orderBy: { createdAt: "asc" },
      include: { financialYears: { where: { isActive: true }, take: 1 } },
    });
    const sub = await prisma.portalSubscription.findUnique({ where: { email: tenant.email! } });
    const active = !!sub && sub.status === "ACTIVE" && sub.expiryDate > new Date();
    res.json({
      instituteId: tenant.id,
      instituteName: tenant.instituteName,
      slug: tenant.slug,
      owner: {
        name: tenant.name, email: tenant.email, businessEmail: tenant.businessEmail, contact: tenant.contact,
        country: tenant.country, state: tenant.state, city: tenant.city, zipCode: tenant.zipCode,
        fullAddress: tenant.fullAddress,
      },
      companies: companies.map((c: any) => ({
        name: c.name, instituteName: c.instituteName, contact: c.contact, country: c.country, state: c.state,
        city: c.city, zipCode: c.zipCode, fullAddress: c.fullAddress, isMaster: c.isMaster,
        financialStartDate: c.financialYears?.[0]?.startDate ?? null,
        financialEndDate: c.financialYears?.[0]?.endDate ?? null,
      })),
      subscription: {
        status: active ? "ACTIVE" : sub?.status === "ACTIVE" ? "EXPIRED" : sub?.status ?? "NONE",
        plan: sub?.plan ?? "NONE",
        expiryDate: sub?.expiryDate ?? null,
        maxUsers: sub?.maxUsers ?? 1,
      },
    });
  } catch (e) {
    console.error("portal identity failed:", e);
    res.status(500).json({ error: "Could not read the institute details. Please try again." });
  }
}

// ---------- Subscription status ----------

export async function portalMe(req: Request, res: Response) {
  const email = (req as any).portalEmail as string;
  const prisma = getCentralPrisma();
  const { master, ownerEmail } = await resolveOwner(email);
  const isCompany = !!master && master.email !== email;
  const sub = await prisma.portalSubscription.findUnique({ where: { email: ownerEmail } });
  const tenant = await prisma.tenant.findUnique({
    where: { email },
    select: {
      instituteName: true, name: true, businessEmail: true, contact: true,
      fullAddress: true, city: true, state: true, country: true, zipCode: true, createdAt: true,
    },
  });
  const active = !!sub && sub.status === "ACTIVE" && sub.expiryDate > new Date();
  res.json({
    profile: tenant,
    isCompany,
    maxUsers: sub?.maxUsers ?? 1,
    masterName: isCompany ? master?.instituteName ?? null : null,
    startDate: sub?.startDate ?? null,
    email,
    status: active ? "ACTIVE" : sub?.status === "ACTIVE" ? "EXPIRED" : sub?.status ?? "EXPIRED",
    plan: sub?.plan ?? "NONE",
    expiryDate: sub?.expiryDate ?? null,
    daysLeft: sub ? Math.max(0, Math.ceil((+sub.expiryDate - Date.now()) / 86400000)) : 0,
  });
}

// Institute name and username identify the institute's database, so only the
// contact/profile details below can be edited from the portal.
export async function portalUpdateProfile(req: Request, res: Response) {
  const email = (req as any).portalEmail as string;
  const n = normalizeTenantInput(req.body);
  const required = [n.name, n.contact, n.country, n.state, n.city, n.zipCode, n.fullAddress];
  if (required.some((v) => !v)) return res.status(400).json({ error: "Please fill in all required fields." });
  if (!n.businessEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(n.businessEmail)) {
    return res.status(400).json({ error: "Please enter a valid business email." });
  }
  const digits = String(n.contact).replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) {
    return res.status(400).json({ error: "Please enter a valid contact number." });
  }
  try {
    const profile = await getCentralPrisma().tenant.update({
      where: { email },
      data: {
        name: n.name!, businessEmail: n.businessEmail, contact: n.contact!, country: n.country!,
        state: n.state!, city: n.city!, zipCode: n.zipCode!, fullAddress: n.fullAddress!,
      },
      select: {
        instituteName: true, name: true, businessEmail: true, contact: true,
        fullAddress: true, city: true, state: true, country: true, zipCode: true, createdAt: true,
      },
    });
    res.json({ message: "Institute details updated.", profile });
  } catch (e) {
    console.error("portal profile update failed:", e);
    res.status(500).json({ error: "Could not update details. Please try again." });
  }
}

export async function portalPayments(req: Request, res: Response) {
  const { ownerEmail: email } = await resolveOwner((req as any).portalEmail as string);
  const rows = await getCentralPrisma().portalPayment.findMany({
    where: { email, status: "PAID" },
    orderBy: { createdAt: "desc" },
    select: { orderId: true, paymentId: true, planCode: true, amount: true, currency: true, createdAt: true },
  });
  res.json(rows);
}

// ---------- Razorpay ----------

function razorpayAuth() {
  const id = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!id || !secret) throw new Error("Razorpay is not configured");
  return { id, secret, header: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64") };
}

export async function createOrder(req: Request, res: Response) {
  const email = (req as any).portalEmail as string;
  const code = String(req.body?.plan ?? "");
  try {
    const prisma = getCentralPrisma();
    // An institute the SaaS admin made inactive cannot buy its way back in; support re-activates it.
    const { ownerEmail } = await resolveOwner(email);
    const current = await prisma.portalSubscription.findUnique({ where: { email: ownerEmail } });
    if (current?.status === "SUSPENDED" || current?.status === "REVOKED") {
      return res.status(403).json({ error: "This account is inactive. Please contact support to re-activate it." });
    }
    const plan = await prisma.subscriptionPlan.findUnique({ where: { code } });
    // Price always comes from the database (set by the super admin), never from the browser.
    if (!plan || !plan.active || !(plan.price > 0)) {
      return res.status(400).json({ error: "This plan is not available" });
    }
    const maxUsers = parseMaxUsers(req.body?.maxUsers);
    // Explicit price for this plan + login count (set by the super admin), else plan price x multiplier.
    // Always computed here, never trusted from the browser.
    const total = resolvePlanPrice(plan, await readTierPrices(), (await readSettings()).userTierMultipliers, maxUsers);
    const rz = razorpayAuth();
    const r = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: rz.header },
      body: JSON.stringify({
        amount: Math.round(total * 100),
        currency: plan.currency,
        receipt: `sub_${Date.now()}`,
        notes: { email, plan: plan.code, maxUsers: String(maxUsers) },
      }),
    });
    const order: any = await r.json();
    if (!r.ok) {
      console.error("razorpay order error:", order);
      return res.status(502).json({ error: "Could not start payment" });
    }
    await prisma.portalPayment.create({
      data: { email, planCode: plan.code, amount: total, currency: plan.currency, maxUsers, orderId: order.id },
    });
    res.json({
      keyId: rz.id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planName: plan.name,
    });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e?.message === "Razorpay is not configured" ? e.message : "Payment error" });
  }
}

/** Idempotent: marks the payment paid and extends the subscription once. */
async function applyPayment(orderId: string, paymentId: string) {
  const prisma = getCentralPrisma();
  const pay = await prisma.portalPayment.findUnique({ where: { orderId } });
  if (!pay || pay.status === "PAID") return pay;

  const plan = await prisma.subscriptionPlan.findUnique({ where: { code: pay.planCode } });
  if (!plan) return null;

  // Claim the payment atomically so verify + webhook cannot both extend.
  const claimed = await prisma.portalPayment.updateMany({
    where: { orderId, status: { not: "PAID" } },
    data: { status: "PAID", paymentId },
  });
  if (claimed.count === 0) return pay;

  const sub = await prisma.portalSubscription.findUnique({ where: { email: pay.email } });
  const now = new Date();
  const base = sub && sub.status === "ACTIVE" && sub.expiryDate > now ? sub.expiryDate : now;
  const tenant = await prisma.tenant.findUnique({ where: { email: pay.email } });
  await prisma.portalSubscription.upsert({
    where: { email: pay.email },
    update: {
      plan: plan.code,
      startDate: sub && base > now ? sub.startDate : now,
      expiryDate: addMonths(base, plan.months),
      status: "ACTIVE",
      maxUsers: pay.maxUsers,
    },
    create: {
      email: pay.email,
      clientId: tenant?.tenantId ?? "",
      plan: plan.code,
      startDate: now,
      expiryDate: addMonths(now, plan.months),
      status: "ACTIVE",
      maxUsers: pay.maxUsers,
    },
  });
  return pay;
}

// Called by the browser right after checkout succeeds.
export async function verifyPayment(req: Request, res: Response) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body ?? {};
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing payment details" });
  }
  try {
    const expected = crypto
      .createHmac("sha256", razorpayAuth().secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(String(razorpay_signature));
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.status(400).json({ error: "Payment verification failed" });
    }
    const pay = await getCentralPrisma().portalPayment.findUnique({ where: { orderId: razorpay_order_id } });
    if (!pay || pay.email !== (req as any).portalEmail) {
      return res.status(403).json({ error: "Not your payment" });
    }
    await applyPayment(razorpay_order_id, razorpay_payment_id);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not confirm payment" });
  }
}

// Razorpay -> server. Authoritative even if the user closes the browser.
export async function razorpayWebhook(req: Request, res: Response) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const raw: Buffer | undefined = (req as any).rawBody;
  const sig = String(req.headers["x-razorpay-signature"] ?? "");
  if (!secret || !raw) return res.status(400).end();
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(400).end();

  try {
    const ev = req.body;
    if (ev?.event === "payment.captured" || ev?.event === "order.paid") {
      const p = ev.payload?.payment?.entity;
      if (p?.order_id && p?.id) await applyPayment(p.order_id, p.id);
    }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
}

// ---------- EXE sync ----------

/** The Windows EXE calls this to get its signed subscription record. */
export async function syncSubscription(req: Request, res: Response) {
  const email = normEmail(req.body?.email);
  const password = req.body?.password ? String(req.body.password) : "";
  const syncToken = req.body?.syncToken ? String(req.body.syncToken) : "";
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const prisma = getCentralPrisma();
    let sub = await prisma.portalSubscription.findUnique({ where: { email } });

    // Token auth keeps the same token (so a dropped response never strands the EXE);
    // a fresh token is only issued after a password login.
    const tokenOk = !!sub?.syncTokenHash && !!syncToken && sub.syncTokenHash === sha256(syncToken);
    let authed = tokenOk;
    if (!authed && password) {
      const tenant = await prisma.tenant.findUnique({ where: { email } });
      authed = !!tenant?.password && (await bcrypt.compare(password, tenant.password));
      if (authed && !sub) {
        sub = await prisma.portalSubscription.create({
          data: { email, clientId: tenant!.tenantId, status: "EXPIRED" },
        });
      }
    }
    if (!authed || !sub) return res.status(401).json({ error: "Invalid credentials" });

    let newToken = syncToken;
    if (!tokenOk) {
      newToken = crypto.randomBytes(32).toString("hex");
      await prisma.portalSubscription.update({
        where: { email },
        data: { syncTokenHash: sha256(newToken) },
      });
    }

    // Companies inherit the master institute's subscription.
    const { master } = await resolveOwner(email);
    const src =
      master && master.email !== email
        ? (await prisma.portalSubscription.findUnique({ where: { email: master.email! } })) ?? sub
        : sub;

    const payload: SubscriptionPayload = {
      clientId: sub.clientId,
      email,
      plan: src.plan,
      startDate: src.startDate.toISOString(),
      expiryDate: src.expiryDate.toISOString(),
      status: src.status as SubscriptionPayload["status"],
      maxUsers: src.maxUsers,
      issuedAt: new Date().toISOString(),
      nonce: req.body?.nonce ? String(req.body.nonce).slice(0, 64) : undefined,
    };
    res.json({ ...signPayload(payload), syncToken: newToken });
  } catch (e) {
    console.error("sync failed:", e);
    res.status(500).json({ error: "Sync failed" });
  }
}

// ---------- Companies under a master institute ----------

// ---------- Companies (rows inside the institute's one database) ----------

const companyView = (c: any) => ({
  id: c.id,
  name: c.name,
  instituteName: c.instituteName,
  contact: c.contact,
  city: c.city,
  state: c.state,
  country: c.country,
  zipCode: c.zipCode,
  fullAddress: c.fullAddress,
  isMaster: !!c.isMaster,
  createdAt: c.createdAt,
});

async function masterContext(req: Request) {
  const prisma = getCentralPrisma();
  const master = await prisma.tenant.findUnique({ where: { email: (req as any).portalEmail } });
  if (!master || master.parentTenantId) return null;
  return { prisma, master, db: instituteDb(master) };
}

export async function listCompanies(req: Request, res: Response) {
  const ctx = await masterContext(req);
  if (!ctx) return res.status(404).json({ error: "Account not found" });
  await ensureMasterCompany(ctx.db);
  const rows = await ctx.db.clientAdmin.findMany({ orderBy: { createdAt: "asc" } });
  res.json(rows.map(companyView));
}

export async function createCompany(req: Request, res: Response) {
  const n = normalizeTenantInput(req.body);
  const required = [
    n.name, n.instituteName, n.contact, n.country,
    n.state, n.city, n.zipCode, n.fullAddress, n.financialStartDate, n.financialEndDate,
  ];
  if (required.some((v) => !v)) return res.status(400).json({ error: "Missing required fields." });

  try {
    const ctx = await masterContext(req);
    if (!ctx) return res.status(404).json({ error: "Account not found" });

    // Companies can only be added while the master's subscription is active (paid).
    const sub = await ctx.prisma.portalSubscription.findUnique({ where: { email: ctx.master.email! } });
    if (!sub || sub.status !== "ACTIVE" || sub.expiryDate <= new Date()) {
      return res.status(402).json({ error: "Please activate a paid subscription before adding companies." });
    }

    await ensureMasterCompany(ctx.db);
    const all = await ctx.db.clientAdmin.findMany({ select: { instituteName: true } });
    if (all.some((c: any) => c.instituteName.toLowerCase() === n.instituteName!.toLowerCase())) {
      return res.status(409).json({ error: "Company name already exists. Please choose a different name." });
    }

    const created = await createCompanyRow(ctx.db, ctx.master.slug, {
      name: n.name!, instituteName: n.instituteName!, contact: n.contact!, country: n.country!,
      state: n.state!, city: n.city!, zipCode: n.zipCode!, fullAddress: n.fullAddress!,
      financialStartDate: n.financialStartDate!, financialEndDate: n.financialEndDate!,
      certificateName: n.certificateName,
    });
    res.status(201).json(companyView(created));
  } catch (e: any) {
    console.error("create company failed:", e);
    res.status(500).json({ error: "Could not create the company" });
  }
}

/** Master edits a company's name, contact and address. */
export async function updateCompany(req: Request, res: Response) {
  const ctx = await masterContext(req);
  if (!ctx) return res.status(404).json({ error: "Account not found" });
  const company = await ctx.db.clientAdmin.findUnique({ where: { id: String(req.params.id) } });
  if (!company) return res.status(404).json({ error: "Company not found" });

  const n = normalizeTenantInput(req.body);
  const required = [n.name, n.instituteName, n.contact, n.country, n.state, n.city, n.zipCode, n.fullAddress];
  if (required.some((v) => !v)) return res.status(400).json({ error: "Please fill in all required fields." });
  const digits = String(n.contact).replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) {
    return res.status(400).json({ error: "Please enter a valid contact number." });
  }
  const others = await ctx.db.clientAdmin.findMany({
    where: { NOT: { id: company.id } },
    select: { instituteName: true },
  });
  if (others.some((c: any) => c.instituteName.toLowerCase() === n.instituteName!.toLowerCase())) {
    return res.status(409).json({ error: "Company name already exists. Please choose a different name." });
  }
  try {
    const updated = await ctx.db.clientAdmin.update({
      where: { id: company.id },
      data: {
        name: n.name!, instituteName: n.instituteName!, contact: n.contact!, country: n.country!,
        state: n.state!, city: n.city!, zipCode: n.zipCode!, fullAddress: n.fullAddress!,
      },
    });
    res.json(companyView(updated));
  } catch (e) {
    console.error("update company failed:", e);
    res.status(500).json({ error: "Could not update the company" });
  }
}
