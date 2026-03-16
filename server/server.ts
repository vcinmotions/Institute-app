import { getCentralDbUrl, loadEnv } from "./src/utils/envLoader";
loadEnv(); // 👈 FIRST LINE

import app from "./src/app";
import { initSocket } from "./src/utils/socket";
import { runCentralMigrations, runTenantMigrations } from "./src/utils/runMigration";
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
console.log("CENTRAL_DATABASE_URL  IN SERVER:", process.env.CENTRAL_DATABASE_URL);
console.log("TENANT_DATABASE_URL  IN SERVER:", process.env.TENANT_DATABASE_URL);

// 🔥 GET CENTRAL SQLITE DB URL
    const centralDbUrl = getCentralDbUrl();
    console.log("📀 CENTRAL SQLITE DB URL IN SERVER:", centralDbUrl);

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Start socket server
initSocket(server);