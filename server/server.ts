import { getCentralDbUrl, loadEnv } from "./src/utils/envLoader";
loadEnv(); // 👈 FIRST LINE

import app from "./src/app";
import { initSocket } from "./src/utils/socket";
import { runCentralMigrations, runTenantMigrations } from "./src/utils/runMigration";
import { ensureDemoData } from "./src/utils/demoBootstrap";
// import { execSync } from "child_process";
// import path from "path";
// import fs from "fs";
// import { getUserDataPath } from "./src/middlewares/runtimePaths";

const isProd = process.env.APP_ENV === "prod";

// ⭐ run migrations first
// ⭐ ONLY RUN MIGRATIONS IN PROD
if (isProd) {
  console.log("🚀 Production mode → Running migrations");

  runCentralMigrations();
  runTenantMigrations();

} else {
  console.log("🧪 Dev mode → Skipping migrations");
}

console.log("APP_ENV IN SERVER:", process.env.APP_ENV);
console.log("DB_PROVIDER IN SERVER:", process.env.DB_PROVIDER);

// 🔥 GET CENTRAL SQLITE DB URL
    const centralDbUrl = getCentralDbUrl();

const PORT = process.env.PORT || 5001;
// HOST: "127.0.0.1" = this PC only (standalone), "0.0.0.0" = reachable on the LAN (server PC).
const HOST = process.env.HOST || "0.0.0.0";

async function start() {
  // Demo build: create the local demo super admin + "Demo Institute" before accepting requests.
  try {
    await ensureDemoData();
  } catch (err) {
    console.error("❌ Demo database preparation failed:", err);
  }

  const server = app.listen(Number(PORT), HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });

  // Start socket server
  initSocket(server);
}

start();