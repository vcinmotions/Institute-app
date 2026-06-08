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

/* ---------------- BASE PATH ---------------- */
const isProd = process.env.APP_ENV === "prod";

if (isProd && !process.env.RESOURCES_PATH) {
  throw new Error("❌ RESOURCES_PATH is not defined in production");
}

const basePath = isProd
  ? process.env.RESOURCES_PATH!   // ✅ MUST pass from Electron
  : path.join(__dirname, "..", "..");

/* ---------------- PATHS ---------------- */

const nodePath = isProd
  ? path.join(basePath, "node", "node.exe")
  : "node";

const prismaCLI = isProd
  ? path.join(basePath, "server", "dist", "node_modules", "prisma", "build", "index.js")
  : path.join(basePath, "node_modules", "prisma", "build", "index.js");

function ensureProdDataDirs() {
  if (!isProd) return;

  const dataDir = path.join(getUserDataPath(), "data");
  const tenantsDir = path.join(dataDir, "tenants");

  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(tenantsDir, { recursive: true });
}

export function runCentralMigrations() {
  ensureProdDataDirs();

  const dbUrl = getCentralDbUrl();

  console.log("📦 Running CENTRAL migrations:", dbUrl);
  console.log("basePath:", basePath);
  console.log("nodePath:", nodePath);
  console.log("prismaCLI:", prismaCLI);

  execSync(`"${nodePath}" "${prismaCLI}" db push --accept-data-loss --schema="${centralSchema}"`, {
    env: {
      ...process.env,
      CENTRAL_DATABASE_URL: dbUrl,
    },
    stdio: "inherit",
  });
}

export function runTenantMigrations() {
  ensureProdDataDirs();

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

    execSync(`"${nodePath}" "${prismaCLI}" db push --accept-data-loss --schema="${tenantSchema}"`, {
      env: {
        ...process.env,
        TENANT_DATABASE_URL: dbUrl,
      },
      stdio: "inherit",
    });
  }
}
