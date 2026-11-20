// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import { getTenantPrisma } from "../prisma-client/tenant-client";
import { getTenantDbUrlById } from "../utils/tenantDbUrl";
import dotenv from "dotenv";
import { claimSession, sessionKey, limitMessage } from "../services/sessionLimit.service";
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
        select: { currentSessionToken: true },
      });
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

    if (dbUser.currentSessionToken !== incomingToken) {
      return res.status(401).json({
        error:
          "You have been logged out because your account was used on another device.",
      });
    }

    // Simultaneous-login limit (counts this user as active).
    const claim = claimSession(sessionKey(String(decoded.tenantId ?? ""), String(userType), id));
    if (!claim.ok) {
      return res.status(403).json({ code: "LOGIN_LIMIT", error: limitMessage(claim.max) });
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
