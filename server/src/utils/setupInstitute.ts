import { Client } from "pg";
import { exec } from "child_process";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

async function setupInstitute() {
  const envPath = path.resolve("./prisma/institute/.env");

  if (!fs.existsSync(envPath)) {
    console.error("❌ prisma/institute/.env not found!");
    process.exit(1);
  }

  // Load env
  dotenv.config({ path: envPath });

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL missing in prisma/institute/.env");
    process.exit(1);
  }

  console.log("📌 DATABASE_URL:", dbUrl);

  // Extract database name
  const dbName = dbUrl.split("/").pop()?.split("?")[0];
  if (!dbName) {
    console.error("❌ Could not extract DB name from URL");
    process.exit(1);
  }

  console.log("🚀 Creating Institute DB:", dbName);

  // 1️⃣ Create database
  const admin = new Client({
    user: "postgres",
    password: "root",
    host: "localhost",
    database: "postgres",
    port: 5432,
  });

  await admin.connect();

  const exists = await admin.query(
    `SELECT 1 FROM pg_database WHERE datname='${dbName}'`
  );

  if (exists.rowCount === 0) {
    await admin.query(`CREATE DATABASE "${dbName}"`);
    console.log(`✅ DB "${dbName}" created`);
  } else {
    console.log(`⚠️ DB "${dbName}" already exists`);
  }

  await admin.end();

  // 2️⃣ Run Prisma migrations for institute schema
  const schemaPath = path.resolve("./prisma/institute/schema.prisma");

  await new Promise((resolve, reject) => {
    exec(
      `npx cross-env DATABASE_URL="${dbUrl}" prisma migrate deploy --schema="${schemaPath}"`,
      (err, stdout, stderr) => {
        if (err) {
          console.error("❌ Migration Failed");
          console.error(stderr);
          reject(err);
        } else {
          console.log(stdout);
          console.log("✅ Migrations Applied Successfully");
          resolve(true);
        }
      }
    );
  });

  // 3️⃣ Generate institute client
  await new Promise((resolve, reject) => {
    exec(
      `npx prisma generate --schema="${schemaPath}"`,
      (err, stdout, stderr) => {
        if (err) {
          console.error("❌ Client generation failed");
          console.error(stderr);
          reject(err);
        } else {
          console.log(stdout);
          console.log("✅ Tenant Client Generated");
          resolve(true);
        }
      }
    );
  });

  console.log("🎉 Institute DB Setup Complete!");
}

setupInstitute();
