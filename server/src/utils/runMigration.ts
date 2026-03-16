import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { getCentralDbUrl } from "./envLoader";
import { getUserDataPath } from "../middlewares/runtimePaths";

const centralSchema = path.join(
  __dirname,
  "..",
  "..",
  "prisma",
  "central",
  "schema.sqlite.prisma"
);

const tenantSchema = path.join(
  __dirname,
  "..",
  "..",
  "prisma",
  "institute",
  "schema.sqlite.prisma"
);

export function runCentralMigrations() {
  const dbUrl = getCentralDbUrl();

  console.log("📦 Running CENTRAL migrations:", dbUrl);

  execSync(`npx prisma db push --accept-data-loss --schema="${centralSchema}"`, {
    env: {
      ...process.env,
      CENTRAL_DATABASE_URL: dbUrl,
    },
    stdio: "inherit",
  });
}

export function runTenantMigrations() {
  const tenantsDir = path.join(
    getUserDataPath(),
    "data",
    "tenants"
  );

  console.log("tenant dir:", tenantsDir);

  if (!fs.existsSync(tenantsDir)) {
    console.log("⚠ No tenant DBs found.");
    return;
  }

  const tenantFiles = fs.readdirSync(tenantsDir);

  for (const file of tenantFiles) {
    if (!file.endsWith(".db")) continue;

    const dbPath = path.join(tenantsDir, file);
    const dbUrl = `file:${dbPath.replace(/\\/g, "/")}`;

    console.log("📦 Migrating tenant DB:", dbUrl);

    execSync(`npx prisma db push --accept-data-loss --schema="${tenantSchema}"`, {
      env: {
        ...process.env,
        TENANT_DATABASE_URL: dbUrl,
      },
      stdio: "inherit",
    });
  }
}