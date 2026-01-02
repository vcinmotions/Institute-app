// tenant-setup.ts
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { createTenant } from "../utils/createTenant";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { exec } from "child_process";

dotenv.config({ path: path.resolve(__dirname, "../prisma/central/.env") });

const argv = yargs(hideBin(process.argv))
  .option("institute", {
    alias: "i",
    type: "string",
    demandOption: true,
    describe: "Institute name",
  })
  .option("name", {
    alias: "n",
    type: "string",
    demandOption: true,
    describe: "Admin name",
  })
  .option("email", {
    alias: "e",
    type: "string",
    demandOption: true,
    describe: "Admin email",
  })
  .option("password", {
    alias: "p",
    type: "string",
    demandOption: true,
    describe: "Admin password",
  })
  .option("contact", {
    alias: "c",
    type: "string",
    demandOption: true,
    describe: "Admin contact",
  })
  .option("country", { type: "string", demandOption: true })
  .option("state", { type: "string", demandOption: true })
  .option("city", { type: "string", demandOption: true })
  .option("zipCode", { type: "string", demandOption: true })
  .option("fullAddress", { type: "string", demandOption: true })
  .option("logo", { type: "string" })
  .option("stamp", { type: "string" })
  .option("sign", { type: "string" })
  .option("certificateName", { type: "string" })
  .help()
  .parseSync();

async function main() {
  const {
    name,
    institute,
    email,
    password,
    contact,
    country,
    state,
    city,
    zipCode,
    fullAddress,
    logo,
    stamp,
    sign,
    certificateName,
  } = argv;

  try {
    console.log("🚀 Creating tenant...");

    const tenant = await createTenant(
      name,
      institute,
      email,
      password,
      contact,
      country,
      state,
      city,
      zipCode,
      fullAddress,
      logo || "",
      stamp || "",
      sign || "",
      certificateName || ""
    );

    console.log("🎉 Tenant created successfully!");
    console.log("📘 DB Name:", tenant.dbName);
    console.log("🌐 DB URL:", tenant.dbUrl);
    console.log("👤 Email:", tenant.email);
  

    const backendEnvPath = path.resolve(__dirname, "../backend/.env");
    fs.writeFileSync(
      backendEnvPath,
      `CLIENT_DATABASE_URL="${tenant.dbUrl}"\n`,
      "utf-8"
    );

    console.log(`✅ Backend .env updated`);

    console.log("🚀 Starting local backend...");
    exec("npm start", { cwd: path.resolve(__dirname, "../backend") });
    console.log("🚀 Starting local frontend...");
    exec("npm run dev", { cwd: path.resolve(__dirname, "../frontend") });

    console.log("🎉 Setup complete → http://localhost:3000");
  } catch (error: any) {
    console.error("❌ Tenant creation failed:", error.message || error);
  }
}

main();
