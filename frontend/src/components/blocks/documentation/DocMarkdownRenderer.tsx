'use client'

import React, { useMemo } from 'react'
import { Info, AlertCircle } from 'lucide-react'

interface DocMarkdownRendererProps {
  content: string
}

type BlockType = 'h1' | 'h2' | 'h3' | 'paragraph' | 'list' | 'code' | 'table' | 'quote' | 'hr'

interface Block {
  type: BlockType
  content: string[]
}

export function DocMarkdownRenderer({ content }: DocMarkdownRendererProps) {
  const blocks = useMemo(() => {
    const lines = content.split('\n')
    const parsedBlocks: Block[] = []
    let currentBlock: Block | null = null

    const commitCurrent = () => {
      if (currentBlock) {
        // Trim empty lines at start/end of content
        while (currentBlock.content.length > 0 && !currentBlock.content[0].trim()) {
          currentBlock.content.shift()
        }
        while (currentBlock.content.length > 0 && !currentBlock.content[currentBlock.content.length - 1].trim()) {
          currentBlock.content.pop()
        }
        if (currentBlock.content.length > 0) {
          parsedBlocks.push(currentBlock)
        }
        currentBlock = null
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()

      // 1. Code block handling
      if (trimmed.startsWith('```')) {
        if (currentBlock && currentBlock.type === 'code') {
          commitCurrent()
        } else {
          commitCurrent()
          currentBlock = { type: 'code', content: [] }
        }
        continue
      }

      if (currentBlock && currentBlock.type === 'code') {
        currentBlock.content.push(line)
        continue
      }

      // 2. Horizontal rule
      if (trimmed === '---') {
        commitCurrent()
        parsedBlocks.push({ type: 'hr', content: [] })
        continue
      }

      // 3. Table handling
      if (trimmed.startsWith('|')) {
        if (currentBlock && currentBlock.type === 'table') {
          currentBlock.content.push(line)
        } else {
          commitCurrent()
          currentBlock = { type: 'table', content: [line] }
        }
        continue
      }

      // 4. Headings
      if (trimmed.startsWith('# ')) {
        commitCurrent()
        parsedBlocks.push({ type: 'h1', content: [trimmed.substring(2)] })
        continue
      }
      if (trimmed.startsWith('## ')) {
        commitCurrent()
        parsedBlocks.push({ type: 'h2', content: [trimmed.substring(3)] })
        continue
      }
      if (trimmed.startsWith('### ')) {
        commitCurrent()
        parsedBlocks.push({ type: 'h3', content: [trimmed.substring(4)] })
        continue
      }

      // 5. Quote/Callout
      if (trimmed.startsWith('>')) {
        const text = trimmed.replace(/^>\s*/, '')
        if (currentBlock && currentBlock.type === 'quote') {
          currentBlock.content.push(text)
        } else {
          commitCurrent()
          currentBlock = { type: 'quote', content: [text] }
        }
        continue
      }

      // 6. List Items
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const text = trimmed.substring(2)
        if (currentBlock && currentBlock.type === 'list') {
          currentBlock.content.push(text)
        } else {
          commitCurrent()
          currentBlock = { type: 'list', content: [text] }
        }
        continue
      }

      // 7. Empty line ends list/quote/table/paragraph
      if (!trimmed) {
        commitCurrent()
        continue
      }

      // 8. Normal Paragraph text
      if (currentBlock && currentBlock.type === 'paragraph') {
        currentBlock.content.push(line)
      } else {
        commitCurrent()
        currentBlock = { type: 'paragraph', content: [line] }
      }
    }

    commitCurrent()
    return parsedBlocks
  }, [content])

  const renderTextWithFormatting = (text: string) => {
    // Basic inline code wrapper `code`
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-800 dark:text-zinc-200 rounded">
            {part.slice(1, -1)}
          </code>
        )
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-extrabold text-black dark:text-white">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return part
    })
  }

  const renderBlock = (block: Block, index: number) => {
    switch (block.type) {
      case 'h1':
        return (
          <h1 key={index} className="text-2xl font-black tracking-tighter text-black dark:text-white border-b border-zinc-150 dark:border-zinc-850 pb-3 mb-6 mt-2">
            {block.content[0]}
          </h1>
        )
      case 'h2':
        return (
          <h2 key={index} id={block.content[0].toLowerCase().replace(/[^a-z0-9]+/g, '-')} className="text-sm font-black uppercase tracking-wider text-black dark:text-white border-l-2 border-black dark:border-white pl-3 mt-10 mb-4">
            {block.content[0]}
          </h2>
        )
      case 'h3':
        return (
          <h3 key={index} className="text-xs font-black uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mt-6 mb-2">
            {block.content[0]}
          </h3>
        )
      case 'hr':
        return <div key={index} className="h-px bg-zinc-100 dark:bg-zinc-900 my-8" />
      case 'quote':
        return (
          <div key={index} className="flex items-start gap-3 p-4 border border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950/20 text-zinc-600 dark:text-zinc-400 font-medium italic my-6 text-[11px] leading-relaxed">
            {block.content[0].includes('Analysis') || block.content[0].includes('Missing') ? (
              <AlertCircle className="size-4 text-amber-500 shrink-0 mt-0.5" />
            ) : (
              <Info className="size-4 text-zinc-400 shrink-0 mt-0.5" />
            )}
            <div>
              {block.content.map((line, i) => (
                <p key={i} className={i > 0 ? 'mt-1' : ''}>{renderTextWithFormatting(line)}</p>
              ))}
            </div>
          </div>
        )
      case 'list':
        return (
          <ul key={index} className="list-disc pl-5 space-y-1.5 my-4 text-[11.5px] text-zinc-600 dark:text-zinc-400 font-medium">
            {block.content.map((item, i) => (
              <li key={i} className="leading-relaxed">
                {renderTextWithFormatting(item)}
              </li>
            ))}
          </ul>
        )
      case 'code':
        return (
          <pre key={index} className="p-4 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-150 dark:border-zinc-850 font-mono text-[10px] text-zinc-800 dark:text-zinc-300 leading-relaxed overflow-x-auto my-4 custom-scrollbar">
            <code>{block.content.join('\n')}</code>
          </pre>
        )
      case 'table':
        // Parse table rows
        const rows = block.content.map(line => 
          line.split('|').map(cell => cell.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
        )
        // Separate header, divider, body
        const header = rows[0]
        const hasDivider = rows[1] && rows[1].every(cell => cell.startsWith(':') || cell.startsWith('-') || cell.endsWith(':'))
        const bodyRows = hasDivider ? rows.slice(2) : rows.slice(1)

        return (
          <div key={index} className="overflow-x-auto my-6 border border-zinc-150 dark:border-zinc-850">
            <table className="w-full text-left text-[11px] border-collapse bg-white dark:bg-black/30">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-150 dark:border-zinc-850">
                  {header.map((cell, cIdx) => (
                    <th key={cIdx} className="px-4 py-2.5 font-bold uppercase text-zinc-500 dark:text-zinc-400 select-none">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150 dark:divide-zinc-850">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">
                        {renderTextWithFormatting(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      default:
        return (
          <p key={index} className="text-[11.5px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium my-3">
            {renderTextWithFormatting(block.content.join(' '))}
          </p>
        )
    }
  }

  return (
    <div className="space-y-1 select-text">
      {blocks.map((block, i) => renderBlock(block, i))}
    </div>
  )
}
