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


export {};

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
  auth: ElectronAuthAPI;
}


declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
