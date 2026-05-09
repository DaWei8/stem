'use client'

import { useState } from 'react'
import {
  Fingerprint,
  Zap,
  Database,
  Settings2,
  Code,
  Layout,
  Box,
  ChevronRight,
  Search,
  Plus,
  Trash2,
  Save,
  Laptop,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDesignSystem } from '@/hooks/useDesignSystem'
import { ScreenInput, ScreenAction, ScreenOutput } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useMemo } from 'react'
import { usePages } from '@/hooks/usePages'
import { useVariables } from '@/hooks/useVariables'

interface ProjectSidebarProps {
  selectedNode: any | null
  projectId: string
  onSelectScreen?: (pageId: string) => void
  onTriggerDelete?: (pageId: string) => void
}

export function ProjectSidebar({ selectedNode, projectId, onSelectScreen, onTriggerDelete }: ProjectSidebarProps) {
  const {
    pages,
    inputs: allInputs,
    actions: allActions,
    outputs: allOutputs,
    transitions: allTransitions,
    updatePage,
    addInput,
    addAction,
    addOutput
  } = usePages()
  const { variables: availableVariables } = useVariables()
  const { components, fetchComponents, tokens, fetchTokens } = useDesignSystem()

  useEffect(() => {
    if (projectId) {
      fetchComponents(projectId)
      fetchTokens(projectId)
    }
  }, [projectId, fetchComponents, fetchTokens])

  const selectedPage = useMemo(() => {
    if (!selectedNode) return null
    const page = pages.find(p => p.id === selectedNode.data.page_id)
    if (!page) return null

    return {
      ...page,
      inputs: allInputs.filter(i => i.page_id === page.id),
      actions: allActions.filter(a => a.page_id === page.id),
      outputs: allOutputs.filter(o => o.page_id === page.id)
    }
  }, [selectedNode, pages, allInputs, allActions, allOutputs])

  return (
    <aside className="w-80 border-l border-zinc-800 bg-black flex flex-col h-full z-50 shadow-2xl">
      <AnimatePresence mode="wait">
        {selectedPage ? (
          <ScreenDetails
            key={selectedPage.id}
            page={selectedPage}
            allPages={pages}
            transitions={allTransitions}
            availableVariables={availableVariables}
            updatePage={updatePage}
            addInput={addInput}
            addAction={addAction}
            addOutput={addOutput}
            onSelectScreen={onSelectScreen}
            onDelete={() => onTriggerDelete?.(selectedPage.id)}
          />
        ) : (
          <ProjectOverview
            key="project-overview"
            pages={pages}
            variables={availableVariables}
            components={components}
            tokens={tokens}
            inputs={allInputs}
            actions={allActions}
            outputs={allOutputs}
            projectId={projectId}
            onSelectScreen={onSelectScreen}
            onDeleteScreen={(id: string) => onTriggerDelete?.(id)}
            selectedNodeId={selectedNode?.id}
          />
        )}
      </AnimatePresence>
    </aside>
  )
}

/* ── Screen Details View ── */

