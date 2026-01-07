// // utils/createTenant.ts
// import { exec } from "child_process";
// import { Client } from "pg";
// import { app } from "electron";

// // import { centralPrisma } from "../prisma-client/central-client";
// import { getCentralPrisma } from "../prisma-client/central-client";

// import { getTenantPrisma } from "../prisma-client/tenant-client";
// import dotenv from "dotenv";
// import path from "path";
// import bcrypt from "bcryptjs";
// import fs from "fs";
// import { generateTenantSlug } from "./generateSlug";
// import { encrypt } from "./encryption";

// const envPath = path.resolve(".env");

// dotenv.config({ path: path.resolve(__dirname, "../../.env.dev") });
// dotenv.config({ path: path.resolve(__dirname, "../../.env.prod") });

// function upsertEnvVariable(key: string, value: string) {
//   let envContent = "";
//   if (fs.existsSync(envPath)) {
//     envContent = fs.readFileSync(envPath, "utf-8");
//   }

//   const regex = new RegExp(`^${key}=.*$`, "m");

//   if (regex.test(envContent)) {
//     // Update existing key
//     envContent = envContent.replace(regex, `${key}=${value}`);
//   } else {
//     // Append new key
//     if (envContent.length > 0 && !envContent.endsWith("\n")) {
//       envContent += "\n";
//     }
//     envContent += `${key}=${value}\n`;
//   }

//   fs.writeFileSync(envPath, envContent, "utf-8");
// }

// dotenv.config({ path: "./prisma/institute/.env" });

// const schemaPath = path.resolve(
//   __dirname,
//   "../../prisma/institute/schema.prisma"
// );

// const schemaPathProd = path.resolve(
//   __dirname,
//   "../../prisma/institute/schema.sqlite.prisma"
// );

// export async function createTenant(
//   name: string,
//   instituteName: string,
//   email: string,
//   password: string,
//   contact: string,
//   country: string,
//   state: string,
//   city: string,
//   zipCode: string,
//   fullAddress: string,
//   logo: string,
//   stamp: string,
//   sign: string,
//   certificateName: string
// ) {
//   console.log(
//     "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<GET COMPANY DATA BEFORE CREATION:",
//     name,
//     instituteName,
//     email,
//     password,
//     city,
//     contact,
//     country,
//     state,
//     zipCode,
//     fullAddress,
//     logo,
//     stamp,
//     sign,
//     certificateName
//   );

//   if (
//     !name ||
//     !instituteName ||
//     !email ||
//     !password ||
//     !city ||
//     !contact ||
//     !country ||
//     !state ||
//     !zipCode ||
//     !fullAddress
//   ) {
//     throw Error(
//       "All fields are required: name, instituteName, email, password, city, contact, country, state, position, zipCode"
//     );
//   }

//   // Generate 9-digit random tenant ID
//   const tenantId = Math.floor(100000000 + Math.random() * 900000000); // 9 digits

//   const dbName = `tenant_${tenantId}`;
//   // const dbUrl = `postgresql://postgres:8262@localhost:5432/${dbName}`;

//   // ===== INSERT ENV-SENSITIVE DB URL LOGIC HERE =====
//   const isProd = process.env.DB_PROVIDER === "sqlite";

//   if (isProd) {
//     // Ensure tenants folder exists in Electron PROD
//     const tenantsDir = path.join(app.getPath("userData"), "tenants");
//     if (!fs.existsSync(tenantsDir))
//       fs.mkdirSync(tenantsDir, { recursive: true });
//   }

//   let dbUrl: string;

//   if (isProd) {
//     const tenantDbPath = path.join(
//       app.getPath("userData"), // Electron user data folder
//       "tenants",
//       `tenant_${tenantId}.db`
//     );
//     dbUrl = `file:${tenantDbPath}`;
//   } else {
//     dbUrl = `postgresql://postgres:8262@localhost:5432/tenant_${tenantId}`;
//   }
//   // ==================================================

