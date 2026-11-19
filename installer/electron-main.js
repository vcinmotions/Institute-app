const { autoUpdater } = require("electron-updater");
const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require("electron");
const { spawn, spawnSync } = require("child_process");
const path = require("path");
const net = require("net");
const fs = require("fs");
const os = require("os");
const http = require("http");

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

// ─── RUN MODE (Standalone / LAN Server / LAN Client) ─────────────────────────
// Chosen once by the administrator and kept in mode-config.json. The app never
// switches mode on its own; changing it needs File > Connection & Mode Settings.
const MODE_CONFIG_PATH = path.join(app.getPath("userData"), "mode-config.json");
const MODES = ["STANDALONE", "LAN_SERVER", "LAN_CLIENT"];

function readModeConfig() {
  try {
    const c = JSON.parse(fs.readFileSync(MODE_CONFIG_PATH, "utf8"));
    if (!MODES.includes(c.mode)) return null;
    if (c.mode === "LAN_CLIENT" && !c.host) return null;
    return c;
  } catch {
    return null;
  }
}

function writeModeConfig(cfg) {
  fs.mkdirSync(path.dirname(MODE_CONFIG_PATH), { recursive: true });
  fs.writeFileSync(MODE_CONFIG_PATH, JSON.stringify(cfg, null, 2), "utf8");
}

function normalizeModeConfig(raw) {
  if (!raw || !MODES.includes(raw.mode)) throw new Error("Invalid mode");
  if (raw.mode !== "LAN_CLIENT") return { mode: raw.mode };
  const host = String(raw.host || "").trim();
  // Only a plain IPv4 address or host name - no URL, path or credentials.
  if (!/^[A-Za-z0-9]([A-Za-z0-9.-]{0,251}[A-Za-z0-9])?$/.test(host)) throw new Error("Invalid server address");
  const port = Number(raw.port) || 5001;
  const frontendPort = Number(raw.frontendPort) || 3000;
  for (const p of [port, frontendPort]) {
    if (!Number.isInteger(p) || p < 1 || p > 65535) throw new Error("Invalid port");
  }
  return { mode: "LAN_CLIENT", host, port, frontendPort };
}

function localIPv4s() {
  const out = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const i of list || []) {
      if (i.family === "IPv4" && !i.internal) out.push(i.address);
    }
  }
  return out;
}

function httpProbe(url, timeoutMs = 4000) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: timeoutMs }, (res) => {
      res.resume();
      resolve({ ok: res.statusCode >= 200 && res.statusCode < 500, message: `reachable (HTTP ${res.statusCode})` });
    });
    req.on("timeout", () => { req.destroy(); resolve({ ok: false, message: "timed out - check the IP and that the server is running" }); });
    req.on("error", (e) => resolve({ ok: false, message: e.code === "ECONNREFUSED" ? "refused - server not running or blocked by firewall" : (e.code || e.message) }));
  });
}

function httpProbeJson(url, timeoutMs = 4000) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: timeoutMs }, (res) => {
      let body = "";
      res.on("data", (d) => (body += d));
      res.on("end", () => {
        try { resolve(JSON.parse(body)); } catch { resolve(null); }
      });
    });
    req.on("timeout", () => { req.destroy(); resolve(null); });
    req.on("error", () => resolve(null));
  });
}

async function testServerConnection(cfg) {
  const host = cfg.host;
  const [backend, frontend] = await Promise.all([
    httpProbe(`http://${host}:${cfg.port}/api/setup/status`),
    httpProbe(`http://${host}:${cfg.frontendPort}/`),
  ]);
  return { backend, frontend };
}

// LAN server: try to open the two ports in Windows Firewall (needs admin; failure is non-fatal).
function ensureFirewallRules() {
  if (!isWin) return { ok: true };
  let allOk = true;
  for (const [name, port] of [["VC Inmotions Backend", BACKEND_PORT], ["VC Inmotions App", FRONTEND_PORT]]) {
    const check = spawnSync("netsh", ["advfirewall", "firewall", "show", "rule", `name=${name}`], { windowsHide: true });
    if (check.status === 0) continue; // rule already exists
    const add = spawnSync(
      "netsh",
      ["advfirewall", "firewall", "add", "rule", `name=${name}`, "dir=in", "action=allow", "protocol=TCP", `localport=${port}`, "profile=private,domain"],
      { windowsHide: true }
    );
    if (add.status !== 0) allOk = false;
  }
  return { ok: allOk };
}

