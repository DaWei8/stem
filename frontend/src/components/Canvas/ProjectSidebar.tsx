'use client'

import { useState, useRef } from 'react'
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
  ArrowRight,
  Send,
  Terminal,
  Play,
  Copy,
  Check,
  Loader2,
  MessageSquare
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
import { useSystemArchitect } from '@/hooks/useSystemArchitect'

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
    <aside className="w-80 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black flex flex-col h-full z-50 shadow-2xl transition-colors duration-300">
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
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-900 bg-white dark:bg-black flex items-center justify-between transition-colors">
        <div>
          <h2 className="text-lg font-bold text-black dark:text-white truncate max-w-[180px]">
            {page.title}
          </h2>
          <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">Screen Properties</span>
        </div>
        <Button
          variant="ghost"
          onClick={onDelete}
          className="size-8 p-0 text-zinc-400 dark:text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-colors rounded-lg"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <Tabs defaultValue="overview" className="flex-1 flex flex-col">
        <TabsList className="bg-white dark:bg-black px-4 border-b border-zinc-200 dark:border-zinc-900 h-12 w-full justify-start gap-4 rounded-none transition-colors">
          <TabsTrigger value="overview" className="data-[state=active]:text-black dark:data-[state=active]:text-white text-zinc-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest p-0 h-full border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white rounded-none bg-transparent">Overview</TabsTrigger>
          <TabsTrigger value="data" className="data-[state=active]:text-black dark:data-[state=active]:text-white text-zinc-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest p-0 h-full border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white rounded-none bg-transparent">Data</TabsTrigger>
          <TabsTrigger value="logic" className="data-[state=active]:text-black dark:data-[state=active]:text-white text-zinc-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest p-0 h-full border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white rounded-none bg-transparent">Logic</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <TabsContent value="overview" className="m-0 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest ">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white dark:bg-black/50 border-zinc-200 dark:border-zinc-800 rounded-lg h-11 text-xs focus:ring-1 focus:ring-black/10 dark:focus:ring-white/20 transition-all text-black dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest ">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-white dark:bg-black/50 border-zinc-200 dark:border-zinc-800 rounded-lg min-h-[100px] text-xs resize-none focus:ring-1 focus:ring-black/10 dark:focus:ring-white/20 transition-all text-black dark:text-white"
                />
              </div>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-lg h-11 text-xs font-bold transition-colors"
              >
                <Save className="size-3.5 mr-2" />
                {isSaving ? 'Updating...' : 'Save Changes'}
              </Button>
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-900 grid gap-3">
              <div className="p-4 bg-zinc-100 dark:bg-black/30 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-colors">
                <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-600 uppercase">Triggers</p>
                <p className="text-xl font-black text-black dark:text-white mt-1">{(page.actions || []).length}</p>
              </div>
            </div>

            {/* Flow Connections Section */}
            <div className="space-y-6 pt-6 border-t border-zinc-200 dark:border-zinc-900">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ArrowRight className="size-3 text-zinc-400 dark:text-zinc-600 rotate-180" />
                  <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Incoming Flows</span>
                </div>
                <div className="space-y-2">
                  {incomingScreens.length === 0 ? (
                    <p className="text-[10px] text-zinc-300 dark:text-zinc-700 italic px-1">No entry points defined</p>
                  ) : (
                    incomingScreens.map(s => (
                      <div
                        key={s.id}
                        onClick={() => onSelectScreen?.(s.id)}
                        className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-black dark:hover:border-zinc-600 cursor-pointer group transition-all"
                      >
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">{s.title}</span>
                        <ChevronRight className="size-3 text-zinc-300 dark:text-zinc-800 group-hover:text-zinc-500" />
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ArrowRight className="size-3 text-zinc-400 dark:text-zinc-600" />
                  <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Outgoing Flows</span>
                </div>
                <div className="space-y-2">
                  {outgoingScreens.length === 0 ? (
                    <p className="text-[10px] text-zinc-300 dark:text-zinc-700 italic px-1">Terminal screen (no exit paths)</p>
                  ) : (
                    outgoingScreens.map(s => (
                      <div
                        key={s.id}
                        onClick={() => onSelectScreen?.(s.id)}
                        className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-black dark:hover:border-zinc-600 cursor-pointer group transition-all"
                      >
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">{s.title}</span>
                        <ChevronRight className="size-3 text-zinc-300 dark:text-zinc-800 group-hover:text-zinc-500" />
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
                <div key={i.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-zinc-800 rounded-lg group transition-colors">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{i.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 bg-white dark:bg-black px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">{i.input_type}</span>
                    <button className="text-zinc-300 dark:text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="size-3" /></button>
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
                <div key={o.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-zinc-800 rounded-lg group transition-colors">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{o.name}</span>
                  <button className="text-zinc-300 dark:text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="size-3" /></button>
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
                  <div key={a.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-zinc-800 rounded-lg group transition-colors">
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{a.name}</span>
                    <button className="text-zinc-300 dark:text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="size-3" /></button>
                  </div>
                )}
              />

              <div className="pt-6 border-t border-zinc-200 dark:border-zinc-900 space-y-4">
                <div className="flex items-center gap-2">
                  <Code className="size-3 text-zinc-400 dark:text-zinc-500" />
                  <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Formal Logic</span>
                </div>
                <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden transition-colors">
                  <div className="px-3 py-1.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/50 flex items-center justify-between">
                    <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase">page_eval.wasm</span>
                    <div className="flex gap-1">
                      <div className="size-1.5 rounded-full bg-red-500/10 dark:bg-red-500/20 border border-red-500/20 dark:border-red-500/40" />
                      <div className="size-1.5 rounded-full bg-yellow-500/10 dark:bg-yellow-500/20 border border-yellow-500/20 dark:border-yellow-500/40" />
                      <div className="size-1.5 rounded-full bg-green-500/10 dark:bg-green-500/20 border border-green-500/20 dark:border-green-500/40" />
                    </div>
                  </div>
                  <pre className="p-4 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 leading-relaxed">
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

/* ── Project Overview View (with Chat Tab) ── */

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
  const [sidebarTab, setSidebarTab] = useState<'overview' | 'chat'>('overview')
  const [chatInput, setChatInput] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    isArchitecting,
    generateSystem,
    commitScript
  } = useSystemArchitect()

  const stats = useMemo(() => {
    return {
      inputs: inputs.length,
      outputs: outputs.length,
      triggers: actions.length
    }
  }, [inputs, actions, outputs])

  const filteredPages = pages.filter(p => (p.title || p.name || '').toLowerCase().includes(search.toLowerCase()))
  const filteredVariables = variables.filter(v => (v.name || '').toLowerCase().includes(search.toLowerCase()))

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || isArchitecting || !projectId) return
    const prompt = chatInput.trim()
    setChatInput('')
    useSystemArchitect.getState().addMessage({ role: 'user', content: prompt })
    generateSystem(prompt, projectId)
  }

  const handleCopy = (id: string, script: string) => {
    navigator.clipboard.writeText(script)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success('STEM-script copied')
  }

  const handleCommit = async (script: string) => {
    if (!projectId) return
    await commitScript(script, projectId)
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black transition-colors duration-300">
      {/* Header */}
      <div className="px-6 pt-6 pb-0 shrink-0 space-y-4">
        <div>
          <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500">Project Engine</span>
          <h2 className="text-lg font-bold text-black dark:text-white tracking-tight">System Blueprint</h2>
        </div>

        <Tabs value={sidebarTab} onValueChange={(v) => setSidebarTab(v as 'overview' | 'chat')} className="w-full">
          <TabsList variant="line" className="w-full justify-start border-b border-zinc-200 dark:border-zinc-800 p-0 h-10 transition-colors">
            <TabsTrigger value="overview" className="flex-1 px-0 text-xs font-black text-zinc-400 dark:text-zinc-500 data-[state=active]:text-black dark:data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex-1 px-0 text-xs font-black text-zinc-400 dark:text-zinc-500 data-[state=active]:text-black dark:data-[state=active]:text-white">
              Chat
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {sidebarTab === 'overview' ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="flex-1 overflow-y-auto p-6 pt-4 space-y-8 custom-scrollbar"
            >
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400 dark:text-zinc-600" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter system elements..."
                  className="bg-zinc-50 dark:bg-black/30 border-zinc-200 dark:border-zinc-800 h-9 pl-9 text-[11px] rounded-lg focus:ring-1 focus:ring-black/10 dark:focus:ring-white/10 text-black dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 transition-colors"
                />
              </div>

              {/* Resource Stats */}
              <div className="grid grid-cols-2 gap-3">
                <StatMini label="Screens" value={pages.length} icon={<Laptop className="size-3" />} />
                <StatMini label="Variables" value={variables.length} icon={<Fingerprint className="size-3" />} />
                <StatMini label="Components" value={components.length} icon={<Box className="size-3" />} />
                <StatMini label="Tokens" value={tokens.length} icon={<Settings2 className="size-3" />} />
                <StatMini label="Inputs" value={stats.inputs} icon={<Fingerprint className="size-3 text-blue-500" />} />
                <StatMini label="Outputs" value={stats.outputs} icon={<Database className="size-3 text-green-500" />} />
                <StatMini label="Triggers" value={stats.triggers} icon={<Zap className="size-3 text-purple-500" />} />
                <StatMini label="Logic" value="Verified" icon={<Code className="size-3 text-black dark:text-white" />} status="active" />
              </div>

              {/* Screens List */}
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
                          : "bg-black/5 border-zinc-300 hover:border-zinc-700"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "size-2 rounded-full transition-colors",
                          selectedNodeId?.includes(p.id) ? "bg-black dark:bg-white" : "bg-zinc-200 dark:bg-zinc-800 group-hover:bg-black dark:group-hover:bg-white"
                        )} />
                        <span className={cn(
                          "text-xs font-medium transition-colors",
                          selectedNodeId?.includes(p.id) ? "text-black dark:text-black" : "text-zinc-500 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-zinc-200"
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
                    <div key={v.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-zinc-900 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="size-2 rounded-none border border-zinc-300 dark:border-zinc-800" />
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{v.name || 'unnamed_var'}</span>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-700 uppercase">{v.type || 'unknown'}</span>
                    </div>
                  )}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4 space-y-5 custom-scrollbar scroll-smooth">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn(
                    "flex flex-col gap-2",
                    msg.role === 'user' ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "max-w-[90%] p-3.5 text-[11px] leading-relaxed font-medium rounded-lg shadow-sm transition-colors",
                      msg.role === 'user'
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "bg-zinc-100 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 backdrop-blur-md"
                    )}>
                      {msg.content}
                    </div>

                    {msg.script && (
                      <div className="w-full mt-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm transition-colors">
                        <div className="h-8 bg-zinc-50 dark:bg-zinc-900/80 flex items-center justify-between px-3 border-b border-zinc-200 dark:border-zinc-800">
                          <div className="flex items-center gap-2">
                            <Terminal className="size-3 text-zinc-400 dark:text-zinc-500" />
                            <span className="text-[9px] font-black uppercase text-zinc-500 dark:text-zinc-400 tracking-widest">STEM-script</span>
                          </div>
                          <button
                            onClick={() => handleCopy(msg.id, msg.script!)}
                            className="p-1 hover:text-white text-zinc-500 transition-colors"
                          >
                            {copiedId === msg.id ? <Check className="size-3" /> : <Copy className="size-3" />}
                          </button>
                        </div>
                        <pre className="p-3 text-[10px] font-mono text-emerald-600 dark:text-green-400 overflow-x-auto selection:bg-emerald-500/10 dark:selection:bg-green-500/20 max-h-[200px] transition-colors">
                          <code>{msg.script}</code>
                        </pre>
                        <button
                          onClick={() => handleCommit(msg.script!)}
                          className="w-full h-9 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-[0.98] border-t border-zinc-200 dark:border-zinc-800"
                        >
                          <Play className="size-3" />
                          Commit Architecture
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {isArchitecting && (
                  <div className="flex flex-col items-start">
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-3.5 flex items-center gap-3 rounded-lg backdrop-blur-sm transition-colors">
                      <Loader2 className="size-3.5 animate-spin text-black dark:text-white" />
                      <span className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400 tracking-widest animate-pulse">Synthesizing...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 bg-zinc-100 dark:bg-zinc-900/30 border-t border-zinc-200 dark:border-zinc-800 shrink-0 transition-colors">
                <form onSubmit={handleChatSubmit} className="relative">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Define architectural intent..."
                    className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-lg h-11 pr-12 text-xs focus:border-black dark:focus:border-white transition-all text-black dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 font-medium"
                  />
                  <Button
                    type="submit"
                    disabled={isArchitecting || !chatInput.trim()}
                    className="absolute right-1 top-1 size-9 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 p-0 transition-all active:scale-95"
                  >
                    <Send className="size-4" />
                  </Button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
          <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{title}</span>
        </div>
        <button onClick={onAdd} className="size-5 rounded-md border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/20 transition-all">
          <Plus className="size-3" />
        </button>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="py-8 border border-dashed border-zinc-200 dark:border-zinc-900 rounded-xl flex flex-center justify-center">
            <span className="text-[10px] text-zinc-300 dark:text-zinc-700 font-medium italic">Empty</span>
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
        <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-600">{title}</h3>
        <span className="text-[10px] font-mono text-zinc-300 dark:text-zinc-200">({count})</span>
      </div>
      <div className="space-y-2">
        {displayItems.map(renderItem)}
        {items.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full py-2 text-[10px] font-bold text-zinc-400 dark:text-zinc-600 hover:text-black dark:hover:text-white transition-colors"
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
    <div className="p-3 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-900 rounded-xl space-y-2 relative overflow-hidden group hover:border-black dark:hover:border-zinc-700 transition-all">
      {status === 'active' && <div className="absolute top-2 right-2 size-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />}
      <div className="text-zinc-400 dark:text-zinc-600 group-hover:text-black dark:group-hover:text-zinc-400 transition-colors">{icon}</div>
      <div>
        <p className="text-xs font-black text-black dark:text-white">{value}</p>
        <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-tighter">{label}</p>
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
