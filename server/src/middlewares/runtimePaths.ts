import path from "path";

let electronApp: any = null;

try {
  const electron = require("electron");
  electronApp = electron?.app ?? null;
} catch {
  electronApp = null;
}

export const isElectron = !!electronApp;
export const isPackaged = isElectron && electronApp.isPackaged;

export function getUserDataPath() {
  if (isElectron && electronApp) {
    return electronApp.getPath("userData");
  }

  // fallback for pure Node
  return path.join(process.cwd(), "data");
}

export function getResourcePath() {
  // Use __dirname of your backend in production
  if (isPackaged) {
    // __dirname points to: resources/server/dist
    return path.resolve(__dirname, "../../../db");
  }

  // fallback for dev
  return path.join(process.cwd(), "db");
}
