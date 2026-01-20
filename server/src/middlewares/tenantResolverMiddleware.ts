// // src/middlewares/tenant-resolver.middleware.ts
// import { Request, Response, NextFunction } from 'express';
// import { centralPrisma } from '../prisma-client/central-client';
// import { getTenantPrisma } from '../prisma-client/tenant-client';

// export async function tenantResolverMiddleware(req: Request, res: Response, next: NextFunction) {
//   try {

//     const { email } = req.body;

//     console.log("GET EMAIL IN TENANT MIDDLEWARE:", email);

//     if (!email) {
//       // no email → maybe master login or public route
//       return next();
//     }

//     // Look up tenant by domain
//     const tenant = await centralPrisma.tenant.findFirst({
//       where: { email: email },
//     });  // fetch tenant info from cantral db where customDmoain matches origin from req.header!

//     console.log("Tenant Found in TeanantResolverMiddleware", tenant);

//     if (!tenant) {
//       return res.status(404).json({ error: `No tenant found for domain: ${email}` });
//     }

//     // Get tenant-specific Prisma client
//     const tenantPrisma = getTenantPrisma(tenant.dbUrl);

//     // Inject tenantPrisma into request
//     req.tenantPrisma = tenantPrisma;

//     // Optionally inject tenant data too
//     req.tenantInfo = tenant;

//     next();
//   } catch (err) {
//     console.error('❌ Error in tenantResolverMiddleware:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }

// src/middlewares/tenantResolverMiddleware.ts
// import { Request, Response, NextFunction } from 'express';
// import { centralPrisma } from '../prisma-client/central-client';
// import { getTenantPrisma } from '../prisma-client/tenant-client';

// export async function tenantResolverMiddleware(req: Request, res: Response, next: NextFunction) {
//   try {
//     const { email } = req.body;

//     // If no email -> might be master admin login
//     if (!email) return next();

//     // 🔍 Check if this email belongs to a tenant (client admin email)
//     const tenant = await centralPrisma.tenant.findFirst({
//       where: { email },
//     });

//     if (!tenant) {
//       // Allow handler to check for Master Admin login next
//       return next();
//     }

//     console.log("get tenant specific db url in tenant Resolver Middleware:", tenant);

//     console.log("get tenant specific db url in tenant Resolver Middleware:", tenant.dbUrl);

//     req.tenantPrisma = getTenantPrisma(tenant.dbUrl);
//     req.tenantInfo = tenant;

//     next();
//   } catch (err) {
//     console.error("❌ tenantResolverMiddleware error:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// }

import { Request, Response, NextFunction } from "express";
// import { centralPrisma } from "../prisma-client/central-client";
import { getCentralPrisma } from "../prisma-client/central-client";

import { getTenantPrisma } from "../prisma-client/tenant-client";
import path from "path";
import dotenv from "dotenv";
import { getUserDataPath, isPackaged } from "./runtimePaths";
import { getTenantDbUrl } from "../utils/envLoader";

// Decide environment
const envFile =
  process.env.APP_ENV === "prod" ? ".env.prod" : ".env.dev";

  
  const rootDir = isPackaged
    ? process.cwd()
    : path.resolve(__dirname, "../../");

  // Load active env
  dotenv.config({ path: path.join(rootDir, envFile) });

const isProd = process.env.APP_ENV === "prod";
const isSqlite = process.env.DB_PROVIDER === "sqlite";

export async function tenantResolverMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = req.body;

    // 1️⃣ Skip middleware for master admin login
    if (!email) return next();

    // 🧠 If email belongs to the master admin -> skip tenant lookup
    // if (email.toLowerCase().includes("@master")) {
    //   console.log("🛑 Skipping tenant resolution for Master Admin login");
    //   return next();
    // }
    // const centralPrisma = getCentralPrisma();




    const centralPrisma = getCentralPrisma();

    // 1️⃣ Check master admin FIRST
    const masterAdmin = await centralPrisma.superAdmin.findUnique({
      where: { email },
    });

    if (masterAdmin) {
      console.log("🛑 MASTER ADMIN detected. Skipping tenant lookup.");
      return next();
    }

    // 2️⃣ Check client admin login in central DB
    // const tenant = await centralPrisma.tenant.findFirst({
    //   where: { email },
    // });

    // if (tenant) {
    //   console.log("✅ Client Admin login detected for tenant:", tenant.name);
    //   req.tenantPrisma = getTenantPrisma(tenant.dbUrl);
    //   req.tenantInfo = tenant;
    //   return next();
    // }

    // 2️⃣ Check if email directly matches a client admin in central DB
    const tenant = await centralPrisma.tenant.findFirst({
      where: { email },
    });

    // if (tenant) {
    //   console.log("✅ Found Client Admin tenant:", tenant.name);
    //   req.tenantPrisma = getTenantPrisma(tenant.dbUrl);
    //   req.tenantInfo = tenant;
    //   return next();
    // }

    if (tenant) {
      const tenantDbUrl = isProd
        ? getTenantDbUrl(tenant.tenantId, true)
        : tenant.dbUrl;




      req.tenantPrisma = getTenantPrisma(tenantDbUrl);
      req.tenantInfo = tenant;
      return next();
    }

    // 3️⃣ Extract institute name from email domain
    const slug = email.split("@")[1]?.toLowerCase(); // e.g. "doki.com"
    //const slug = domainPart?.split(".")[0]?.toLowerCase(); // e.g. "doki"

    console.log("GET slug NAME; in tenant Resolver middleware", slug);

    if (!slug) {
      console.log("❌ Could not extract slug name from email:", email);
      return next();
    }

    const getALlTenant = await centralPrisma.tenant.findMany({});

    console.log("GET ALL TENANT IN CENTRL DB;", getALlTenant);

    // 4️⃣ Try to find tenant by domain or name
    // const domainTenant = await centralPrisma.tenant.findFirst({
    //   where: {
    //     slug: { equals: slug, mode: "insensitive" },
    //   },
    // });

    // 4️⃣ Find tenant by slug
    const domainTenant = await centralPrisma.tenant.findFirst({
      where: { slug },
    });

    if (domainTenant) {
      console.log(
        "✅✅✅✅✅✅✅✅✅✅✅✅✅ Found Faculty/RoleUser tenant:",
        domainTenant.name
      );
      req.tenantPrisma = getTenantPrisma(domainTenant.dbUrl);
      req.tenantInfo = domainTenant;
      return next();
    }

    // 5️⃣ Tenant not found
    console.log("❌ Tenant not found for email:", email);
    return res.status(404).json({ error: "Tenant not found for this email" });
  } catch (err) {
    console.error("❌ tenantResolverMiddleware error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
