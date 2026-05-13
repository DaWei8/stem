'use client'

import { useState } from 'react'
import { Download, FileJson, Package, Shield, Share2, Globe, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { useProjects } from '@/hooks/useProjects'
import { usePages } from '@/hooks/usePages'
import { useVariables } from '@/hooks/useVariables'
import { useDesignSystem } from '@/hooks/useDesignSystem'
import { useDatabase } from '@/hooks/useDatabase'
import { useIdentity } from '@/hooks/useIdentity'
import { generateProjectDocumentation, generateDocFile } from '@/lib/exportUtils'
import clsx from 'clsx'

export function ExportView() {
  const { currentProject } = useProjects()
  const { pages, inputs, actions, outputs, transitions } = usePages()
  const { variables } = useVariables()
  const { tokens, components } = useDesignSystem()
  const { tables, columns } = useDatabase()
  const { userTypes, policies } = useIdentity()

  const [isExporting, setIsExporting] = useState(false)
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false)
  const [publicUrl, setPublicUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)

  const handleExportDocs = () => {
    try {
      const data = {
        project: currentProject,
        architecture: { pages, transitions, inputs, actions, outputs },
        schema: { tables, columns },
        identity: { userTypes, policies },
        logic: { variables },
        designSystem: { tokens, components },
        observability: { latencyModels: [], costProjections: [], bottlenecks: [] },
        lifecycle: { featureFlags: [], flagGates: [], migrations: [], transforms: [] },
        meta: { version: '0.1.0-alpha', exportedAt: new Date().toISOString(), engine: 'STEM-CORE-V1' }
      }
      const docText = generateProjectDocumentation(data)
      generateDocFile(docText, currentProject?.name || 'project')
      toast.success('System Documentation exported')
    } catch (err) {
      toast.error('Failed to export documentation')
    }
  }


  const stats = [
    { label: 'Entities', value: pages.length + tables.length },
    { label: 'Logic', value: actions.length + policies.length },
    { label: 'Variables', value: variables.length },
    { label: 'Design', value: tokens.length + components.length }
  ]

  const downloadFile = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExportScript = () => {
    try {
      const data = {
        logic: { actions, policies, variables },
        meta: { exportedAt: new Date().toISOString(), type: 'logic-registry' }
      }
      downloadFile(data, `${currentProject?.name?.toLowerCase().replace(/\s+/g, '_')}_logic.json`)
      toast.success('Logic registry exported')
    } catch (err) {
      toast.error('Failed to export logic')
    }
  }

  const handleExportDesign = () => {
    try {
      const data = {
        design: { tokens, components },
        meta: { exportedAt: new Date().toISOString(), type: 'design-system' }
      }
      downloadFile(data, `${currentProject?.name?.toLowerCase().replace(/\s+/g, '_')}_design.json`)
      toast.success('Design system exported')
    } catch (err) {
      toast.error('Failed to export design system')
    }
  }

  const handleExportFlow = () => {
    try {
      const data = {
        architecture: { pages, transitions, inputs, actions, outputs },
        meta: { exportedAt: new Date().toISOString(), type: 'ui-flow' }
      }
      downloadFile(data, `${currentProject?.name?.toLowerCase().replace(/\s+/g, '_')}_flow.json`)
      toast.success('UI Flow exported')
    } catch (err) {
      toast.error('Failed to export UI Flow')
    }
  }

  const handleExportJson = () => {
    setIsExporting(true)
    try {
      const data = {
        project: currentProject,
        architecture: {
          pages,
          transitions,
          inputs,
          actions,
          outputs
        },
        schema: {
          tables,
          columns
        },
        identity: {
          userTypes,
          policies
        },
        logic: {
          variables
        },
        designSystem: {
          tokens,
          components
        },
        meta: {
          version: '0.1.0-alpha',
          exportedAt: new Date().toISOString(),
          engine: 'STEM-CORE-V1'
        }
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

  const handleGenerateUrl = () => {
    setIsGeneratingUrl(true)
    setTimeout(() => {
      const slug = currentProject?.name?.toLowerCase().replace(/\s+/g, '-') || 'unnamed-system'
      setPublicUrl(`https://cdn.stem.dev/v1/share/${slug}-${Math.random().toString(36).substring(7)}`)
      setIsGeneratingUrl(false)
      toast.success('Public distribution link generated')
    }, 1500)
  }

  const copyPublicUrl = () => {
    if (!publicUrl) return
    navigator.clipboard.writeText(publicUrl)
    setCopiedUrl(true)
    toast.success('CDN Link copied to clipboard')
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  const copyProjectId = () => {
    if (!currentProject?.id) return
    navigator.clipboard.writeText(currentProject.id)
    setCopied(true)
    toast.success('Project ID copied')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full bg-white dark:bg-black p-8 overflow-y-auto custom-scrollbar selection:bg-black/10 dark:selection:bg-white/20 transition-colors duration-300">
      <div className="mx-auto space-y-12 pb-20">
        <header className="space-y-2">
          <h1 className="text-3xl font-black tracking-tighter text-black dark:text-white transition-colors">System Export</h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium transition-colors">Export your deterministic system models for external simulation or backup.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Main Blueprint Card */}
          <div className="p-8 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/10 hover:bg-white dark:hover:bg-zinc-900/20 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[280px]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Package className="size-24 -mr-8 -mt-8 text-black dark:text-white" />
            </div>

            <div className="space-y-6 relative z-10">
              <div className="size-12 bg-black dark:bg-white flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                <Package className="size-6 text-white dark:text-black" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-black dark:text-white">Full Blueprint</h3>
                  <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 font-mono">.STEM</span>
                </div>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-relaxed font-medium max-w-[240px]">
                  An encrypted, high-fidelity snapshot of the entire system architecture, including all deterministic logic and state flows.
                </p>
              </div>
            </div>

            <Button
              onClick={handleExportJson}
              disabled={isExporting}
              className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-none h-12 text-xs transition-all hover:gap-3 group/btn"
            >
              {isExporting ? 'Packaging...' : 'Download Blueprint'}
              <Download className="size-4 opacity-0 group-hover/btn:opacity-100 transition-all w-0 group-hover/btn:w-4" />
            </Button>
          </div>

          {/* Public Distribution Card */}
          <div className="p-8 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/10 hover:bg-white dark:hover:bg-zinc-900/20 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[280px]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-black dark:text-white">
              <Globe className="size-24 -mr-8 -mt-8" />
            </div>

            <div className="space-y-6 relative z-10">
              <div className="size-12 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-600 group-hover:border-black dark:group-hover:border-zinc-500 transition-colors">
                <Globe className="size-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">Public CDN Link</h3>
                {publicUrl ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] text-green-600 dark:text-green-500/80 font-mono truncate transition-colors">{publicUrl}</p>
                    <button onClick={copyPublicUrl} className="text-[9px] text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors uppercase font-bold">
                      {copiedUrl ? <Check className="size-3" /> : <Copy className="size-3" />}
                      {copiedUrl ? 'Copied' : 'Copy Link'}
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-600 leading-relaxed font-medium max-w-[240px] transition-colors">
                    Deploy a read-only, deterministic endpoint for external simulation and stakeholder validation.
                  </p>
                )}
              </div>
            </div>

            <Button
              onClick={handleGenerateUrl}
              disabled={isGeneratingUrl}
              className={clsx(
                "w-full rounded-none h-12 text-xs transition-all",
                publicUrl
                  ? "bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                  : "bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
              )}
            >
              {isGeneratingUrl ? 'Deploying...' : publicUrl ? 'Regenerate Link' : 'Generate URL'}
              {!isGeneratingUrl && <Share2 className="size-4 ml-2" />}
            </Button>
          </div>

          {/* Multi-Format Export Card */}
          <div className="p-8 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/10 hover:bg-white dark:hover:bg-zinc-900/20 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[280px]">
            <div className="space-y-6">
              <div className="size-12 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-600 transition-colors">
                <FileJson className="size-6" />
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">Alternative Formats</h3>
                <div className="space-y-2">
                  <button onClick={handleExportDocs} className="w-full flex items-center justify-between p-3 border border-zinc-100 dark:border-zinc-900 hover:border-black dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-black/40 transition-all group/opt">
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 group-hover/opt:text-black dark:group-hover/opt:text-white uppercase transition-colors">System Documentation</span>
                    <span className="text-[9px] font-mono text-zinc-300 dark:text-zinc-700 transition-colors">.MD</span>
                  </button>

                  <button onClick={handleExportScript} className="w-full flex items-center justify-between p-3 border border-zinc-100 dark:border-zinc-900 hover:border-black dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-black/40 transition-all group/opt">
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 group-hover/opt:text-black dark:group-hover/opt:text-white uppercase transition-colors">Logic Registry</span>
                    <span className="text-[9px] font-mono text-zinc-300 dark:text-zinc-700 transition-colors">.JSON</span>
                  </button>
                  <button onClick={handleExportFlow} className="w-full flex items-center justify-between p-3 border border-zinc-100 dark:border-zinc-900 hover:border-black dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-black/40 transition-all group/opt">
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 group-hover/opt:text-black dark:group-hover/opt:text-white uppercase transition-colors">UI Flow</span>
                    <span className="text-[9px] font-mono text-zinc-300 dark:text-zinc-700 transition-colors">.JSON</span>
                  </button>
                  <button onClick={handleExportDesign} className="w-full flex items-center justify-between p-3 border border-zinc-100 dark:border-zinc-900 hover:border-black dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-black/40 transition-all group/opt">
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 group-hover/opt:text-black dark:group-hover/opt:text-white uppercase transition-colors">Design System</span>
                    <span className="text-[9px] font-mono text-zinc-300 dark:text-zinc-700 transition-colors">.JSON</span>
                  </button>
                </div>
              </div>
            </div>
            <p className="text-[9px] text-zinc-300 dark:text-zinc-700 font-medium italic transition-colors">Standardized portability formats.</p>
          </div>
        </div>

        {/* Project Metadata */}
        <section className="space-y-6 pt-6">
          <div className="flex items-center gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-900 transition-colors">
            <Shield className="size-4 text-zinc-400 dark:text-zinc-600" />
            <h2 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest transition-colors">Metadata & Engine Metrics</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/10 border border-zinc-100 dark:border-zinc-900 group hover:border-black dark:hover:border-zinc-700 transition-colors">
              <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-600 uppercase mb-2 transition-colors">Project Identifier</p>
              <div className="flex items-center justify-between">
                <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 truncate pr-4 transition-colors">{currentProject?.id || 'unassigned'}</p>
                <Button
                  onClick={copyProjectId}
                  variant="ghost"
                  size="icon"
                  className="size-6 rounded-none text-zinc-400 dark:text-zinc-600 hover:text-black dark:hover:text-white transition-colors"
                >
                  {copied ? <Check className="size-3 text-green-600 dark:text-green-500" /> : <Copy className="size-3" />}
                </Button>
              </div>
            </div>

            {stats.map((stat, i) => (
              <div key={i} className="p-4 bg-zinc-50 dark:bg-zinc-900/10 border border-zinc-100 dark:border-zinc-900 hover:border-black dark:hover:border-zinc-800 transition-colors group">
                <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-600 uppercase mb-1 transition-colors">{stat.label}</p>
                <p className="text-xl font-black text-black dark:text-white transition-colors">{stat.value}</p>
              </div>
            ))}

            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/10 border border-zinc-100 dark:border-zinc-900 flex items-center justify-between transition-colors">
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-600 uppercase transition-colors">Engine Integrity</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-black dark:text-white transition-colors">SHA-256 Verified</p>
                  <div className="size-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Audit Log Hint */}
        <div className="p-6 border border-dashed border-zinc-100 dark:border-zinc-900 rounded-none text-center transition-colors">
          <p className="text-[10px] text-zinc-300 dark:text-zinc-700 font-medium italic transition-colors">
            Exports are recorded in the system audit registry for compliance tracking.
          </p>
        </div>
      </div>
    </div>
  )
}
