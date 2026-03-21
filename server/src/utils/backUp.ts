// import fs from "fs";
// import path from "path";
// import { getUserDataPath } from "../middlewares/runtimePaths";
// import { encryptFile } from "./crypto";
// import { zipFolder } from "./zip";

// /* -------------------------------------------------------
//    FULL SYSTEM BACKUP (CENTRAL + TENANTS)
// ------------------------------------------------------- */

// export async function backupFullSystem() {
//   try {
//     const userDataPath = getUserDataPath();

//     // ✅ timestamp folder (important)
//     const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

//     const backupRoot = path.join(userDataPath, "backups", timestamp);
//     const tenantBackupDir = path.join(backupRoot, "tenants");

//     fs.mkdirSync(tenantBackupDir, { recursive: true });

//     console.log("📦 Backup folder:", backupRoot);

//     /* -------------------------------------------------------
//       CENTRAL DB BACKUP
//     ------------------------------------------------------- */

//     const centralDbPath = path.join(userDataPath, "data", "central.db");

//     if (!fs.existsSync(centralDbPath)) {
//       console.log("⚠ central.db not found, skipping...");
//     } else {
//       fs.copyFileSync(
//         centralDbPath,
//         path.join(backupRoot, "central.db")
//       );
//       console.log("✅ Central DB copied");

//       console.log("✅ Central DB backed up");
//     }

//     /* -------------------------------------------------------
//        TENANT DB BACKUP
//     ------------------------------------------------------- */

//     const tenantsDir = path.join(userDataPath, "data", "tenants");

//     if (!fs.existsSync(tenantsDir)) {
//       console.log("⚠ No tenant directory found");
//     } else {
//       const tenantFiles = fs.readdirSync(tenantsDir);

//       for (const file of tenantFiles) {
//         if (!file.endsWith(".db")) continue;

//         fs.copyFileSync(
//           path.join(tenantsDir, file),
//           path.join(tenantBackupDir, file)
//         );

//         console.log(`✅ Copied tenant: ${file}`);
//       }
//     }

//     console.log("🎉 FULL SYSTEM BACKUP COMPLETED");

//      /* ---------------- ZIP ---------------- */
//     const zipPath = backupRoot + ".zip";
//     await zipFolder(backupRoot, zipPath);

//     console.log("📦 Zipped");

//     /* ---------------- ENCRYPT ---------------- */
//     const encryptedPath = zipPath + ".enc";

//     encryptFile(zipPath, encryptedPath);

//     console.log("🔐 Encrypted");

//     /* ---------------- CLEANUP ---------------- */
//     fs.rmSync(backupRoot, { recursive: true, force: true });
//     fs.rmSync(zipPath, { force: true });

//     console.log("🧹 Cleanup done");

//     console.log("🎉 FINAL BACKUP:", encryptedPath);

//     return encryptedPath;

//   } catch (error) {
//     console.error("❌ Backup failed:", error);
//     throw error;
//   }
// }

import fs from "fs";
import path from "path";
import { getUserDataPath } from "../middlewares/runtimePaths";
import { encryptFile } from "./crypto";
import { zipFolder } from "./zip";

/* ---------------- SAFE SQLITE COPY ---------------- */
function safeCopySQLite(dbPath: string, destPath: string) {
  // main DB
  fs.copyFileSync(dbPath, destPath);

  // WAL + SHM (VERY IMPORTANT)
  const wal = dbPath + "-wal";
  const shm = dbPath + "-shm";

  if (fs.existsSync(wal)) {
    fs.copyFileSync(wal, destPath + "-wal");
  }

  if (fs.existsSync(shm)) {
    fs.copyFileSync(shm, destPath + "-shm");
  }
}

/* -------------------------------------------------------
   FULL SYSTEM BACKUP (CENTRAL + TENANTS)
------------------------------------------------------- */

export async function backupFullSystem() {
  try {
    const userDataPath = getUserDataPath();

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    const backupRoot = path.join(userDataPath, "backups", timestamp);
    const tenantBackupDir = path.join(backupRoot, "tenants");

    fs.mkdirSync(tenantBackupDir, { recursive: true });

    console.log("📦 Backup folder:", backupRoot);

    /* ---------------- CENTRAL ---------------- */

    const centralDbPath = path.join(userDataPath, "data", "central.db");

    if (fs.existsSync(centralDbPath)) {
      safeCopySQLite(
        centralDbPath,
        path.join(backupRoot, "central.db")
      );
      console.log("✅ Central DB backed up");
    }

    /* ---------------- TENANTS ---------------- */

    const tenantsDir = path.join(userDataPath, "data", "tenants");

    if (fs.existsSync(tenantsDir)) {
      const tenantFiles = fs.readdirSync(tenantsDir);

      for (const file of tenantFiles) {
        if (!file.endsWith(".db")) continue;

        const source = path.join(tenantsDir, file);

        safeCopySQLite(
          source,
          path.join(tenantBackupDir, file)
        );

        console.log(`✅ Tenant backed up: ${file}`);
      }
    }

    console.log("🎉 FULL SYSTEM BACKUP COMPLETED");

    /* ---------------- ZIP ---------------- */
    const zipPath = backupRoot + ".zip";
    await zipFolder(backupRoot, zipPath);

    /* ---------------- ENCRYPT ---------------- */
    const encryptedPath = zipPath + ".enc";
    await encryptFile(zipPath, encryptedPath);

    /* ---------------- CLEANUP ---------------- */
    fs.rmSync(backupRoot, { recursive: true, force: true });
    fs.rmSync(zipPath, { force: true });

    console.log("🎉 FINAL BACKUP:", encryptedPath);

    return encryptedPath;

  } catch (error) {
    console.error("❌ Backup failed:", error);
    throw error;
  }
}