//   // const dbName = `tenant_${instituteName.toLowerCase().replace(/\s/g, '_')}_${Date.now()}`;
//   // const dbUrl = `postgresql://postgres:root@localhost:5432/${dbName}`;

//   // Create Backup DB
//   const backupDbName = `${dbName}_backup`;
//   const backupDbUrl = `postgresql://postgres:8262@localhost:5432/${backupDbName}`;

//   // // 1. Create the tenant database
//   // const admin = new Client({
//   //   user: "postgres",
//   //   password: "8262",
//   //   host: "localhost",
//   //   port: 5432,
//   //   database: "postgres",
//   // });

//   // await admin.connect();
//   // await admin.query(`CREATE DATABASE "${dbName}";`);
//   // await admin.end();
//   // console.log(`✅ Created database ${dbName}`);

//   // // 🔥 Create backup DB (fresh connection)
//   // const admin2 = new Client({
//   //   user: "postgres",
//   //   password: "8262",
//   //   host: "localhost",
//   //   port: 5432,
//   //   database: "postgres",
//   // });

//   // await admin2.connect();
//   // await admin2.query(`CREATE DATABASE "${backupDbName}";`);
//   // await admin2.end();

//   if (!isProd) {
//     // Only create Postgres DBs
//     const admin = new Client({
//       user: "postgres",
//       password: "8262",
//       host: "localhost",
//       port: 5432,
//       database: "postgres",
//     });
//     await admin.connect();
//     await admin.query(`CREATE DATABASE "${dbName}";`);
//     await admin.end();

//     const admin2 = new Client({
//       user: "postgres",
//       password: "8262",
//       host: "localhost",
//       port: 5432,
//       database: "postgres",
//     });
//     await admin2.connect();
//     await admin2.query(`CREATE DATABASE "${backupDbName}";`);
//     await admin2.end();
//   }

//   console.log(`✅ Backup database ${backupDbName} created`);

//   const schemaPathToUse = isProd ? schemaPathProd : schemaPath;

//   // 2. Run Prisma migrations
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

//   console.log(`✅ Database migration is Successful ${dbUrl}`);

//   console.log(
//     `✅ Run this cmd to open studio: npx cross-env DATABASE_URL="${dbUrl}" npx prisma studio --schema=${schemaPathToUse}`
//   );

//   // Run migrations on backup DB
//   await new Promise((resolve, reject) => {
//     exec(
//       `npx cross-env DATABASE_URL="${backupDbUrl}" npx prisma migrate deploy --schema=${schemaPathToUse}`,
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

//   console.log(`✅ Backup database migration successful ${backupDbUrl}`);

//   console.log(
//     `✅ Run this cmd to open studio: npx cross-env DATABASE_URL="${backupDbUrl}" npx prisma studio --schema=${schemaPathToUse}`
//   );

//   //fs.writeFileSync('.env', `DATABASE_URL=${dbUrl}`);

//   upsertEnvVariable(`${instituteName}_CLIENT_DATABASE_URL`, dbUrl);

//   upsertEnvVariable(`${instituteName}_CLIENT_BACKUP_DATABASE_URL`, backupDbUrl);

//   // 3. Store tenant info in central DB
//   const hashedPassword = await bcrypt.hash(password, 10);

//   const hashedPass = await bcrypt.hash(password, 10);
//   const encryptedPass = encrypt(password);

//   // await tenantPrisma.tenant.create({
//   //   data: {
//   //     name,
//   //     email,
//   //     password: hashedPass,
//   //     encryptedPassword: encryptedPass, // store encrypted here
//   //     ...
//   //   }
//   // });

//   console.log(`✅ Tenant "${instituteName}" saved in central DB`);

//   // Generate tenant slug
//   const slug = await generateTenantSlug(instituteName);

//   // 4. Create ClientAdmin in tenant DB
//   const tenantPrisma = getTenantPrisma(dbUrl);
//   const centralPrisma = getCentralPrisma();

