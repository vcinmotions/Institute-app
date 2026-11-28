// export {};

// interface ElectronAuthAPI {
//   saveSession: (data: {
//     token: string;
//     email: string;
//     role: string;
//     userType?: string;
//     dbUrl?: string;
//     loggedAt: number;
//   }) => Promise<void>;

//   getSession: () => Promise<any | null>;
//   clearSession: () => Promise<void>;
// }

// interface ElectronAPI {
//   restartApp: () => void;
//   setSesstio: ElectronAuthAPI;
// }

// declare global {
//   interface Window {
//     electronAPI: ElectronAPI;
//   }
// }


export { };

interface ElectronAuthAPI {
  setSession: (data: {
    token: string;
    email: string;
    role: string;
    userType?: string;
    dbUrl?: string;
    loggedAt: number;
  }) => void;

  getSession: () => {
    token: string;
    email: string;
    role: string;
    userType?: string;
    dbUrl?: string;
    loggedAt: number;
  } | null;

  clearSession: () => void;
}

interface ElectronAPI {
  restartApp: () => void;
  openExternal?: (url: string) => Promise<boolean>;
  selectBackupFile: () => Promise<string | null>;
  selectFolder?: (opts?: { title?: string; defaultPath?: string }) => Promise<{ path?: string | null; error?: string }>;
  saveBackupFile: (sourcePath: string) => Promise<void>;
  performRestore: (filePath: string) => Promise<void>;
  auth: ElectronAuthAPI;
  device?: { get: () => Promise<{ deviceId: string; deviceName: string; os: string }> };
  update?: {
    status: () => Promise<any>;
    check: (token: string) => Promise<any>;
    download: (token: string) => Promise<any>;
    install: (token: string) => Promise<void>;
    rollback: (token: string, version: string) => Promise<any>;
  };
}


declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
