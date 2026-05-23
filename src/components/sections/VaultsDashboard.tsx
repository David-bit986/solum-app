import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Vault } from '../../types/solum'

// Reusable macOS Folder SVG component
function MacOSFolder({ className = "w-28 h-28" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 80" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={`${className} drop-shadow-md`}
    >
      <path 
        d="M5 12C5 8.68629 7.68629 6 11 6H35C38.3137 6 41 8.68629 41 12V14H89C92.3137 14 95 16.6863 95 20V68C95 71.3137 92.3137 74 89 74H11C7.68629 74 5 71.3137 5 68V12Z" 
        fill="url(#folderBackGradient)"
      />
      <path 
        d="M5 24C5 20.6863 7.68629 18 11 18H89C92.3137 18 95 20.6863 95 24V68C95 71.3137 92.3137 74 89 74H11C7.68629 74 5 71.3137 5 68V24Z" 
        fill="url(#folderFrontGradient)"
      />
      <path 
        d="M5 24C5 20.6863 7.68629 18 11 18H89C92.3137 18 95 20.6863 95 24V25.5C95 22.1863 92.3137 19.5 89 19.5H11C7.68629 19.5 5 22.1863 5 25.5V24Z" 
        fill="white" 
        fillOpacity="0.25"
      />
      <rect x="5" y="18" width="90" height="2" fill="black" fillOpacity="0.15" />
      <defs>
        <linearGradient id="folderBackGradient" x1="50" y1="6" x2="50" y2="74" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4bb2f9" />
          <stop offset="100%" stopColor="#0b7be6" />
        </linearGradient>
        <linearGradient id="folderFrontGradient" x1="50" y1="18" x2="50" y2="74" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5bc2ff" />
          <stop offset="40%" stopColor="#1e94fd" />
          <stop offset="100%" stopColor="#0766cc" />
        </linearGradient>
      </defs>
    </svg>
  )
}

interface VaultsDashboardProps {
  vaults?: Vault[]
  onOpenVault?: (name: string) => void
  onAddVault?: (name: string, count?: number) => void
  actionMode?: 'rename' | 'delete' | null
  onSetActionMode?: (mode: 'rename' | 'delete' | null) => void
  onRenameVault?: (id: string, newName: string) => void
  onDeleteVault?: (id: string) => void
  folderSize?: 'sm' | 'md' | 'lg'
  fontSize?: number
}

