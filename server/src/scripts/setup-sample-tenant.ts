import { Client } from "pg";
import { execSync } from "child_process";
import path from "path";

async function setupSampleTenant() {
  const SAMPLE_DB = "sample_tenant";
  const DATABASE_URL = `postgresql://postgres:root@localhost:5432/${SAMPLE_DB}`;
  const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");

  // Connect to admin DB
  const admin = new Client({
    user: "postgres",
    password: "root",
    host: "localhost",
    port: 5432,
    database: "postgres",
  });

  await admin.connect();

  console.log("🔍 Checking if sample_tenant exists...");

  const exists = await admin.query(`
    SELECT 1 FROM pg_database WHERE datname='${SAMPLE_DB}';
  `);

  if (exists.rowCount === 0) {
    console.log("📦 Creating sample_tenant...");
    await admin.query(`CREATE DATABASE ${SAMPLE_DB};`);
  } else {
    console.log("✅ sample_tenant already exists. Skipping creation.");
  }

  await admin.end();

  console.log("📑 Applying Prisma migrations...");

  // Run all Prisma migrations on sample tenant
  execSync(
    `cross-env DATABASE_URL="${DATABASE_URL}" npx prisma migrate deploy --schema=${schemaPath}`,
    { stdio: "inherit" }
  );

  console.log("🎉 DONE! sample_tenant created with EMPTY schema.");
  process.exit(0);
}

setupSampleTenant().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
