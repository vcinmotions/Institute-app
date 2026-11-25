const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  restartApp: () => ipcRenderer.send("restart-app"),

  openExternal: (url) => ipcRenderer.invoke("open-external", url),

  selectBackupFile: () => ipcRenderer.invoke("select-backup-file"),

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
