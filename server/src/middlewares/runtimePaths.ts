import path from "path";

let electronApp: any = null;

try {
  const electron = require("electron");
  electronApp = electron?.app ?? null;
} catch {
  electronApp = null;
}

export const isElectron = !!electronApp;
//export const isPackaged = isElectron && electronApp.isPackaged;

export const isPackaged = !!process.env.NODE_ENV && process.env.NODE_ENV === "production";

/**
 * True when this server was started by the desktop EXE (Electron always passes USER_DATA_PATH).
 * The EXE has ONE admin: the institute ADMIN also holds every master/system screen, and the
 * separate master login is not used. The hosted web server keeps both logins.
 */
export const isDesktopApp = () => !!process.env.USER_DATA_PATH;

export function getUserDataPath() {
  // if (isElectron && electronApp) {
  //   return electronApp.getPath("userData");
  // }

  // Use Electron path if passed via env
  // if (process.env.USER_DATA_PATH) {
  //    return process.env.USER_DATA_PATH || path.join(electronApp.getPath("userData"), "VC Inmotions");
  // }

  // ✅ Always prefer Electron-passed path
  if (process.env.USER_DATA_PATH) {
    return process.env.USER_DATA_PATH;
  }

  // ✅ If Electron available (dev fallback)
  if (isElectron && electronApp) {
    return path.join(electronApp.getPath("userData"), "VC Inmotions");
  }

  // ⚠️ Last fallback (non-electron)
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
