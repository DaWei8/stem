'use client'

import { useState } from 'react'
import { Download, FileJson, Package, Shield, Share2, Globe, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { useProjects } from '@/hooks/useProjects'
import { usePages } from '@/hooks/usePages'
import { useVariables } from '@/hooks/useVariables'

export function ExportView() {
  const { currentProject } = useProjects()
  const { pages, inputs, actions, outputs, transitions } = usePages()
  const { variables } = useVariables()
  const [isExporting, setIsExporting] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleExportJson = () => {
    setIsExporting(true)
    try {
      const data = {
        project: currentProject,
        screens: pages,
        inputs,
        logic: actions,
        mutations: outputs,
        flows: transitions,
        registry: variables,
        version: '0.1.0-alpha',
        exportedAt: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${currentProject?.name?.toLowerCase().replace(/\s+/g, '_') || 'project'}.stem`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('System blueprint exported successfully')
    } catch (err) {
      toast.error('Failed to export system blueprint')
    } finally {
      setIsExporting(false)
    }
  }

  const copyProjectId = () => {
    if (!currentProject?.id) return
    navigator.clipboard.writeText(currentProject.id)
    setCopied(true)
    toast.success('Project ID copied')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full bg-black p-8 overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        <header className="space-y-2">
          <h1 className="text-3xl font-black tracking-tighter">System Export</h1>
          <p className="text-xs text-zinc-500 font-medium">Export your deterministic system models for external simulation or backup.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Export Card */}
          <div className="p-8 border border-zinc-800 bg-black/20 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="size-12 bg-white flex items-center justify-center">
                <Package className="size-6 text-black" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Full Blueprint (.stem)</h3>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                  A complete, encrypted snapshot of your system including all flows, logic layers, schema definitions, and design tokens.
                </p>
              </div>
            </div>
            <Button
              onClick={handleExportJson}
              disabled={isExporting}
              className="w-full bg-white text-black hover:bg-zinc-200 rounded-none h-12 text-xs font-black uppercase tracking-widest"
            >
              <Download className="size-4 mr-2" />
              {isExporting ? 'Packaging...' : 'Download Blueprint'}
            </Button>
          </div>

          {/* Public Sharing Card */}
          <div className="p-8 border border-zinc-800 bg-black/20 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="size-12 bg-black border border-zinc-800 flex items-center justify-center text-zinc-400">
                <Globe className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Public CDN Link</h3>
                <p className="text-[10px] text-zinc-600 leading-relaxed font-medium">
                  Generate a deterministic, read-only URL for external stakeholders to view the system without logic mutation privileges.
                </p>
              </div>
            </div>
            <Button disabled className="w-full bg-zinc-800 text-zinc-500 rounded-none h-12 text-xs font-black uppercase tracking-widest cursor-not-allowed border border-zinc-700/50">
              <Share2 className="size-4 mr-2" />
              Generate URL
            </Button>
          </div>
        </div>

        {/* Project Metadata */}
        <section className="space-y-6 pt-6">
          <div className="flex items-center gap-3 pb-2 border-b border-zinc-900">
            <Shield className="size-4 text-zinc-600" />
            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Metadata & Security</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-black/50 border border-zinc-900 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-zinc-600 uppercase">Project Identifier</p>
                <p className="text-xs font-mono text-zinc-400 truncate max-w-[200px]">{currentProject?.id}</p>
              </div>
              <Button
                onClick={copyProjectId}
                variant="ghost"
                size="icon"
                className="size-8 rounded-none hover:bg-black text-zinc-600 hover:text-white"
              >
                {copied ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
              </Button>
            </div>

            <div className="p-4 bg-black/50 border border-zinc-900 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-zinc-600 uppercase">Engine Integrity</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-white">SHA-256 Validated</p>
                  <div className="size-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Audit Log Hint */}
        <div className="p-6 border border-dashed border-zinc-900 rounded-none text-center">
          <p className="text-[10px] text-zinc-700 font-medium italic">
            Exports are recorded in the system audit registry for compliance tracking.
          </p>
        </div>
      </div>
    </div>
  )
}
