export interface ElectronAPI {
  selectWorkspace: () => Promise<string | null>;
  readVaults: (workspacePath: string) => Promise<any[]>;
  createVault: (workspacePath: string, vaultName: string) => Promise<boolean>;
  renameVault: (workspacePath: string, oldName: string, newName: string) => Promise<boolean>;
  deleteVault: (workspacePath: string, vaultName: string) => Promise<boolean>;
  readPhotos: (workspacePath: string, vaultName: string) => Promise<any[]>;
  writePhoto: (workspacePath: string, vaultName: string, sourcePath: string, fileName: string) => Promise<string>;
  deletePhoto: (workspacePath: string, vaultName: string, photoId: string) => Promise<boolean>;
  renamePhoto: (workspacePath: string, vaultName: string, photoId: string, newName: string) => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
