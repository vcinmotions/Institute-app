const { autoUpdater } = require("electron-updater");

const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const net = require("net");
const fs = require("fs");

// ✅ ADD THIS LINE HERE FOR RELEASE BUILD
function setupAutoUpdater(win) {
  autoUpdater.autoDownload = true;

  autoUpdater.on("update-available", () => {
    console.log("Update available");
  });

  autoUpdater.on("update-downloaded", async () => {
    console.log("Update downloaded");

    const result = await dialog.showMessageBox({
      type: "info",
      title: "Update Ready",
      message: "New version downloaded. Restart now?",
      buttons: ["Restart", "Later"]
    });

    if (result.response === 0) {
      if (backendProcess) backendProcess.kill();
      if (frontendProcess) frontendProcess.kill();

      autoUpdater.quitAndInstall();
    }
  });

  autoUpdater.on("error", (err) => {
    console.error("Update error:", err);
  });

  // check after app starts
  setTimeout(() => {
    autoUpdater.checkForUpdates();
  }, 5000);
}

// function setupAutoUpdater(win) {
//   autoUpdater.logger = log;
//   autoUpdater.logger.transports.file.level = "info";

//   autoUpdater.autoDownload = true;

//   autoUpdater.on("checking-for-update", () => {
//     log.info("🔍 Checking for update...");
//   });

//   autoUpdater.on("update-available", (info) => {
//     log.info("✅ Update available:", info);
//   });

//   autoUpdater.on("update-not-available", (info) => {
//     log.info("❌ No update available:", info);
//   });

//   autoUpdater.on("error", (err) => {
//     log.error("🔥 Update error:", err);
//   });

//   autoUpdater.on("download-progress", (progress) => {
//     log.info(`⬇️ Downloading: ${progress.percent}%`);
//   });

//   autoUpdater.on("update-downloaded", async () => {
//     log.info("🎉 Update downloaded");

//     const result = await dialog.showMessageBox({
//       type: "info",
//       title: "Update Ready",
//       message: "New version downloaded. Restart now?",
//       buttons: ["Restart", "Later"]
//     });

//     if (result.response === 0) {
//       if (backendProcess) backendProcess.kill();
//       if (frontendProcess) frontendProcess.kill();

//       autoUpdater.quitAndInstall();
//     }
//   });

//   setTimeout(() => {
//     autoUpdater.checkForUpdates();
//   }, 5000);
// }

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error("❌ ENV NOT FOUND:", filePath);
    return;
  }

  const envContent = fs.readFileSync(filePath, "utf-8");

  envContent.split("\n").forEach((line) => {
    if (!line || line.startsWith("#")) return;

    const index = line.indexOf("=");
    if (index === -1) return;

    const key = line.substring(0, index).trim();
    const value = line.substring(index + 1).trim().replace(/^"|"$/g, "");

    if (key && value) {
      process.env[key] = value;
    }
  });
}

function loadGlobalEnv() {
  const basePath = app.isPackaged
    ? path.join(process.resourcesPath, "server", "dist")
    : path.join(__dirname, "../server");

  const globalEnv = path.join(basePath, ".env");
  const prodEnv = path.join(basePath, ".env.prod");

  console.log("Loading ENV:", globalEnv);
  loadEnvFile(globalEnv);

  console.log("Loading ENV:", prodEnv);
  loadEnvFile(prodEnv);

  if (!process.env.BACKUP_SECRET) {
    throw new Error("❌ BACKUP_SECRET not loaded");
  }

  console.log("✅ BACKUP_SECRET:", process.env.BACKUP_SECRET);
}

const userDataPath = path.join(app.getPath("userData"), "VC Inmotions");

console.log("ELECTRON USER DATA PATH:", userDataPath);

if (!fs.existsSync(userDataPath)) fs.mkdirSync(userDataPath, { recursive: true });

// -------------------- LOG SETUP --------------------
const logDir = path.join(app.getPath("userData"), "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const log = require("electron-log");

// Main process log
log.transports.file.resolvePath = () =>
  path.join(app.getPath("userData"), "logs/main.log");
log.transports.file.format = "{y}-{m}-{d} {h}:{i}:{s} [{level}] {text}";

// Backend log

// Create scoped logs (clean way)
const backendLog = log.create({ logId: "backend" });
backendLog.transports.file.resolvePath = () =>
  path.join(app.getPath("userData"), "logs/backend.log");

// Frontend log
const frontendLog = log.create({ logId: "frontend" });
frontendLog.transports.file.resolvePath = () =>
  path.join(app.getPath("userData"), "logs/frontend.log");

// Optional: Replace console with main log
console.log = log.info;
console.error = log.error;

// Global error handlers
process.on("uncaughtException", (err) => log.error("Uncaught Exception:", err));
process.on("unhandledRejection", (reason, promise) =>
  log.error("Unhandled Rejection at:", promise, reason)
);
// -------------------- END LOG SETUP --------------------

let backendProcess;
let frontendProcess;

const isDev = !app.isPackaged;
const BACKEND_PORT = 5001;
const FRONTEND_PORT = 3000;
const STARTUP_TIMEOUT = 180000;

/* ---------------- UTILS ---------------- */
function prepareUserDataFolders() {
  const dataDir = path.join(userDataPath, "data");
  const tenantsDir = path.join(dataDir, "tenants");

  fs.mkdirSync(userDataPath, { recursive: true });
  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(tenantsDir, { recursive: true });

  console.log("Prepared user data folders:", {
    userDataPath,
    dataDir,
    tenantsDir,
  });
}

function waitForPort(port, timeout = STARTUP_TIMEOUT) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const socket = new net.Socket();
      socket.once("connect", () => {
        socket.destroy();
        resolve(true);
      });
      socket.once("error", () => {
        socket.destroy();
        if (Date.now() - start > timeout)
          reject(new Error(`Port ${port} not ready`));
        else setTimeout(check, 500);
      });
      socket.connect(port, "127.0.0.1");
    };
    check();
  });
}

