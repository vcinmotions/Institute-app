const { autoUpdater } = require("electron-updater");
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { spawn, spawnSync } = require("child_process");
const path = require("path");
const net = require("net");
const fs = require("fs");

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const isDev = !app.isPackaged;
const isWin = process.platform === "win32";
const BACKEND_PORT = 5001;
const FRONTEND_PORT = 3000;
const STARTUP_TIMEOUT = 180_000;
const RESTORE_TIMEOUT = 300_000; // 5-minute absolute deadlock safety guard

const USER_DATA_PATH = path.join(app.getPath("userData"), "VC Inmotions");
const RESOURCES_PATH = process.resourcesPath;

// Dynamic cross-platform Node binary resolution for production
const NODE_PATH = path.join(RESOURCES_PATH, "node", isWin ? "node.exe" : "node");

// ─── LOG DIRECTORY GUARD ─────────────────────────────────────────────────────
const LOG_DIR = path.join(app.getPath("userData"), "logs");
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const log = require("electron-log");
log.transports.file.resolvePath = () => path.join(LOG_DIR, "main.log");
log.transports.file.format = "{y}-{m}-{d} {h}:{i}:{s} [{level}] {text}";

const backendLog = log.create({ logId: "backend" });
backendLog.transports.file.resolvePath = () => path.join(LOG_DIR, "backend.log");

const frontendLog = log.create({ logId: "frontend" });
frontendLog.transports.file.resolvePath = () => path.join(LOG_DIR, "frontend.log");

console.log = log.info.bind(log);
console.error = log.error.bind(log);

process.on("uncaughtException", (err) => log.error("Uncaught Exception:", err));
process.on("unhandledRejection", (reason) => log.error("Unhandled Rejection:", reason));

// ─── PROCESS HANDLES ─────────────────────────────────────────────────────────
let backendProcess = null;
let frontendProcess = null;

// ─── ENV LOADING ──────────────────────────────────────────────────────────────
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    log.warn("ENV file not found (skipping):", filePath);
    return;
  }
  try {
    const lines = fs.readFileSync(filePath, "utf-8").split(/\r?\n/);
    for (const line of lines) {
      if (!line || line.trim().startsWith("#")) continue;
      const idx = line.indexOf("=");
      if (idx === -1) continue;
      const key = line.substring(0, idx).trim();
      const value = line.substring(idx + 1).trim().replace(/^"|"$/g, "");
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch (err) {
    log.error(`Failed to read env file: ${filePath}`, err);
  }
}

function loadGlobalEnv() {
  const basePath = isDev
    ? path.join(__dirname, "../server")
    : path.join(RESOURCES_PATH, "server", "dist");

  loadEnvFile(path.join(basePath, ".env"));
  loadEnvFile(path.join(basePath, ".env.prod"));

  if (!process.env.BACKUP_SECRET) {
    throw new Error("BACKUP_SECRET not loaded — check .env / .env.prod");
  }
  log.info("ENV loaded. BACKUP_SECRET present ✓");
}

// ─── RUNTIME VERIFICATION ────────────────────────────────────────────────────
function verifyProductionRuntime() {
  if (!isDev && !fs.existsSync(NODE_PATH)) {
    throw new Error(`Bundled Node runtime missing at expected path: ${NODE_PATH}`);
  }
}

// ─── FOLDER PREP ─────────────────────────────────────────────────────────────
function prepareUserDataFolders() {
  const folders = [
    USER_DATA_PATH,
    path.join(USER_DATA_PATH, "data"),
    path.join(USER_DATA_PATH, "data", "tenants"),
  ];
  for (const dir of folders) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
  log.info("User data folders ready:", USER_DATA_PATH);
}

// ─── PORT WAIT ───────────────────────────────────────────────────────────────
function waitForPort(port, timeout = STARTUP_TIMEOUT) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeout;
    let delay = 250;

    const check = () => {
      if (Date.now() > deadline) {
        return reject(new Error(`Port ${port} not ready within ${timeout}ms`));
      }
      const socket = new net.Socket();
      socket.once("connect", () => { socket.destroy(); resolve(); });
      socket.once("error", () => {
        socket.destroy();
        delay = Math.min(delay * 1.5, 2000);
        setTimeout(check, delay);
      });
      socket.connect(port, "127.0.0.1");
    };
    check();
  });
}

