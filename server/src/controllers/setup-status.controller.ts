// import { Request, Response } from "express";
// import { getUserDataPath } from "../middlewares/runtimePaths";

// export function setupStatusController(req: Request, res: Response) {
//   res.json({
//     setupComplete: Boolean(getUserDataPath()),
//   });
// }


// import { Request, Response } from "express";
// import fs from "fs";
// import path from "path";
// import { PrismaClient } from "../../prisma-client/generated/central";
// import { getUserDataPath } from "../middlewares/runtimePaths";
// import { getCentralDbUrl } from "../utils/envLoader";

// export async function setupStatusController(req: Request, res: Response) {
//   console.log("SETUPSTATUSCONTROLLER IS BEING CALLED")
//   try {
//     const isProd = process.env.APP_ENV === "prod";
//     console.log("is Prod:", isProd);
//     /* ---------- PROD (Electron + SQLite) ---------- */
//     if (isProd) {
//       const dbPath = path.join(getUserDataPath(), "central.db");

//       // 1️⃣ File must exist
//       if (!fs.existsSync(dbPath)) {
//         return res.json({ setupComplete: "NOT_STARTED" });
//       }

//       // 2️⃣ DB must be readable
//       try {
//         const prisma = new PrismaClient({
//           datasources: {
//             db: { url: `file:${dbPath}` },
//           },
//         });

//         // 3️⃣ Schema must exist
//         await prisma.superAdmin.findFirst();
//         await prisma.$disconnect();

//         return res.json({ setupComplete: true });
//       } catch {
//         return res.json({ setupComplete: false });
//       }
//     }

//     /* ---------- DEV (Postgres) ---------- */
//     console.log("is Prod:", isProd);

//     const dbUrl = getCentralDbUrl();
//     if (!dbUrl) {
//       return res.json({ setupComplete: "NOT_STARTED" });
//     }

//     const prisma = new PrismaClient({
//       datasources: {
//         db: { url: dbUrl },
//       },
//     });

//     await prisma.superAdmin.findFirst();
//     await prisma.$disconnect();

//     console.log("GET SETUP STATUS IN DEV:", { setupComplete: true, APP_ENV: "DEV" })
//     return res.json({ setupComplete: true });
//   } catch (err) {
//     console.log("GET SETUP STATUS IN PROD:", { setupComplete: false, APP_ENV: "PROD" })

//     return res.json({ setupComplete: false });
//   }
// }

import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { PrismaClient } from "../../prisma-client/generated/central";
import { getUserDataPath } from "../middlewares/runtimePaths";
import { getCentralDbUrl } from "../utils/envLoader";

export async function setupStatusController(req: Request, res: Response) {
  console.log("SETUPSTATUSCONTROLLER IS BEING CALLED");

  try {
    const isProd = process.env.APP_ENV === "prod";
    console.log("isProd:", isProd);

    let prisma: PrismaClient;

    /* ---------- PROD (Electron + SQLite) ---------- */
    if (isProd) {
      const dbPath = path.join(getUserDataPath(), "central.db");

      if (!fs.existsSync(dbPath)) {
        return res.json({ setupComplete: "NOT_STARTED" });
      }

      prisma = new PrismaClient({
        datasources: { db: { url: `file:${dbPath}` } },
      });
    } 
    /* ---------- DEV (Postgres) ---------- */
    else {
      const dbUrl = getCentralDbUrl();
      if (!dbUrl) {
        return res.json({ setupComplete: "NOT_STARTED" });
      }

      prisma = new PrismaClient({
        datasources: { db: { url: dbUrl } },
      });
    }

    // Check if SuperAdmin exists
    const admin = await prisma.superAdmin.findFirst();
    await prisma.$disconnect();

    if (!admin) {
      // DB exists but no admin
      return res.json({ setupComplete: "NOT_STARTED" });
    }

    // Determine setup stage based on flags
    if (admin.basicComplete && !admin.addressComplete) {
      return res.json({ setupComplete: "BASIC_DONE" });
    } else if (admin.basicComplete && admin.addressComplete) {
      return res.json({ setupComplete: "FULL_DONE" });
    } else {
      return res.json({ setupComplete: "NOT_STARTED" });
    }

  } catch (err) {
    console.error("Error checking setup status:", err);
    return res.json({ setupComplete: "NOT_STARTED" });
  }
}
