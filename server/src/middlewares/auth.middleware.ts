// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import { getTenantPrisma } from "../prisma-client/tenant-client";
import { getTenantDbUrlById } from "../utils/tenantDbUrl";
import dotenv from "dotenv";
import { claimSession, limitMessage } from "../services/sessionLimit.service";
import { isDesktopApp } from "./runtimePaths";
dotenv.config({ path: ".env" });

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
      tenantPrisma?: ReturnType<typeof getTenantPrisma>;
      tenantInfo?: any;
    }
  }
}

/** The most recent Sunday 23:59 (local time) at or before `now`: the weekly sign-out moment in the EXE. */
export function lastWeeklySignOut(now: Date): Date {
  const d = new Date(now);
  d.setDate(d.getDate() - d.getDay()); // this week's Sunday (getDay: 0 = Sunday)
  d.setHours(23, 59, 0, 0);
  if (d > now) d.setDate(d.getDate() - 7);
  return d;
}

// Refresh a user's seat at most this often (the app also sends a heartbeat every minute).
const TOUCH_EVERY_MS = 30 * 1000;
const lastTouch = new Map<string, number>();

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  //const token = req.headers.authorization

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;

    // Master (super-admin) tokens are not valid on institute routes.
    if (decoded.role === "MASTER_ADMIN") {
      return res.status(403).json({ error: "Master admin cannot use institute routes" });
    }

    // Desktop EXE: closing the app keeps users signed in, so everyone is signed out once a week instead
    // (Sunday 11:59 PM, this server's local time). A sign-in from before that moment is no longer valid.
    if (isDesktopApp() && typeof decoded.iat === "number" && decoded.iat * 1000 < lastWeeklySignOut(new Date()).getTime()) {
      return res.status(401).json({ code: "SESSION_ENDED", error: "Weekly sign-out: please sign in again." });
    }

    const id = decoded.id;
    const email = decoded.email;
    // dbUrl is resolved server-side from the tenant id (older tokens may still carry it).
    let dbUrl: string | null | undefined = decoded.dbUrl;
    if (!dbUrl && decoded.tenantId) {
      dbUrl = await getTenantDbUrlById(decoded.tenantId);
    }
    // Server-side only. Non-enumerable so it never shows up in logs or JSON output.
    Object.defineProperty(decoded, "dbUrl", { value: dbUrl, enumerable: false, writable: true });
    const userType = decoded.userType;

    if (!email) {
      return res
        .status(401)
        .json({ error: "Invalid token: Missing email or customDomain" });
    }

    console.log("🔐 Decoded JWT -> Id:", id);
    console.log("🔐 Decoded JWT -> Email:", email);
    console.log("🔐 Decoded JWT -> userType:", userType);

    //const dbUrl = decoded.dburl;

    if (!dbUrl) {
      return res.status(500).json({ error: "Database URL not configured" });
    }

    // 🔌 Inject tenant-specific Prisma client into request
    req.tenantPrisma = getTenantPrisma(dbUrl);

    // ***************************************
    // 🔥 SINGLE DEVICE LOGIN VALIDATION HERE
    // ***************************************

    const tenantPrisma = req.tenantPrisma;

    let dbUser = null;

    if (userType === "ADMIN") {
      dbUser = await tenantPrisma.clientAdmin.findUnique({
        where: { id },
        select: { currentSessionToken: true },
      });
    } else if (userType === "ROLE_USER") {
      dbUser = await tenantPrisma.roleUser.findUnique({
        where: { id },
        select: { currentSessionToken: true, customRoleId: true },
      });
      // Read from the database on every request so changing a user's role takes effect immediately.
      (decoded as any).customRoleId = (dbUser as any)?.customRoleId ?? null;
    } else if (userType === "FACULTY") {
      dbUser = await tenantPrisma.faculty.findUnique({
        where: { id: Number(id) },
        select: { currentSessionToken: true },
      });
    }

    if (!dbUser) {
      return res.status(401).json({ error: "User not found" });
    }

    // 🚨 Single Device Check
    const incomingToken = token;

    if (!dbUser.currentSessionToken) {
      // Cleared by an explicit sign-out: the old token can never be reused.
      return res.status(401).json({ code: "SESSION_ENDED", error: "You have been signed out. Please sign in again." });
    }
    if (dbUser.currentSessionToken !== incomingToken) {
      return res.status(401).json({
        error:
          "You have been logged out because your account was used on another device.",
      });
    }

    // Simultaneous-login limit, counted institute-wide. A seat that timed out
    // (no heartbeat) is re-registered here when there is room.
    const who = { userType: String(userType), userId: String(id), clientAdminId: decoded.clientAdminId };
    const tk = `${dbUrl}|${who.userType}|${who.userId}`;
    const now = Date.now();
    if (!lastTouch.has(tk) || now - (lastTouch.get(tk) as number) > TOUCH_EVERY_MS) {
      const claim = await claimSession(tenantPrisma, who);
      if (!claim.ok) {
        lastTouch.delete(tk);
        return res.status(403).json({ code: "LOGIN_LIMIT", error: limitMessage(claim.max) });
      }
      lastTouch.set(tk, now);
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
