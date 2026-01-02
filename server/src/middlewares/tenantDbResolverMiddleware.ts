// src/middlewares/tenantResolverMiddleware.ts
import { Request, Response, NextFunction } from "express";

import { getTenantPrisma } from "../prisma-client/tenant-client";
import { JwtPayload } from "jsonwebtoken";
import * as jwt from "jsonwebtoken";

export async function tenantDbUrlMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("Raw Jwt Token:", req.headers.authorization);
  const token = req.headers.authorization?.split(" ")[1];
  //const token = req.headers.authorization
  console.log("Jwt Token:", token);

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;

    console.log("GET TOKEN IN TENANT DB URL MIDDLEWARE;", decoded);

    console.log("req.user", req.user);
    console.log("decoded", decoded);

    const id = decoded.id;
    const email = decoded.email;

    if (!email) {
      return res
        .status(401)
        .json({ error: "Invalid token: Missing email or customDomain" });
    }

    console.log("🔐 Decoded JWT -> Id:", id);
    console.log("🔐 Decoded JWT -> Email:", email);

    //const dbUrl = decoded.dburl;

    // 🔌 Inject tenant-specific Prisma client into request
    req.tenantPrisma = getTenantPrisma(decoded.dbUrl);

    next();
  } catch (err) {
    console.error("❌ tenantResolverMiddleware error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
