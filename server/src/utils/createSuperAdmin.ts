import { getCentralPrisma } from "../prisma-client/central-client";

import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

const rootDir = path.resolve(__dirname, "../../");
const envFile = process.env.APP_ENV === "prod"
  ? ".env.prod"
  : ".env.dev";

const envPath = path.join(rootDir, envFile);

console.log("=================================");
console.log("APP_ENV before loading:", process.env.APP_ENV);
console.log("Loading ENV FILE:", envFile);
console.log("ENV PATH:", envPath);
console.log("Root Dir:", rootDir);
console.log("=================================");

if (!fs.existsSync(envPath)) {
  throw new Error(`❌ ENV file not found: ${envPath}`);
}

dotenv.config({
  path: envPath,
  override: true,
});

console.log("APP_ENV:", process.env.APP_ENV);
console.log("DB_PROVIDER:", process.env.DB_PROVIDER);
console.log("CENTRAL_DATABASE_URL:", process.env.CENTRAL_DATABASE_URL);

const databaseUrl = process.env.CENTRAL_DATABASE_URL;

if (!databaseUrl) {
  throw new Error("❌ CENTRAL_DATABASE_URL is not defined");
}

if (!databaseUrl.startsWith("postgresql://")) {
  throw new Error(
    `❌ Expected PostgreSQL CENTRAL_DATABASE_URL, received: ${databaseUrl}`
  );
}

const centralPrisma = getCentralPrisma(databaseUrl);

async function createSuperAdmin() {
  const name = "Master Admin";
  const email = "admin@master.com";
  const password = "master123";
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

    console.log("✅ SuperAdmin created:", admin);
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
