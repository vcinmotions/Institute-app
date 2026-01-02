// // backend/src/utils/createCentralDB.ts
// import { exec } from "child_process";
// import { Client } from "pg";
// import path from "path";
// import dotenv from "dotenv";
// import bcrypt from "bcryptjs";
// import fs from "fs";
// import { getCentralPrisma } from "../prisma-client/central-client";
// import { app } from "electron"; // needed for prod file paths

// dotenv.config({ path: path.resolve(__dirname, "../../.env.dev") });
// dotenv.config({ path: path.resolve(__dirname, "../../.env.prod") });

// // const isProd = process.env.DB_PROVIDER === "sqlite";

// // Load central env (this will contain DATABASE_URL placeholder)
// // 1️⃣ Load root .env first (contains DB_USER, DB_PASS, DB_HOST, DB_PORT)
// dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// // 2️⃣ Load central Prisma env (for DATABASE_URL placeholder)
// dotenv.config({ path: path.resolve(__dirname, "../../prisma/central/.env") });

// // 3️⃣ Optional: load tenant env if needed
// dotenv.config({ path: path.resolve(__dirname, "../../prisma/tenant/.env") });

// const envPath = path.resolve(".env");

// const rootDir = app?.isPackaged
//   ? process.cwd()
//   : path.resolve(__dirname, "../../");

// // Decide env FIRST
// const envFile =
//   process.env.APP_ENV === "prod"
//     ? ".env.prod"
//     : ".env.dev";

// // Load active env
// dotenv.config({ path: path.join(rootDir, envFile) });

// // Load root .env for runtime updates (CENTRAL_DATABASE_URL)
// dotenv.config({
//   path: path.join(rootDir, ".env"),
//   override: false,
// });


// // 🔹 Add these paths here
// // const centralSchemaPath = path.join(
// //   process.cwd(),
// //   "prisma/central/schema.prisma"
// // );
// // const tenantSchemaPath = path.join(
// //   process.cwd(),
// //   "prisma/tenant/schema.prisma"
// // );

// function upsertEnvVariable(key: string, value: string) {
//   let envContent = "";

//   if (fs.existsSync(envPath)) {
//     envContent = fs.readFileSync(envPath, "utf-8");
//   }

//   const regex = new RegExp(`^${key}=.*$`, "m");

//   if (regex.test(envContent)) {
//     envContent = envContent.replace(regex, `${key}=${value}`);
//   } else {
//     if (envContent.length > 0 && !envContent.endsWith("\n")) {
//       envContent += "\n";
//     }
//     envContent += `${key}=${value}\n`;
//   }

//   fs.writeFileSync(envPath, envContent, "utf-8");
// }

// const centralSchemaPath = path.resolve(
//   __dirname,
//   "../../prisma/central/schema.prisma"
// );

// const centralSchemaPathProd = path.resolve(
//   __dirname,
//   "../../prisma/central/schema.sqlite.prisma"
// );

// const schemaPathToUse = isProd ? centralSchemaPathProd : centralSchemaPath;

// export async function createCentralDB(clientId: string, options?: any) {
//   const dbName = "master";

//   let dbUrl: string;

//   if (isProd) {
//     // Ensure central DB folder exists in Electron PROD
//     const centralDir = app.getPath("userData");
//     if (!fs.existsSync(centralDir))
//       fs.mkdirSync(centralDir, { recursive: true });
//   }

//   if (isProd) {
//     // SQLite path inside Electron app data folder
//     const centralDbPath = path.join(app.getPath("userData"), "central.db");
//     dbUrl = `file:${centralDbPath}`;
//   } else {
//     // DEV: Postgres
//     dbUrl = `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${dbName}`;
//   }

//   //const dbName = `client_root_${clientId}`;
//   //const dbUrl = `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${dbName}`;

//   //const dbUrl = `postgresql://postgres:8262@localhost:5432/${dbName}`;

//   // 1️⃣ Create the central database (master DB)
//   // const admin = new Client({
//   //   user: "postgres",
//   //   password: "8262",
//   //   host: "localhost",
//   //   port: 5432,
//   //   database: "postgres",
//   // });

//   // await admin.connect();

//   // // Create DB only if not exists
//   // const dbExists = await admin.query(
//   //   `SELECT 1 FROM pg_database WHERE datname='${dbName}'`
//   // );

//   // if (dbExists.rowCount === 0) {
//   //   await admin.query(`CREATE DATABASE "${dbName}";`);
//   //   console.log(`✅ Central DB "${dbName}" created`);
//   // } else {
//   //   console.log(`⚠️ Central DB "${dbName}" already exists, skipping...`);
//   // }

//   // await admin.end();

//   if (!isProd) {
//     const admin = new Client({
//       user: process.env.DB_USER || "postgres",
//       password: process.env.DB_PASS || "8262",
//       host: process.env.DB_HOST || "localhost",
//       port: parseInt(process.env.DB_PORT || "5432"),
//       database: "postgres",
//     });

//     await admin.connect();

//     const dbExists = await admin.query(
//       `SELECT 1 FROM pg_database WHERE datname='${dbName}'`
//     );

