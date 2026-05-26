'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useDatabase } from '@/hooks/useDatabase'
import { useDesignSystem } from '@/hooks/useDesignSystem'
import { useDocVersions } from '@/hooks/useDocVersions'
import { useIdentity } from '@/hooks/useIdentity'
import { usePages } from '@/hooks/usePages'
import { useProjects } from '@/hooks/useProjects'
import { useVariables } from '@/hooks/useVariables'
import { cn } from '@/lib/utils'
import { Edit3, Eye, FileText, Save } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { DocMarkdownRenderer } from './documentation/DocMarkdownRenderer'
import { DocSidebar } from './documentation/DocSidebar'
import { DocVersionSelector } from './documentation/DocVersionSelector'

export function DocumentationView() {
  const { currentProject } = useProjects()
  const { pages, transitions, actions, inputs, outputs } = usePages()
  const { variables } = useVariables()
  const { tokens, components } = useDesignSystem()
  const { tables, columns } = useDatabase()
  const { userTypes, policies } = useIdentity()

  const {
    versions,
    activeVersionId,
    isEditing,
    editedContent,
    fetchVersions,
    setActiveVersionId,
    setIsEditing,
    setEditedContent,
    saveContent,
    createVersion,
    deleteVersion,
    toggleStatus,
    duplicateVersion,
    generateAutoSpecs,
    exportVersionAsMarkdown,
    aiRefineContent
  } = useDocVersions()

  const [isExporting, setIsExporting] = useState(false)
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview')

  useEffect(() => {
    if (currentProject?.id) {
      fetchVersions(currentProject.id)
    }
  }, [currentProject?.id, fetchVersions])

  const activeVersion = useMemo(() => {
    return versions.find(v => v.id === activeVersionId) || versions[0] || {
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }, [versions, activeVersionId])

  useEffect(() => {
    setViewMode(isEditing ? 'edit' : 'preview')
  }, [isEditing])

  const sections = useMemo(() => {
    if (!activeVersion?.content) return []
    return activeVersion.content
      .split('\n')
      .filter(line => line.trim().startsWith('## '))
      .map(line => {
        const text = line.trim().replace(/^##\s*\d*\.?\s*/, '')
        return {
          text,
          id: text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        }
      })
  }, [activeVersion])

  const handleExportBlueprint = () => {
    setIsExporting(true)
    try {
      const data = {
        header: {
          title: 'Full System Blueprint',
          project: currentProject?.name,
          id: currentProject?.id,
          engine: 'STEM-CORE-V2',
          exported_at: new Date().toISOString(),
          integrity: 'SHA-256-DETERMINISTIC'
        },
        project: currentProject,
        architecture: { pages, transitions, inputs, actions, outputs },
        schema: { tables, columns },
        identity: { userTypes, policies },
        logic: { variables },
        designSystem: { tokens, components },
        meta: { version: '0.2.0-beta', exportedAt: new Date().toISOString(), engine: 'STEM-CORE-V2' }
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
      toast.success('System blueprint exported')
    } catch (err) {
      toast.error('Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  const handleSyncDocumentation = () => {
    const snapshot = { pages, actions, transitions, variables, tables, columns, userTypes, policies, tokens, components }
    generateAutoSpecs(snapshot, currentProject?.name)
  }

  const handleDownloadFormat = (type: 'logic' | 'flow') => {
    const data = type === 'logic'
      ? {
        header: { title: 'Logic Registry', project: currentProject?.name, exported_at: new Date().toISOString() },
        logic: { actions, policies, variables }
      }
      : {
        header: { title: 'Architectural UI Flow', project: currentProject?.name, exported_at: new Date().toISOString() },
        architecture: { pages, transitions, inputs, actions, outputs }
      }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentProject?.name?.toLowerCase().replace(/\s+/g, '_') || 'project'}_${type}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`${type === 'logic' ? 'Logic Registry' : 'UI Flow'} exported`)
  }

  return (
    <div className="h-full bg-white dark:bg-black p-8 overflow-y-auto custom-scrollbar transition-colors duration-300">
      <div className="w-full mx-auto space-y-8 pb-20">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 dark:border-zinc-900 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="size-8 bg-black dark:bg-white flex items-center justify-center">
                <FileText className="size-4 text-white dark:text-black" />
              </div>
              <h1 className="text-3xl font-black tracking-tighter text-black dark:text-white">Documentation & Assets</h1>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
              The definitive source of truth and data portability for <span className="text-black dark:text-white font-bold">{currentProject?.name || 'System'}</span>.
            </p>
          </div>

          <DocVersionSelector
            versions={versions}
            activeVersionId={activeVersionId}
            onSelectVersion={setActiveVersionId}
            onCycleStatus={toggleStatus}
            onDuplicateVersion={duplicateVersion}
            onExportMarkdown={(id) => exportVersionAsMarkdown(id, currentProject?.name)}
            onDeleteVersion={deleteVersion}
            onCreateVersion={createVersion}
          />
        </header>

        {/* View mode toggle subheader */}
        <div className="flex flex-col md:flex-row md:items-center justify-between py-1 gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-3">
          <div className="flex bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-0.5 select-none">
            <button
              onClick={() => { setViewMode('preview'); setIsEditing(false) }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all",
                viewMode === 'preview'
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "text-zinc-400 hover:text-black dark:hover:text-zinc-200"
              )}
            >
              <Eye className="size-3" /> Preview Spec
            </button>
            <button
              onClick={() => { setViewMode('edit'); setIsEditing(true) }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all",
                viewMode === 'edit'
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "text-zinc-400 hover:text-black dark:hover:text-zinc-200"
              )}
            >
              <Edit3 className="size-3" /> Edit Raw
            </button>
          </div>

          <div className="flex items-center gap-4 text-[10px] text-zinc-400 font-medium font-mono md:ml-auto">
            <span>Updated: {new Date(activeVersion.updatedAt || activeVersion.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>{(activeVersion.content || '').length.toLocaleString()} chars</span>
            {viewMode === 'edit' && (
              <Button
                onClick={() => saveContent()}
                className="bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-wider h-7 px-3 rounded-md gap-1.5 transition-colors"
              >
                <Save className="size-3" /> Save Changes
              </Button>
            )}
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Left Sidebar Table of Contents (Only visible in Preview Mode) */}
          {viewMode === 'preview' && (
            <aside className="lg:col-span-1 space-y-4 hidden lg:block sticky top-8 self-start border-r border-zinc-100 dark:border-zinc-900 pr-4 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar select-none">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4 px-1">
                Table of Contents
              </h3>
              <nav className="space-y-3">
                {sections.length > 0 ? (
                  sections.map((sec, i) => (
                    <a
                      key={i}
                      href={`#${sec.id}`}
                      onClick={(e) => {
                        e.preventDefault()
                        document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="block text-[10.5px] font-bold text-zinc-400 hover:text-black dark:hover:text-white uppercase transition-colors py-0.5 truncate"
                    >
                      {sec.text}
                    </a>
                  ))
                ) : (
                  <span className="text-[10px] text-zinc-400 italic px-1">No sections identified</span>
                )}
              </nav>
            </aside>
          )}

          {/* Center spec container */}
          <div className={cn(viewMode === 'preview' ? "lg:col-span-2" : "lg:col-span-3", "space-y-4")}>
            {viewMode === 'edit' ? (
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full min-h-[600px] bg-zinc-50 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800 rounded-md p-6 font-mono text-xs leading-relaxed focus:ring-0 focus:outline-none transition-all text-black dark:text-white"
                placeholder="Describe your system architecture in detail..."
              />
            ) : (
              <div className="min-h-[600px] bg-zinc-50/20 dark:bg-zinc-950/5 border border-zinc-100 dark:border-zinc-900/60 p-8 transition-all">
                {activeVersion.content ? (
                  <DocMarkdownRenderer content={activeVersion.content} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-28 select-none">
                    <FileText className="size-10 text-zinc-250 dark:text-zinc-850" />
                    <div>
                      <p className="text-xs font-black text-zinc-400 dark:text-zinc-600">No specification documentation generated yet</p>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-600 font-medium mt-1">
                        Click &quot;Sync Documentation&quot; in the sidebar to compile your system state.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar actions container */}
          <aside className="lg:col-span-1">
            <DocSidebar
              isExporting={isExporting}
              onExportBlueprint={handleExportBlueprint}
              onSyncDocumentation={handleSyncDocumentation}
              onDownloadFormat={handleDownloadFormat}
              onAIRefine={(format) => aiRefineContent(format)}
              metrics={{
                pages: pages.length,
                tables: tables.length,
                actions: actions.length,
                policies: policies.length,
                tokens: tokens.length
              }}
            />
          </aside>
        </div>

      </div>
    </div>
  )
}
