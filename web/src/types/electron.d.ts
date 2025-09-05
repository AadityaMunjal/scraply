// Type declarations for Electron preload API

export interface ElectronAPI {
  trainModel: (config: any) => Promise<any>;
  generateNotebook: (config: any) => Promise<any>;
  saveFile: (defaultPath: string, data: string) => Promise<any>;
  checkPythonHealth: () => Promise<any>;
  onTrainingProgress: (callback: (data: any) => void) => () => void;
  isDev: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
