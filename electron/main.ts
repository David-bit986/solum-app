import { app, BrowserWindow, ipcMain, dialog, protocol, net } from 'electron'
import * as path from 'path'
import * as fs from 'fs/promises'
import { existsSync } from 'fs'

let mainWindow: BrowserWindow | null = null

// Register custom media protocol to load local files without breaking web security
protocol.registerSchemesAsPrivileged([
  { scheme: 'solum-media', privileges: { bypassCSP: true, secure: true, supportFetchAPI: true } }
])

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    titleBarStyle: 'default',
    title: 'Solum'
  })

  // In development, load the Vite dev server URL. In production, load the built index.html.
  if (app.isPackaged || process.env.NODE_ENV === 'production') {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  } else {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  // Handle local media protocol
  protocol.handle('solum-media', (request) => {
    const url = new URL(request.url)
    // Decode URI path (convert %20 back to spaces, etc.)
    const filePath = decodeURIComponent(url.pathname)
    
    // Resolve Windows file path prefix (e.g. /C:/path -> C:/path)
    let cleanedPath = filePath
    if (process.platform === 'win32' && filePath.startsWith('/')) {
      cleanedPath = filePath.slice(1)
    }

    return net.fetch('file://' + cleanedPath)
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// --- Safe IPC Filesystem Handlers ---

// 1. Select Workspace Directory
ipcMain.handle('select-workspace', async () => {
  if (!mainWindow) return null
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Select Solum Workspace Directory'
  })
  
  if (result.canceled) return null
  return result.filePaths[0]
})

// Helper: Scan folder image files and count them
async function countImagesInDir(dirPath: string): Promise<number> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    let count = 0
    for (const entry of entries) {
      if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase()
        if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext)) {
          count++
        }
      }
    }
    return count
  } catch {
    return 0
  }
}

// 2. Read Vaults (subdirectories in the workspace)
ipcMain.handle('read-vaults', async (_, workspacePath: string) => {
  try {
    if (!workspacePath || !existsSync(workspacePath)) return []
    const entries = await fs.readdir(workspacePath, { withFileTypes: true })
    const vaults = []

    for (const entry of entries) {
      if (entry.isDirectory()) {
        // Exclude hidden folders like .git
        if (entry.name.startsWith('.')) continue
        
        const fullPath = path.join(workspacePath, entry.name)
        const stats = await fs.stat(fullPath)
        const count = await countImagesInDir(fullPath)

        vaults.push({
          id: entry.name.toLowerCase().replace(/\s+/g, '-'),
          name: entry.name,
          count: count,
          createdAt: stats.birthtime.toISOString()
        })
      }
    }
    
    // Sort by birthtime/creation
    return vaults.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  } catch (error) {
    console.error('Failed to read vaults:', error)
    return []
  }
})

// 3. Create Vault Directory
ipcMain.handle('create-vault', async (_, workspacePath: string, vaultName: string) => {
  try {
    const dirPath = path.join(workspacePath, vaultName)
    if (existsSync(dirPath)) {
      throw new Error('Vault folder already exists')
    }
    await fs.mkdir(dirPath, { recursive: true })
    return true
  } catch (error) {
    console.error('Failed to create vault:', error)
    throw error
  }
})

// 4. Rename Vault Directory
ipcMain.handle('rename-vault', async (_, workspacePath: string, oldName: string, newName: string) => {
  try {
    const oldPath = path.join(workspacePath, oldName)
    const newPath = path.join(workspacePath, newName)
    await fs.rename(oldPath, newPath)
    return true
  } catch (error) {
    console.error('Failed to rename vault:', error)
    throw error
  }
})

// 5. Delete Vault Directory
ipcMain.handle('delete-vault', async (_, workspacePath: string, vaultName: string) => {
  try {
    const dirPath = path.join(workspacePath, vaultName)
    await fs.rm(dirPath, { recursive: true, force: true })
    return true
  } catch (error) {
    console.error('Failed to delete vault:', error)
    throw error
  }
})

// 6. Read Photos from a Vault
ipcMain.handle('read-photos', async (_, workspacePath: string, vaultName: string) => {
  try {
    const vaultPath = path.join(workspacePath, vaultName)
    if (!existsSync(vaultPath)) return []
    const entries = await fs.readdir(vaultPath, { withFileTypes: true })
    const photos = []
    let index = 0

    for (const entry of entries) {
      if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase()
        if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext)) {
          const fullPath = path.join(vaultPath, entry.name)
          const stats = await fs.stat(fullPath)
          
          // Construct custom protocol URL
          const mediaUrl = `solum-media://${fullPath.replace(/\\/g, '/')}`
          const name = path.basename(entry.name, ext)

          photos.push({
            id: entry.name,
            url: mediaUrl,
            aspectRatio: 1.0, // Default; frontend image load handles precise ratios
            createdAt: stats.mtime.toISOString(),
            order: ++index,
            name: name
          })
        }
      }
    }
    return photos.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  } catch (error) {
    console.error('Failed to read photos:', error)
    return []
  }
})

// 7. Write/Import Photos into the Vault (Copy file directly)
ipcMain.handle('write-photo', async (_, workspacePath: string, vaultName: string, sourcePath: string, fileName: string) => {
  try {
    const targetDir = path.join(workspacePath, vaultName)
    const targetPath = path.join(targetDir, fileName)
    
    // Copy the file
    await fs.copyFile(sourcePath, targetPath)
    
    // Return the new media URL
    const mediaUrl = `solum-media://${targetPath.replace(/\\/g, '/')}`
    return mediaUrl
  } catch (error) {
    console.error('Failed to copy photo:', error)
    throw error
  }
})

// 8. Delete Photo File
ipcMain.handle('delete-photo', async (_, workspacePath: string, vaultName: string, photoId: string) => {
  try {
    const photoPath = path.join(workspacePath, vaultName, photoId)
    await fs.unlink(photoPath)
    return true
  } catch (error) {
    console.error('Failed to delete photo:', error)
    throw error
  }
})

// 9. Rename Photo File
ipcMain.handle('rename-photo', async (_, workspacePath: string, vaultName: string, photoId: string, newName: string) => {
  try {
    const ext = path.extname(photoId)
    const oldPath = path.join(workspacePath, vaultName, photoId)
    const newPath = path.join(workspacePath, vaultName, `${newName}${ext}`)
    await fs.rename(oldPath, newPath)
    return true
  } catch (error) {
    console.error('Failed to rename photo:', error)
    throw error
  }
})
