// scripts/setup.js
import { existsSync } from "fs";
import { execSync } from "child_process";
import { createCentralDB } from "./createCentralDB";

const FLAG_FILE = "setup.done";

async function setup() {
  if (existsSync(FLAG_FILE)) {
    console.log("Setup already done");
    return;
  }

  console.log("🔍 Checking PostgreSQL...");
  execSync("psql --version", { stdio: "inherit" });

  console.log("⚙️ Running DB setup...");
  await createCentralDB("local_client");

  console.log("🚀 Starting backend...");
  execSync("npm run start", {
    cwd: "./backend",
    stdio: "inherit",
  });

  require("fs").writeFileSync(FLAG_FILE, "ok");
}

setup();