/* ---------------- BACKEND ---------------- */
function startBackend() {
  const backendDir = isDev
    ? path.join(__dirname, "../server")
    : path.join(process.resourcesPath, "server"); // remove /dist

  const nodePath = isDev
    ? "node"
    : path.join(process.resourcesPath, "node", "node.exe");

  //const nodePath = "node";
  const backendFile = isDev ? "server.ts" : "dist/server.js";

  console.log("========== BACKEND INFO ==========");
  console.log("Mode           :", isDev ? "Development" : "Production");
  console.log("Backend Dir    :", backendDir);
  console.log("Node Path      :", nodePath);
  console.log("Backend File   :", backendFile);
  console.log("userDataPath   :", userDataPath);
  console.log("process.resourcesPath   :", process.resourcesPath);
  console.log("==================================");

  console.log("GET NODE PATH:", nodePath);

  return new Promise((resolve, reject) => {
    console.log("GET BACKEND FILE:", backendFile);

    // backendProcess = spawn(nodePath, [backendFile], {
    //   cwd: backendDir,
    //   env: { ...process.env, PORT: BACKEND_PORT },
    //   APP_ENV: "prod", // 👈 add this
    //   windowsHide: false,
    // });

    backendProcess = spawn(nodePath, [backendFile], {
      cwd: backendDir,
      env: {
        ...process.env,
        PORT: BACKEND_PORT,
        APP_ENV: "prod",
        NODE_ENV: "production",
        USER_DATA_PATH: userDataPath, // 👈 pass the Electron userData path
        BACKUP_SECRET: process.env.BACKUP_SECRET, // ✅ FORCE IT
        RESOURCES_PATH: process.resourcesPath
      },
      windowsHide: false,
    });

    console.log(
      "GET BACKEND PROCESS:",
      nodePath,
      [backendFile],
      backendFile,
      backendDir
    );

    backendProcess.stdout.on("data", (d) =>
      log.info(`[BACKEND] ${d.toString().trim()}`)
    );
    backendProcess.stderr.on("data", (d) =>
      log.error(`[BACKEND-ERR] ${d.toString().trim()}`)
    );

    backendProcess.once("exit", (code, signal) => {
      reject(new Error(`Backend exited before startup completed. Code: ${code}, Signal: ${signal}`));
    });

    waitForPort(BACKEND_PORT, STARTUP_TIMEOUT).then(resolve).catch(reject);
  });
}

/* ---------------- FRONTEND ---------------- */
function startFrontend() {
  if (isDev) return waitForPort(FRONTEND_PORT, STARTUP_TIMEOUT);

  const frontendDir = path.join(
    process.resourcesPath,
    "frontend",
    "standalone",
    "frontend"
  );

  const frontendServerPath = path.join(frontendDir, "server.js");

  //const nodePath = process.execPath; // ✅ IMPORTANT
  const nodePath = isDev
    ? "node"
    : path.join(process.resourcesPath, "node", "node.exe");

  console.log("========== FRONTEND INFO =========");
  console.log("Mode           :", "Production");
  console.log("Frontend Dir   :", frontendDir);
  console.log("Frontend Server:", frontendServerPath);
  console.log("Node Path      :", nodePath); // ✅ ADD IT HERE
  console.log("==================================");

  console.log("GET frontendServerPath DIR:", frontendServerPath);

  return new Promise((resolve, reject) => {
    frontendProcess = spawn(nodePath, [frontendServerPath], {
      cwd: frontendDir,
      env: { ...process.env, NODE_ENV: "production", PORT: FRONTEND_PORT },
      windowsHide: false, // show console
    });

    frontendProcess.stdout.on("data", (d) =>
      log.info(`[FRONTEND] ${d.toString().trim()}`)
    );
    frontendProcess.stderr.on("data", (d) =>
      log.error(`[FRONTEND-ERR] ${d.toString().trim()}`)
    );

    frontendProcess.once("exit", (code, signal) => {
      reject(new Error(`Frontend exited before startup completed. Code: ${code}, Signal: ${signal}`));
    });

    waitForPort(FRONTEND_PORT, STARTUP_TIMEOUT).then(resolve).catch(reject);
  });
}