function ScreenDetails({
  page,
  allPages,
  transitions,
  availableVariables,
  updatePage,
  addInput,
  addAction,
  addOutput,
  onSelectScreen,
  onDelete
}: {
  page: any
  allPages: any[]
  transitions: any[]
  availableVariables: any[]
  updatePage: any
  addInput: any
  addAction: any
  addOutput: any
  onSelectScreen?: (id: string) => void
  onDelete: () => void
}) {
  const [title, setTitle] = useState(page.title)
  const [description, setDescription] = useState(page.description || '')
  const [isSaving, setIsSaving] = useState(false)

  const incomingScreens = useMemo(() => {
    const screens = transitions
      .filter(t => t.to_page_id === page.id)
      .map(t => allPages.find(p => p.id === t.from_page_id))
      .filter(Boolean)
    
    // Unique by ID to avoid duplicate keys
    return Array.from(new Map(screens.map(s => [s.id, s])).values())
  }, [transitions, page.id, allPages])

  const outgoingScreens = useMemo(() => {
    const screens = transitions
      .filter(t => t.from_page_id === page.id)
      .map(t => allPages.find(p => p.id === t.to_page_id))
      .filter(Boolean)
    
    // Unique by ID to avoid duplicate keys
    return Array.from(new Map(screens.map(s => [s.id, s])).values())
  }, [transitions, page.id, allPages])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updatePage(page.id, { title, description })
      toast.success('Screen updated')
    } catch (err) {
      toast.error('Failed to update')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddInput = () => {
    if (availableVariables.length === 0) {
      toast.error('Define variables in the Registry first.')
      return
    }
    addInput(page.id, {
      name: `input_${(page.inputs || []).length + 1}`,
      input_type: 'form_field',
      variable_id: availableVariables[0].id
    })
  }

  return (
    <div
      className="flex flex-col h-full"
    >
      <div className="p-6 border-b border-zinc-900 bg-black flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white truncate max-w-[180px]">
            {page.title}
          </h2>
          <span className="text-xs font-bold text-zinc-500">Screen Properties</span>
        </div>
        <Button
          variant="ghost"
          onClick={onDelete}
          className="size-8 p-0 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-colors rounded-lg"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <Tabs defaultValue="overview" className="flex-1 flex flex-col">
        <TabsList className="bg-black px-4 border-b border-zinc-900 h-12 w-full justify-start gap-4 rounded-none">
          <TabsTrigger value="overview" className="data-[state=active]:text-white text-zinc-500 text-[10px] font-bold uppercase tracking-widest p-0 h-full border-b-2 border-transparent data-[state=active]:border-white rounded-none bg-transparent">Overview</TabsTrigger>
          <TabsTrigger value="data" className="data-[state=active]:text-white text-zinc-500 text-[10px] font-bold uppercase tracking-widest p-0 h-full border-b-2 border-transparent data-[state=active]:border-white rounded-none bg-transparent">Data</TabsTrigger>
          <TabsTrigger value="logic" className="data-[state=active]:text-white text-zinc-500 text-[10px] font-bold uppercase tracking-widest p-0 h-full border-b-2 border-transparent data-[state=active]:border-white rounded-none bg-transparent">Logic</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <TabsContent value="overview" className="m-0 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-black/50 border-zinc-800 rounded-lg h-11 text-xs focus:ring-1 focus:ring-white/20 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-black/50 border-zinc-800 rounded-lg min-h-[100px] text-xs resize-none focus:ring-1 focus:ring-white/20 transition-all"
                />
              </div>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-white text-black hover:bg-zinc-200 rounded-lg h-11 text-xs font-bold"
              >
                <Save className="size-3.5 mr-2" />
                {isSaving ? 'Updating...' : 'Save Changes'}
              </Button>
            </div>

            <div className="pt-4 border-t border-zinc-900 grid gap-3">
              <div className="p-4 bg-black/30 border border-zinc-800 rounded-xl">
                <p className="text-[9px] font-bold text-zinc-600 uppercase">Triggers</p>
                <p className="text-xl font-black text-white mt-1">{(page.actions || []).length}</p>
              </div>
            </div>

            {/* Flow Connections Section */}
            <div className="space-y-6 pt-6 border-t border-zinc-900">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ArrowRight className="size-3 text-zinc-600 rotate-180" />
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Incoming Flows</span>
                </div>
                <div className="space-y-2">
                  {incomingScreens.length === 0 ? (
                    <p className="text-[10px] text-zinc-700 italic px-1">No entry points defined</p>
                  ) : (
                    incomingScreens.map(s => (
                      <div
                        key={s.id}
                        onClick={() => onSelectScreen?.(s.id)}
                        className="flex items-center justify-between p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg hover:border-zinc-600 cursor-pointer group transition-all"
                      >
                        <span className="text-xs font-medium text-zinc-400 group-hover:text-white transition-colors">{s.title}</span>
                        <ChevronRight className="size-3 text-zinc-800 group-hover:text-zinc-500" />
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ArrowRight className="size-3 text-zinc-600" />
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Outgoing Flows</span>
                </div>
                <div className="space-y-2">
                  {outgoingScreens.length === 0 ? (
                    <p className="text-[10px] text-zinc-700 italic px-1">Terminal screen (no exit paths)</p>
                  ) : (
                    outgoingScreens.map(s => (
                      <div
                        key={s.id}
                        onClick={() => onSelectScreen?.(s.id)}
                        className="flex items-center justify-between p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg hover:border-zinc-600 cursor-pointer group transition-all"
                      >
                        <span className="text-xs font-medium text-zinc-400 group-hover:text-white transition-colors">{s.title}</span>
                        <ChevronRight className="size-3 text-zinc-800 group-hover:text-zinc-500" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="data" className="m-0 space-y-8">
            <SidebarSection
              title="Incoming Data"
              icon={<Fingerprint className="size-3" />}
              onAdd={handleAddInput}
              items={page.inputs || []}
              renderItem={(i) => (
                <div key={i.id} className="flex items-center justify-between p-3 bg-black/30 border border-zinc-800 rounded-lg group">
                  <span className="text-xs font-medium text-zinc-300">{i.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-zinc-500 bg-black px-1.5 py-0.5 rounded border border-zinc-800">{i.input_type}</span>
                    <button className="text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="size-3" /></button>
                  </div>
                </div>
              )}
            />

            <SidebarSection
              title="State Mutations"
              icon={<Database className="size-3" />}
              onAdd={() => addOutput(page.id, { name: `output_${(page.outputs || []).length + 1}`, output_type: 'state_update' })}
              items={page.outputs || []}
              renderItem={(o) => (
                <div key={o.id} className="flex items-center justify-between p-3 bg-black/30 border border-zinc-800 rounded-lg group">
                  <span className="text-xs font-medium text-zinc-300">{o.name}</span>
                  <button className="text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="size-3" /></button>
                </div>
              )}
            />
          </TabsContent>

          <TabsContent value="logic" className="m-0 space-y-6">
            <div className="space-y-4">
              <SidebarSection
                title="Active Triggers"
                icon={<Zap className="size-3" />}
                onAdd={() => addAction(page.id, { name: `trigger_${(page.actions || []).length + 1}`, action_type: 'function_call' })}
                items={page.actions || []}
                renderItem={(a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 bg-black/30 border border-zinc-800 rounded-lg group">
                    <span className="text-xs font-medium text-zinc-300">{a.name}</span>
                    <button className="text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="size-3" /></button>
                  </div>
                )}
              />

              <div className="pt-6 border-t border-zinc-900 space-y-4">
                <div className="flex items-center gap-2">
                  <Code className="size-3 text-zinc-500" />
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Formal Logic</span>
                </div>
                <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden">
                  <div className="px-3 py-1.5 border-b border-zinc-800 bg-black/50 flex items-center justify-between">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">page_eval.wasm</span>
                    <div className="flex gap-1">
                      <div className="size-1.5 rounded-full bg-red-500/20 border border-red-500/40" />
                      <div className="size-1.5 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
                      <div className="size-1.5 rounded-full bg-green-500/20 border border-green-500/40" />
                    </div>
                  </div>
                  <pre className="p-4 text-[10px] font-mono text-zinc-500 leading-relaxed">
                    <code>{`fn evaluate() {
  // deterministic check
  if state.valid() {
    return ok();
  }
}`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

/* ── Project Overview View ── */

function ProjectOverview({
  pages,
  variables,
  components,
  tokens,
  inputs,
  actions,
  outputs,
  projectId,
  onSelectScreen,
  onDeleteScreen,
  selectedNodeId
}: {
  pages: any[]
  variables: any[]
  components: any[]
  tokens: any[]
  inputs: any[]
  actions: any[]
  outputs: any[]
  projectId: string
  onSelectScreen?: (id: string) => void
  onDeleteScreen?: (id: string) => void
  selectedNodeId: string | undefined
}) {
  const [search, setSearch] = useState('')

  const stats = useMemo(() => {
    return {
      inputs: inputs.length,
      outputs: outputs.length,
      triggers: actions.length
    }
  }, [inputs, actions, outputs])

  const filteredPages = pages.filter(p => (p.title || p.name || '').toLowerCase().includes(search.toLowerCase()))
  const filteredVariables = variables.filter(v => (v.name || '').toLowerCase().includes(search.toLowerCase()))

  return (
    <div
      className="flex flex-col h-full"
    >
      <div className="p-6 border-b border-zinc-900 bg-black">
        <span className="text-xs font-bold text-zinc-500">Project Engine</span>
        <h2 className="text-lg font-bold text-white tracking-tight">System Blueprint</h2>

        <div className="mt-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-600" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter system elements..."
            className="bg-black/30 border-zinc-800 h-9 pl-9 text-[11px] rounded-lg focus:ring-1 focus:ring-white/10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
        {/* Resource Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatMini label="Screens" value={pages.length} icon={<Laptop className="size-3" />} />
          <StatMini label="Variables" value={variables.length} icon={<Fingerprint className="size-3" />} />
          <StatMini label="Components" value={components.length} icon={<Box className="size-3" />} />
          <StatMini label="Tokens" value={tokens.length} icon={<Settings2 className="size-3" />} />
          <StatMini label="Inputs" value={stats.inputs} icon={<Fingerprint className="size-3 text-blue-500" />} />
          <StatMini label="Outputs" value={stats.outputs} icon={<Database className="size-3 text-green-500" />} />
          <StatMini label="Triggers" value={stats.triggers} icon={<Zap className="size-3 text-purple-500" />} />
          <StatMini label="Logic" value="Verified" icon={<Code className="size-3 text-white" />} status="active" />
        </div>

        {/* Component List */}
        <div className="space-y-6">
          <OverviewSection
            title="Active Screens"
            count={filteredPages.length}
            items={filteredPages}
            renderItem={(p) => (
              <div
                key={p.id}
                onClick={() => onSelectScreen?.(p.id)}
                className={cn(
                  "flex items-center justify-between p-3 border rounded-lg group transition-all cursor-pointer",
                  selectedNodeId?.includes(p.id)
                    ? "bg-white border-white"
                    : "bg-black/20 border-zinc-900 hover:border-zinc-700"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "size-2 rounded-full transition-colors",
                    selectedNodeId?.includes(p.id) ? "bg-black" : "bg-zinc-800 group-hover:bg-white"
                  )} />
                  <span className={cn(
                    "text-xs font-medium transition-colors",
                    selectedNodeId?.includes(p.id) ? "text-black" : "text-zinc-400 group-hover:text-zinc-200"
                  )}>{p.title || p.name || 'Untitled'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteScreen?.(p.id);
                    }}
                    className={cn(
                      "size-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-md",
                      selectedNodeId?.includes(p.id) ? "text-black/40 hover:text-red-600 hover:bg-black/5" : "text-zinc-700 hover:text-red-500 hover:bg-red-500/10"
                    )}
                  >
                    <Trash2 className="size-3" />
                  </button>
                  <ChevronRight className={cn(
                    "size-3 transition-colors",
                    selectedNodeId?.includes(p.id) ? "text-black" : "text-zinc-800 group-hover:text-zinc-500"
                  )} />
                </div>
              </div>
            )}
          />

          <OverviewSection
            title="Global Variables"
            count={filteredVariables.length}
            items={filteredVariables}
            renderItem={(v) => (
              <div key={v.id} className="flex items-center justify-between p-3 bg-black/20 border border-zinc-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="size-2 rounded-none border border-zinc-800" />
                  <span className="text-xs font-medium text-zinc-500">{v.name || 'unnamed_var'}</span>
                </div>
                <span className="text-[9px] font-mono text-zinc-700 uppercase">{v.type || 'unknown'}</span>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  )
}

/* ── Helpers ── */

function SidebarSection({ title, icon, onAdd, items, renderItem }: { title: string; icon: React.ReactNode; onAdd: () => void; items: any[]; renderItem: (item: any) => React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{title}</span>
        </div>
        <button onClick={onAdd} className="size-5 rounded-md border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-white/20 transition-all">
          <Plus className="size-3" />
        </button>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="py-8 border border-dashed border-zinc-900 rounded-xl flex flex-center justify-center">
            <span className="text-[10px] text-zinc-700 font-medium italic">Empty</span>
          </div>
        ) : (
          items.map(renderItem)
        )}
      </div>
    </div>
  )
}

function OverviewSection({ title, count, items, renderItem }: { title: string; count: number; items: any[]; renderItem: (item: any) => React.ReactNode }) {
  const [showAll, setShowAll] = useState(false)
  if (items.length === 0) return null

  const displayItems = showAll ? items : items.slice(0, 5)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">{title}</h3>
        <span className="text-[10px] font-mono text-zinc-200">({count})</span>
      </div>
      <div className="space-y-2">
        {displayItems.map(renderItem)}
        {items.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full py-2 text-[10px] font-bold text-zinc-600 hover:text-white transition-colors"
          >
            {showAll ? 'Show less' : `View all ${items.length}...`}
          </button>
        )}
      </div>
    </div>
  )
}

function StatMini({ label, value, icon, status }: { label: string; value: any; icon: React.ReactNode; status?: 'active' }) {
  return (
    <div className="p-3 bg-black border border-zinc-900 rounded-xl space-y-2 relative overflow-hidden group hover:border-zinc-700 transition-all">
      {status === 'active' && <div className="absolute top-2 right-2 size-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />}
      <div className="text-zinc-600 group-hover:text-zinc-400 transition-colors">{icon}</div>
      <div>
        <p className="text-xs font-black text-white">{value}</p>
        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">{label}</p>
      </div>
    </div>
  )
}

function ShieldAlert(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  )
}
