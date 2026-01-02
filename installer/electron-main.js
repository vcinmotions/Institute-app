const { app, BrowserWindow, ipcMain } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const net = require("net");
const fs = require("fs");

const userDataPath = path.join(app.getPath("userData"), "VC Inmotions");
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
const backendLog = require("electron-log");
backendLog.transports.file.resolvePath = () =>
  path.join(app.getPath("userData"), "logs/backend.log");

// Frontend log
const frontendLog = require("electron-log");
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

/* ---------------- UTILS ---------------- */
function waitForPort(port, timeout = 15000) {
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

    waitForPort(BACKEND_PORT, 60000).then(resolve).catch(reject);
  });
}

/* ---------------- FRONTEND ---------------- */
function startFrontend() {
  if (isDev) return Promise.resolve(); // Dev uses localhost:3000 automatically

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

    waitForPort(FRONTEND_PORT, 60000).then(resolve).catch(reject);
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

  try {
    await startBackend();
    await startFrontend();

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

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (backendProcess) backendProcess.kill();
  if (frontendProcess) frontendProcess.kill();
  app.quit();
});

ipcMain.on("restart-app", () => {
  app.relaunch();
  app.exit();
});