//   //4.1 Create Admin (primary user) For (RBAC)
//   await tenantPrisma.clientAdmin.create({
//     data: {
//       name,
//       email,
//       contact,
//       country,
//       state,
//       city,
//       fullAddress,
//       logo: logo || null,
//       sign: sign || null,
//       certificateName: certificateName || null,
//       stamp: stamp || null,
//       zipCode,
//       position: "ADMIN",
//       slug,
//       password: hashedPassword,
//       instituteName,
//       role: "ADMIN", // ✅ ADD ROLE FIELD
//     },
//   });
//   console.log(
//     `✅ ✅ ✅ ✅ ✅ ✅ Admin "${email}" created in tenant DB with Name ${name}`
//   );

//   console.log(
//     `✅ ✅ ✅✅✅✅✅ ClientAdmin "${email}" created in tenant DB with Name ${name}`
//   );

//   await centralPrisma.tenant.create({
//     data: {
//       tenantId: tenantId.toString(), // store 9-digit ID
//       name,
//       contact,
//       country,
//       fullAddress,
//       logo,
//       sign: sign || null,
//       certificateName: certificateName || null,
//       stamp: stamp || null,
//       state,
//       city,
//       zipCode,
//       position: "ADMIN",
//       instituteName,
//       slug,
//       email,
//       password: hashedPassword, // optional but ok
//       encryptedPassword: encryptedPass, // store encrypted here
//       dbUrl,
//     },
//   });

//   return { dbName, dbUrl, email, password };
// }

// // import { exec } from 'child_process';
// // import { Client } from 'pg';
// // import { centralPrisma } from '../prisma-client/central-client';
// // import { getTenantPrisma } from '../prisma-client/tenant-client';
// // import dotenv from 'dotenv';
// // import path from 'path';
// // import bcrypt from 'bcryptjs';
// // import fs from 'fs';

// // const envPath = path.resolve('.env');

// // function upsertEnvVariable(key: string, value: string) {
// //   let envContent = '';
// //   if (fs.existsSync(envPath)) {
// //     envContent = fs.readFileSync(envPath, 'utf-8');
// //   }

// //   const regex = new RegExp(`^${key}=.*$`, 'm');

// //   if (regex.test(envContent)) {
// //     envContent = envContent.replace(regex, `${key}=${value}`);
// //   } else {
// //     if (envContent.length > 0 && !envContent.endsWith('\n')) {
// //       envContent += '\n';
// //     }
// //     envContent += `${key}=${value}\n`;
// //   }

// //   fs.writeFileSync(envPath, envContent, 'utf-8');
// // }

// // dotenv.config({ path: './prisma/institute/.env' });

// // const schemaPath = path.resolve(__dirname, '../../prisma/institute/schema.prisma');

// // // Lab seed data
// // const labsSeed = [
// //   { name: "LAB-01", location: "Building A - Floor 1" },
// //   { name: "LAB-02", location: "Building A - Floor 2" },
// //   { name: "LAB-03", location: "Building B - Floor 1" },
// // ];

// // async function seedLabsForTenant(dbUrl: string, tenantLabel: string = 'Default Tenant') {
// //   const tenantPrisma = getTenantPrisma(dbUrl);

// //   console.log(`🚀 Seeding lab infrastructure for: ${tenantLabel}`);

// //   try {
// //     const clientAdmin = await tenantPrisma.clientAdmin.findFirst();
// //     if (!clientAdmin) {
// //       console.warn(`⚠️ No ClientAdmin found — seed admin first`);
// //       return;
// //     }

// //     const labs = [
// //       { name: "LAB-01", location: "Building A - Floor 1" },
// //       { name: "LAB-02", location: "Building A - Floor 2" },
// //       { name: "LAB-03", location: "Building B - Floor 1" },
// //       { name: "LAB-04", location: "Building B - Floor 2" },
// //       { name: "LAB-05", location: "Building C - Floor 1" },
// //     ];

