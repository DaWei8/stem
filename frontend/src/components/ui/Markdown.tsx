'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface MarkdownProps {
  content: string
  className?: string
}

export function Markdown({ content, className }: MarkdownProps) {
  // Simple regex-based markdown formatter for the chat
  // Supports: bold, italic, inline code, headings, and lists

  const lines = content.split('\n')

  return (
    <div className={cn("space-y-2", className)}>
      {lines.map((line, i) => {
        // Empty line
        if (!line.trim()) return <div key={i} className="h-2" />

        // Headings
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-sm font-black text-black dark:text-white mt-4 mb-1  tracking-tight">{formatInline(line.slice(4))}</h3>
        }
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-base font-black text-black dark:text-white mt-6 mb-2  tracking-tighter">{formatInline(line.slice(3))}</h2>
        }

        // Ordered List
        const olMatch = line.match(/^(\d+)\.\s+(.*)/)
        if (olMatch) {
          return (
            <div key={i} className="flex gap-3 pl-1">
              <span className="text-[10px] font-black text-zinc-400 shrink-0 mt-0.5">{olMatch[1]}.</span>
              <p className="text-[11px] leading-relaxed">{formatInline(olMatch[2])}</p>
            </div>
          )
        }

        // Unordered List
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          return (
            <div key={i} className="flex gap-3 pl-1">
              <span className="size-1 rounded-full bg-zinc-400 shrink-0 mt-1.5 ml-1" />
              <p className="text-[11px] leading-relaxed">{formatInline(line.trim().slice(2))}</p>
            </div>
          )
        }

        // Standard paragraph
        return (
          <p key={i} className="text-[11px] leading-relaxed">
            {formatInline(line)}
          </p>
        )
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = []
  let currentText = text
  let key = 0

  // This is a very basic inline parser
  // Handles **bold**, `code`, and _italic_

  const regex = /(\*\*.*?\*\*|`.*?`|_.*?_)/g
  const segments = currentText.split(regex)

  return segments.map((seg, i) => {
    if (seg.startsWith('**') && seg.endsWith('**')) {
      return <strong key={i} className="font-black text-black dark:text-white">{seg.slice(2, -2)}</strong>
    }
    if (seg.startsWith('`') && seg.endsWith('`')) {
      return <code key={i} className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-sm font-mono text-[10px] text-emerald-600 dark:text-emerald-400">{seg.slice(1, -1)}</code>
    }
    if (seg.startsWith('_') && seg.endsWith('_')) {
      return <em key={i} className="italic text-zinc-600 dark:text-zinc-400">{seg.slice(1, -1)}</em>
    }
    return seg
  })
}