//     if (dbExists.rowCount === 0) {
//       await admin.query(`CREATE DATABASE "${dbName}";`);
//       console.log(`✅ Central DB "${dbName}" created`);
//     } else {
//       console.log(`⚠️ Central DB "${dbName}" already exists, skipping...`);
//     }

//     await admin.end();
//   }

//   // 2️⃣ Run migrations for central DB
//   await new Promise((resolve, reject) => {
//     exec(
//       `npx cross-env DATABASE_URL="${dbUrl}" npx prisma migrate deploy --schema=${schemaPathToUse}`,

//       (err, stdout, stderr) => {
//         if (err) {
//           console.error(stderr);
//           reject(err);
//         } else {
//           console.log(stdout);
//           resolve(true);
//         }
//       }
//     );
//   });

//   console.log(`✅ Central DB migration successful ${dbUrl}`);

//   // 3️⃣ Update .env (Optional)
//   upsertEnvVariable("CENTRAL_DATABASE_URL", dbUrl);

//   // 4️⃣ Create Master Admin inside central DB
//   // const { centralPrisma } = await import("../prisma-client/central-client");
//   //const centralPrisma = getCentralPrisma();
//   //const centralPrisma = getCentralPrisma(dbUrl);

//   const centralPrisma = getCentralPrisma(
//     isProd ? `file:${path.join(app.getPath("userData"), "central.db")}` : dbUrl
//   );

//   const hashedPassword = await bcrypt.hash(
//     options?.password || "shobha123",
//     10
//   );

//   const name = "Shobha";
//   const email = "shobha@vcinmotions.com";
//   const role = "MASTER_ADMIN";
//   const contact = "9819234567";
//   const position = "Master Admin";
//   const state = "Maharashtra";
//   const country = "India";
//   const city = "Mumbai";
//   const zipCode = "400024";

//   //const hashedPassword = await bcrypt.hash(password, 10);

//   try {
//     await centralPrisma.superAdmin.create({
//       data: {
//         name,
//         email,
//         contact,
//         position,
//         country,
//         state,
//         city,
//         zipCode,
//         role,
//         password: hashedPassword,
//       },
//     });

//     console.log("✅ Master Admin created successfully");
//   } catch (error: any) {
//     if (error.code === "P2002") {
//       console.log("⚠️ Master admin already exists");
//     } else {
//       console.error("❌ Error creating master admin:", error);
//     }
//   } finally {
//     await centralPrisma.$disconnect();
//   }

//   return { dbName, dbUrl };
// }

// // createCentralDB("abc123");


// backend/src/utils/createCentralDB.ts
import { exec } from "child_process";
import { Client } from "pg";
import path from "path";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import fs from "fs";
import { getCentralPrisma } from "../prisma-client/central-client";
import { getResourcePath, getUserDataPath, isPackaged } from "../middlewares/runtimePaths";

/* -------------------------------------------------------
   SAFE ELECTRON DETECTION
------------------------------------------------------- */


/* -------------------------------------------------------
   ROOT DIR
------------------------------------------------------- */

const rootDir = isPackaged
  ? process.cwd()
  : path.resolve(__dirname, "../../");


/* -------------------------------------------------------
   ENV LOADING (SINGLE SOURCE OF TRUTH)
------------------------------------------------------- */

// const rootDir = app.isPackaged
//   ? process.cwd()
//   : path.resolve(__dirname, "../../");

// Decide environment
const envFile =
  process.env.APP_ENV === "prod" ? ".env.prod" : ".env.dev";

// Load active env
dotenv.config({ path: path.join(rootDir, envFile) });

// Load root .env for runtime persistence (CENTRAL_DATABASE_URL)
dotenv.config({
  path: path.join(rootDir, ".env"),
  override: false,
});

const isProd = process.env.APP_ENV === "prod";
const isSqlite = process.env.DB_PROVIDER === "sqlite";


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

  fs.mkdirSync(dbDir, { recursive: true });

  const userDbPath = path.join(dbDir, "central.db");
  console.log("User DB path:", userDbPath); // <- debug

  const templatePath = path.join(getResourcePath(), "central_template.db");
  console.log("Template DB path:", templatePath); // <- debug

  if (!fs.existsSync(templatePath)) {
    throw new Error("central_template.db missing from resources");
  }

  if (!fs.existsSync(userDbPath)) {
    fs.copyFileSync(templatePath, userDbPath);
  }

  dbUrl = `file:${userDbPath.replace(/\\/g, "/")}`;
  console.log("DB URL being used:", dbUrl); // <- debug



  }
  /* ---------- DEV (Postgres) ---------- */
  /* ===============================
     DEV (Postgres) → MIGRATIONS
  =============================== */
  else {
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
      `npx prisma migrate deploy --schema="${centralSchemaPath}"`,
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

  /* ---------- MIGRATIONS ---------- */
  // await new Promise<void>((resolve, reject) => {
  //   exec(
  //     `npx prisma migrate deploy --schema="${schemaPathToUse}"`,
  //     {
  //       env: {
  //         ...process.env,
  //         DATABASE_URL: dbUrl,
  //       },
  //     },
  //     (err, stdout, stderr) => {
  //       if (err) {
  //         console.error(stderr);
  //         reject(err);
  //       } else {
  //         console.log(stdout);
  //         resolve();
  //       }
  //     }
  //   );
  // });

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
