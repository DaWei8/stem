'use client'

import { useState } from 'react'
import {
  FileText,
  History,
  Save,
  Sparkles,
  Database,
  Code2,
  ShieldCheck,
  Palette,
  Layout,
  Plus,
  Trash2,
  Copy,
  Download,
  MoreVertical,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useProjects } from '@/hooks/useProjects'
import { usePages } from '@/hooks/usePages'
import { useVariables } from '@/hooks/useVariables'
import { useDesignSystem } from '@/hooks/useDesignSystem'
import { useDatabase } from '@/hooks/useDatabase'
import { useIdentity } from '@/hooks/useIdentity'
import { useDocVersions } from '@/hooks/useDocVersions'

export function DocumentationView() {
  const { currentProject } = useProjects()
  const { pages, transitions, actions } = usePages()
  const { variables } = useVariables()
  const { tokens, components } = useDesignSystem()
  const { tables, columns } = useDatabase()
  const { userTypes, policies } = useIdentity()

  const {
    versions,
    activeVersionId,
    isEditing,
    editedContent,
    setActiveVersionId,
    setIsEditing,
    setEditedContent,
    saveContent,
    createVersion,
    deleteVersion,
    toggleStatus,
    duplicateVersion,
    generateAutoSpecs,
    exportVersionAsMarkdown
  } = useDocVersions()

  const [isCreating, setIsCreating] = useState(false)
  const [newVersionName, setNewVersionName] = useState('')
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  const activeVersion = versions.find(v => v.id === activeVersionId) || versions[0]

  const snapshot = { pages, actions, transitions, variables, tables, columns, userTypes, policies, tokens, components }

  const handleCreate = () => {
    if (!newVersionName.trim()) return
    createVersion(newVersionName.trim())
    setNewVersionName('')
    setIsCreating(false)
  }

  const stats = [
    { label: 'UI Screens', count: pages.length, icon: Layout },
    { label: 'Data Entities', count: tables.length, icon: Database },
    { label: 'Business Logic', count: actions.length, icon: Code2 },
    { label: 'Security Rules', count: policies.length, icon: ShieldCheck },
    { label: 'Design Tokens', count: tokens.length, icon: Palette },
  ]

  return (
    <div className="h-full bg-white dark:bg-black p-8 overflow-y-auto custom-scrollbar selection:bg-black/10 dark:selection:bg-white/20 transition-colors duration-300">
      <div className="w-full mx-auto space-y-10 pb-20">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="size-8 bg-black dark:bg-white flex items-center justify-center">
                <FileText className="size-4 text-white dark:text-black" />
              </div>
              <h1 className="text-3xl font-black tracking-tighter text-black dark:text-white transition-colors">Documentation</h1>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium transition-colors">
              Single source of truth for <span className="text-black dark:text-white font-bold"> {currentProject?.name || 'System'}</span>.
            </p>
          </div>

          {/* Version Tabs */}
          <div className="flex items-center gap-2">
            <div className="flex bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-1 transition-colors">
              {versions.map(v => (
                <div key={v.id} className="relative group/tab">
                  <button
                    onClick={() => setActiveVersionId(v.id)}
                    className={cn(
                      "px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
                      v.id === activeVersionId
                        ? "bg-black dark:bg-white text-white dark:text-black shadow-lg"
                        : "text-zinc-400 hover:text-black dark:hover:text-zinc-200"
                    )}
                  >
                    {v.name}
                  </button>

                  {/* Context Menu Trigger */}
                  {v.id === activeVersionId && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === v.id ? null : v.id) }}
                      className="absolute -top-1 -right-1 size-4 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center opacity-0 group-hover/tab:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="size-2.5 text-zinc-600 dark:text-zinc-300" />
                    </button>
                  )}

                  {/* Context Menu */}
                  {menuOpenId === v.id && (
                    <div className="absolute top-full right-0 mt-2 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl min-w-[160px]">
                      <button
                        onClick={() => { toggleStatus(v.id); setMenuOpenId(null) }}
                        className="w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        Cycle Status
                      </button>
                      <button
                        onClick={() => { duplicateVersion(v.id); setMenuOpenId(null) }}
                        className="w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2"
                      >
                        <Copy className="size-3" /> Duplicate
                      </button>
                      <button
                        onClick={() => { exportVersionAsMarkdown(v.id, currentProject?.name); setMenuOpenId(null) }}
                        className="w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2"
                      >
                        <Download className="size-3" /> Export .MD
                      </button>
                      <div className="border-t border-zinc-100 dark:border-zinc-800" />
                      <button
                        onClick={() => { deleteVersion(v.id); setMenuOpenId(null) }}
                        className="w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="size-3" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* New Version Inline */}
              {isCreating ? (
                <div className="flex items-center gap-1 px-1">
                  <input
                    autoFocus
                    value={newVersionName}
                    onChange={e => setNewVersionName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setIsCreating(false) }}
                    placeholder="v2.0"
                    className="w-20 bg-transparent text-[10px] font-black uppercase tracking-widest text-black dark:text-white placeholder:text-zinc-400 outline-none border-b border-zinc-300 dark:border-zinc-700 py-1"
                  />
                  <button onClick={handleCreate} className="text-green-600 hover:text-green-500"><Plus className="size-3.5" /></button>
                  <button onClick={() => setIsCreating(false)} className="text-zinc-400 hover:text-red-500"><X className="size-3.5" /></button>
                </div>
              ) : (
                <button onClick={() => setIsCreating(true)} className="px-3 py-2 text-zinc-400 hover:text-black dark:hover:text-zinc-200 transition-colors">
                  <Plus className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Status Bar */}
        <div className="flex items-center gap-6 py-4 border-y border-zinc-100 dark:border-zinc-900 transition-colors">
          <div className="flex items-center gap-2">
            <History className="size-3.5 text-zinc-400" />
            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">
              Updated: {new Date(activeVersion.updatedAt || activeVersion.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="ml-auto text-[9px] font-mono text-zinc-300 dark:text-zinc-700">
            {activeVersion.content.length.toLocaleString()} chars
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Editor / Viewer */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-black dark:text-white">Detailed Specification</h2>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <Button variant="ghost" onClick={() => setIsEditing(true)} className="h-8 text-xs text-zinc-500 hover:text-black dark:hover:text-white rounded-none">
                    Edit Content
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => setIsEditing(false)} className="h-8 text-xs text-zinc-500 rounded-none">
                      Cancel
                    </Button>
                    <Button onClick={saveContent} className="h-8 bg-black dark:bg-white text-white dark:text-black text-xs rounded-none">
                      <Save className="size-3" /> Save
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {isEditing ? (
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[600px] bg-zinc-50 dark:bg-black/40 border-zinc-200 dark:border-zinc-800 rounded-none p-6 font-mono text-xs leading-relaxed focus:ring-1 focus:ring-black/10 dark:focus:ring-white/10 transition-all text-black dark:text-white"
                placeholder="Describe your system architecture in detail..."
              />
            ) : (
              <div className="min-h-[600px] bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-900 p-8 transition-colors">
                {activeVersion.content ? (
                  <div className="whitespace-pre-wrap font-mono text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {activeVersion.content}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                    <FileText className="size-12 text-zinc-200 dark:text-zinc-800" />
                    <div>
                      <p className="text-sm font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">No content yet</p>
                      <p className="text-[10px] text-zinc-300 dark:text-zinc-700 font-medium mt-1">Click &quot;Auto-Generate Specs&quot; to populate from your system state.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">

            {/* Generate Card */}
            <div className="p-4 bg-black dark:bg-white space-y-4 shadow-2xl">
              <h3 className="text-xl font-black text-white dark:text-black">Stem Intelligence</h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-600 font-medium leading-relaxed">
                Parse your entire project state to generate a comprehensive technical specification with entity-level detail.
              </p>
              <Button
                onClick={() => generateAutoSpecs(snapshot, currentProject?.name)}
                className="w-full bg-zinc-800 dark:bg-zinc-100 text-white dark:text-black hover:bg-zinc-700 dark:hover:bg-zinc-200 rounded-none h-11 text-xs "
              >
                Auto-Generate Specs
              </Button>
            </div>

            {/* System Metrics */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-1 transition-colors">System Metrics</h3>
              <div className="space-y-2">
                {stats.map((stat, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-zinc-100 dark:border-zinc-900 bg-white dark:bg-black/20 hover:border-zinc-200 dark:hover:border-zinc-800 transition-all group">
                    <div className="flex items-center gap-3">
                      <stat.icon className="size-3.5 text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                      <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-tighter">{stat.label}</span>
                    </div>
                    <span className="text-xs font-black text-black dark:text-white">{stat.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Quick Action */}
            <Button
              variant="outline"
              onClick={() => exportVersionAsMarkdown(activeVersionId, currentProject?.name)}
              className="w-full rounded-none h-10 text-[10px] font-black uppercase tracking-widest gap-2 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
            >
              <Download className="size-3.5" /> Export as Markdown
            </Button>

            {/* Tip */}
            <div className="p-6 border border-zinc-100 dark:border-zinc-900 transition-colors">
              <p className="text-[10px] text-zinc-400 dark:text-zinc-600 font-medium leading-relaxed italic">
                Maintain a versioned spec for every milestone. This document is the definitive reference for your engineering and design teams.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
