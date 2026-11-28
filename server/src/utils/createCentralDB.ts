// backend/src/utils/createCentralDB.ts
import { exec } from "child_process";
import { Client } from "pg";
import path from "path";
import bcrypt from "bcryptjs";
import fs from "fs";
import { getCentralPrisma } from "../prisma-client/central-client";
import { getResourcePath, getUserDataPath, isPackaged } from "../middlewares/runtimePaths";
import { activeEnvFile } from "./envLoader";

/* -------------------------------------------------------
   SAFE ELECTRON DETECTION
------------------------------------------------------- */


/* -------------------------------------------------------
   ROOT DIR
------------------------------------------------------- */

const rootDir = isPackaged
  ? process.cwd()
  : path.resolve(__dirname, "../../");

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

/* -------------------------------------------------------
   ENV LOADING (SINGLE SOURCE OF TRUTH)
------------------------------------------------------- */

// const rootDir = app.isPackaged
//   ? process.cwd()
//   : path.resolve(__dirname, "../../");

// Decide environment
const envFile = activeEnvFile();


  console.log("envFile in CREATE CENTRAL CONTROLLER:", envFile);
  console.log("DB_PROVIDER in CREATE CENTRAL CONTROLLER:", process.env.DB_PROVIDER);
// Load active env

// const isProd = process.env.APP_ENV === "prod";
const isSqlite = process.env.DB_PROVIDER === "sqlite";

console.log("is sqlite in central controller:", isSqlite);
/* -------------------------------------------------------
   PATHS
------------------------------------------------------- */

const envPath = path.join(rootDir, ".env");

const centralSchemaPath = path.join(
  rootDir,
  "prisma/central/schema.prisma"
);

const centralSchemaPathProd = path.join(
  rootDir,
  "prisma/central/schema.sqlite.prisma"
);

const centralSchema = path.join(
  __dirname,
  "..",
  "..",
  "prisma",
  "central",
  "schema.sqlite.prisma"
);


const schemaPathToUse = isProd
  ? centralSchemaPathProd
  : centralSchemaPath;

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */

function upsertEnvVariable(key: string, value: string) {
  let envContent = "";

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf-8");
  }

  const regex = new RegExp(`^${key}=.*$`, "m");

  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, `${key}=${value}`);
  } else {
    if (envContent.length && !envContent.endsWith("\n")) {
      envContent += "\n";
    }
    envContent += `${key}=${value}\n`;
  }

  fs.writeFileSync(envPath, envContent, "utf-8");
}

/* -------------------------------------------------------
   MAIN
------------------------------------------------------- */

export async function createCentralDB(clientId: string, options?: any) {
  const dbName = "master";
  let dbUrl: string;

  /* ---------- PROD (SQLite) ---------- */
  /* ===============================
     PROD (SQLite) → COPY TEMPLATE
  =============================== */
  if (isProd && isSqlite) {
    // const dbDir = getUserDataPath();
    // if (!fs.existsSync(dbDir)) {
    //   fs.mkdirSync(dbDir, { recursive: true });
    // }

    // const dbPath = path.join(getUserDataPath(), "central.db");
    // dbUrl = `file:${dbPath.replace(/\\/g, "/")}`;

    // const dbDir = getUserDataPath();
    // fs.mkdirSync(dbDir, { recursive: true });

    // const userDbPath = path.join(dbDir, "central.db");
    // const templatePath = path.join(getResourcePath(),
    //   "central_template.db"
    // );

    // if (!fs.existsSync(templatePath)) {
    //   throw new Error("central_template.db missing from resources");
    // }

    // if (!fs.existsSync(userDbPath)) {
    //   fs.copyFileSync(templatePath, userDbPath);
    // }

    // dbUrl = `file:${userDbPath.replace(/\\/g, "/")}`;


  const dbDir = getUserDataPath();
  console.log("DB directory:", dbDir); // <- debug

  const dataDir = path.join(getUserDataPath(), "data");
  fs.mkdirSync(dataDir, { recursive: true });

  const userDbPath = path.join(dataDir, "central.db");
  console.log("User DB path:", userDbPath); // <- debug

  // const templatePath = path.join(getResourcePath(), "central_template.db");
  // console.log("Template DB path:", templatePath); // <- debug

  // if (!fs.existsSync(templatePath)) {
  //   throw new Error("central_template.db missing from resources");
  // }

  // if (!fs.existsSync(userDbPath)) {
  //   fs.copyFileSync(templatePath, userDbPath);
  // }

  dbUrl = `file:${userDbPath.replace(/\\/g, "/")}`;

  }
  /* ---------- DEV (Postgres) ---------- */
  else {

    console.log("DEV DB CREATION CALLED", envFile);
    dbUrl =
      `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}` +
      `@${process.env.DB_HOST}:${process.env.DB_PORT}/${dbName}`;


    const admin = new Client({
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: "postgres",
    });

    await admin.connect();

    const exists = await admin.query(
      `SELECT 1 FROM pg_database WHERE datname='${dbName}'`
    );

    if (exists.rowCount === 0) {
      await admin.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Central DB "${dbName}" created`);
    } else {
      console.log(`⚠️ Central DB "${dbName}" already exists`);
    }

    await admin.end();

    await new Promise<void>((resolve, reject) => {
    //const envVar = isProd && isSqlite ? "CENTRAL_DATABASE_URL" : "DATABASE_URL";

    exec(
      `"${nodePath}" "${prismaCLI}" db push --schema="${centralSchemaPath}"`,
      {
        env: {
          ...process.env,
          DATABASE_URL: dbUrl,
        },
      },
      (err, stdout, stderr) => {
        if (err) {
          console.error(stderr);
          reject(err);
        } else {
          console.log(stdout);
          resolve();
        }
      }
    );
  });


  }

  /* ---------- MIGRATIONS (SQLite only; Postgres schema was pushed above) ---------- */
  if (isSqlite) {
  await new Promise<void>((resolve, reject) => {
    exec(
      `"${nodePath}" "${prismaCLI}" db push --accept-data-loss --schema="${centralSchema}"`,
      {
        env: {
          ...process.env,
          CENTRAL_DATABASE_URL: dbUrl,
        },
      },
      (err, stdout, stderr) => {
        if (err) {
          console.error(stderr);
          reject(err);
        } else {
          console.log(stdout);
          resolve();
        }
      }
    );
  });
  }

  console.log(
    isProd
      ? "✅ Central DB ready (template copied)"
      : "✅ Central DB migration successful"
  );


  /* ---------- SAVE URL ---------- */
  upsertEnvVariable("CENTRAL_DATABASE_URL", dbUrl);

  /* ---------- CREATE MASTER ADMIN ---------- */
  const centralPrisma = getCentralPrisma(dbUrl);

  const hashedPassword = await bcrypt.hash(
    options?.password,
    10
  );

  try {
    await centralPrisma.superAdmin.create({
      data: {
        name: options?.name,
        email: options?.email,
        position: "Master Admin",
        password: hashedPassword,

        // 🔑 SETUP FLAGS
          basicComplete: true,
          addressComplete: false,
      },
    });

    console.log("✅ Master Admin created");
  } catch (error: any) {
    if (error.code === "P2002") {
      console.log("⚠️ Master Admin already exists");
    } else {
      console.error("❌ Master Admin creation failed:", error);
    }
  } finally {
    await centralPrisma.$disconnect();
  }

  return { dbName, dbUrl, email: options?.email };
}