// //     const timeSlots = [
// //       { startTime: "08:00", endTime: "09:00" },
// //       { startTime: "09:00", endTime: "10:00" },
// //       { startTime: "10:00", endTime: "11:00" },
// //       { startTime: "11:00", endTime: "12:00" },
// //       { startTime: "12:00", endTime: "13:00" },
// //       { startTime: "13:00", endTime: "14:00" },
// //       { startTime: "14:00", endTime: "15:00" },
// //       { startTime: "15:00", endTime: "16:00" },
// //     ];

// //     const totalPCs = 10;

// //     for (const labData of labs) {
// //       const lab = await tenantPrisma.lab.create({
// //         data: {
// //           ...labData,
// //           totalPCs,
// //           clientAdminId: clientAdmin.id,
// //         },
// //       });

// //       console.log(`✅ Created: ${lab.name}`);

// //       for (const slot of timeSlots) {
// //         await tenantPrisma.labTimeSlot.create({
// //           data: {
// //             ...slot,
// //             day: "Daily",
// //             labId: lab.id,
// //             availablePCs: totalPCs,
// //             clientAdminId: clientAdmin.id,
// //           },
// //         });
// //       }

// //       console.log(`🕘 Added ${timeSlots.length} TimeSlots ➝ ${lab.name}`);
// //     }

// //     console.log(`🎉 Lab + TimeSlot Seeding Completed for: ${tenantLabel}`);

// //   } catch (err: any) {
// //     console.error(`❌ Seeding Error for ${tenantLabel}:`, err.message);
// //   } finally {
// //     await tenantPrisma.$disconnect();
// //   }
// // }

// // export async function createTenant(
// //   name: string,
// //   instituteName: string,
// //   email: string,
// //   password: string,
// // ) {

// //   const dbName = `tenant_${instituteName.toLowerCase().replace(/\s/g, '_')}_${Date.now()}`;
// //   const dbUrl = `postgresql://postgres:root@localhost:5432/${dbName}`;

// //   const backupDbName = `${dbName}_backup`;
// //   const backupDbUrl = `postgresql://postgres:root@localhost:5432/${backupDbName}`;

// //   // 1. Create the tenant database
// //   const admin = new Client({
// //     user: 'postgres',
// //     password: 'root',
// //     host: 'localhost',
// //     port: 5432,
// //     database: 'postgres',
// //   });
// //   await admin.connect();
// //   await admin.query(`CREATE DATABASE "${dbName}";`);
// //   await admin.end();
// //   console.log(`✅ Created database ${dbName}`);

// //   const admin2 = new Client({
// //     user: 'postgres',
// //     password: 'root',
// //     host: 'localhost',
// //     port: 5432,
// //     database: 'postgres',
// //   });
// //   await admin2.connect();
// //   await admin2.query(`CREATE DATABASE "${backupDbName}";`);
// //   await admin2.end();
// //   console.log(`✅ Backup database ${backupDbName} created`);

// //   // 2. Run Prisma migrations
// //   await new Promise((resolve, reject) => {
// //     exec(
// //       `npx cross-env DATABASE_URL="${dbUrl}" npx prisma migrate deploy --schema=${schemaPath}`,
// //       (err, stdout, stderr) => {
// //         if (err) {
// //           console.error(stderr);
// //           reject(err);
// //         } else {
// //           console.log(stdout);
// //           resolve(true);
// //         }
// //       }
// //     );
// //   });
// //   console.log(`✅ Database migration successful: ${dbUrl}`);

// //   await new Promise((resolve, reject) => {
// //     exec(
// //       `npx cross-env DATABASE_URL="${backupDbUrl}" npx prisma migrate deploy --schema=${schemaPath}`,
// //       (err, stdout, stderr) => {
// //         if (err) {
// //           console.error(stderr);
// //           reject(err);
// //         } else {
// //           console.log(stdout);
// //           resolve(true);
// //         }
// //       }
// //     );
// //   });
// //   console.log(`✅ Backup database migration successful: ${backupDbUrl}`);

