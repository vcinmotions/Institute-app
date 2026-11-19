import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getCentralPrisma } from "../prisma-client/central-client";
import { createTenant } from "../utils/createTenant";
import { normalizeTenantInput } from "../utils/normalizer/tenantNormalizer";
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

  try {
    const prisma = getCentralPrisma();
    if (await prisma.tenant.findUnique({ where: { email: n.email! } })) {
      return res.status(409).json({ error: "Username already exists. Please choose a different username." });
    }
    if (await prisma.tenant.findUnique({ where: { instituteName: n.instituteName! } })) {
      return res.status(409).json({ error: "Institute name already exists. Please choose a different institute name." });
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
      create: { email: n.email!, clientId: tenant?.tenantId ?? "", status: "EXPIRED" },
    });

    res.status(201).json({ token: portalToken(n.email!), email: n.email });
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

// ---------- Subscription status ----------

export async function portalMe(req: Request, res: Response) {
  const email = (req as any).portalEmail as string;
  const prisma = getCentralPrisma();
  const sub = await prisma.portalSubscription.findUnique({ where: { email } });
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
    startDate: sub?.startDate ?? null,
    email,
    status: active ? "ACTIVE" : sub?.status === "ACTIVE" ? "EXPIRED" : sub?.status ?? "EXPIRED",
    plan: sub?.plan ?? "NONE",
    expiryDate: sub?.expiryDate ?? null,
    daysLeft: sub ? Math.max(0, Math.ceil((+sub.expiryDate - Date.now()) / 86400000)) : 0,
  });
}

export async function portalPayments(req: Request, res: Response) {
  const email = (req as any).portalEmail as string;
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
    const plan = await prisma.subscriptionPlan.findUnique({ where: { code } });
    // Price always comes from the database (set by the super admin), never from the browser.
    if (!plan || !plan.active || !(plan.price > 0)) {
      return res.status(400).json({ error: "This plan is not available" });
    }
    const rz = razorpayAuth();
    const r = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: rz.header },
      body: JSON.stringify({
        amount: Math.round(plan.price * 100),
        currency: plan.currency,
        receipt: `sub_${Date.now()}`,
        notes: { email, plan: plan.code },
      }),
    });
    const order: any = await r.json();
    if (!r.ok) {
      console.error("razorpay order error:", order);
      return res.status(502).json({ error: "Could not start payment" });
    }
    await prisma.portalPayment.create({
      data: { email, planCode: plan.code, amount: plan.price, currency: plan.currency, orderId: order.id },
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
    },
    create: {
      email: pay.email,
      clientId: tenant?.tenantId ?? "",
      plan: plan.code,
      startDate: now,
      expiryDate: addMonths(now, plan.months),
      status: "ACTIVE",
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

    const payload: SubscriptionPayload = {
      clientId: sub.clientId,
      email,
      plan: sub.plan,
      startDate: sub.startDate.toISOString(),
      expiryDate: sub.expiryDate.toISOString(),
      status: sub.status as SubscriptionPayload["status"],
      issuedAt: new Date().toISOString(),
    };
    res.json({ ...signPayload(payload), syncToken: newToken });
  } catch (e) {
    console.error("sync failed:", e);
    res.status(500).json({ error: "Sync failed" });
  }
}
