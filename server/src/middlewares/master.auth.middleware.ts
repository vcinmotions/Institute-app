// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
// import { centralPrisma } from "../prisma-client/central-client";
import { getCentralPrisma } from "../prisma-client/central-client";

import { getTenantPrisma } from "../prisma-client/tenant-client";

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
      superAdmin?: any;
    }
  }
}

export const masterAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Use values injected by tenantResolverMiddleware
  console.log("Raw Jwt Token:", req.headers.authorization);
  const token = req.headers.authorization?.split(" ")[1];
  //const token = req.headers.authorization
  console.log("Jwt Token:", token);

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;

    console.log("req.user", req.user);
    console.log("decoded", decoded);

    const id = decoded.id;
    const email = decoded.email;
    const role = decoded.role;

    if (!email) {
      return res
        .status(401)
        .json({ error: "Invalid token: Missing email or customDomain" });
    }

    const centralPrisma = getCentralPrisma();

    console.log("🔐 Decoded JWT -> Id:", id);
    console.log("🔐 Decoded JWT -> Email:", email);

    // 🧠 Fetch tenant info from central DB
    const superAdmin = await centralPrisma.superAdmin.findUnique({
      where: { email: email },
    });
    if (!superAdmin) {
      return res.status(404).json({ error: "superAdmin not found" });
    }

    console.log("Get Super Admin Data in Auth Middleware", superAdmin);

    // 🔌 Inject tenant-specific Prisma client into request
    req.superAdmin = superAdmin;

    let dbUser = null;

    if (role === "MASTER_ADMIN") {
      dbUser = await centralPrisma.superAdmin.findUnique({
        where: { id },
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

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