// ─── BACKEND ─────────────────────────────────────────────────────────────────
function startBackend() {
  const backendDir = isDev
    ? path.join(__dirname, "../server")
    : path.join(RESOURCES_PATH, "server");

  const runtime = isDev ? (isWin ? "npx.cmd" : "npx") : NODE_PATH;
  const args    = isDev ? ["ts-node", "server.ts"] : ["dist/server.js"];

  log.info("Starting backend →", backendDir, runtime, args);

  return new Promise((resolve, reject) => {
    backendProcess = spawn(runtime, args, {
      cwd: backendDir,
      env: {
        ...process.env,
        PORT: String(BACKEND_PORT),
        APP_ENV: "prod",
        NODE_ENV: isDev ? "development" : "production",
        USER_DATA_PATH,
        BACKUP_SECRET: process.env.BACKUP_SECRET,
        RESOURCES_PATH,
      },
      windowsHide: !isDev,
    });

    backendProcess.stdout.on("data", (d) => backendLog.info(d.toString().trimEnd()));
    backendProcess.stderr.on("data", (d) => backendLog.error(d.toString().trimEnd()));

    let started = false;

    // Handles early boot failures exclusively
    backendProcess.once("exit", (code, signal) => {
      if (!started) {
        reject(new Error(`Backend exited early — code: ${code}, signal: ${signal}`));
      }
    });

    // Persistent runtime crash monitor
    backendProcess.on("exit", (code, signal) => {
      if (started && code !== 0 && code !== null) {
        backendLog.error(`Backend crashed/exited unexpectedly. Code: ${code}, Signal: ${signal}`);
      }
    });

    waitForPort(BACKEND_PORT, STARTUP_TIMEOUT)
      .then(() => { started = true; resolve(); })
      .catch(reject);
  });
}

// ─── FRONTEND ────────────────────────────────────────────────────────────────
function startFrontend() {
  if (isDev) return waitForPort(FRONTEND_PORT, STARTUP_TIMEOUT);

  // const frontendDir = path.join(RESOURCES_PATH, "frontend", "standalone", "frontend");
  const frontendDir = path.join(
    RESOURCES_PATH,
    "frontend",
    "standalone",
    "vcinmotions-application-ai",
    "frontend"
  );
  const frontendServerPath = path.join(frontendDir, "server.js");

  log.info("Frontend dir:", frontendDir);
  log.info("Frontend dir exists:", fs.existsSync(frontendDir));

  log.info("Frontend server:", frontendServerPath);
  log.info("Frontend server exists:", fs.existsSync(frontendServerPath));

  log.info("Starting frontend →", frontendServerPath);

  return new Promise((resolve, reject) => {
    frontendProcess = spawn(NODE_PATH, [frontendServerPath], {
      cwd: frontendDir,
      env: { ...process.env, NODE_ENV: "production", PORT: String(FRONTEND_PORT) },
      windowsHide: true,
    });

    frontendProcess.stdout.on("data", (d) => frontendLog.info(d.toString().trimEnd()));
    frontendProcess.stderr.on("data", (d) => frontendLog.error(d.toString().trimEnd()));

    let started = false;

    // Handles early boot failures exclusively
    frontendProcess.once("exit", (code, signal) => {
      if (!started) {
        reject(new Error(`Frontend exited early — code: ${code}, signal: ${signal}`));
      }
    });

    // Persistent runtime crash monitor
    frontendProcess.on("exit", (code, signal) => {
      if (started && code !== 0 && code !== null) {
        frontendLog.error(`Frontend crashed/exited unexpectedly. Code: ${code}, Signal: ${signal}`);
      }
    });

    waitForPort(FRONTEND_PORT, STARTUP_TIMEOUT)
      .then(() => { started = true; resolve(); })
      .catch(reject);
  });
}

// ─── AUTO UPDATER ─────────────────────────────────────────────────────────────
function setupAutoUpdater() {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("checking-for-update", () => log.info("Checking for updates..."));
  autoUpdater.on("update-available", (info) => log.info("Update available:", info.version));
  autoUpdater.on("update-not-available", () => log.info("No updates available"));
  autoUpdater.on("download-progress", (progress) => log.info(`Downloading update: ${progress.percent.toFixed(1)}%`));
  
  // Explicitly log channel communication errors
  autoUpdater.on("error", (err) => log.error("Auto-updater failure caught:", err));

  autoUpdater.on("update-downloaded", async () => {
    log.info("Update downloaded — prompting user");
    const { response } = await dialog.showMessageBox({
      type: "info",
      title: "Update Ready",
      message: "A new version has been downloaded. Restart now to apply it?",
      buttons: ["Restart Now", "Later"],
    });
    if (response === 0) {
      killChildren();
      autoUpdater.quitAndInstall();
    }
  });

  setTimeout(() => autoUpdater.checkForUpdates(), 10_000);
}

