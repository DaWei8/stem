'use client'

import { useState, useEffect, useMemo } from 'react'
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
  X,
  Package,
  ListTodo,
  TrendingUp,
  DollarSign,
  Info,
  Layers,
  ArrowRight,
  ShieldAlert,
  Server,
  Calculator
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useProjects } from '@/hooks/useProjects'
import { usePages } from '@/hooks/usePages'
import { useVariables } from '@/hooks/useVariables'
import { useDesignSystem } from '@/hooks/useDesignSystem'
import { useDatabase } from '@/hooks/useDatabase'
import { useIdentity } from '@/hooks/useIdentity'
import { useDocVersions, parseMetadata, serializeMetadata, TechRequirement, CostItem } from '@/hooks/useDocVersions'
import { toast } from 'sonner'

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
  const [isExporting, setIsExporting] = useState(false)

  // Sub-tab: spec | requirements | costs
  const [activeSubTab, setActiveSubTab] = useState<'spec' | 'requirements' | 'costs'>('spec')

  const activeVersion = useMemo(() => {
    return versions.find(v => v.id === activeVersionId) || versions[0]
  }, [versions, activeVersionId])

  // Form states for Technical Requirements
  const [reqCategory, setReqCategory] = useState('Backend')
  const [reqTitle, setReqTitle] = useState('')
  const [reqDesc, setReqDesc] = useState('')
  const [reqPriority, setReqPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High')

  // Form states for Cost Calculator
  const [costService, setCostService] = useState('')
  const [costMetric, setCostMetric] = useState('per month')
  const [costUnit, setCostUnit] = useState('0')
  const [costVolume, setCostVolume] = useState('1')

  // Parse structured metadata from active version
  const metadata = useMemo(() => {
    return parseMetadata(activeVersion?.content || '')
  }, [activeVersion])

  const [localReqs, setLocalReqs] = useState<TechRequirement[]>([])
  const [localCosts, setLocalCosts] = useState<CostItem[]>([])

  // Load local state whenever version changes
  useEffect(() => {
    if (metadata) {
      setLocalReqs(metadata.requirements || [])
      setLocalCosts(metadata.costs || [])
    }
  }, [metadata])

  // Common snapshots
  const snapshot = { pages, actions, transitions, variables, tables, columns, userTypes, policies, tokens, components }

  const getSystemSnapshot = () => ({
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
  })

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

  const handleExportBlueprint = () => {
    setIsExporting(true)
    try {
      downloadFile(getSystemSnapshot(), `${currentProject?.name?.toLowerCase().replace(/\s+/g, '_') || 'project'}.stem`)
      toast.success('System blueprint exported')
    } catch (err) {
      toast.error('Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  const handleCreate = () => {
    if (!newVersionName.trim()) return
    createVersion(newVersionName.trim())
    setNewVersionName('')
    setIsCreating(false)
  }

  // Save changes wrapper
  const handleSave = (customContent?: string, updatedReqs?: TechRequirement[], updatedCosts?: CostItem[]) => {
    const content = customContent !== undefined ? customContent : editedContent
    const reqs = updatedReqs !== undefined ? updatedReqs : localReqs
    const costs = updatedCosts !== undefined ? updatedCosts : localCosts

    const serialized = serializeMetadata(content, {
      requirements: reqs,
      costs: costs
    })

    // Synchronously set Zustand store state before committing save
    useDocVersions.setState({ editedContent: serialized })
    saveContent()
  }

  // Adding requirement
  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reqTitle.trim()) return

    const newItem: TechRequirement = {
      id: `req-${Date.now()}`,
      category: reqCategory,
      title: reqTitle.trim(),
      desc: reqDesc.trim(),
      priority: reqPriority
    }

    const updated = [...localReqs, newItem]
    setLocalReqs(updated)
    setReqTitle('')
    setReqDesc('')

    // Auto-save metadata update
    const plainContent = activeVersion?.content.replace(/<!-- STEM_METADATA_START[\s\S]*?STEM_METADATA_END -->/g, '').trim() || ''
    handleSave(plainContent, updated, localCosts)
    toast.success('Technical requirement added')
  }

  // Deleting requirement
  const handleDeleteRequirement = (id: string) => {
    const updated = localReqs.filter(r => r.id !== id)
    setLocalReqs(updated)
    const plainContent = activeVersion?.content.replace(/<!-- STEM_METADATA_START[\s\S]*?STEM_METADATA_END -->/g, '').trim() || ''
    handleSave(plainContent, updated, localCosts)
    toast.success('Technical requirement removed')
  }

  // Adding cost item
  const handleAddCostItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!costService.trim()) return

    const newItem: CostItem = {
      id: `cost-${Date.now()}`,
      service: costService.trim(),
      metric: costMetric,
      unitCost: parseFloat(costUnit) || 0,
      volume: parseInt(costVolume) || 1
    }

    const updated = [...localCosts, newItem]
    setLocalCosts(updated)
    setCostService('')
    setCostUnit('0')
    setCostVolume('1')

    const plainContent = activeVersion?.content.replace(/<!-- STEM_METADATA_START[\s\S]*?STEM_METADATA_END -->/g, '').trim() || ''
    handleSave(plainContent, localReqs, updated)
    toast.success('Cost implication added')
  }

  // Deleting cost item
  const handleDeleteCostItem = (id: string) => {
    const updated = localCosts.filter(c => c.id !== id)
    setLocalCosts(updated)
    const plainContent = activeVersion?.content.replace(/<!-- STEM_METADATA_START[\s\S]*?STEM_METADATA_END -->/g, '').trim() || ''
    handleSave(plainContent, localReqs, updated)
    toast.success('Cost item removed')
  }

  // Total monthly projected operating cost
  const totalMonthlyCost = useMemo(() => {
    return localCosts.reduce((sum, item) => sum + (item.unitCost * item.volume), 0)
  }, [localCosts])

  const stats = [
    { label: 'UI Screens', count: pages.length, icon: Layout },
    { label: 'Data Entities', count: tables.length, icon: Database },
    { label: 'Business Logic', count: actions.length, icon: Code2 },
    { label: 'Security Rules', count: policies.length, icon: ShieldCheck },
    { label: 'Design Tokens', count: tokens.length, icon: Palette },
  ]

  const alternativeFormats = [
    {
      label: 'Logic Registry',
      ext: '.JSON',
      action: () => downloadFile({
        header: { title: 'Logic Registry', project: currentProject?.name, exported_at: new Date().toISOString() },
        logic: { actions, policies, variables }
      }, `${currentProject?.name?.toLowerCase().replace(/\s+/g, '_')}_logic.json`)
    },
    {
      label: 'UI Flow',
      ext: '.JSON',
      action: () => downloadFile({
        header: { title: 'Architectural UI Flow', project: currentProject?.name, exported_at: new Date().toISOString() },
        architecture: { pages, transitions, inputs, actions, outputs }
      }, `${currentProject?.name?.toLowerCase().replace(/\s+/g, '_')}_flow.json`)
    }
  ]

  // Render priority badges helper
  const getPriorityBadge = (priority: TechRequirement['priority']) => {
    switch (priority) {
      case 'Critical':
        return <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black  ">Critical</span>
      case 'High':
        return <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black  ">High</span>
      case 'Medium':
        return <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[9px] font-black  ">Medium</span>
      case 'Low':
        return <span className="px-2 py-0.5 bg-zinc-500/10 border border-zinc-500/20 text-zinc-500 text-[9px] font-black  ">Low</span>
    }
  }

  // Pre-seed options helper
  const commonServices = ['Gemini API Key', 'Supabase Database', 'Vercel hosting Pro', 'Stripe Payments', 'Postmark SMTP Server', 'Algolia Search', 'Sentry Error Reporting']
  const commonRequirements = [
    { cat: 'Database', title: 'Row Level Security (RLS)', desc: 'Configure Postgres tables to restrict data access to owners/authorized collaborators only.' },
    { cat: 'Backend', title: 'Semantic LLM Processing', desc: 'Integrate gemini-1.5-flash model via SDK endpoint for system specifications automation.' },
    { cat: 'Frontend', title: 'Next.js App Router Conversion', desc: 'Refactor client context and route handlers to utilize App Router page layout paradigms.' },
    { cat: 'Infrastructure', title: 'Canary Deployments', desc: 'Utilize Vercel edge configs to run split traffic routing for new versions.' }
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
              <h1 className="text-3xl font-black tracking-tighter text-black dark:text-white transition-colors">Documentation & Assets</h1>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium transition-colors">
              The definitive source of truth and data portability for <span className="text-black dark:text-white font-bold">{currentProject?.name || 'System'}</span>.
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
                      "px-4 py-2 text-[10px] font-black transition-all",
                      v.id === activeVersionId
                        ? "bg-black dark:bg-white text-white dark:text-black shadow-lg"
                        : "text-zinc-400 hover:text-black dark:hover:text-zinc-200"
                    )}
                  >
                    {v.name}
                  </button>
                  {v.id === activeVersionId && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === v.id ? null : v.id) }}
                      className="absolute -top-1 -right-1 size-4 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center opacity-0 group-hover/tab:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="size-2.5 text-zinc-600 dark:text-zinc-300" />
                    </button>
                  )}

                  {menuOpenId === v.id && (
                    <div className="absolute top-full right-0 mt-2 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl min-w-[160px]">
                      <button onClick={() => { toggleStatus(v.id); setMenuOpenId(null) }} className="w-full text-left px-4 py-2.5 text-[10px] font-bold text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Cycle Status</button>
                      <button onClick={() => { duplicateVersion(v.id); setMenuOpenId(null) }} className="w-full text-left px-4 py-2.5 text-[10px] font-bold text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2"><Copy className="size-3" /> Duplicate</button>
                      <button onClick={() => { exportVersionAsMarkdown(v.id, currentProject?.name); setMenuOpenId(null) }} className="w-full text-left px-4 py-2.5 text-[10px] font-bold text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2"><Download className="size-3" /> Export .MD</button>
                      <div className="border-t border-zinc-100 dark:border-zinc-800" />
                      <button onClick={() => { deleteVersion(v.id); setMenuOpenId(null) }} className="w-full text-left px-4 py-2.5 text-[10px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex items-center gap-2"><Trash2 className="size-3" /> Delete</button>
                    </div>
                  )}
                </div>
              ))}
              {isCreating ? (
                <div className="flex items-center gap-1 px-1">
                  <input autoFocus value={newVersionName} onChange={e => setNewVersionName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setIsCreating(false) }} placeholder="v2.0" className="w-20 bg-transparent text-[10px] font-black text-black dark:text-white placeholder:text-zinc-400 outline-none border-b border-zinc-300 dark:border-zinc-700 py-1" />
                  <button onClick={handleCreate} className="text-green-600 hover:text-green-500"><Plus className="size-3.5" /></button>
                  <button onClick={() => setIsCreating(false)} className="text-zinc-400 hover:text-red-500"><X className="size-3.5" /></button>
                </div>
              ) : (
                <button onClick={() => setIsCreating(true)} className="px-3 py-2 text-zinc-400 hover:text-black dark:hover:text-zinc-200 transition-colors"><Plus className="size-3.5" /></button>
              )}
            </div>
          </div>
        </header>

        {/* Status & Sub-tab navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-y border-zinc-100 dark:border-zinc-900 transition-colors py-2 gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('spec')}
              className={cn(
                "px-3 py-2 text-xs font-black   border transition-all",
                activeSubTab === 'spec'
                  ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                  : "border-transparent text-zinc-400 hover:text-black dark:hover:text-white"
              )}
            >
              <span className="flex items-center gap-2">
                <FileText className="size-3.5" />
                Technical Specification
              </span>
            </button>
            <button
              onClick={() => setActiveSubTab('requirements')}
              className={cn(
                "px-3 py-2 text-xs font-black   border transition-all",
                activeSubTab === 'requirements'
                  ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                  : "border-transparent text-zinc-400 hover:text-black dark:hover:text-white"
              )}
            >
              <span className="flex items-center gap-2">
                <ListTodo className="size-3.5" />
                Technical Requirements
              </span>
            </button>
            <button
              onClick={() => setActiveSubTab('costs')}
              className={cn(
                "px-3 py-2 text-xs font-black   border transition-all",
                activeSubTab === 'costs'
                  ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                  : "border-transparent text-zinc-400 hover:text-black dark:hover:text-white"
              )}
            >
              <span className="flex items-center gap-2">
                <TrendingUp className="size-3.5" />
                Cost Implications
              </span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-[10px] text-zinc-400 font-medium md:ml-auto">
            <span className="flex items-center gap-1.5">
              <History className="size-3.5" />
              <span>Updated: {new Date(activeVersion.updatedAt || activeVersion.createdAt).toLocaleDateString()}</span>
            </span>
            <span>•</span>
            <span className="font-mono text-zinc-300 dark:text-zinc-700">{(activeVersion.content || '').length.toLocaleString()} chars</span>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">

            {/* TAB 1: SPEC DOCUMENT (MARKDOWN PREVIEW / EDITOR) */}
            {activeSubTab === 'spec' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h2 className="text-lg font-black tracking-tight text-black dark:text-white">Technical Specification</h2>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Rendered Markdown specification for architectural portability.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isEditing ? (
                      <Button variant="ghost" onClick={() => setIsEditing(true)} className="h-8 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-black dark:hover:text-white rounded-none border border-zinc-200 dark:border-zinc-800">Edit Specification</Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={() => setIsEditing(false)} className="h-8 text-[10px] font-black uppercase tracking-widest text-zinc-500 rounded-none">Cancel</Button>
                        <Button onClick={() => handleSave()} className="h-8 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest rounded-none gap-1.5"><Save className="size-3" /> Save</Button>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <Textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="min-h-[600px] bg-zinc-50 dark:bg-black/40 border-zinc-200 dark:border-zinc-800 rounded-none p-6 font-mono text-xs leading-relaxed focus:ring-1 focus:ring-black/10 dark:focus:ring-white/10 transition-all text-black dark:text-white" placeholder="Describe your system architecture in detail..." />
                ) : (
                  <div className="min-h-[600px] bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-900 p-8 transition-colors">
                    {activeVersion.content ? (
                      <div className="whitespace-pre-wrap font-mono text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed select-all">
                        {/* Remove metadata block from visual markdown display to keep it extremely clean */}
                        {activeVersion.content.replace(/<!-- STEM_METADATA_START[\s\S]*?STEM_METADATA_END -->/g, '').trim()}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-28">
                        <FileText className="size-12 text-zinc-200 dark:text-zinc-800" />
                        <div>
                          <p className="text-xs font-black text-zinc-400 dark:text-zinc-600  ">No spec documentation generated yet</p>
                          <p className="text-[10px] text-zinc-300 dark:text-zinc-700 font-medium mt-1">Click &quot;Sync Documentation&quot; in the sidebar to populate automatically.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: TECHNICAL REQUIREMENTS */}
            {activeSubTab === 'requirements' && (
              <div className="space-y-6">
                <div className="space-y-0.5">
                  <h2 className="text-lg font-black tracking-tight text-black dark:text-white">Technical Requirements</h2>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium font-mono">Map out deployment guidelines, dependencies, and infrastructural requirements.</p>
                </div>

                {/* Form to add requirement */}
                <form onSubmit={handleAddRequirement} className="p-5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/10 space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-2">
                    <Layers className="size-3.5 text-zinc-400" />
                    <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Add Requirement Registry</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase">Category</label>
                      <select
                        value={reqCategory}
                        onChange={(e) => setReqCategory(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-black   text-zinc-600 dark:text-zinc-400 h-9 px-2 rounded-none focus:outline-none focus:border-zinc-400"
                      >
                        <option value="Frontend">Frontend (UI/UX)</option>
                        <option value="Backend">Backend (APIs)</option>
                        <option value="Database">Database (Schema)</option>
                        <option value="Security">Security (Auth/RLS)</option>
                        <option value="Infrastructure">Infrastructure</option>
                      </select>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase">Requirement Title</label>
                      <Input
                        required
                        placeholder="e.g. Supabase Auth with SMS MFA"
                        value={reqTitle}
                        onChange={(e) => setReqTitle(e.target.value)}
                        className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-none h-9 text-xs focus:ring-0 text-black dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase">Description Details</label>
                      <Input
                        placeholder="Define details, libraries, constraints, or configurations..."
                        value={reqDesc}
                        onChange={(e) => setReqDesc(e.target.value)}
                        className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-none h-9 text-xs focus:ring-0 text-black dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase">Priority Severity</label>
                      <select
                        value={reqPriority}
                        onChange={(e: any) => setReqPriority(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-black   text-zinc-600 dark:text-zinc-400 h-9 px-2 rounded-none focus:outline-none focus:border-zinc-400"
                      >
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="submit" className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-850 dark:hover:bg-zinc-150 rounded-none h-9 text-xs font-black gap-1">
                      <Plus className="size-3.5" /> Add Requirement
                    </Button>
                  </div>
                </form>

                {/* Requirements list */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-zinc-400 tracking-widest uppercase">Requirements Registry ({localReqs.length})</h3>

                  {localReqs.length === 0 ? (
                    <div className="p-8 border border-dashed border-zinc-200 dark:border-zinc-800 text-center flex flex-col items-center justify-center gap-2">
                      <ListTodo className="size-6 text-zinc-300" />
                      <p className="text-xs font-black text-zinc-400 uppercase">No custom technical requirements logged yet.</p>

                      {/* Seed helper options */}
                      <div className="mt-4 w-full max-w-md bg-zinc-50 dark:bg-zinc-900/40 p-4 border border-zinc-100 dark:border-zinc-900/60 text-left">
                        <span className="text-[9px] font-black text-zinc-500 uppercase flex items-center gap-1 mb-2">
                          <Info className="size-3" /> Quick Recommend templates:
                        </span>
                        <div className="flex flex-col gap-1.5">
                          {commonRequirements.map((r, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setReqCategory(r.cat)
                                setReqTitle(r.title)
                                setReqDesc(r.desc)
                              }}
                              className="text-[9.5px] text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors text-left truncate flex items-center gap-1.5"
                            >
                              <ArrowRight className="size-2.5 text-zinc-300" />
                              <strong className="uppercase font-mono text-[8px] border border-zinc-250 dark:border-zinc-850 px-1">{r.cat}</strong>
                              <span>{r.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-zinc-250 dark:border-zinc-850 divide-y divide-zinc-250 dark:divide-zinc-850 overflow-hidden bg-white dark:bg-black/30">
                      {localReqs.map((req) => (
                        <div key={req.id} className="p-4 flex items-start justify-between group hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-all gap-4">
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex items-center gap-2.5">
                              <span className="px-1.5 py-0.2 border border-zinc-350 dark:border-zinc-750 font-mono text-[8px] font-black uppercase text-zinc-500 dark:text-zinc-400 select-none bg-zinc-100/50 dark:bg-zinc-900">
                                {req.category}
                              </span>
                              <h4 className="text-xs font-black text-black dark:text-white truncate leading-none">{req.title}</h4>
                              {getPriorityBadge(req.priority)}
                            </div>
                            {req.desc && <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-relaxed font-medium">{req.desc}</p>}
                          </div>

                          <Button
                            onClick={() => handleDeleteRequirement(req.id)}
                            size="icon"
                            variant="ghost"
                            className="size-7 rounded-none text-red-500 border border-zinc-200 dark:border-zinc-800 hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all shrink-0"
                            title="Remove requirement"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: COST PROJECTIONS */}
            {activeSubTab === 'costs' && (
              <div className="space-y-6">
                <div className="space-y-0.5">
                  <h2 className="text-lg font-black tracking-tight text-black dark:text-white">Cost Implications & Budgeting</h2>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium font-mono">Calculate estimated resource charges, API tolls, and hosting projections.</p>
                </div>

                {/* Cost Form */}
                <form onSubmit={handleAddCostItem} className="p-5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/10 space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-2">
                    <Calculator className="size-3.5 text-zinc-400" />
                    <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Add Cost Projections</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase">Service Name</label>
                      <Input
                        required
                        placeholder="e.g. Gemini SDK API usage"
                        value={costService}
                        onChange={(e) => setCostService(e.target.value)}
                        className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-none h-9 text-xs focus:ring-0 text-black dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase">Pricing Unit</label>
                      <Input
                        required
                        placeholder="e.g. per 1M tokens"
                        value={costMetric}
                        onChange={(e) => setCostMetric(e.target.value)}
                        className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-none h-9 text-xs focus:ring-0 text-black dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase">Unit Cost (USD)</label>
                      <Input
                        required
                        type="number"
                        step="0.0001"
                        min="0"
                        placeholder="0.00"
                        value={costUnit}
                        onChange={(e) => setCostUnit(e.target.value)}
                        className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-none h-9 text-xs focus:ring-0 text-black dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase">Projected Vol / Month</label>
                      <Input
                        required
                        type="number"
                        min="1"
                        placeholder="1"
                        value={costVolume}
                        onChange={(e) => setCostVolume(e.target.value)}
                        className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-none h-9 text-xs focus:ring-0 text-black dark:text-white"
                      />
                    </div>

                    <div className="text-[10px] font-mono text-zinc-400 pb-2">
                      Est. Total: <strong className="text-black dark:text-white">${((parseFloat(costUnit) || 0) * (parseInt(costVolume) || 1)).toFixed(2)}</strong> / mo
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button type="submit" className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-850 dark:hover:bg-zinc-150 rounded-none h-9 text-xs font-black gap-1">
                        <Plus className="size-3.5" /> Add Cost
                      </Button>
                    </div>
                  </div>
                </form>

                {/* Cost Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Budget Highlight */}
                  <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <DollarSign className="size-4 text-emerald-500" />
                        <span className="text-[9px] font-black  ">Projected OpEx Budget</span>
                      </div>
                      <p className="text-3xl font-black text-black dark:text-white tracking-tighter mt-2">${totalMonthlyCost.toFixed(2)}<span className="text-xs text-zinc-400 font-medium">/month</span></p>
                    </div>
                    <p className="text-[9.5px] text-zinc-400 leading-relaxed">Summarized total expenses based on active service projections.</p>
                  </div>

                  {/* List of items */}
                  <div className="md:col-span-2 space-y-3">
                    <h3 className="text-[10px] font-black text-zinc-400 tracking-widest uppercase">Projected Services ({localCosts.length})</h3>

                    {localCosts.length === 0 ? (
                      <div className="p-8 border border-dashed border-zinc-200 dark:border-zinc-800 text-center flex flex-col items-center justify-center gap-2">
                        <TrendingUp className="size-6 text-zinc-300" />
                        <p className="text-xs font-black text-zinc-400 uppercase">No projected service costs registered.</p>

                        {/* Seed helper */}
                        <div className="mt-4 w-full bg-zinc-50 dark:bg-zinc-900/40 p-4 border border-zinc-100 dark:border-zinc-900/60 text-left">
                          <span className="text-[9px] font-black text-zinc-500 uppercase flex items-center gap-1 mb-2">
                            <Info className="size-3" /> Quick add recommendations:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {commonServices.map((s, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  setCostService(s)
                                  setCostMetric('flat rate / mo')
                                  setCostUnit(s.includes('Gemini') ? '0.0075' : s.includes('Supabase') ? '25.00' : '20.00')
                                }}
                                className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors border border-zinc-200 dark:border-zinc-800 px-2 py-0.5"
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-zinc-250 dark:border-zinc-850 divide-y divide-zinc-250 dark:divide-zinc-850 overflow-hidden bg-white dark:bg-black/30">
                        {localCosts.map((item) => (
                          <div key={item.id} className="p-4 flex items-center justify-between group hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-all gap-4">
                            <div className="space-y-0.5 min-w-0">
                              <h4 className="text-xs font-black text-black dark:text-white truncate">{item.service}</h4>
                              <div className="flex items-center gap-2 text-[9px] text-zinc-400 font-mono">
                                <span>Unit: ${item.unitCost.toFixed(4)} ({item.metric})</span>
                                <span>•</span>
                                <span>Vol: {item.volume}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                              <span className="text-xs font-mono font-black text-black dark:text-white">
                                +${(item.unitCost * item.volume).toFixed(2)}
                              </span>

                              <Button
                                onClick={() => handleDeleteCostItem(item.id)}
                                size="icon"
                                variant="ghost"
                                className="size-7 rounded-none text-red-500 border border-zinc-200 dark:border-zinc-800 hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                                title="Remove cost item"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Main Export Card */}
            <div className="p-6 bg-black dark:bg-white space-y-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Package className="size-20 -mr-6 -mt-6 text-white dark:text-black" />
              </div>
              <div className="space-y-2 relative z-10">
                <h3 className="text-xl font-black text-white dark:text-black">System Blueprint</h3>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium leading-relaxed">
                  Export high-fidelity snapshot (.STEM) for external simulation.
                </p>
              </div>
              <Button onClick={handleExportBlueprint} disabled={isExporting} className="w-full bg-zinc-800 dark:bg-zinc-100 text-white dark:text-black hover:bg-zinc-700 dark:hover:bg-zinc-200 rounded-none h-11 text-xs font-black  ">
                {isExporting ? 'Packaging...' : 'Download Blueprint'}
              </Button>
            </div>

            {/* Generate Action */}
            <div className="p-6 border border-zinc-200 dark:border-zinc-800 space-y-4 bg-zinc-50/50 dark:bg-zinc-950/20">
              <div className="flex items-center gap-2">
                <h3 className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Auto-Maintenance</h3>
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-600 font-medium leading-relaxed">Refresh documentation based on latest architectural mutations.</p>
              <Button onClick={() => generateAutoSpecs(snapshot, currentProject?.name)} variant="outline" className="w-full border-zinc-200 dark:border-zinc-800 rounded-none h-10 text-[10px] font-black   hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all">
                Sync Documentation
              </Button>
            </div>

            {/* Asset Formats */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 px-1 tracking-widest uppercase">Asset Packages</h3>
              <div className="space-y-2">
                {alternativeFormats.map((format, i) => (
                  <button key={i} onClick={format.action} className="w-full flex items-center justify-between p-3 border border-zinc-100 dark:border-zinc-900 bg-white dark:bg-black/20 hover:border-black dark:hover:border-zinc-700 transition-all group/opt">
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 group-hover/opt:text-black dark:group-hover/opt:text-white  ">{format.label}</span>
                    <span className="text-[9px] font-mono text-zinc-300 dark:text-zinc-700">{format.ext}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* System Metrics */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 px-1 tracking-widest uppercase">System Metrics</h3>
              <div className="space-y-2">
                {stats.map((stat, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-zinc-100 dark:border-zinc-900 bg-white dark:bg-black/20 group">
                    <div className="flex items-center gap-3">
                      <stat.icon className="size-3.5 text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                      <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 tracking-tighter uppercase">{stat.label}</span>
                    </div>
                    <span className="text-xs font-black text-black dark:text-white font-mono">{stat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
