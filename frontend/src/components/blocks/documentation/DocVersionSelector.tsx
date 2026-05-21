'use client'

import React, { useState } from 'react'
import {
  MoreVertical,
  Copy,
  Download,
  Trash2,
  Plus,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DocVersion } from '@/hooks/useDocVersions'

interface DocVersionSelectorProps {
  versions: DocVersion[]
  activeVersionId: string
  onSelectVersion: (id: string) => void
  onCycleStatus: (id: string) => void
  onDuplicateVersion: (id: string) => void
  onExportMarkdown: (id: string) => void
  onDeleteVersion: (id: string) => void
  onCreateVersion: (name: string) => void
}

export function DocVersionSelector({
  versions,
  activeVersionId,
  onSelectVersion,
  onCycleStatus,
  onDuplicateVersion,
  onExportMarkdown,
  onDeleteVersion,
  onCreateVersion
}: DocVersionSelectorProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  const handleCreateSubmit = () => {
    if (!newName.trim()) return
    onCreateVersion(newName.trim())
    setNewName('')
    setIsCreating(false)
  }

  return (
    <div className="flex items-center gap-2 select-none">
      <div className="flex bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-1 relative z-40">
        {versions.map(v => (
          <div key={v.id} className="relative group/tab">
            <button
              onClick={() => onSelectVersion(v.id)}
              className={cn(
                "px-4 py-2 text-[10px] font-black transition-all",
                v.id === activeVersionId
                  ? "bg-black dark:bg-white text-white dark:text-black shadow-lg"
                  : "text-zinc-400 hover:text-black dark:hover:text-zinc-200"
              )}
            >
              {v.name}
            </button>
            
            {v.id === activeVersionId && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpenId(menuOpenId === v.id ? null : v.id)
                }}
                className="absolute -top-1 -right-1 size-4 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center opacity-0 group-hover/tab:opacity-100 transition-opacity z-50"
              >
                <MoreVertical className="size-2.5 text-zinc-600 dark:text-zinc-300" />
              </button>
            )}

            {menuOpenId === v.id && (
              <>
                {/* Backdrop click out handler */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setMenuOpenId(null)} 
                />
                
                <div className="absolute top-full right-0 mt-2 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl min-w-[160px] animate-in fade-in slide-in-from-top-1 duration-150">
                  <button
                    onClick={() => {
                      onCycleStatus(v.id)
                      setMenuOpenId(null)
                    }}
                    className="w-full text-left px-4 py-2.5 text-[10px] font-bold text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors"
                  >
                    Cycle Status ({v.status})
                  </button>
                  <button
                    onClick={() => {
                      onDuplicateVersion(v.id)
                      setMenuOpenId(null)
                    }}
                    className="w-full text-left px-4 py-2.5 text-[10px] font-bold text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors flex items-center gap-2"
                  >
                    <Copy className="size-3" /> Duplicate
                  </button>
                  <button
                    onClick={() => {
                      onExportMarkdown(v.id)
                      setMenuOpenId(null)
                    }}
                    className="w-full text-left px-4 py-2.5 text-[10px] font-bold text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors flex items-center gap-2"
                  >
                    <Download className="size-3" /> Export .MD
                  </button>
                  <div className="border-t border-zinc-100 dark:border-zinc-800" />
                  <button
                    onClick={() => {
                      onDeleteVersion(v.id)
                      setMenuOpenId(null)
                    }}
                    className="w-full text-left px-4 py-2.5 text-[10px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {isCreating ? (
          <div className="flex items-center gap-1 px-1">
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreateSubmit()
                if (e.key === 'Escape') setIsCreating(false)
              }}
              placeholder="v2.0"
              className="w-16 bg-transparent text-[10px] font-black text-black dark:text-white placeholder:text-zinc-500 outline-none border-b border-zinc-300 dark:border-zinc-700 py-0.5 px-1"
            />
            <button onClick={handleCreateSubmit} className="text-green-600 hover:text-green-500">
              <Plus className="size-3.5" />
            </button>
            <button onClick={() => setIsCreating(false)} className="text-zinc-400 hover:text-red-500">
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="px-3 py-2 text-zinc-400 hover:text-black dark:hover:text-zinc-200 transition-colors"
          >
            <Plus className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
