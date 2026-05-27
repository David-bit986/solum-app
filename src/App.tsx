import { useState, useEffect } from 'react'
import { FolderOpen, ArrowLeft, RefreshCw, Folder } from 'lucide-react'
import { AppShell } from './components/shell/AppShell'
import VaultsDashboard from './components/sections/VaultsDashboard'
import MoodboardGrid from './components/sections/MoodboardGrid'
import type { Vault, Photo } from './types/solum'

const defaultMockVaults: Vault[] = [
  { id: 'design-inspiration', name: 'Design Inspiration', count: 6, createdAt: '2026-05-20T10:00:00Z' },
  { id: 'brutalist-architecture', name: 'Brutalist Architecture', count: 0, createdAt: '2026-05-21T14:30:00Z' },
  { id: 'editorial-layouts', name: 'Editorial Layouts', count: 0, createdAt: '2026-05-22T09:15:00Z' },
  { id: 'organic-tones', name: 'Organic Tones', count: 0, createdAt: '2026-05-22T11:45:00Z' },
]

const defaultMockPhotos: Photo[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    aspectRatio: 1.5,
    createdAt: '2026-05-22T10:00:00Z',
    order: 1,
    name: 'Golden Coast Coastline View'
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
    aspectRatio: 1.33,
    createdAt: '2026-05-22T10:05:00Z',
    order: 2,
    name: 'Foggy Forest Landscape'
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
    aspectRatio: 0.75,
    createdAt: '2026-05-22T10:10:00Z',
    order: 3,
    name: 'Minimalist Architectural Window'
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&auto=format&fit=crop&q=80',
    aspectRatio: 1.5,
    createdAt: '2026-05-22T10:15:00Z',
    order: 4,
    name: 'Sunny Forest Canopy Trees'
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    aspectRatio: 1.5,
    createdAt: '2026-05-22T10:20:00Z',
    order: 5,
    name: 'Modern Brutalist Glass Building Facade'
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
    aspectRatio: 1.5,
    createdAt: '2026-05-22T10:25:00Z',
    order: 6,
    name: 'Apple Style Office Desk Interior'
  }
]

