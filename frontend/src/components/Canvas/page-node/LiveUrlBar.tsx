'use client'

import { cn } from '@/lib/utils'
import { Globe, ExternalLink, Link2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface LiveUrlBarProps {
  url?: string | null
  onChange?: (url: string) => void
  readOnly?: boolean
}

export function LiveUrlBar({ url, onChange, readOnly }: LiveUrlBarProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(url || '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleCommit = () => {
    setIsEditing(false)
    const trimmed = draft.trim()
    if (trimmed !== (url || '')) {
      onChange?.(trimmed)
    }
  }

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (url) {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`
      window.open(fullUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const displayUrl = url
    ? url.replace(/^https?:\/\//, '').replace(/\/$/, '')
    : null

  return (
    <div className="px-3 py-1.5 border-t border-zinc-800/50">
      <div
        className={cn(
          'flex items-center gap-1.5 px-2 py-1 rounded-md transition-all',
          'bg-zinc-900/60 border',
          url ? 'border-zinc-700/50' : 'border-dashed border-zinc-800/60',
          !readOnly && 'cursor-text hover:border-zinc-600',
        )}
        onClick={(e) => {
          e.stopPropagation()
          if (!readOnly && !isEditing) {
            setDraft(url || '')
            setIsEditing(true)
          }
        }}
      >
        {url ? (
          <Globe className="size-2.5 text-emerald-500 shrink-0" />
        ) : (
          <Link2 className="size-2.5 text-zinc-700 shrink-0" />
        )}

        {isEditing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleCommit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCommit()
              if (e.key === 'Escape') {
                setDraft(url || '')
                setIsEditing(false)
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-transparent text-[8px] font-mono text-white outline-none placeholder-zinc-700 min-w-0"
            placeholder="www.example.com/page"
          />
        ) : (
          <span className={cn(
            'flex-1 text-[8px] font-mono truncate',
            url ? 'text-zinc-400' : 'text-zinc-700 italic',
          )}>
            {displayUrl || 'Add live URL...'}
          </span>
        )}

        {url && !isEditing && (
          <button
            onClick={handleOpen}
            className="shrink-0 text-zinc-600 hover:text-white transition-colors"
          >
            <ExternalLink className="size-2.5" />
          </button>
        )}
      </div>
    </div>
  )
}
