'use client'

import { Check, Copy } from 'lucide-react'

interface CodeBlockProps {
  title: string
  code: string
  handleCopy: (t: string) => void
  copied: boolean
}

export function CodeBlock({ title, code, handleCopy, copied }: CodeBlockProps) {
  return (
    <div className="bg-zinc-950 dark:bg-black border border-border rounded-2xl overflow-hidden shadow-2xl">
      <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-2.5 rounded-full bg-red-500/20 border border-red-500/30" />
          <div className="size-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
          <div className="size-2.5 rounded-full bg-green-500/20 border border-green-500/30" />
          <span className="ml-3 text-[10px] font-mono font-bold tracking-widest text-muted-foreground uppercase">{title}</span>
        </div>
        <button
          onClick={() => handleCopy(code)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
        </button>
      </div>
      <pre className="p-8 text-xs font-mono leading-loose overflow-x-auto selection:bg-primary/20">
        <code className="text-zinc-400 dark:text-zinc-400">
          {code.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </code>
      </pre>
    </div>
  )
}
