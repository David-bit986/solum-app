import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  selectWorkspace: () => ipcRenderer.invoke('select-workspace'),
  readVaults: (workspacePath: string) => ipcRenderer.invoke('read-vaults', workspacePath),
  createVault: (workspacePath: string, vaultName: string) => ipcRenderer.invoke('create-vault', workspacePath, vaultName),
  renameVault: (workspacePath: string, oldName: string, newName: string) => ipcRenderer.invoke('rename-vault', workspacePath, oldName, newName),
  deleteVault: (workspacePath: string, vaultName: string) => ipcRenderer.invoke('delete-vault', workspacePath, vaultName),
  readPhotos: (workspacePath: string, vaultName: string) => ipcRenderer.invoke('read-photos', workspacePath, vaultName),
  writePhoto: (workspacePath: string, vaultName: string, sourcePath: string, fileName: string) => ipcRenderer.invoke('write-photo', workspacePath, vaultName, sourcePath, fileName),
  deletePhoto: (workspacePath: string, vaultName: string, photoId: string) => ipcRenderer.invoke('delete-photo', workspacePath, vaultName, photoId),
  renamePhoto: (workspacePath: string, vaultName: string, photoId: string, newName: string) => ipcRenderer.invoke('rename-photo', workspacePath, vaultName, photoId, newName)
})
