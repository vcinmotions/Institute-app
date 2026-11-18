const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  restartApp: () => ipcRenderer.send("restart-app"),

  openExternal: (url) => ipcRenderer.invoke("open-external", url),

  selectBackupFile: () => ipcRenderer.invoke("select-backup-file"),

  saveBackupFile: (sourcePath) =>
    ipcRenderer.invoke("save-backup-file", sourcePath),

  // ✅ ADD THIS
  performRestore: (filePath) =>
    ipcRenderer.invoke("perform-restore", filePath),
});

