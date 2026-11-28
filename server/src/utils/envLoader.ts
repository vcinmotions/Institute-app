import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { getUserDataPath, isPackaged } from "../middlewares/runtimePaths";

let loaded = false;

// export function loadEnv() {
//   if (loaded) return; // prevent multiple loads
//   const rootDir = isPackaged ? process.cwd() : path.resolve(__dirname, "../../");

//   const envFile = process.env.APP_ENV === "prod" ? ".env.prod" : ".env.dev";

//   console.log("ENVFILE in LoadEnv;", envFile);
//   console.log("DB_PROVIDER in LoadEnv;", process.env.DB_PROVIDER);

//   // Load environment
//   dotenv.config({ path: path.join(rootDir, envFile) });
//   dotenv.config({ path: path.join(rootDir, ".env"), override: false });

//   loaded = true;
// }

/**
 * The env file for this run:
 *   APP_ENV=prod   -> .env.prod   (desktop EXE)
 *   APP_ENV=portal -> .env.portal (live web portal; .env.dev / .env.prod are never read)
 *   anything else  -> .env.dev    (developer PC)
 */
export function activeEnvFile(): string {
  if (process.env.APP_ENV === "prod") return ".env.prod";
  if (process.env.APP_ENV === "portal") return ".env.portal";
  return ".env.dev";
}

export function loadEnv() {
  if (loaded) return;

  const rootDir = path.resolve(__dirname, "../../");

  const envFile = activeEnvFile();

  console.log("=================================");
  console.log("APP_ENV:", process.env.APP_ENV);
  console.log("Loading ENV FILE:", envFile);
  console.log("Root Dir:", rootDir);
  console.log("=================================");

  dotenv.config({
    path: path.join(rootDir, envFile),
    // On the live portal .env.portal is the only source of truth: it must win over values a
    // process manager (pm2) kept from an old shell, e.g. JWT_SECRET=CHANGE_ME from a first start.
    override: envFile === ".env.portal",
  });

  dotenv.config({
    path: path.join(rootDir, ".env"),
    override: false,
  });

  // Portal-only secrets (e.g. SUBSCRIPTION_PRIVATE_KEY). Not committed, not shipped in the EXE.
  // In portal mode it was already loaded above.
  if (envFile !== ".env.portal") {
    dotenv.config({
      path: path.join(rootDir, ".env.portal"),
      override: false,
    });
  }

  if (envFile === ".env.portal" && !fs.existsSync(path.join(rootDir, ".env.portal"))) {
    console.error(`APP_ENV=portal but ${path.join(rootDir, ".env.portal")} was not found.`);
  }

  loaded = true;
}

export function getCentralDbUrl(): string | undefined {
  loadEnv();
  const isProd = process.env.APP_ENV === "prod";
  const isSqlite = process.env.DB_PROVIDER === "sqlite";

  if (isProd && isSqlite) {
    const dbPath = path.join(getUserDataPath(), "data", "central.db");

    return `file:${dbPath.replace(/\\/g, "/")}`;
  }


  return process.env.CENTRAL_DATABASE_URL; // fallback for Postgres/dev
}

/**
 * Optional helper: construct SQLite URL for a tenant in production
 */

export function getTenantDbUrl(tenantId: string, prod: boolean): string {
  if (prod) {

    const tenantsDir = path.join(
      getUserDataPath(),
      "data",
      "tenants"
    );

    // ensure folder exists
    fs.mkdirSync(tenantsDir, { recursive: true });

    const dbPath = path.join(
      tenantsDir,
      `tenant_${tenantId}.db`
    );

    return `file:${dbPath.replace(/\\/g, "/")}`;
  }

  throw new Error(
    "Tenant DB URL must be provided for non-production environments"
  );
}

// export function getTenantDbUrl(tenantId: string, prod: boolean): string {
//   if (prod) {
//     // return `file:${path.join(getUserDataPath(), "tenants", `tenant_${tenantId}.db`)}`;

//     const dbPath = path.join(
//       getUserDataPath(),
//       "tenants",
//       `tenant_${tenantId}.db`
//     );

//     return `file:${dbPath.replace(/\\/g, "/")}`;

//   }
//   throw new Error("Tenant DB URL must be provided for non-production environments");
// }
