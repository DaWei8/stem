'use client'

import { Terminal, Download, Box } from 'lucide-react'
import { useState } from 'react'
import { DocHeader } from './DocHeader'
import { CodeBlock } from './CodeBlock'

export function InstallContent() {
  const [copied, setCopied] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <DocHeader
        title={<>Installation & Setup</>}
        description="Get your environment ready for deterministic system design."
      />

      <div className="space-y-20 pb-32 max-w-3xl">
        <section id="prerequisites" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <Box className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Prerequisites</h2>
          </div>
          <ul className="space-y-4 text-muted-foreground text-sm">
            <li className="flex items-start gap-3">
              <div className="size-1.5 rounded-full bg-border mt-1.5" />
              <span>Node.js 18.0 or higher</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="size-1.5 rounded-full bg-border mt-1.5" />
              <span>Rust Toolchain (latest stable)</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="size-1.5 rounded-full bg-border mt-1.5" />
              <span>Docker (for local simulation environment)</span>
            </li>
          </ul>
        </section>

        <section id="cli-setup" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <Terminal className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">CLI Setup</h2>
          </div>
          <CodeBlock
            title="Terminal"
            code="npm install -g @stem/cli"
            handleCopy={handleCopy}
            copied={copied}
          />
        </section>

        <section id="initialization" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <Download className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Initialization</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Run <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono text-[11px]">stem init</code> in your project root to create the <code className="text-foreground">stem.config.json</code> and initialize the five-pillar directory structure.
          </p>
        </section>
      </div>
    </>
  )
}
