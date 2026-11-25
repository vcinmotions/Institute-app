// controllers/authController.ts
import { Request, Response } from "express";
// import { centralPrisma } from "../prisma-client/central-client";
import { getCentralPrisma } from "../prisma-client/central-client";

import { getTenantPrisma } from "../prisma-client/tenant-client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { normalizeLoginInput } from "../utils/normalizer/loginNormalizer";
import { canClaimSession, claimSession, releaseSession, limitMessage } from "../services/sessionLimit.service";
import { companiesForUser, ensureMasterCompany, CompanyChoice } from "../utils/institute";
import { isEnforced, syncFromCloud, getState } from "../services/subscription.service";

export async function loginController(req: Request, res: Response) {

  const { email, password } = req.body;


  const normalizeEmail = normalizeLoginInput({ email });

  if (!normalizeEmail.email || !password)
    return res.status(400).json({ error: "Email and password required" });

  try {
    const centralPrisma = getCentralPrisma();

    // 1️⃣ MASTER ADMIN LOGIN
    const master = await centralPrisma.superAdmin.findUnique({
      where: { email: normalizeEmail.email },
    });

    if (master) {
      const valid = await bcrypt.compare(password, master.password);
      if (!valid) return res.status(401).json({ error: "Invalid password" });

      const token = jwt.sign(
        { id: master.id, role: "MASTER_ADMIN", email: normalizeEmail.email },
        process.env.JWT_SECRET!,
        { expiresIn: "30d" }
      );

      await centralPrisma.superAdmin.update({
        where: {
          id: master.id,
        },
        data: {
          currentSessionToken: token,
          lastLoginAt: new Date(),
        },
      });

      return res.json({
        message: "Master Login Successful",
        token: token,
        id: master.id,
        email: master.email,
        name: master.name,
        role: "MASTER_ADMIN",
      });
    }

    // 2️⃣ TENANT ADMIN / ROLE USER / FACULTY LOGIN
    if (!req.tenantPrisma) {
      return res.status(404).json({ error: "Tenant not found for this email" });
    }

    const tenantPrisma = req.tenantPrisma;
    const tenantInfo = req.tenantInfo;

    const found = await findUserByEmail(tenantPrisma, normalizeEmail.email);
    if (!found) {
      await authLog(req, "LOGIN_FAILED", `Failed sign-in: no user "${normalizeEmail.email}"`);
      return res.status(404).json({ error: "User not found" });
    }

    const valid = await bcrypt.compare(password, found.user.password);
    if (!valid) {
      await authLog(req, "LOGIN_FAILED", `Failed sign-in: wrong password for ${normalizeEmail.email}`, { name: found.user.name, role: found.user.role });
      return res.status(401).json({ error: "Invalid password" });
    }

    // Subscription: refresh from the portal at login (best-effort). The very
    // first activation must be online. Expired subscriptions may still sign in
    // (view/export only) - the subscriptionGuard blocks writes.
    if (isEnforced()) {
      const sync = await syncFromCloud({ email: normalizeEmail.email, password });
      if (!sync.ok && getState().status === "NOT_ACTIVATED") {
        // Say what actually went wrong; "needs internet" was shown for every failure.
        const why = sync.error === "Offline" || sync.error === "Portal timed out"
          ? "The licence server could not be reached. Check the internet connection and try again."
          : `The licence server refused the activation (${sync.error ?? "unknown error"}). Contact support.`;
        return res.status(403).json({ error: `First-time activation failed. ${why}` });
      }
    }

    // Which companies may this user work in?
    await ensureMasterCompany(tenantPrisma);
    const companies = await companiesForUser(tenantPrisma, userFacts(found));
    if (companies.length === 0) {
      return res.status(403).json({ error: "No company is assigned to this user. Ask your administrator." });
    }

    // One company: go straight in. Several: the user picks one next.
    if (companies.length > 1) {
      const selectionToken = jwt.sign(
        { purpose: "SELECT_COMPANY", email: normalizeEmail.email, userType: found.userType, id: found.user.id },
        process.env.JWT_SECRET!,
        { expiresIn: "5m" }
      );
      return res.status(200).json({
        needsCompany: true,
        message: "Select a company",
        name: found.user.name,
        companies,
        selectionToken,
      });
    }

    return finishLogin(req, res, found, companies[0], companies);
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

type Db = NonNullable<Request["tenantPrisma"]>;
type Found = { userType: "ADMIN" | "ROLE_USER" | "FACULTY"; user: any };

async function findUserByEmail(db: Db, email: string): Promise<Found | null> {
  const admin = await db.clientAdmin.findUnique({ where: { email } });
  if (admin) return { userType: "ADMIN", user: admin };
  const roleUser = await db.roleUser.findUnique({ where: { email }, include: { clientAdmin: true } });
  if (roleUser) return { userType: "ROLE_USER", user: roleUser };
  const faculty = await db.faculty.findUnique({ where: { email }, include: { clientAdmin: true } });
  if (faculty) return { userType: "FACULTY", user: faculty };
  return null;
}

async function findUserById(db: Db, userType: string, id: string | number): Promise<Found | null> {
  if (userType === "ADMIN") {
    const u = await db.clientAdmin.findUnique({ where: { id: String(id) } });
    return u ? { userType, user: u } : null;
  }
  if (userType === "ROLE_USER") {
    const u = await db.roleUser.findUnique({ where: { id: String(id) }, include: { clientAdmin: true } });
    return u ? { userType, user: u } : null;
  }
  if (userType === "FACULTY") {
    const u = await db.faculty.findUnique({ where: { id: Number(id) }, include: { clientAdmin: true } });
    return u ? { userType, user: u } : null;
  }
  return null;
}

const userFacts = (f: Found) => ({
  userType: f.userType,
  id: f.user.id,
  role: f.user.role,
  clientAdminId: f.userType === "ADMIN" ? f.user.id : f.user.clientAdminId,
});

/** Issues the real session token for the chosen company and takes a seat. */
async function finishLogin(
  req: Request,
  res: Response,
  found: Found,
  company: CompanyChoice,
  companies: CompanyChoice[]
) {
  const db = req.tenantPrisma as Db;
  const tenantInfo = req.tenantInfo;
  const { userType, user } = found;
  const who = { userType, userId: user.id, clientAdminId: company.id };

  // Simultaneous-login limit from the purchased plan (institute-wide).
  const can = await canClaimSession(db, who);
  if (!can.ok) {
    return res.status(403).json({ code: "LOGIN_LIMIT", error: limitMessage(can.max) });
  }

  const payload = {
    id: user.id,
    email: user.email,
    userType,
    role: company.role, // the role this user holds in the selected company
    tenantId: tenantInfo.id, // dbUrl is resolved server-side, never sent to clients
    clientAdminId: company.id,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "30d" });

  await authLog(req, "LOGIN", `Signed in to ${company.name ?? "company"}`, { name: user.name, role: company.role, clientAdminId: company.id, id: String(user.id) });

  const data = { currentSessionToken: token, lastLoginAt: new Date() };
  if (userType === "ADMIN") await db.clientAdmin.update({ where: { id: String(user.id) }, data });
  if (userType === "ROLE_USER") await db.roleUser.update({ where: { id: String(user.id) }, data });
  if (userType === "FACULTY") await db.faculty.update({ where: { id: Number(user.id) }, data });

  const claim = await claimSession(db, who, String(req.headers["user-agent"] ?? "").slice(0, 120));
  if (!claim.ok) {
    return res.status(403).json({ code: "LOGIN_LIMIT", error: limitMessage(claim.max) });
  }

  return res.status(200).json({
    message: "Login successful",
    instituteName: company.name,
    clientAdminId: company.id,
    companyId: company.id,
    companyName: company.name,
    companies,
    token,
    userType,
    id: user.id,
    email: user.email,
    name: user.name,
    role: company.role,
  });
}

/** Step 2 of login for users with several companies. */
export async function selectCompanyController(req: Request, res: Response) {
  const { selectionToken, companyId } = req.body ?? {};
  try {
    if (!req.tenantPrisma) return res.status(404).json({ error: "Tenant not found for this email" });
    const d = jwt.verify(String(selectionToken ?? ""), process.env.JWT_SECRET!) as any;
    if (d.purpose !== "SELECT_COMPANY") return res.status(401).json({ error: "Please sign in again." });

    const found = await findUserById(req.tenantPrisma, d.userType, d.id);
    if (!found) return res.status(404).json({ error: "User not found" });
    const companies = await companiesForUser(req.tenantPrisma, userFacts(found));
    const company = companies.find((c) => c.id === String(companyId));
    if (!company) return res.status(403).json({ error: "You do not have access to that company." });
    return finishLogin(req, res, found, company, companies);
  } catch (e: any) {
    if (e?.name === "TokenExpiredError" || e?.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Company selection expired. Please sign in again." });
    }
    console.error("select-company error:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/** Signed-in user moves to another company without signing in again (same seat). */
export async function switchCompanyController(req: Request, res: Response) {
  try {
    const db = req.tenantPrisma as Db;
    const u = req.user as any;
    const found = await findUserById(db, u.userType, u.id);
    if (!found) return res.status(404).json({ error: "User not found" });
    const companies = await companiesForUser(db, userFacts(found));
    const company = companies.find((c) => c.id === String(req.body?.companyId));
    if (!company) return res.status(403).json({ error: "You do not have access to that company." });
    req.tenantInfo = req.tenantInfo ?? { id: u.tenantId };
    return finishLogin(req, res, found, company, companies);
  } catch (e) {
    console.error("switch-company error:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/** Explicit sign-out (also called when the desktop app closes). Frees the seat and kills the token. */
export async function logoutController(req: Request, res: Response) {
  try {
    const db = req.tenantPrisma as Db;
    const u = req.user as any;
    const clear = { currentSessionToken: null as string | null };
    if (u.userType === "ADMIN") await db.clientAdmin.update({ where: { id: String(u.id) }, data: clear });
    if (u.userType === "ROLE_USER") await db.roleUser.update({ where: { id: String(u.id) }, data: clear });
    if (u.userType === "FACULTY") await db.faculty.update({ where: { id: Number(u.id) }, data: clear });
    await releaseSession(db, { userType: u.userType, userId: u.id });
    await authLog(req, "LOGOUT", "Signed out", { name: u.email, role: u.role, clientAdminId: u.clientAdminId, id: String(u.id) });
    return res.json({ message: "Signed out" });
  } catch (e) {
    console.error("logout error:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/** Keeps the seat alive. The app calls this every minute. */
export async function heartbeatController(req: Request, res: Response) {
  const db = req.tenantPrisma as Db;
  const u = req.user as any;
  const claim = await claimSession(db, { userType: u.userType, userId: u.id, clientAdminId: u.clientAdminId });
  if (!claim.ok) return res.status(403).json({ code: "LOGIN_LIMIT", error: limitMessage(claim.max) });
  return res.json({ ok: true });
}


/** Sign-in / sign-out / failed sign-in are recorded in the activity log (best effort, never blocks login). */
async function authLog(
  req: Request,
  action: "LOGIN" | "LOGOUT" | "LOGIN_FAILED",
  message: string,
  who: { name?: string; role?: string; clientAdminId?: string; id?: string } = {}
) {
  try {
    const db = req.tenantPrisma as Db | undefined;
    if (!db) return;
    const clientAdminId = who.clientAdminId ?? (await ensureMasterCompany(db));
    if (!clientAdminId) return;
    await db.activityLog.create({
      data: {
        clientAdminId,
        entity: "Authentication",
        entityId: who.id ?? "-",
        action,
        message,
        module: "auth",
        actorId: who.id ?? null,
        actorName: who.name ?? null,
        actorRole: who.role ?? null,
        ip: req.ip ?? null,
      },
    });
  } catch (e) {
    console.error("auth log failed:", e);
  }
}
