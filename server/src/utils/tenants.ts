// lib/tenant.ts (server-only)
import { exec } from "child_process";
import { Client as PGClient } from "pg";
import path from "path";
import bcrypt from "bcryptjs";
import fs from "fs";
// import { centralPrisma } from "../prisma-client/central-client";
import { getCentralPrisma } from "../prisma-client/central-client";

import { getTenantPrisma } from "../prisma-client/tenant-client";
import { generateTenantSlug } from "../utils/generateSlug";
import { encrypt } from "../utils/encryption";

const PRISMA_SCHEMA_PATH = path.resolve(
  process.cwd(),
  "prisma/institute/schema.prisma"
);

function execCmd(cmd: string, env?: Record<string, string>) {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    exec(
      cmd,
      { env: { ...process.env, ...(env || {}) }, maxBuffer: 1024 * 1024 * 10 },
      (err, stdout, stderr) => {
        if (err) return reject({ err, stderr, stdout });
        resolve({ stdout, stderr });
      }
    );
  });
}

export async function createTenantOnServer(params: {
  name: string;
  instituteName: string;
  email: string;
  password: string;
  contact?: string;
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  fullAddress?: string;
  logo?: string;
  stamp?: string;
  sign?: string;
  certificateName?: string;
}) {
  const {
    name,
    instituteName,
    email,
    password,
    contact = "",
    country = "",
    state = "",
    city = "",
    zipCode = "",
    fullAddress = "",
    logo = "",
    stamp,
    sign,
    certificateName,
  } = params;

  if (!name || !instituteName || !email || !password) {
    throw new Error("Missing required fields");
  }

  // 1) Tenant id and DB names
  const tenantId = Math.floor(100000000 + Math.random() * 900000000); // 9-digit
  const dbName = `tenant_${tenantId}`;
  const backupDbName = `${dbName}_backup`;

  // Compose DB connection strings (use secure credentials & secrets in prod)
  // In prod, these will be based on your DB host, user, and password managed by secrets manager.
  const DB_USER = process.env.PG_USER || "postgres";
  const DB_PASSWORD = process.env.PG_PASSWORD || "8262";
  const DB_HOST = process.env.PG_HOST || "localhost";
  const DB_PORT = process.env.PG_PORT || "5432";

  const dbUrl = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${dbName}`;
  const backupDbUrl = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${backupDbName}`;

  const admin = new PGClient({
    user: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: Number(DB_PORT),
    database: "postgres",
  });

  try {
    await admin.connect();

    // 2) Create databases
    await admin.query(`CREATE DATABASE "${dbName}";`);
    await admin.query(`CREATE DATABASE "${backupDbName}";`);

    // 3) Run migrations against tenant DB and backup DB
    // We call `prisma migrate deploy --schema=...` with DATABASE_URL set to tenant DB.
    await execCmd(`npx prisma migrate deploy --schema=${PRISMA_SCHEMA_PATH}`, {
      DATABASE_URL: dbUrl,
    });

    await execCmd(`npx prisma migrate deploy --schema=${PRISMA_SCHEMA_PATH}`, {
      DATABASE_URL: backupDbUrl,
    });

    // 4) Create admin in tenant DB using tenant Prisma client
    const tenantPrisma = getTenantPrisma(dbUrl);
    const centralPrisma = getCentralPrisma();

    const hashedPassword = await bcrypt.hash(password, 10);
    const encryptedPassword = encrypt(password);
    const slug = await generateTenantSlug(instituteName);

    const clientAdmin = await tenantPrisma.clientAdmin.create({
      data: {
        name,
        email,
        contact,
        country,
        state,
        city,
        fullAddress,
        logo,
        sign: sign || null,
        certificateName: certificateName || null,
        stamp: stamp || null,
        zipCode,
        position: "ADMIN",
        slug,
        password: hashedPassword,
        instituteName,
        role: "ADMIN",
        //mustResetPassword: true, // mark so first login is forced to reset
      },
    });

    // 5) Persist central record
    const tenantRecord = await centralPrisma.tenant.create({
      data: {
        tenantId: tenantId.toString(),
        name: instituteName,
        contact,
        country,
        fullAddress,
        logo,
        sign: sign || null,
        certificateName: certificateName || null,
        stamp: stamp || null,
        state,
        city,
        zipCode,
        position: "ADMIN",
        instituteName,
        slug,
        email,
        password: hashedPassword,
        encryptedPassword,
        dbUrl,
      },
    });

    // 6) Optionally: seed data (call seed functions here)
    // await seedLabsForTenant(dbUrl, instituteName);
    // await seedLabsForTenant(backupDbUrl, instituteName);

    // close tenant prisma client
    await tenantPrisma.$disconnect();

    return {
      success: true,
      tenantId,
      dbUrl,
      backupDbUrl,
      tenantRecordId: tenantRecord.id,
      clientAdminId: clientAdmin.id,
    };
  } catch (err: any) {
    // Try to cleanup: drop created DBs if present (best-effort)
    try {
      await admin.query(`DROP DATABASE IF EXISTS "${dbName}";`);
      await admin.query(`DROP DATABASE IF EXISTS "${backupDbName}";`);
    } catch (dropErr) {
      console.error("Failed cleanup drop:", dropErr);
    }
    throw err;
  } finally {
    try {
      await admin.end();
    } catch {}
  }
}
