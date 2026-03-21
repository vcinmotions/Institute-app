const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  restartApp: () => ipcRenderer.send("restart-app"),

  selectBackupFile: () => ipcRenderer.invoke("select-backup-file"),

  saveBackupFile: (sourcePath) =>
    ipcRenderer.invoke("save-backup-file", sourcePath),

  // ✅ ADD THIS
  performRestore: (filePath) =>
    ipcRenderer.invoke("perform-restore", filePath),
});

