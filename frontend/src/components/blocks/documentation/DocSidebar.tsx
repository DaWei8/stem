'use client'

import { Button } from '@/components/ui/button'
import {
  Code2,
  Database,
  Layout,
  Package,
  Palette,
  ShieldCheck,
  Terminal
} from 'lucide-react'

interface DocSidebarProps {
  isExporting: boolean
  onExportBlueprint: () => void
  onSyncDocumentation: () => void
  onDownloadFormat: (type: 'logic' | 'flow') => void
  onAIRefine?: (format: string) => void
  metrics: {
    pages: number
    tables: number
    actions: number
    policies: number
    tokens: number
  }
}

export function DocSidebar({
  isExporting,
  onExportBlueprint,
  onSyncDocumentation,
  onDownloadFormat,
  onAIRefine,
  metrics
}: DocSidebarProps) {
  const stats = [
    { label: 'UI Screens', count: metrics.pages, icon: Layout },
    { label: 'Data Entities', count: metrics.tables, icon: Database },
    { label: 'Business Logic', count: metrics.actions, icon: Code2 },
    { label: 'Security Rules', count: metrics.policies, icon: ShieldCheck },
    { label: 'Design Tokens', count: metrics.tokens, icon: Palette },
  ]

  return (
    <div className="space-y-8 select-none">
      {/* Main Export Card */}
      <div className="p-6 rounded-lg bg-black dark:bg-white text-white dark:text-black space-y-6 shadow-2xl relative overflow-hidden group border border-zinc-900 dark:border-zinc-100">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Package className="size-20 -mr-6 -mt-6" />
        </div>
        <div className="space-y-2 relative z-10">
          <h3 className="text-lg font-black tracking-tight">System Blueprint</h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium leading-relaxed">
            Export high-fidelity snapshot (.STEM) for external simulation.
          </p>
        </div>
        <Button
          onClick={onExportBlueprint}
          disabled={isExporting}
          className="w-full dark:bg-zinc-900 bg-zinc-100 text-black dark:text-white hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-zinc-800 dark:border-zinc-200 rounded-md h-10 text-[10px] font-black uppercase tracking-wider transition-colors"
        >
          {isExporting ? 'Packaging...' : 'Download Blueprint'}
        </Button>
      </div>

      {/* Generate Action */}
      <div className="p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-4 bg-zinc-50/50 dark:bg-zinc-950/20">
        <div className="flex items-center gap-2">
          <Terminal className="size-4 text-zinc-400" />
          <h3 className="text-lg font-black text-zinc-500">Auto-Maintenance</h3>
        </div>
        <p className="text-xs text-zinc-400 dark:text-zinc-600 font-medium leading-relaxed">
          Refresh documentation based on latest system design updates.
        </p>
        <Button
          onClick={onSyncDocumentation}
          variant="outline"
          className="w-full border-zinc-200 dark:border-zinc-800 rounded-md h-9 text-[10px] font-black uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
        >
          Sync Documentation
        </Button>
      </div>

      {/* AI Spec Refiner */}
      <div className="p-6 rounded-lg border border-purple-500/20 dark:border-purple-500/10 space-y-4 bg-purple-50/5 dark:bg-purple-950/5 shadow-lg shadow-purple-500/5 relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 size-28 bg-purple-500/10 dark:bg-purple-500/5 blur-2xl rounded-full" />
        <div className="flex items-center gap-2 relative z-10">
          <h3 className="text-lg font-black text-purple-600 dark:text-purple-400">AI Spec Refiner</h3>
        </div>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium leading-relaxed">
          Compile and format your raw project summary into a polished spec.
        </p>
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => onAIRefine?.('prd')}
            className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-800 text-[9px] font-bold py-1.5 h-auto rounded-md uppercase transition-all"
          >
            PRD
          </Button>
          <Button
            onClick={() => onAIRefine?.('mvp')}
            className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-800 text-[9px] font-bold py-1.5 h-auto rounded-md uppercase transition-all"
          >
            MVP
          </Button>
          <Button
            onClick={() => onAIRefine?.('tech')}
            className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-800 text-[9px] font-bold py-1.5 h-auto rounded-md uppercase transition-all"
          >
            Tech
          </Button>
        </div>
      </div>

      {/* Asset Formats */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-1">
          Asset Packages
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => onDownloadFormat('logic')}
            className="w-full flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/20 hover:border-black dark:hover:border-white transition-all group/opt"
          >
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 group-hover/opt:text-black dark:group-hover/opt:text-white transition-colors">
              Logic Registry
            </span>
            <span className="text-[9px] font-mono text-zinc-300 dark:text-zinc-700">.JSON</span>
          </button>
          <button
            onClick={() => onDownloadFormat('flow')}
            className="w-full flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/20 hover:border-black dark:hover:border-white transition-all group/opt"
          >
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 group-hover/opt:text-black dark:group-hover/opt:text-white transition-colors">
              UI Flow
            </span>
            <span className="text-[9px] font-mono text-zinc-300 dark:text-zinc-700">.JSON</span>
          </button>
        </div>
      </div>
    </div>
  )
}