// ─── LOADING SCREEN ──────────────────────────────────────────────────────────
const LOADING_HTML = `data:text/html;charset=utf-8,${encodeURIComponent(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Loading</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{
      height:100vh;display:flex;flex-direction:column;
      justify-content:center;align-items:center;
      background:#0f0f10;font-family:system-ui,-apple-system,sans-serif;
      color:#e2e2e5;gap:20px;
    }
    .brand{font-size:1.1rem;font-weight:600;letter-spacing:.02em;opacity:.9}
    .bar-track{width:220px;height:3px;background:#1e1e22;border-radius:99px;overflow:hidden;margin-top:6px}
    .bar-fill{height:100%;width:30%;background:linear-gradient(90deg,#6366f1,#8b5cf6);
      border-radius:99px;animation:slide 1.4s ease-in-out infinite}
    .sub{font-size:.75rem;color:#888;letter-spacing:.04em}
    @keyframes slide{
      0%{transform:translateX(-100%)}
      50%{transform:translateX(250%)}
      100%{transform:translateX(-100%)}
    }
  </style>
</head>
<body>
  <div class="brand">VC Inmotions</div>
  <div class="bar-track"><div class="bar-fill"></div></div>
  <div class="sub">Starting services…</div>
</body>
</html>`)}`;

// ─── WINDOW ──────────────────────────────────────────────────────────────────
async function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    backgroundColor: "#0f0f10",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true, 
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

  await win.loadURL(LOADING_HTML);
  win.show();

  try {
    prepareUserDataFolders();
    await startBackend();
    await startFrontend();
  } catch (err) {
    log.error("Startup failed:", err);
    
    // Explicitly clean up any orphan background tasks if partial boot failed
    killChildren();
    
    await win.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(
        `<body style="background:#0f0f10;color:#f87171;font-family:system-ui;padding:40px">
          <h2>Startup failed</h2><pre>${String(err.message)}</pre>
          <p style="color:#888;margin-top:16px">Check logs at: ${LOG_DIR}</p>
        </body>`
      )}`
    );
    return;
  }

  await win.loadURL(`http://localhost:${FRONTEND_PORT}`);

  if (isDev) win.webContents.openDevTools();
  if (!isDev && app.isPackaged) setupAutoUpdater();
}

// ─── PROCESS TREE TERMINATION ────────────────────────────────────────────────
function killProcessTree(proc) {
  if (!proc || !proc.pid) return;

  try {
    if (isWin) {
      spawnSync("taskkill", ["/pid", String(proc.pid), "/T", "/F"], { windowsHide: true });
    } else {
      proc.kill("SIGTERM");
    }
  } catch (err) {
    try { proc.kill("SIGKILL"); } catch (e) { log.error("Process terminal kill failed:", e); }
  }
}

function killChildren() {
  if (backendProcess) { killProcessTree(backendProcess); backendProcess = null; }
  if (frontendProcess) { killProcessTree(frontendProcess); frontendProcess = null; }
}

// ─── APP LIFECYCLE ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  try {
    verifyProductionRuntime();
    loadGlobalEnv();
  } catch (err) {
    log.error(err.message);
    dialog.showErrorBox("Configuration Error", String(err.message));
    app.exit(1); 
    return;
  }
  createWindow();
});

app.on("window-all-closed", () => {
  killChildren();
  app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

process.on("SIGINT", () => {
  killChildren();
  process.exit(0);
});

process.on("SIGTERM", () => {
  killChildren();
  process.exit(0);
});

// ─── IPC HANDLERS ────────────────────────────────────────────────────────────
ipcMain.on("restart-app", () => {
  killChildren();
  app.relaunch();
  app.quit();
});

ipcMain.handle("select-backup-file", async () => {
  const result = await dialog.showOpenDialog({
    title: "Select Backup File",
    properties: ["openFile"],
    filters: [{ name: "Backup Files", extensions: ["enc"] }],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("perform-restore", async (_, filePath) => {
  log.info("Restore triggered from UI:", filePath);

  const restoreModulePath = isDev
    ? path.join(__dirname, "../server/dist/src/utils/restoreBackUp.js")
    : path.join(RESOURCES_PATH, "server", "dist", "src", "utils", "restoreBackUp.js");

  const restoreRuntime = isDev ? "node" : NODE_PATH;

  const restoreProcess = spawn(restoreRuntime, [restoreModulePath, filePath], {
    env: { ...process.env, USER_DATA_PATH }
  });

  // Watchdog timer to prevent the application from hanging indefinitely on locked operations
  const watchdog = setTimeout(() => {
    log.error("Restore execution timed out! Forcing process termination.");
    killProcessTree(restoreProcess);
  }, RESTORE_TIMEOUT);

  // Pipe standard error streams over to primary diagnostic log files
  restoreProcess.stderr.on("data", (d) => {
    log.error("[RESTORE CRITICAL ERROR]", d.toString().trimEnd());
  });

  restoreProcess.on("error", (err) => {
    clearTimeout(watchdog);
    log.error("Failed to spawn restore script pipeline:", err);
    dialog.showErrorBox("Restore Boot Failure", `Could not execute restore runtime: ${err.message}`);
  });

  restoreProcess.on("exit", (code) => {
    clearTimeout(watchdog);
    
    if (code === 0) {
      log.info(`Restore script completed successfully. Purging environment and relaunching.`);
      // Only kill existing child runtime tree frames once recovery is authenticated!
      killChildren();
      app.relaunch();
      app.quit();
    } else {
      log.error(`Restore routine failed with non-zero exit validation code: ${code}`);
      dialog.showErrorBox(
        "Restore Failed",
        `The data restoration script terminated unexpectedly (Code: ${code}).\n\nYour existing server processes are still active. No state modifications were made.`
      );
    }
  });
});

ipcMain.handle("save-backup-file", async (_, sourcePath) => {
  if (!fs.existsSync(sourcePath)) throw new Error("Backup file not found");

  const result = await dialog.showSaveDialog({
    title: "Save Backup",
    defaultPath: "backup.enc",
  });
  if (result.canceled) return null;

  await fs.promises.copyFile(sourcePath, result.filePath);
  return result.filePath;
});