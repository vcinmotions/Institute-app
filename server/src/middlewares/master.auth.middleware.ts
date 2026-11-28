// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import { getCentralPrisma } from "../prisma-client/central-client";
import { authMiddleware } from "./auth.middleware";
import { isDesktopApp } from "./runtimePaths";

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
      superAdmin?: any;
      /** Set when the request may use the system (master) screens: backup, branding, health, updates... */
      systemAdmin?: boolean;
    }
  }
}

/** The institute owner's login (a ClientAdmin, role ADMIN) - the one admin of the desktop EXE. */
const isInstituteAdminToken = (d: JwtPayload) => d.userType === "ADMIN" && d.role === "ADMIN";

/** True when the request passed masterAuthMiddleware (master token, or the institute ADMIN in the EXE). */
export const isSystemAdmin = (req: Request) => !!req.systemAdmin;

/**
 * System (master) routes.
 *  - Web server: master admin token only (unchanged).
 *  - Desktop EXE: the institute ADMIN. It is checked by the normal institute auth (session, single device,
 *    login limit), then mapped to the installation's master record so the master controllers work unchanged.
 *    Master tokens are refused there: the EXE has one admin concept.
 */
export const masterAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  if (isDesktopApp()) {
    if (!isInstituteAdminToken(decoded)) {
      return res.status(403).json({ error: "Admin access required" });
    }
    return authMiddleware(req, res, async () => {
      try {
        const superAdmin = await getCentralPrisma().superAdmin.findFirst({ orderBy: { createdAt: "asc" } });
        if (!superAdmin) return res.status(404).json({ error: "This installation is not set up." });
        req.superAdmin = superAdmin;
        req.systemAdmin = true;
        next();
      } catch (err) {
        console.error("system admin check failed:", err);
        res.status(500).json({ error: "Could not verify admin access" });
      }
    });
  }

  try {
    req.user = decoded;

    if (decoded.role !== "MASTER_ADMIN") {
      return res.status(403).json({ error: "Master admin access required" });
    }

    const id = decoded.id;
    const email = decoded.email;

    if (!email) {
      return res
        .status(401)
        .json({ error: "Invalid token: Missing email or customDomain" });
    }

    const centralPrisma = getCentralPrisma();

    const superAdmin = await centralPrisma.superAdmin.findUnique({
      where: { email: email },
    });
    if (!superAdmin) {
      return res.status(404).json({ error: "superAdmin not found" });
    }

    req.superAdmin = superAdmin;

    const dbUser = await centralPrisma.superAdmin.findUnique({
      where: { id },
      select: { currentSessionToken: true },
    });

    if (!dbUser) {
      return res.status(401).json({ error: "User not found" });
    }

    // Single Device Check
    if (dbUser.currentSessionToken !== token) {
      return res.status(401).json({
        error:
          "You have been logged out because your account was used on another device.",
      });
    }

    req.systemAdmin = true;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
