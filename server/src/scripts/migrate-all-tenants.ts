// scripts/migrate-all-tenants.ts

import { exec } from "child_process";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: "./.env" }); // ✅ adjust if your .env file is somewhere else

const schemaPath = path.resolve(
  __dirname,
  "../../prisma/institute/schema.prisma"
);

if (!fs.existsSync(schemaPath)) {
  console.error(`❌ Prisma schema not found at: ${schemaPath}`);
  process.exit(1);
}

async function migrateTenant(dbUrl: string) {
  return new Promise((resolve, reject) => {
    exec(
      `npx cross-env DATABASE_URL="${dbUrl}" npx prisma migrate deploy --schema=${schemaPath}`,
      (err, stdout, stderr) => {
        if (err) {
          console.error(`❌ Migration failed for DB: ${dbUrl}`);
          console.error(stderr);
          reject(err);
        } else {
          console.log(`✅ Migration successful for DB: ${dbUrl}`);
          console.log(stdout);
          resolve(true);
        }
      }
    );
  });
}

async function migrateAllTenants() {
  // const tenants = await centralPrisma.tenant.findMany();

  // for (const tenant of tenants) {
  //   const dbUrl = process.env.CLIENT_DATABASE_URL;
  //   console.log(`🚀 Migrating DB for tenant: ${tenant.name} and ${tenant.dbUrl}`);
  //   try {
  //     await migrateTenant(dbUrl);
  //   } catch (err) {
  //     console.error(`❌ Skipped tenant ${tenant.name} due to error`);
  //   }
  // }

  const dbUrl = process.env.CLIENT_DATABASE_URL;
  console.log(`🚀 Migrating DB for tenant: ${dbUrl} and ${dbUrl}`);

  await migrateTenant(dbUrl as any);

  process.exit(0);
}

migrateAllTenants();
