/**
 * Solum Unified TypeScript Interfaces
 */

export interface Vault {
  id: string
  name: string
  count: number
  createdAt: string
}

export interface Photo {
  id: string
  url: string
  aspectRatio: number
  createdAt: string
  order: number
  name?: string
}

export interface AppShellProps {
  children: React.ReactNode
  navigationItems?: Array<{ label: string; href: string; isActive?: boolean }>
  user?: { name: string; avatarUrl?: string }
  onNavigate?: (href: string) => void
  onLogout?: () => void
  activeVault?: string | null
  onRenameActiveVault?: (newName: string) => void
  onDeleteActiveVault?: () => void
  actionMode?: 'rename' | 'delete' | null
  onSetActionMode?: (mode: 'rename' | 'delete' | null) => void
  folderSize?: 'sm' | 'md' | 'lg'
  onSetFolderSize?: (size: 'sm' | 'md' | 'lg') => void
  photoSize?: 'sm' | 'md' | 'lg'
  onSetPhotoSize?: (size: 'sm' | 'md' | 'lg') => void
  fontSize?: number
  onSetFontSize?: (size: number) => void
}

export interface MainNavProps {
  navigationItems: Array<{ label: string; href: string; isActive?: boolean }>
  onNavigate?: (href: string) => void
}

export interface VaultsDashboardProps {
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

export interface MoodboardGridProps {
  photos?: Photo[]
  vaultName?: string
  onAddPhotos?: (files: FileList) => void
  onDeletePhoto?: (id: string) => void
  onBack?: () => void
  actionMode?: 'rename' | 'delete' | null
  onSetActionMode?: (mode: 'rename' | 'delete' | null) => void
  photoSize?: 'sm' | 'md' | 'lg'
  fontSize?: number
}
