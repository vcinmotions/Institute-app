const { contextBridge, ipcRenderer } = require("electron");

// ─── Stay signed in across restarts ──────────────────────────────────────────
// The app keeps its session token in sessionStorage, which Electron empties when the EXE closes.
// Closing the EXE must NOT sign the user out (the server signs everyone out once a week, Sunday 11:59 PM),
// so a copy is kept in localStorage and put back on the first page load after the EXE starts.
// DOM storage is shared with the page (same origin), so this works with context isolation.
const TOKEN = "token";
const SAVED = "vc_saved_token";
const RESTORED = "vc_token_restored"; // per window: restore only once, never after a sign-out in this run

function syncSavedToken() {
  try {
    const t = window.sessionStorage.getItem(TOKEN);
    if (t) window.localStorage.setItem(SAVED, t);
    else window.localStorage.removeItem(SAVED); // signed out: forget the copy
  } catch (_) { /* storage unavailable (file:// pages) */ }
}

try {
  if (!window.sessionStorage.getItem(RESTORED)) {
    window.sessionStorage.setItem(RESTORED, "1");
    const saved = window.localStorage.getItem(SAVED);
    if (saved && !window.sessionStorage.getItem(TOKEN)) window.sessionStorage.setItem(TOKEN, saved);
  }
  setInterval(syncSavedToken, 3000); // also covers a power cut
  window.addEventListener("pagehide", syncSavedToken);
  window.addEventListener("beforeunload", syncSavedToken);
} catch (_) { /* storage unavailable (file:// pages) */ }

contextBridge.exposeInMainWorld("electronAPI", {
  restartApp: () => ipcRenderer.send("restart-app"),

  openExternal: (url) => ipcRenderer.invoke("open-external", url),

  selectBackupFile: () => ipcRenderer.invoke("select-backup-file"),

  // Folder picker for the backup folders; returns { path } (null when cancelled) or { error }.
  selectFolder: (opts) => ipcRenderer.invoke("select-folder", opts),

  saveBackupFile: (sourcePath) =>
    ipcRenderer.invoke("save-backup-file", sourcePath),

  performRestore: (filePath) =>
    ipcRenderer.invoke("perform-restore", filePath),

  // This PC's id (used to register client PCs against the company's Client key)
  device: { get: () => ipcRenderer.invoke("device:get") },

  // Software update (Super Admin only; the main process re-checks the token)
  update: {
    status: () => ipcRenderer.invoke("update:status"),
    check: (token) => ipcRenderer.invoke("update:check", token),
    download: (token) => ipcRenderer.invoke("update:download", token),
    install: (token) => ipcRenderer.invoke("update:install", token),
    rollback: (token, version) => ipcRenderer.invoke("update:rollback", token, version),
  },

  // Standalone / LAN mode setup (used by installer/mode-setup.html)
  mode: {
    get: () => ipcRenderer.invoke("mode:get"),
    test: (cfg) => ipcRenderer.invoke("mode:test", cfg),
    save: (cfg) => ipcRenderer.invoke("mode:save", cfg),
    cancel: () => ipcRenderer.invoke("mode:cancel"),
  },
});
