// Creates the master (super) admin login in the central database.
//
//   Developer PC:  npm run create-superadmin                    (admin@master.com / master123)
//   Live portal:   APP_ENV=portal SUPERADMIN_EMAIL=you@example.com SUPERADMIN_PASSWORD='...' npm run create-superadmin
//                  On the portal both values are required: the dev login is never created there.
import { loadEnv } from "./envLoader";
loadEnv(); // same env files as the server (APP_ENV=portal -> .env.portal only)

import { getCentralPrisma } from "../prisma-client/central-client";
import bcrypt from "bcryptjs";

const isPortal = process.env.APP_ENV === "portal";

const databaseUrl = process.env.CENTRAL_DATABASE_URL;

if (!databaseUrl) {
  throw new Error("❌ CENTRAL_DATABASE_URL is not defined");
}

if (!databaseUrl.startsWith("postgresql://")) {
  throw new Error("❌ Expected a PostgreSQL CENTRAL_DATABASE_URL (postgresql://...)");
}

const email = process.env.SUPERADMIN_EMAIL || (isPortal ? "" : "admin@master.com");
const password = process.env.SUPERADMIN_PASSWORD || (isPortal ? "" : "master123");

if (isPortal && (!email || password.length < 12)) {
  throw new Error("❌ On the live portal set SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD (at least 12 characters).");
}

console.log(`Creating SuperAdmin ${email} (APP_ENV=${process.env.APP_ENV || "dev"})`);

const centralPrisma = getCentralPrisma(databaseUrl);

async function createSuperAdmin() {
  const name = "Master Admin";
  const role = "MASTER_ADMIN";
  const contact = "9819234567";
  const position = "Super Admin";
  const state = "Maharashtra";
  const country = "India";
  const city = "Mumbai";
  const zipCode = "400024";

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await centralPrisma.superAdmin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        contact,
        position,
        country,
        state,
        city,
        zipCode,
        role,
      },
    });

    console.log("✅ SuperAdmin created:", admin.email);
  } catch (error: any) {
    if (error.code === "P2002") {
      console.error("❌ SuperAdmin with this email already exists.");
    } else {
      console.error("❌ Error creating SuperAdmin:", error);
    }
  } finally {
    await centralPrisma.$disconnect();
  }
}

createSuperAdmin();