export default function App() {
  // Global settings state
  const [fontSize, setFontSize] = useState<number>(() => {
    return Number(localStorage.getItem('solum_fontSize') || '14')
  })
  const [folderSize, setFolderSize] = useState<'sm' | 'md' | 'lg'>(() => {
    return (localStorage.getItem('solum_folderSize') as 'sm' | 'md' | 'lg') || 'md'
  })
  const [photoSize, setPhotoSize] = useState<'sm' | 'md' | 'lg'>(() => {
    return (localStorage.getItem('solum_photoSize') as 'sm' | 'md' | 'lg') || 'md'
  })
  const [imageFit, setImageFit] = useState<'cover' | 'contain'>(() => {
    return (localStorage.getItem('solum_imageFit') as 'cover' | 'contain') || 'cover'
  })
  const [actionMode, setActionMode] = useState<'rename' | 'delete' | null>(null)

  // Workspace filesystem configuration
  const isElectron = typeof window !== 'undefined' && 'electronAPI' in window
  const [workspacePath, setWorkspacePath] = useState<string | null>(() => {
    return localStorage.getItem('solum_workspace_path')
  })

  // Frontend states
  const [vaults, setVaults] = useState<Vault[]>([])
  const [activeVaultName, setActiveVaultName] = useState<string | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])

  // Fallback database for web browsers
  const [browserVaults, setBrowserVaults] = useState<Vault[]>(() => {
    const val = localStorage.getItem('solum_browser_vaults')
    return val ? JSON.parse(val) : defaultMockVaults
  })
  const [browserPhotosMap, setBrowserPhotosMap] = useState<Record<string, Photo[]>>(() => {
    const val = localStorage.getItem('solum_browser_photos')
    return val ? JSON.parse(val) : { 'design-inspiration': defaultMockPhotos }
  })

  // Sync browser states back to localStorage
  useEffect(() => {
    if (!isElectron) {
      localStorage.setItem('solum_browser_vaults', JSON.stringify(browserVaults))
    }
  }, [browserVaults, isElectron])

  useEffect(() => {
    if (!isElectron) {
      localStorage.setItem('solum_browser_photos', JSON.stringify(browserPhotosMap))
    }
  }, [browserPhotosMap, isElectron])

  // Sync settings
  useEffect(() => {
    localStorage.setItem('solum_fontSize', String(fontSize))
  }, [fontSize])
  useEffect(() => {
    localStorage.setItem('solum_folderSize', folderSize)
  }, [folderSize])
  useEffect(() => {
    localStorage.setItem('solum_photoSize', photoSize)
  }, [photoSize])
  useEffect(() => {
    localStorage.setItem('solum_imageFit', imageFit)
  }, [imageFit])

  // Initial load theme class
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light'
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [])

  // Load vaults on workspace selection
  useEffect(() => {
    loadVaults()
  }, [workspacePath, browserVaults, isElectron])

  // Load photos when active vault changes
  useEffect(() => {
    loadPhotos()
  }, [activeVaultName, browserPhotosMap, isElectron])

  // Prevent default drag and drop behavior globally to prevent window navigation
  useEffect(() => {
    const preventDefault = (e: DragEvent) => {
      e.preventDefault()
    }
    document.addEventListener('dragover', preventDefault)
    document.addEventListener('drop', preventDefault)
    return () => {
      document.removeEventListener('dragover', preventDefault)
      document.removeEventListener('drop', preventDefault)
    }
  }, [])


  const loadVaults = async () => {
    if (isElectron && workspacePath) {
      try {
        const list = await window.electronAPI.readVaults(workspacePath)
        setVaults(list)
      } catch (err) {
        console.error('Failed to load vaults from disk:', err)
      }
    } else if (!isElectron) {
      setVaults(browserVaults)
    }
  }

  const loadPhotos = async () => {
    if (!activeVaultName) {
      setPhotos([])
      return
    }

    if (isElectron && workspacePath) {
      try {
        const list = await window.electronAPI.readPhotos(workspacePath, activeVaultName)
        setPhotos(list)
      } catch (err) {
        console.error('Failed to load photos from vault directory:', err)
      }
    } else if (!isElectron) {
      const slug = activeVaultName.toLowerCase().replace(/\s+/g, '-')
      setPhotos(browserPhotosMap[slug] || [])
    }
  }

  // --- Operations Actions ---

  const handleSelectWorkspace = async () => {
    if (isElectron) {
      const pathStr = await window.electronAPI.selectWorkspace()
      if (pathStr) {
        setWorkspacePath(pathStr)
        localStorage.setItem('solum_workspace_path', pathStr)
      }
    } else {
      // Browser environment mock simulation
      setWorkspacePath('/workspace-mock')
    }
  }

  const handleAddVault = async (name: string) => {
    if (isElectron && workspacePath) {
      try {
        await window.electronAPI.createVault(workspacePath, name)
        await loadVaults()
      } catch (err: any) {
        alert(err.message || 'Error creating vault')
      }
    } else if (!isElectron) {
      const id = name.toLowerCase().replace(/\s+/g, '-')
      if (browserVaults.some(v => v.id === id)) {
        alert('Vault folder already exists')
        return
      }
      const newVault: Vault = {
        id,
        name,
        count: 0,
        createdAt: new Date().toISOString()
      }
      setBrowserVaults([...browserVaults, newVault])
    }
  }

  const handleRenameVault = async (id: string, newName: string) => {
    const vault = vaults.find(v => v.id === id)
    if (!vault) return

    if (isElectron && workspacePath) {
      try {
        await window.electronAPI.renameVault(workspacePath, vault.name, newName)
        if (activeVaultName === vault.name) {
          setActiveVaultName(newName)
        }
        await loadVaults()
      } catch (err: any) {
        alert('Failed to rename vault folder')
      }
    } else if (!isElectron) {
      const updatedVaults = browserVaults.map(v => v.id === id ? { ...v, name: newName, id: newName.toLowerCase().replace(/\s+/g, '-') } : v)
      setBrowserVaults(updatedVaults)
      
      const oldSlug = vault.id
      const newSlug = newName.toLowerCase().replace(/\s+/g, '-')
      if (browserPhotosMap[oldSlug]) {
        const photosCopy = [...browserPhotosMap[oldSlug]]
        const updatedPhotosMap = { ...browserPhotosMap }
        delete updatedPhotosMap[oldSlug]
        updatedPhotosMap[newSlug] = photosCopy
        setBrowserPhotosMap(updatedPhotosMap)
      }

      if (activeVaultName === vault.name) {
        setActiveVaultName(newName)
      }
    }
  }

  const handleDeleteVault = async (id: string) => {
    const vault = vaults.find(v => v.id === id)
    if (!vault) return

    if (isElectron && workspacePath) {
      try {
        await window.electronAPI.deleteVault(workspacePath, vault.name)
        if (activeVaultName === vault.name) {
          setActiveVaultName(null)
        }
        await loadVaults()
      } catch (err) {
        alert('Failed to delete vault folder')
      }
    } else if (!isElectron) {
      setBrowserVaults(browserVaults.filter(v => v.id !== id))
      const updatedPhotosMap = { ...browserPhotosMap }
      delete updatedPhotosMap[id]
      setBrowserPhotosMap(updatedPhotosMap)
      if (activeVaultName === vault.name) {
        setActiveVaultName(null)
      }
    }
  }

  const handleAddPhotos = async (files: FileList) => {
    if (!activeVaultName) return

    const supportedExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.tif', '.ico', '.avif', '.pdf']

    if (isElectron && workspacePath) {
      try {
        let copiedAny = false
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
          if (!supportedExts.includes(ext)) {
            continue
          }
          const physicalPath = window.electronAPI.getPathForFile(file)
          if (physicalPath) {
            await window.electronAPI.writePhoto(workspacePath, activeVaultName, physicalPath, file.name)
            copiedAny = true
          }
        }
        if (copiedAny) {
          await loadPhotos()
          await loadVaults()
        }
      } catch (err) {
        alert('Failed to save files')
      }
    } else if (!isElectron) {
      // Browser fallback - generate object URLs
      const slug = activeVaultName.toLowerCase().replace(/\s+/g, '-')
      const newPhotos: Photo[] = []
      const currentList = browserPhotosMap[slug] || []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const isImage = file.type.startsWith('image/')
        const isPdf = file.type === 'application/pdf'
        if (isImage || isPdf) {
          const url = URL.createObjectURL(file)
          const name = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
          newPhotos.push({
            id: `local-${Date.now()}-${i}`,
            url,
            aspectRatio: 1.0,
            createdAt: new Date().toISOString(),
            order: currentList.length + i + 1,
            name
          })
        }
      }

      const updatedList = [...currentList, ...newPhotos]
      setBrowserPhotosMap({
        ...browserPhotosMap,
        [slug]: updatedList
      })

      // Update vault count label
      setBrowserVaults(browserVaults.map(v => v.id === slug ? { ...v, count: updatedList.length } : v))
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!activeVaultName) return

    if (isElectron && workspacePath) {
      try {
        await window.electronAPI.deletePhoto(workspacePath, activeVaultName, photoId)
        await loadPhotos()
        await loadVaults()
      } catch (err) {
        alert('Failed to delete file')
      }
    } else if (!isElectron) {
      const slug = activeVaultName.toLowerCase().replace(/\s+/g, '-')
      const currentList = browserPhotosMap[slug] || []
      const updatedList = currentList.filter(p => p.id !== photoId)
      
      setBrowserPhotosMap({
        ...browserPhotosMap,
        [slug]: updatedList
      })

      // Update vault count label
      setBrowserVaults(browserVaults.map(v => v.id === slug ? { ...v, count: updatedList.length } : v))
    }
  }

  const handleRenamePhoto = async (photoId: string, newName: string) => {
    if (!activeVaultName) return

    if (isElectron && workspacePath) {
      try {
        await window.electronAPI.renamePhoto(workspacePath, activeVaultName, photoId, newName)
        await loadPhotos()
      } catch (err) {
        alert('Failed to rename photo file')
      }
    } else if (!isElectron) {
      const slug = activeVaultName.toLowerCase().replace(/\s+/g, '-')
      const currentList = browserPhotosMap[slug] || []
      const updatedList = currentList.map(p => p.id === photoId ? { ...p, name: newName } : p)
      
      setBrowserPhotosMap({
        ...browserPhotosMap,
        [slug]: updatedList
      })
    }
  }

  // --- Landing Screen for Workspace Folder Picker ---
  if (!workspacePath) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 font-sans flex items-center justify-center p-6 transition-all duration-300">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl text-center select-none animate-fade-in">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <FolderOpen className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Welcome to Solum</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 max-w-xs mx-auto">
            Choose a directory folder on your computer to open as your moodboard vault workspace.
          </p>
          
          <button
            onClick={handleSelectWorkspace}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-medium text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <FolderOpen className="w-4 h-4" />
            Open Workspace Folder
          </button>
          
          {!isElectron && (
            <p className="text-[11px] text-amber-500 mt-4">
              Running in demo mode. Changes will be saved in your browser's localStorage.
            </p>
          )}
        </div>
      </div>
    )
  }

  const navItems = [
    { label: 'Dashboard', href: '/', isActive: !activeVaultName },
    ...(activeVaultName ? [{ label: activeVaultName, href: '/vault', isActive: true }] : [])
  ]

  return (
    <div id="app-context-container">
      <AppShell
        navigationItems={navItems}
        onNavigate={() => {
          setActiveVaultName(null)
          setActionMode(null)
        }}
        activeVault={activeVaultName}
        onRenameActiveVault={(newName) => {
          if (activeVaultName) {
            // Find active vault ID
            const vault = vaults.find(v => v.name === activeVaultName)
            if (vault) {
              handleRenameVault(vault.id, newName)
            }
          }
        }}
        actionMode={actionMode}
        onSetActionMode={setActionMode}
        fontSize={fontSize}
        onSetFontSize={setFontSize}
        folderSize={folderSize}
        onSetFolderSize={setFolderSize}
        photoSize={photoSize}
        onSetPhotoSize={setPhotoSize}
        imageFit={imageFit}
        onSetImageFit={setImageFit}
      >
        {activeVaultName ? (
          <div className="space-y-4">
            <button
              onClick={() => {
                setActiveVaultName(null)
                setActionMode(null)
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to vaults
            </button>
            <MoodboardGrid
              photos={photos}
              vaultName={activeVaultName}
              onAddPhotos={handleAddPhotos}
              onDeletePhoto={handleDeletePhoto}
              onRenamePhoto={handleRenamePhoto}
              actionMode={actionMode}
              onSetActionMode={setActionMode}
              photoSize={photoSize}
              fontSize={fontSize}
              imageFit={imageFit}
            />
          </div>
        ) : (
          <div className="space-y-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-900 pb-4">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Folder className="w-5 h-5 text-blue-500" strokeWidth={2} />
                  Your Vaults
                </h2>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mt-1">
                  Path: {workspacePath}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadVaults}
                  className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                  title="Reload from Disk"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setWorkspacePath(null)
                    localStorage.removeItem('solum_workspace_path')
                  }}
                  className="text-xs font-medium text-red-500 hover:underline cursor-pointer"
                >
                  Close Workspace
                </button>
              </div>
            </div>
            
            <VaultsDashboard
              vaults={vaults}
              onOpenVault={setActiveVaultName}
              onAddVault={handleAddVault}
              actionMode={actionMode}
              onSetActionMode={setActionMode}
              onRenameVault={handleRenameVault}
              onDeleteVault={handleDeleteVault}
              folderSize={folderSize}
              fontSize={fontSize}
            />
          </div>
        )}
      </AppShell>
    </div>
  )
}
