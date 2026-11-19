const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  restartApp: () => ipcRenderer.send("restart-app"),

  openExternal: (url) => ipcRenderer.invoke("open-external", url),

  selectBackupFile: () => ipcRenderer.invoke("select-backup-file"),

  saveBackupFile: (sourcePath) =>
    ipcRenderer.invoke("save-backup-file", sourcePath),

  performRestore: (filePath) =>
    ipcRenderer.invoke("perform-restore", filePath),

  // Standalone / LAN mode setup (used by installer/mode-setup.html)
  mode: {
    get: () => ipcRenderer.invoke("mode:get"),
    test: (cfg) => ipcRenderer.invoke("mode:test", cfg),
    save: (cfg) => ipcRenderer.invoke("mode:save", cfg),
    cancel: () => ipcRenderer.invoke("mode:cancel"),
  },
});