export default function VaultsDashboard({
  vaults = [],
  onOpenVault,
  onAddVault,
  actionMode = null,
  onSetActionMode,
  onRenameVault,
  onDeleteVault,
  folderSize = 'md',
  fontSize = 14,
}: VaultsDashboardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newVaultName, setNewVaultName] = useState('')
  const [editingVaultId, setEditingVaultId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newVaultName.trim()) return
    onAddVault?.(newVaultName.trim(), 0)
    setNewVaultName('')
    setIsAdding(false)
  }

  const handleRenameVaultInline = (id: string, newName: string) => {
    if (!newName.trim()) return
    onRenameVault?.(id, newName.trim())
    setEditingVaultId(null)
    onSetActionMode?.(null)
  }

  return (
    <div className="py-6 animate-fade-in max-w-5xl mx-auto w-full font-sans">
      <div className={`grid gap-x-8 transition-all duration-300 ${
        folderSize === 'sm'
          ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-y-8'
          : folderSize === 'lg'
          ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-16'
          : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-12'
      }`}>
        {vaults.map((vault) => {
          const isEditingThis = vault.id === editingVaultId
          return (
            <div 
              key={vault.id}
              onClick={(e) => {
                if (actionMode === 'rename') {
                  e.stopPropagation()
                  setEditingVaultId(vault.id)
                  setRenameValue(vault.name)
                } else if (actionMode === 'delete') {
                  e.stopPropagation()
                  if (window.confirm(`Are you sure you want to delete the vault "${vault.name}"?`)) {
                    onDeleteVault?.(vault.id)
                  }
                  onSetActionMode?.(null)
                } else {
                  onOpenVault?.(vault.name)
                }
              }}
              className={`flex flex-col items-center justify-center group cursor-pointer rounded-2xl transition-all duration-200 select-none ${
                folderSize === 'sm' ? 'p-1.5' : folderSize === 'lg' ? 'p-3.5' : 'p-2.5'
              } ${
                actionMode === 'rename'
                  ? 'hover:bg-blue-50/40 dark:hover:bg-blue-950/20 hover:ring-1 hover:ring-blue-400/30 shadow-sm shadow-blue-500/5'
                  : actionMode === 'delete'
                  ? 'hover:bg-red-50/40 dark:hover:bg-red-950/20 hover:ring-1 hover:ring-red-400/30 shadow-sm shadow-red-500/5'
                  : ''
              }`}
            >
              {/* macOS folder SVG representation with hover scaling */}
              <div className="transform group-hover:scale-[1.03] active:scale-[0.98] transition-all duration-150 ease-out">
                <MacOSFolder className={
                  folderSize === 'sm' ? 'w-20 h-20' : folderSize === 'lg' ? 'w-36 h-36' : 'w-28 h-28'
                } />
              </div>
 
              {/* Vault Info / Inline Edit */}
              {isEditingThis ? (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleRenameVaultInline(vault.id, renameValue)
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-3 text-center w-full px-2 animate-fade-in"
                >
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    className="w-full border border-blue-500 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 text-center font-medium px-2 py-1"
                    style={{ fontSize: `${fontSize}px` }}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setEditingVaultId(null)
                        onSetActionMode?.(null)
                      }
                    }}
                    onBlur={() => handleRenameVaultInline(vault.id, renameValue)}
                  />
                </form>
              ) : (
                <div className="mt-3 text-center w-full px-2">
                  <span 
                    className="block font-medium text-zinc-800 dark:text-zinc-200 truncate tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {vault.name}
                  </span>
                  <span 
                    className="block text-zinc-400 dark:text-zinc-500 font-mono mt-0.5 text-center"
                    style={{ fontSize: `${Math.max(10, fontSize - 3)}px` }}
                  >
                    {vault.count} items
                  </span>
                </div>
              )}
            </div>
          )
        })}
 
        {/* Dynamic Add Vault card (Interactive inline input or standard state) */}
        {isAdding ? (
          <form 
            onSubmit={handleCreate}
            className={`flex flex-col items-center justify-center border border-dashed border-blue-400 dark:border-blue-600 rounded-2xl bg-blue-50/10 dark:bg-blue-950/5 transition-all w-full ${
              folderSize === 'sm' ? 'p-2 h-[110px]' : folderSize === 'lg' ? 'p-6 h-[180px]' : 'p-4 h-[142px]'
            }`}
          >
            <input
              type="text"
              placeholder="Vault Name..."
              value={newVaultName}
              onChange={(e) => setNewVaultName(e.target.value)}
              className={`w-full border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 text-center font-medium ${
                folderSize === 'sm' ? 'text-[10px] px-1.5 py-0.5 mb-1.5' : folderSize === 'lg' ? 'text-sm px-2.5 py-2 mb-3' : 'text-xs px-2 py-1.5 mb-2'
              }`}
              autoFocus
              onKeyDown={(e) => e.key === 'Escape' && setIsAdding(false)}
            />
            <div className="flex space-x-1 w-full justify-center">
              <button
                type="submit"
                className={`bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors cursor-pointer ${
                  folderSize === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : folderSize === 'lg' ? 'px-3 py-1.5 text-xs' : 'px-2 py-1 text-[10px]'
                }`}
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className={`bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded font-medium transition-colors cursor-pointer ${
                  folderSize === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : folderSize === 'lg' ? 'px-3 py-1.5 text-xs' : 'px-2 py-1 text-[10px]'
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div 
            onClick={() => setIsAdding(true)}
            className={`flex flex-col items-center justify-center group cursor-pointer border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-all ${
              folderSize === 'sm' ? 'p-4 h-[110px]' : folderSize === 'lg' ? 'p-8 h-[180px]' : 'p-6 h-[142px]'
            }`}
          >
            <span className="text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">
              <Plus className={folderSize === 'sm' ? 'w-4 h-4' : folderSize === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} strokeWidth={1.5} />
            </span>
            <span className={`font-medium text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors ${
              folderSize === 'sm' ? 'text-[10px] mt-1' : folderSize === 'lg' ? 'text-sm mt-3' : 'text-xs mt-2'
            }`}>
              Add Vault
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