// //   // 3. Update .env
// //   upsertEnvVariable(`${instituteName}_CLIENT_DATABASE_URL`, dbUrl);
// //   upsertEnvVariable(`${instituteName}_CLIENT_BACKUP_DATABASE_URL`, backupDbUrl);

// //   // 4. Store tenant in central DB
// //   const hashedPassword = await bcrypt.hash(password, 10);

// //   // 5. Create ClientAdmin in tenant DB
// //   const tenantPrisma = getTenantPrisma(dbUrl);
// //   const newTenant = await tenantPrisma.clientAdmin.create({
// //     data: {
// //       name,
// //       email,
// //       password: hashedPassword,
// //       instituteName,
// //       role: 'ADMIN',
// //     },
// //   });

// //   // 6. Seed lab data for main and backup DB
// //   await seedLabsForTenant(dbUrl, newTenant.id);
// //   await seedLabsForTenant(backupDbUrl, newTenant.id);

// //   console.log(`🎉 Tenant "${instituteName}" setup complete with labs seeded.`);

// //   await centralPrisma.tenant.create({
// //     data: {
// //       name: instituteName,
// //       email,
// //       password: hashedPassword,
// //       dbUrl,
// //     },
// //   });

// //   return { dbName, dbUrl, email, password };
// // }


// utils/createTenant.ts
import { exec } from "child_process";
import { Client } from "pg";
import { getCentralPrisma } from "../prisma-client/central-client";
import { getTenantPrisma } from "../prisma-client/tenant-client";
import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";
import fs from "fs";
import { generateTenantSlug } from "./generateSlug";
import { encrypt } from "./encryption";
import {  getResourcePath, getUserDataPath, isPackaged } from "../middlewares/runtimePaths";


/* -------------------------------------------------------
   ENV LOADING (SINGLE SOURCE OF TRUTH)
------------------------------------------------------- */

const rootDir = isPackaged
  ? process.cwd() // Electron prod
  : path.resolve(__dirname, "../../"); // dev / node


const envFile =
  process.env.APP_ENV === "prod" ? ".env.prod" : ".env.dev";

dotenv.config({ path: path.join(rootDir, envFile) });

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

const schemaPath = path.join(
  rootDir,
  "prisma/institute/schema.prisma"
);

const schemaPathProd = path.join(
  rootDir,
  "prisma/institute/schema.sqlite.prisma"
);

