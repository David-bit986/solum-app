import React, { useState, useEffect } from 'react'
import { Plus, Upload } from 'lucide-react'
import type { Photo } from '../../types/solum'

interface MoodboardGridProps {
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

export default function MoodboardGrid({
  photos = [],
  vaultName = 'Design Inspiration',
  onAddPhotos,
  onDeletePhoto,
  onBack: _onBack,
  actionMode = null,
  onSetActionMode,
  photoSize = 'md',
  fontSize = 14,
}: MoodboardGridProps) {
  const [localPhotos, setLocalPhotos] = useState<Photo[]>(photos)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  
  // Inline rename states for photos
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Sync props to local state
  useEffect(() => {
    setLocalPhotos(photos)
  }, [photos])

  // Automatically exit editing states if action mode is cleared
  useEffect(() => {
    if (!actionMode) {
      setEditingPhotoId(null)
    }
  }, [actionMode])

  const triggerUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      importFiles(e.target.files)
    }
  }

  const importFiles = (files: FileList) => {
    if (onAddPhotos) {
      onAddPhotos(files)
    } else {
      const newPhotos: Photo[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file)
          const name = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
          newPhotos.push({
            id: `local-${Date.now()}-${i}`,
            url,
            aspectRatio: 1.0,
            createdAt: new Date().toISOString(),
            order: localPhotos.length + i + 1,
            name
          })
        }
      }
      setLocalPhotos(prev => [...prev, ...newPhotos])
    }
  }

  const handlePhotoClick = (photo: Photo, e: React.MouseEvent) => {
    e.stopPropagation()
    if (actionMode === 'rename') {
      setEditingPhotoId(photo.id)
      setRenameValue(photo.name || `Photo ${photo.id}`)
    } else if (actionMode === 'delete') {
      if (window.confirm(`Delete this photo from your moodboard?`)) {
        onDeletePhoto?.(photo.id)
        onSetActionMode?.(null)
      }
    }
  }

  const handleSavePhotoRename = (id: string, newName: string) => {
    if (newName.trim()) {
      onSavePhotoRename(id, newName.trim())
    }
    setEditingPhotoId(null)
    onSetActionMode?.(null)
  }

  const onSavePhotoRename = (id: string, newName?: string) => {
    // If parent doesn't override via state trigger, rename locally
    // For our app, the parent App.tsx handles IPC rename
    const targetElement = document.getElementById(`rename-form-${id}`) as HTMLFormElement | null
    if (targetElement) {
      const input = targetElement.querySelector('input')
      if (input && newName !== undefined) {
        input.value = newName
      }
      targetElement.dispatchEvent(new Event('submit'))
    }
  }

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(true)
  }

  const handleDragLeave = () => {
    setIsDraggingOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      importFiles(e.dataTransfer.files)
    }
  }

  return (
    <div 
      className="py-4 font-sans animate-fade-in relative min-h-[60vh] flex flex-col"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Invisible file input */}
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        className="hidden" 
      />

      {/* Drag & Drop Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 bg-blue-600/10 dark:bg-blue-500/10 border-2 border-dashed border-blue-500 dark:border-blue-400 rounded-3xl z-30 flex items-center justify-center backdrop-blur-xs pointer-events-none transition-all duration-300">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-6 py-4 rounded-xl shadow-lg text-center flex flex-col items-center">
            <Upload className="w-8 h-8 text-blue-500 animate-bounce mb-2" />
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Drop to Import Images</span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Files will be added to {vaultName}</span>
          </div>
        </div>
      )}

      {/* Photos Canvas - Uniform Square Grid */}
      {localPhotos.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-3xl py-20 px-4 text-center">
          <Upload className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mb-3" strokeWidth={1.5} />
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-200">No photos in this Vault</h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-[240px] mt-1 mb-4">Drag and drop images here, or click to browse local files.</p>
          <button 
            onClick={triggerUpload}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Browse Files
          </button>
        </div>
      ) : (
        <div className={`grid select-none transition-all duration-300 ${
          photoSize === 'sm'
            ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4'
            : photoSize === 'lg'
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'
            : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6'
        }`}>
          {localPhotos.map((photo) => {
            const isEditingThis = photo.id === editingPhotoId
            return (
              <div 
                key={photo.id}
                onClick={(e) => handlePhotoClick(photo, e)}
                className={`group flex flex-col relative cursor-pointer overflow-hidden rounded-xl transition-all duration-300 ${
                  photoSize === 'sm' ? 'p-1' : photoSize === 'lg' ? 'p-2' : 'p-1.5'
                } ${
                  actionMode === 'rename'
                    ? 'hover:bg-blue-50/40 dark:hover:bg-blue-950/20 hover:ring-2 hover:ring-blue-500/50 shadow-sm shadow-blue-500/5'
                    : actionMode === 'delete'
                    ? 'hover:bg-red-50/40 dark:hover:bg-red-950/20 hover:ring-2 hover:ring-red-500/50 shadow-sm shadow-red-500/5'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                }`}
              >
                {/* Photo Thumbnail Wrapper */}
                <div className="aspect-square w-full overflow-hidden rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900">
                  <img 
                    src={photo.url} 
                    alt={photo.name || "Moodboard item"}
                    className="w-full h-full object-cover transform group-hover:scale-[1.02] transition-transform duration-300 ease-out"
                    loading="lazy"
                  />
                  {/* Gentle hover dim overlay (no buttons) */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>

                {/* Photo Info / Inline Edit */}
                <div className="mt-2 text-center w-full px-1">
                  {isEditingThis ? (
                    <form 
                      id={`rename-form-${photo.id}`}
                      onSubmit={(e) => {
                        e.preventDefault()
                        const target = e.target as HTMLFormElement
                        const input = target.querySelector('input')
                        if (input && input.value.trim()) {
                          const newName = input.value.trim()
                          // Trigger rename API
                          const container = document.getElementById(`rename-form-${photo.id}`)
                          // @ts-ignore
                          if (container && container.dataset.callback) {
                            // @ts-ignore
                            container.dataset.callback(newName)
                          }
                        }
                        setEditingPhotoId(null)
                      }}
                      ref={(el) => {
                        if (el) {
                          // Bind callback parameter onto dataset so parent knows
                          // @ts-ignore
                          el.dataset.callback = (val: string) => {
                            // @ts-ignore
                            if (window.onPhotoRenameTrigger) {
                              // @ts-ignore
                              window.onPhotoRenameTrigger(photo.id, val)
                            }
                          }
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full text-center"
                    >
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        className="w-full border border-blue-500 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 text-center font-medium px-1.5 py-0.5"
                        style={{ fontSize: `${Math.max(10, fontSize - 2)}px` }}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setEditingPhotoId(null)
                          }
                        }}
                        onBlur={() => handleSavePhotoRename(photo.id, renameValue)}
                      />
                    </form>
                  ) : (
                    <span 
                      className="block font-medium text-zinc-700 dark:text-zinc-300 truncate tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                      style={{ fontSize: `${Math.max(10, fontSize - 2)}px` }}
                      title={photo.name || `Photo ${photo.id}`}
                    >
                      {photo.name || `Photo ${photo.id}`}
                    </span>
                  )}
                </div>
              </div>
            )
          })}

          {/* Add card placeholder at grid end */}
          <div 
            onClick={triggerUpload}
            className="flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl aspect-square hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 cursor-pointer transition-all duration-200 group"
          >
            <Plus className="w-6 h-6 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
            <span className="text-xs text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 font-medium transition-colors mt-2">
              Add Item
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
