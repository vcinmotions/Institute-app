// import fs from "fs";
// import path from "path";
// import { getUserDataPath } from "../middlewares/runtimePaths";
// import { decryptFile } from "./crypto";
// import { unzipFile } from "./zip";

// export async function restoreBackup(encFilePath: string) {
//   try {
//     const userDataPath = getUserDataPath();

//     const tempZip = encFilePath.replace(".enc", "");
//     const extractDir = path.join(userDataPath, "restore-temp");

//     /* DECRYPT */
//     decryptFile(encFilePath, tempZip);

//     console.log("🔓 Decrypted");

//     /* UNZIP */
//     await unzipFile(tempZip, extractDir);

//     console.log("📂 Extracted");

//     /* COPY BACK */
//     fs.copyFileSync(
//       path.join(extractDir, "central.db"),
//       path.join(userDataPath, "data", "central.db")
//     );

//     const tenantSrc = path.join(extractDir, "tenants");
//     const tenantDest = path.join(userDataPath, "data", "tenants");

//     fs.mkdirSync(tenantDest, { recursive: true });

//     for (const file of fs.readdirSync(tenantSrc)) {
//       fs.copyFileSync(
//         path.join(tenantSrc, file),
//         path.join(tenantDest, file)
//       );
//     }

//     console.log("✅ Restore completed");

//     /* CLEANUP */
//     fs.rmSync(tempZip, { force: true });
//     fs.rmSync(extractDir, { recursive: true, force: true });

//   } catch (error) {
//     console.error("❌ Restore failed:", error);
//     throw error;
//   }
// }

import fs from "fs";
import path from "path";
import { getUserDataPath } from "../middlewares/runtimePaths";
import { decryptFile } from "./crypto";
import { unzipFile } from "./zip";

/* ---------------- SAFE RESTORE ---------------- */
function restoreSQLite(srcPath: string, destPath: string) {
  // delete old
  if (fs.existsSync(destPath)) fs.rmSync(destPath, { force: true });
  if (fs.existsSync(destPath + "-wal")) fs.rmSync(destPath + "-wal", { force: true });
  if (fs.existsSync(destPath + "-shm")) fs.rmSync(destPath + "-shm", { force: true });

  // copy main
  fs.copyFileSync(srcPath, destPath);

  // WAL + SHM
  if (fs.existsSync(srcPath + "-wal")) {
    fs.copyFileSync(srcPath + "-wal", destPath + "-wal");
  }

  if (fs.existsSync(srcPath + "-shm")) {
    fs.copyFileSync(srcPath + "-shm", destPath + "-shm");
  }
}

export async function restoreBackup(encFilePath: string) {
  try {
    const userDataPath = getUserDataPath();

    console.log("userDataPath in Restore Backup Controller:", userDataPath);

    const tempZip = encFilePath.replace(".enc", "");
    const extractDir = path.join(userDataPath, "restore-temp");

    console.log("extractDir in Restore Backup Controller:", extractDir);

    if (fs.existsSync(extractDir)) {
      fs.rmSync(extractDir, { recursive: true, force: true });
    }

    /* ---------------- VALIDATION ---------------- */
    if (!encFilePath.endsWith(".enc")) {
      throw new Error("Invalid backup file");
    }

    /* ---------------- DECRYPT ---------------- */
    decryptFile(encFilePath, tempZip);

    /* ---------------- UNZIP ---------------- */
    await unzipFile(tempZip, extractDir);

    /* ---------------- CENTRAL ---------------- */

    const centralSrc = path.join(extractDir, "central.db");

    console.log("centralSrc in Restore Backup Controller:", centralSrc);
    
    if (!fs.existsSync(centralSrc)) {
      throw new Error("Invalid backup: central.db missing");
    }

    const centralDest = path.join(userDataPath, "data", "central.db");

    console.log("centralDest in Restore Backup Controller:", centralDest);

    restoreSQLite(centralSrc, centralDest);

    /* ---------------- TENANTS ---------------- */

    const tenantSrc = path.join(extractDir, "tenants");

    console.log("tenantSrc in Restore Backup Controller:", tenantSrc);

    if (!fs.existsSync(tenantSrc)) {
      throw new Error("Invalid backup: tenants folder missing");
    }

    const tenantDest = path.join(userDataPath, "data", "tenants");

    console.log("tenantDest in Restore Backup Controller:", tenantDest);

    fs.mkdirSync(tenantDest, { recursive: true });

    // delete old tenants
    if (fs.existsSync(tenantDest)) {
      for (const file of fs.readdirSync(tenantDest)) {
        fs.rmSync(path.join(tenantDest, file), { force: true });
      }
    }

    for (const file of fs.readdirSync(tenantSrc)) {
      if (!file.endsWith(".db")) continue;

      restoreSQLite(
        path.join(tenantSrc, file),
        path.join(tenantDest, file)
      );
    }

    console.log("✅ Restore completed");

    /* ---------------- CLEANUP ---------------- */
    fs.rmSync(tempZip, { force: true });
    fs.rmSync(extractDir, { recursive: true, force: true });

  } catch (error) {
    console.error("❌ Restore failed:", error);
    throw error;
  }
}