let modeSetupContext = { isChange: false, error: "" };

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
function startBackend(lanServer = false) {
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
        // Standalone: reachable from this PC only. LAN server: reachable from the network.
        HOST: lanServer ? "0.0.0.0" : "127.0.0.1",
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
function startFrontend(lanServer = false) {
  if (isDev) return waitForPort(FRONTEND_PORT, STARTUP_TIMEOUT);

  const frontendDir = path.join(RESOURCES_PATH, "frontend", "standalone", "frontend");
  const frontendServerPath = path.join(frontendDir, "server.js");

  log.info("Frontend dir:", frontendDir);
  log.info("Frontend dir exists:", fs.existsSync(frontendDir));

  log.info("Frontend server:", frontendServerPath);
  log.info("Frontend server exists:", fs.existsSync(frontendServerPath));

  log.info("Starting frontend →", frontendServerPath);

  return new Promise((resolve, reject) => {
    frontendProcess = spawn(NODE_PATH, [frontendServerPath], {
      cwd: frontendDir,
      env: {
        ...process.env,
        NODE_ENV: "production",
        PORT: String(FRONTEND_PORT),
        HOSTNAME: lanServer ? "0.0.0.0" : "127.0.0.1",
      },
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

  const cfg = readModeConfig();

  // First run (or settings requested): ask the administrator how this PC should run.
  if (!cfg || modeSetupContext.isChange) {
    await win.loadFile(path.join(__dirname, "mode-setup.html"));
    return;
  }

  // LAN client: no local database or services - use the server computer.
  if (cfg.mode === "LAN_CLIENT") {
    const probe = await testServerConnection(cfg);
    if (!probe.backend.ok || !probe.frontend.ok) {
      modeSetupContext = {
        isChange: true,
        error: `Cannot reach the server at ${cfg.host}. Backend: ${probe.backend.message}. App: ${probe.frontend.message}. Check the server computer is on, then Test connection / Save again.`,
      };
      await win.loadFile(path.join(__dirname, "mode-setup.html"));
      return;
    }
    await win.loadURL(`http://${cfg.host}:${cfg.frontendPort}`);
    if (!isDev && app.isPackaged) setupAutoUpdater();
    return;
  }

  const lanServer = cfg.mode === "LAN_SERVER";

  try {
    prepareUserDataFolders();
    await startBackend(lanServer);
    await startFrontend(lanServer);
    if (lanServer) {
      const fw = ensureFirewallRules();
      if (!fw.ok) {
        dialog.showMessageBox({
          type: "warning",
          title: "Allow other computers to connect",
          message: "Windows Firewall may block other computers from connecting.",
          detail:
            "Run these two commands once in an Administrator Command Prompt on this computer:\n\n" +
            `netsh advfirewall firewall add rule name="VC Inmotions Backend" dir=in action=allow protocol=TCP localport=${BACKEND_PORT}\n` +
            `netsh advfirewall firewall add rule name="VC Inmotions App" dir=in action=allow protocol=TCP localport=${FRONTEND_PORT}\n\n` +
            `Other computers connect to: ${localIPv4s().join(", ") || "(no network found)"}`,
        });
      }
    }
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
  buildMenu();
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
// Opens the subscription portal in the default browser (https + allowlisted host only).
function isAllowedExternal(url) {
  try {
    const u = new URL(url);
    const portal = process.env.SUBSCRIPTION_PORTAL_URL;
    if (!portal || u.protocol !== "https:") return false;
    return u.hostname === new URL(portal).hostname;
  } catch {
    return false;
  }
}

ipcMain.handle("open-external", async (_e, url) => {
  if (!isAllowedExternal(url)) return false;
  await shell.openExternal(url);
  return true;
});

// ── Mode setup (Standalone / LAN) ──
ipcMain.handle("mode:get", () => ({
  config: readModeConfig(),
  ips: localIPv4s(),
  isChange: modeSetupContext.isChange,
  error: modeSetupContext.error,
}));

ipcMain.handle("mode:test", async (_e, raw) => {
  try {
    const cfg = normalizeModeConfig({ mode: "LAN_CLIENT", ...raw });
    return await testServerConnection(cfg);
  } catch (err) {
    const bad = { ok: false, message: err.message };
    return { backend: bad, frontend: bad };
  }
});

ipcMain.handle("mode:save", (_e, raw) => {
  const cfg = normalizeModeConfig(raw);
  writeModeConfig(cfg);
  log.info("Run mode saved:", cfg.mode);
  killChildren();
  app.relaunch();
  app.quit();
});

ipcMain.handle("mode:cancel", () => {
  killChildren();
  app.relaunch();
  app.quit();
});

async function confirmAndOpenModeSettings(win) {
  const { response } = await dialog.showMessageBox(win, {
    type: "warning",
    title: "Change connection mode",
    message: "Change how this computer runs VC Inmotions?",
    detail:
      "Only an administrator should do this. Your data is not deleted, but this computer will use a different database location after you save: " +
      "Standalone and Server use this computer's data; Client uses the server computer's data.",
    buttons: ["Continue", "Cancel"],
    defaultId: 1,
    cancelId: 1,
  });
  if (response !== 0) return;
  modeSetupContext = { isChange: true, error: "" };
  (win || BrowserWindow.getAllWindows()[0])?.loadFile(path.join(__dirname, "mode-setup.html"));
}

function buildMenu() {
  const template = [
    {
      label: "File",
      submenu: [
        { label: "Connection & Mode Settings…", click: (_i, win) => confirmAndOpenModeSettings(win) },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    { role: "editMenu" },
    { role: "viewMenu" },
    { role: "windowMenu" },
    { role: "help", submenu: [{ label: "About", click: () => dialog.showMessageBox({ message: `VC Inmotions ${app.getVersion()}` }) }] },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

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

  // A client PC has no local database, and a restore overwrites data - refuse in View-Only Mode.
  const cfg = readModeConfig();
  if (cfg?.mode === "LAN_CLIENT") {
    dialog.showErrorBox("Restore not available", "Restore must be done on the server computer.");
    return;
  }
  const lock = await httpProbeJson(`http://127.0.0.1:${BACKEND_PORT}/api/subscription/locked`);
  if (lock?.locked) {
    dialog.showErrorBox(
      "View-Only Mode",
      "Your software subscription has expired. The application is currently in View-Only Mode. Please renew your subscription through the web portal to restore full access."
    );
    return;
  }

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