const schemaPathToUse = isProd ? schemaPathProd : schemaPath;

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

     /* ---------- MIGRATIONS ---------- */
  const runMigration = (url: string) =>
    new Promise<void>((resolve, reject) => {
    //const envVar = isProd && isSqlite ? "TENANT_DATABASE_URL" : "DATABASE_URL";


      exec(
        `npx prisma migrate deploy --schema="${schemaPath}"`,
        {
          env: { ...process.env, DATABASE_URL: url },
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


/* -------------------------------------------------------
   MAIN
------------------------------------------------------- */

export async function createTenant(
  name: string,
  instituteName: string,
  email: string,
  password: string,
  contact: string,
  country: string,
  state: string,
  city: string,
  zipCode: string,
  fullAddress: string,
  logo: string,
  stamp: string,
  sign: string,
  certificateName: string
) {
  if (
    !name ||
    !instituteName ||
    !email ||
    !password ||
    !city ||
    !contact ||
    !country ||
    !state ||
    !zipCode ||
    !fullAddress
  ) {
    throw new Error("All required tenant fields must be provided");
  }

  console.log("GET ALL CREATE TENANT DATA HERE :::::::::", name, instituteName, email);

  const tenantId = Math.floor(100000000 + Math.random() * 900000000);
  const dbName = `tenant_${tenantId}`;

  let dbUrl: string;
  let backupDbUrl: string | null = null;

  /* ---------- PROD (SQLite) ---------- */
  if (isProd && isSqlite) {
    // const tenantsDir = path.join(getUserDataPath(), "tenants");
    // fs.mkdirSync(tenantsDir, { recursive: true });

    // const tenantDbPath = path.join(tenantsDir, `${dbName}.db`);


    // dbUrl = `file:${tenantDbPath.replace(/\\/g, "/")}`;

    const tenantsDir = path.join(getUserDataPath(), "tenants");
    console.log("tenants directory:", tenantsDir); // <- debug

    fs.mkdirSync(tenantsDir, { recursive: true });

    const tenantDbPath = path.join(tenantsDir, `${dbName}.db`);
    console.log("tenants DB PATH:", tenantDbPath); // <- debug

    const templatePath = path.join(getResourcePath(), "tenant_template.db");

    console.log("tenants directory PATH:", templatePath); // <- debug

    if (!fs.existsSync(templatePath)) throw new Error("tenant_template.db missing from resources");
    if (!fs.existsSync(tenantDbPath)) fs.copyFileSync(templatePath, tenantDbPath);

    dbUrl = `file:${tenantDbPath.replace(/\\/g, "/")}`;
      
  }
  /* ---------- DEV (Postgres) ---------- */
  else {
    dbUrl =
      `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}` +
      `@${process.env.DB_HOST}:${process.env.DB_PORT}/${dbName}`;

    const backupDbName = `${dbName}_backup`;
    backupDbUrl =
      `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}` +
      `@${process.env.DB_HOST}:${process.env.DB_PORT}/${backupDbName}`;

    const admin = new Client({
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: "postgres",
    });

    await admin.connect();
    await admin.query(`CREATE DATABASE "${dbName}"`);
    await admin.query(`CREATE DATABASE "${backupDbName}"`);
    await admin.end();


    
  await runMigration(dbUrl);
  if (backupDbUrl) await runMigration(backupDbUrl);
  }

  // /* ---------- MIGRATIONS ---------- */
  // const runMigration = (url: string) =>
  //   new Promise<void>((resolve, reject) => {
  //   const envVar = isProd && isSqlite ? "TENANT_DATABASE_URL" : "DATABASE_URL";


  //     exec(
  //       `npx prisma migrate deploy --schema="${schemaPathToUse}"`,
  //       {
  //         env: { ...process.env, [envVar]: url },
  //       },
  //       (err, stdout, stderr) => {
  //         if (err) {
  //           console.error(stderr);
  //           reject(err);
  //         } else {
  //           console.log(stdout);
  //           resolve();
  //         }
  //       }
  //     );
  //   });

  // await runMigration(dbUrl);
  // if (backupDbUrl) await runMigration(backupDbUrl);

  /* ---------- SAVE ENV ---------- */
  upsertEnvVariable(`${instituteName}_CLIENT_DATABASE_URL`, dbUrl);
  if (backupDbUrl) {
    upsertEnvVariable(
      `${instituteName}_CLIENT_BACKUP_DATABASE_URL`,
      backupDbUrl
    );
  }

  /* ---------- DATA CREATION ---------- */
  const hashedPassword = await bcrypt.hash(password, 10);
  const encryptedPass = encrypt(password);
  const slug = await generateTenantSlug(instituteName);

  const tenantPrisma = getTenantPrisma(dbUrl);
  const centralPrisma = getCentralPrisma();

  await tenantPrisma.clientAdmin.create({
    data: {
      name,
      email,
      contact,
      country,
      state,
      city,
      fullAddress,
      zipCode,
      instituteName,
      position: "ADMIN",
      role: "ADMIN",
      slug,
      password: hashedPassword,
      logo: logo || null,
      sign: sign || null,
      stamp: stamp || null,
      certificateName: certificateName || null,
    },
  });

  await centralPrisma.tenant.create({
    data: {
      tenantId: tenantId.toString(),
      name,
      email,
      contact,
      country,
      state,
      city,
      zipCode,
      fullAddress,
      instituteName,
      position: "ADMIN",
      slug,
      password: hashedPassword,
      encryptedPassword: encryptedPass,
      dbUrl,
    },
  });

  await tenantPrisma.$disconnect();
  await centralPrisma.$disconnect();

  return { dbName, dbUrl, email };
}
