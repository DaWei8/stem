'use client'

import React from 'react'

export function MarkdownText({ content }: { content: string }) {
  if (!content) return null

  // Pre-process content: split collapsed inline bullet points (e.g. " * **") into proper newlines
  const formattedContent = content
    .replace(/\s+\*\s+(?=\*\*)/g, '\n* ')
    .replace(/\s+-\s+(?=\*\*)/g, '\n- ')

  // Split by newlines to process paragraph/list structures
  const lines = formattedContent.split('\n')

  return (
    <div className="space-y-2.5">
      {lines.map((line, lineIndex) => {
        const trimmed = line.trim()
        if (!trimmed) return null

        // Check if the line is a list item
        const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ')
        const cleanLine = isBullet ? trimmed.substring(2) : trimmed

        // Parser for bold (**) and inline code (`)
        const parseLineContent = (text: string) => {
          const regex = /(\*\*.*?\*\*|`.*?`)/g
          const parts = text.split(regex)

          return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={index} className="font-extrabold text-black dark:text-zinc-100">
                  {part.slice(2, -2)}
                </strong>
              )
            }
            if (part.startsWith('`') && part.endsWith('`')) {
              return (
                <code
                  key={index}
                  className="px-1.5 py-0.5 mx-0.5 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-700 dark:text-zinc-300 rounded font-semibold"
                >
                  {part.slice(1, -1)}
                </code>
              )
            }
            return part
          })
        }

        if (isBullet) {
          return (
            <div key={lineIndex} className="flex items-start gap-2 pl-1.5 mt-1">
              <span className="size-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 mt-1.5 shrink-0" />
              <p className="flex-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400 font-medium">
                {parseLineContent(cleanLine)}
              </p>
            </div>
          )
        }

        return (
          <p key={lineIndex} className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400 font-medium">
            {parseLineContent(trimmed)}
          </p>
        )
      })}
    </div>
  )
}
