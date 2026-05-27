import React from 'react'
import { Settings, Sun, Moon, Edit2, Trash2, Check, X } from 'lucide-react'
import type { AppShellProps } from '../../types/solum'

export function AppShell({
  children,
  navigationItems = [],
  onNavigate,
  activeVault,
  onRenameActiveVault,
  actionMode = null,
  onSetActionMode,
  folderSize = 'md',
  onSetFolderSize,
  photoSize = 'md',
  onSetPhotoSize,
  fontSize = 14,
  onSetFontSize,
  imageFit = 'cover',
  onSetImageFit,
}: AppShellProps) {
  // Sync dark mode state locally for the shell preview
  const [isDark, setIsDark] = React.useState(() => {
    return document.documentElement.classList.contains('dark')
  })

  const [isEditing, setIsEditing] = React.useState(false)
  const [renameValue, setRenameValue] = React.useState('')
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const settingsRef = React.useRef<HTMLDivElement>(null)

  // Close settings dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleDarkMode = () => {
    const root = document.documentElement
    const nextDark = !isDark
    root.classList.toggle('dark', nextDark)
    setIsDark(nextDark)
    localStorage.setItem('theme', nextDark ? 'dark' : 'light')
  }

  // Find active navigation item (like the current Vault name) to display in the breadcrumbs
  const activeItem = navigationItems.find(item => item.isActive)

  const isMainPageLabel = (label: string) => {
    const l = label.toLowerCase()
    return (
      l === 'dashboard' || 
      l === 'vaults dashboard' || 
      l === 'solum' || 
      l === 'home' || 
      l === 'left header' || 
      l === 'right header' ||
      l === 'vault controls' ||
      l === 'theme toggle' ||
      l === 'settings gear'
    )
  }

  const activeVaultName = activeVault || (activeItem && !isMainPageLabel(activeItem.label) ? activeItem.label : null)

  // Reset editing state when active vault changes
  React.useEffect(() => {
    setIsEditing(false)
    setRenameValue(activeVaultName || '')
  }, [activeVaultName])

  const handleStartRename = () => {
    if (activeVaultName) {
      setRenameValue(activeVaultName)
      setIsEditing(true)
    }
  }

  const handleSaveRename = () => {
    if (renameValue.trim() && renameValue.trim() !== activeVaultName) {
      onRenameActiveVault?.(renameValue.trim())
    }
    setIsEditing(false)
  }

  return (
    <div className={`min-h-screen bg-white dark:bg-zinc-950 font-sans flex flex-col antialiased selection:bg-blue-100 dark:selection:bg-blue-950/50 transition-all duration-300 ${
      actionMode 
        ? 'ring-2 ring-blue-500/50 shadow-[inset_0_0_20px_rgba(59,130,246,0.15),0_0_15px_rgba(59,130,246,0.25)]' 
        : ''
    }`} style={{ fontSize: `${fontSize}px` }}>
      {/* Top Header Navigation - Apple-style thin, border-bottom */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-900 select-none">
        <div className="max-w-7xl mx-auto px-6 h-12 flex items-center justify-between">
          
          {/* Left Area: Breadcrumbs */}
          <div className="flex items-center space-x-2 text-sm">
            <button 
              onClick={() => onNavigate?.('/')}
              className="font-medium text-zinc-900 dark:text-zinc-100 hover:opacity-70 transition-opacity"
            >
              Solum
            </button>
            {activeVaultName && (
              <>
                <span className="text-zinc-300 dark:text-zinc-700">/</span>
                {isEditing ? (
                  <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename()
                        if (e.key === 'Escape') setIsEditing(false)
                      }}
                      className="text-sm px-1.5 py-0.5 border border-blue-500 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-normal"
                      autoFocus
                    />
                    <button onClick={handleSaveRename} className="p-0.5 text-green-600 dark:text-green-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setIsEditing(false)} className="p-0.5 text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span 
                    onDoubleClick={handleStartRename}
                    className="text-zinc-500 dark:text-zinc-400 font-normal truncate max-w-[200px] md:max-w-[400px] cursor-pointer select-none hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                    title="Double click to rename vault"
                  >
                    {activeVaultName}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Right Area: Control Actions */}
          <div className="flex items-center space-x-1">
            <div className="flex items-center space-x-1 mr-2 border-r border-zinc-100 dark:border-zinc-900 pr-2">
              <button
                onClick={() => onSetActionMode?.(actionMode === 'rename' ? null : 'rename')}
                className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                  actionMode === 'rename'
                    ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-500/20'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
                title={activeVaultName ? "Rename Photos" : "Rename Vaults"}
              >
                <Edit2 className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => onSetActionMode?.(actionMode === 'delete' ? null : 'delete')}
                className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                  actionMode === 'delete'
                    ? 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 shadow-sm ring-1 ring-red-500/20'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
                title={activeVaultName ? "Delete Photos" : "Delete Vaults"}
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              title="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4" strokeWidth={1.5} />
              ) : (
                <Moon className="w-4 h-4" strokeWidth={1.5} />
              )}
            </button>

            {/* Settings Gear with dropdown */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  isSettingsOpen
                    ? 'bg-zinc-150 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-800'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 border border-transparent'
                }`}
                title="Settings"
              >
                <Settings className="w-4 h-4" strokeWidth={1.5} />
              </button>
              
              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl shadow-lg p-4 z-50 text-left animate-fade-in">
                  <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-3 uppercase tracking-wider">Appearance Settings</h3>
                  
                  {/* Font Size Slider Option */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Font Size</span>
                      <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">{fontSize}px</span>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="range"
                        min="12"
                        max="20"
                        value={fontSize}
                        onChange={(e) => onSetFontSize?.(Number(e.target.value))}
                        className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-400"
                      />
                    </div>
                  </div>

                  {/* Folder Size Option - only visible on dashboard (no active vault name) */}
                  {!activeVaultName && (
                    <div className="mb-4">
                      <span className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Folder Size</span>
                      <div className="grid grid-cols-3 gap-1 bg-zinc-50 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-100 dark:border-zinc-800">
                        {(['sm', 'md', 'lg'] as const).map((sz) => (
                          <button
                            key={sz}
                            onClick={() => onSetFolderSize?.(sz)}
                            className={`text-[10px] py-1 rounded-md font-medium capitalize cursor-pointer transition-all ${
                              folderSize === sz
                                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700'
                                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 border border-transparent'
                            }`}
                          >
                            {sz === 'sm' ? 'Small' : sz === 'md' ? 'Medium' : 'Large'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Photo Size Option - only visible in a vault (active vault name is present) */}
                  {activeVaultName && (
                    <div className="space-y-4">
                      <div>
                        <span className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Photo Size</span>
                        <div className="grid grid-cols-3 gap-1 bg-zinc-50 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-100 dark:border-zinc-800">
                          {(['sm', 'md', 'lg'] as const).map((sz) => (
                            <button
                              key={sz}
                              onClick={() => onSetPhotoSize?.(sz)}
                              className={`text-[10px] py-1 rounded-md font-medium capitalize cursor-pointer transition-all ${
                                photoSize === sz
                                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700'
                                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 border border-transparent'
                              }`}
                            >
                              {sz === 'sm' ? 'Small' : sz === 'md' ? 'Medium' : 'Large'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Image Fit</span>
                        <div className="grid grid-cols-2 gap-1 bg-zinc-50 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-100 dark:border-zinc-800">
                          {(['cover', 'contain'] as const).map((fit) => (
                            <button
                              key={fit}
                              onClick={() => onSetImageFit?.(fit)}
                              className={`text-[10px] py-1 rounded-md font-medium capitalize cursor-pointer transition-all ${
                                imageFit === fit
                                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700'
                                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 border border-transparent'
                              }`}
                            >
                              {fit}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="flex-1 flex flex-col bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 flex flex-col">
          {children}
        </div>
      </main>
    </div>
  )
}