/* ---------------- WINDOW ---------------- */
async function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const loadingHTML = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Loading</title>
        <style>
          body {
            margin: 0;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #ffffff;
            font-family: system-ui, -apple-system, BlinkMacSystemFont;
          }

          .loader {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .icon {
            height: 1.5rem;
            width: 1.5rem;
            animation: spin 1s linear infinite;
            stroke: rgba(107, 114, 128, 1);
          }

          .loading-text {
            font-size: 0.75rem;
            font-weight: 500;
            color: rgba(107, 114, 128, 1);
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        </style>
      </head>
      <body>
        <div aria-label="Loading..." role="status" class="loader">
          <svg class="icon" viewBox="0 0 256 256" fill="none">
            <line x1="128" y1="32" x2="128" y2="64" stroke-width="24" stroke-linecap="round"/>
            <line x1="195.9" y1="60.1" x2="173.3" y2="82.7" stroke-width="24" stroke-linecap="round"/>
            <line x1="224" y1="128" x2="192" y2="128" stroke-width="24" stroke-linecap="round"/>
            <line x1="195.9" y1="195.9" x2="173.3" y2="173.3" stroke-width="24" stroke-linecap="round"/>
            <line x1="128" y1="224" x2="128" y2="192" stroke-width="24" stroke-linecap="round"/>
            <line x1="60.1" y1="195.9" x2="82.7" y2="173.3" stroke-width="24" stroke-linecap="round"/>
            <line x1="32" y1="128" x2="64" y2="128" stroke-width="24" stroke-linecap="round"/>
            <line x1="60.1" y1="60.1" x2="82.7" y2="82.7" stroke-width="24" stroke-linecap="round"/>
          </svg>
          <span class="loading-text">Starting VC Inmotions…</span>
        </div>
      </body>
    </html>
  `;

  //await win.loadURL("data:text/html,<h2>Starting VC Inmotions...</h2>");

  await win.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(loadingHTML)}`
  );

  prepareUserDataFolders();


  try {
    await startBackend();
    await startFrontend();

    // ✅ ADD THIS LINE HERE FOR RELEASE BUILD
    if (!isDev && app.isPackaged) {
      setupAutoUpdater(win);
    }

    const url = isDev
      ? "http://localhost:3000"
      : `http://localhost:${FRONTEND_PORT}`;
    await win.loadURL(url);

    if (isDev) win.webContents.openDevTools();
  } catch (err) {
    console.error(err);
    await win.loadURL(
      "data:text/html,<h2 style='color:red'>Startup failed</h2>"
    );
  }
}

// app.whenReady().then(createWindow);

app.whenReady().then(() => {
  loadGlobalEnv();   // ✅ VERY IMPORTANT

  createWindow();
});

app.on("window-all-closed", () => {
  if (backendProcess) backendProcess.kill();
  if (frontendProcess) frontendProcess.kill();
  app.quit();
});

ipcMain.on("restart-app", () => {
  app.relaunch();
  app.exit();
});

/* ---------------- SELECT BACKUP FILE ---------------- */
ipcMain.handle("select-backup-file", async () => {
  try {
    const result = await dialog.showOpenDialog({
      title: "Select Backup File",
      properties: ["openFile"],
      filters: [{ name: "Backup Files", extensions: ["enc"] }],
    });

    if (result.canceled) return null;

    return result.filePaths[0];
  } catch (err) {
    console.error("Select backup file failed:", err);
    throw err;
  }
});

ipcMain.handle("perform-restore", async (_, filePath) => {
  try {
    console.log("🔄 Restore triggered from UI");

    /* ---------------- KILL RUNNING PROCESSES ---------------- */
    if (backendProcess) {
      backendProcess.kill();
      backendProcess = null;
    }

    if (frontendProcess) {
      frontendProcess.kill();
      frontendProcess = null;
    }

    // 2. Call your backend restore logic DIRECTLY
    const restoreModulePath = isDev
    ? path.join(__dirname, "../server/dist/src/utils/restoreBackUp.js")
    : path.join(process.resourcesPath, "server", "dist", "src", "utils", "restoreBackUp.js");

    const { restoreBackup } = require(restoreModulePath);

    await restoreBackup(filePath);

    console.log("✅ Restore completed");

    // 3. Restart app
    app.relaunch();
    app.exit();

  } catch (err) {
    console.error("❌ Restore failed:", err);
    throw err;
  }
});

/* ---------------- SAVE BACKUP FILE ---------------- */
ipcMain.handle("save-backup-file", async (_, sourcePath) => {
  try {
    if (!fs.existsSync(sourcePath)) {
      throw new Error("Backup file not found");
    }

    const result = await dialog.showSaveDialog({
      title: "Save Backup",
      defaultPath: "backup.enc",
    });

    if (result.canceled) return null;

    await new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(sourcePath);
      const writeStream = fs.createWriteStream(result.filePath);

      readStream.on("error", reject);
      writeStream.on("error", reject);
      writeStream.on("finish", resolve);

      readStream.pipe(writeStream);
    }); 

    return result.filePath;

  } catch (err) {
    console.error("Backup save failed:", err);
    throw err;
  }
});
