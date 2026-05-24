'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Folder, ChevronDown } from 'lucide-react'
import { usePages } from '@/hooks/usePages'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface FolderSelectProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  inputClassName?: string
}

export function FolderSelect({ value, onChange, placeholder, inputClassName }: FolderSelectProps) {
  const pages = usePages(s => s.pages)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Compute unique folders in the project and sort them alphabetically
  const existingFolders = useMemo(() => {
    const folders = new Set<string>()
    pages.forEach(p => {
      if (p.folder && p.folder.trim()) {
        folders.add(p.folder.trim())
      }
    })
    return Array.from(folders).sort((a, b) => a.localeCompare(b))
  }, [pages])

  // Filter folders based on user input for live search
  const filteredFolders = useMemo(() => {
    if (!value.trim()) return existingFolders
    const query = value.toLowerCase().trim()
    return existingFolders.filter(f => f.toLowerCase().includes(query))
  }, [existingFolders, value])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ESC to close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full group/folder-select">
      <Folder className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400 group-focus-within/folder-select:text-black dark:group-focus-within/folder-select:text-white transition-colors z-10" />

      <Input
        value={value}
        onChange={e => {
          onChange(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className={cn("pl-10 pr-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-md text-xs shadow-sm font-bold", inputClassName)}
      />

      {existingFolders.length > 0 && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded transition-colors text-zinc-400 hover:text-black dark:hover:text-white z-10"
        >
          <ChevronDown className={cn("size-3.5 text-zinc-400 transition-transform duration-200", isOpen && "rotate-180")} />
        </button>
      )}

      {/* Dropdown list */}
      {isOpen && filteredFolders.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl z-999 py-1 custom-scrollbar">
          <div className="px-2.5 py-1 text-[8px] font-black uppercase text-zinc-400 tracking-wider border-b border-zinc-100 dark:border-zinc-900/50 mb-1">
            Select Existing Folder
          </div>
          {filteredFolders.map(folder => (
            <button
              key={folder}
              type="button"
              onClick={() => {
                onChange(folder)
                setIsOpen(false)
              }}
              className={cn(
                "w-full text-left px-3 py-2 text-xs transition-colors truncate font-semibold",
                value === folder
                  ? "bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white font-bold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white"
              )}
            >
              {folder}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
