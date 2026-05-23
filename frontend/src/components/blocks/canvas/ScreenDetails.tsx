'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Markdown } from '@/components/ui/Markdown'
import { StandardModal } from '@/components/ui/StandardModal'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDatabase } from '@/hooks/useDatabase'
import { useIdentity } from '@/hooks/useIdentity'
import { useLogic } from '@/hooks/useLogic'
import { usePages } from '@/hooks/usePages'
import { useSystemArchitect } from '@/hooks/useSystemArchitect'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  ChevronRight,
  Copy,
  Database,
  ExternalLink,
  Fingerprint,
  Folder,
  Globe,
  Loader2, Lock,
  Save,
  Send,
  Shield,
  ShieldCheck, Terminal,
  Trash2,
  Unlock,
  Zap,
  X,
  Play
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { EditActionModal } from './EditActionModal'
import { EditInputModal } from './EditInputModal'
import { EditOutputModal } from './EditOutputModal'
import { EditConstraintModal } from './EditConstraintModal'
import { SidebarSection } from './helpers'

interface Props {
  page: any
  allPages: any[]
  transitions: any[]
  availableVariables: any[]
  updatePage: any
  addInput: any
  addAction: any
  addOutput: any
  updateInput: any
  updateOutput: any
  updateAction: any
  removeInput: any
  removeOutput: any
  removeAction: any
  onSelectScreen?: (id: string) => void
  onDelete: () => void
}

export function ScreenDetails({
  page, allPages, transitions, availableVariables, updatePage, addInput, addAction, addOutput,
  updateInput, updateOutput, updateAction, removeInput, removeOutput, removeAction,
  onSelectScreen, onDelete
}: Props) {
  const { columns, tables } = useDatabase()
  const { policies, userTypes } = useIdentity()

  const [title, setTitle] = useState(page.title)
  const [folder, setFolder] = useState(page.folder || '')
  const [liveUrl, setLiveUrl] = useState(page.live_url || '')
  const [allowedRoles, setAllowedRoles] = useState<string[]>(page.allowed_roles || [])
  const [isSaving, setIsSaving] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [editingInput, setEditingInput] = useState<any>(null)
  const [editingOutput, setEditingOutput] = useState<any>(null)
  const [editingAction, setEditingAction] = useState<any>(null)
  const [editingConstraint, setEditingConstraint] = useState<any>(null)

  const constraints = usePages(s => s.constraints)
  const addConstraint = usePages(s => s.addConstraint)
  const updateConstraint = usePages(s => s.updateConstraint)
  const removeConstraint = usePages(s => s.removeConstraint)

  const { constants, functions: availableFunctions, fetchLogicData } = useLogic()
  const { messages, isArchitecting, generateSystem, commitScript, rejectScript, restoreScript, addMessage } = useSystemArchitect()
  const projectId = page.project_id

  useEffect(() => {
    if (projectId) {
      fetchLogicData(projectId)
    }
  }, [projectId, fetchLogicData])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || isArchitecting || !projectId) return
    const prompt = chatInput.trim()
    setChatInput('')
    addMessage({ role: 'user', content: prompt })
    generateSystem(prompt, projectId)
  }

  const handleCopy = (id: string, script: string) => {
    navigator.clipboard.writeText(script); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); toast.success('STEM-script copied')
  }

  const incomingScreens = useMemo(() => {
    const screens = transitions.filter(t => t.to_page_id === page.id).map(t => allPages.find(p => p.id === t.from_page_id)).filter(Boolean)
    return Array.from(new Map(screens.map(s => [s.id, s])).values())
  }, [transitions, page.id, allPages])

  const outgoingScreens = useMemo(() => {
    const screens = transitions.filter(t => t.from_page_id === page.id).map(t => allPages.find(p => p.id === t.to_page_id)).filter(Boolean)
    return Array.from(new Map(screens.map(s => [s.id, s])).values())
  }, [transitions, page.id, allPages])

  const pageConstraints = useMemo(() => {
    return constraints.filter(c => c.page_id === page.id)
  }, [constraints, page.id])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updatePage(page.id, { title, folder, live_url: liveUrl || null, allowed_roles: allowedRoles })
      toast.success('Architecture updated')
    } catch (err) {
      toast.error('Update failed')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-black overflow-hidden border-l border-zinc-200 dark:border-zinc-800 shadow-2xl">
      {/* Header */}
      <header className="p-6 bg-white dark:bg-black/50 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-xl font-black text-black dark:text-white tracking-tighter truncate max-w-[200px]">{page.title}</h2>
          <span className="text-[10px] font-black text-zinc-400 ">Screen Context</span>
        </div>
        <Button variant="ghost" onClick={onDelete} className="size-9 p-0 text-zinc-400 hover:text-red-500 hover:bg-red-500/5 transition-all">
          <Trash2 className="size-4" />
        </Button>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <TabsList className="grid grid-cols-2 w-full bg-zinc-100 dark:bg-zinc-950 p-1 h-12 rounded-none border-b border-zinc-200 dark:border-zinc-800">
          <TabsTrigger value="overview">Properties</TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Zap className="size-3" />
            AI Architect
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden relative">
          <Button onClick={handleSave} disabled={isSaving} className="w-full absolute bottom-0 left-0 z-10 bg-black dark:bg-white text-white dark:text-black rounded-none h-12 text-[10px] font-black  shadow-lg hover:scale-[1.02] transition-all">
            <Save className="size-3.5 mr-2" /> {isSaving ? 'Synchronizing...' : 'Save Architecture'}
          </Button>
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="absolute inset-0 overflow-y-auto p-6 space-y-6 custom-scrollbar m-0"
              >
                {/* Core Properties */}
                <section className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-zinc-400  ml-1">Title</label>
                      <Input value={title} onChange={e => setTitle(e.target.value)} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-none h-12 text-xs font-bold shadow-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-zinc-400  ml-1">Architectural Folder</label>
                      <div className="relative group">
                        <Folder className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                        <Input value={folder} onChange={e => setFolder(e.target.value)} placeholder="Auth Flow, Dashboard..." className="pl-10 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-none h-12 text-xs font-bold shadow-sm" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-zinc-400  ml-1">Live URL</label>
                      <div className="relative group">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                        <Input value={liveUrl} onChange={e => setLiveUrl(e.target.value)} placeholder="www.example.com/page" className="pl-10 pr-10 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-none h-12 text-xs font-bold font-mono shadow-sm" />
                        {liveUrl && (
                          <button
                            onClick={() => {
                              const fullUrl = liveUrl.startsWith('http') ? liveUrl : `https://${liveUrl}`
                              window.open(fullUrl, '_blank', 'noopener,noreferrer')
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-emerald-500 transition-colors"
                          >
                            <ExternalLink className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Page Governance */}
                <section className="space-y-6 pt-10 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-8 bg-red-500/10 flex items-center justify-center">
                        <Shield className="size-4 text-red-500" />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-[10px] font-medium text-black dark:text-white  tracking-tight">Access Constraints</h3>
                      </div>
                    </div>
                    {allowedRoles.length === 0 ? (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 text-green-500 border border-green-500/20">
                        <Unlock className="size-2.5" />
                        <span className="text-[8px] font-black ">Public Access</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 text-red-500 border border-red-500/20">
                        <Lock className="size-2.5" />
                        <span className="text-[8px] font-black ">Restricted ({allowedRoles.length})</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-400 ml-1">Allowed User Types</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {userTypes.map(ut => {
                        const isSelected = allowedRoles.includes(ut.id)
                        return (
                          <button
                            key={ut.id}
                            onClick={() => {
                              if (isSelected) {
                                setAllowedRoles(allowedRoles.filter(r => r !== ut.id))
                              } else {
                                setAllowedRoles([...allowedRoles, ut.id])
                              }
                            }}
                            className={cn(
                              "flex items-center justify-between p-3 border transition-all text-left group",
                              isSelected
                                ? "bg-black dark:bg-white border-black dark:border-white text-white dark:text-black"
                                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-zinc-400"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "size-1.5 rounded-full",
                                isSelected ? "bg-white dark:bg-black" : "bg-zinc-200 dark:bg-zinc-800 group-hover:bg-zinc-400"
                              )} />
                              <span className="text-[10px] font-black  tracking-tight">{ut.name}</span>
                            </div>
                            {isSelected && <Check className="size-3" />}
                          </button>
                        )
                      })}
                      {userTypes.length === 0 && (
                        <div className="p-4 border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                          <p className="text-[10px] text-zinc-400 font-bold italic">No User Types defined in Identity Pillar</p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Logic Constraints */}
                <section className="space-y-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                  <SidebarSection
                    title="Logic Constraints"
                    icon={<Shield className="size-3.5 text-red-500" />}
                    onAdd={() => setEditingConstraint({})}
                    items={pageConstraints}
                    renderItem={(c) => {
                      const variable = availableVariables.find(v => v.id === c.variable_id)
                      const fallbackPage = allPages.find(p => p.id === c.fallback_page_id)
                      return (
                        <div
                          key={c.id}
                          onClick={() => setEditingConstraint(c)}
                          className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none space-y-2 group shadow-sm hover:border-red-500/50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-black dark:text-white font-mono tracking-tight">
                              {variable?.label || 'Unknown'} {c.operator} {c.expected_value !== undefined ? (typeof c.expected_value === 'object' ? JSON.stringify(c.expected_value) : String(c.expected_value)) : ''}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (confirm('Delete this logical constraint?')) {
                                  removeConstraint(c.id)
                                }
                              }}
                              className="text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                          {c.error_message && (
                            <p className="text-[9px] text-zinc-400 italic">"{c.error_message}"</p>
                          )}
                          {fallbackPage && (
                            <div className="text-[8px] font-bold text-red-500 flex items-center gap-1">
                              <span>Redirect:</span>
                              <span className="font-mono">{fallbackPage.title || fallbackPage.name}</span>
                            </div>
                          )}
                        </div>
                      )
                    }}
                  />
                </section>

                {/* Data Context */}
                <div className="space-y-10 pt-10 border-t border-zinc-200 dark:border-zinc-800">
                  <SidebarSection
                    title="Input Interfaces"
                    icon={<Fingerprint className="size-3.5 text-blue-500" />}
                    onAdd={() => addInput(page.id, { name: `input_${(page.inputs || []).length + 1}`, input_type: 'form_field', variable_id: availableVariables[0]?.id })}
                    items={page.inputs || []}
                    renderItem={(i) => {
                      const variable = availableVariables.find(v => v.id === i.variable_id)
                      const linkedCol = columns.find(c => c.variable_id === i.variable_id)
                      const table = tables.find(t => t.id === linkedCol?.table_id)
                      const tablePolicies = table ? policies.filter(p => p.table_id === table.id) : []

                      return (
                        <div key={i.id} onClick={() => setEditingInput(i)} className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none space-y-4 group shadow-sm hover:border-blue-500/50 cursor-pointer transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-black dark:text-white  font-mono tracking-tight">
                              {i.name} {i.is_required && <span className="text-red-500 text-[8px] font-black uppercase ml-1">Required</span>}
                            </span>
                            <button onClick={(e) => { e.stopPropagation(); if (confirm(`Delete input "${i.name}"?`)) removeInput(i.id) }} className="text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="size-3.5" /></button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="text-[9px] font-black px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50">
                              {variable?.label || 'Transient'}
                            </span>
                            {table && (
                              <span className="text-[9px] font-black px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50">
                                Persistent: {table.name}
                              </span>
                            )}
                          </div>
                          {tablePolicies.length > 0 && (
                            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="size-3 text-red-500" />
                                <span className="text-[9px] font-black text-zinc-400 ">Governance (RLS)</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {tablePolicies.map(p => (
                                  <div key={p.id} className="text-[8px] font-black bg-zinc-50 dark:bg-black px-2 py-1 border border-zinc-200 dark:border-zinc-800 text-zinc-500  tracking-tight">
                                    {p.name}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    }}
                  />

                  <SidebarSection
                    title="State Mutations"
                    icon={<Database className="size-3.5 text-emerald-500" />}
                    onAdd={() => addOutput(page.id, { name: `output_${(page.outputs || []).length + 1}`, output_type: 'state_update' })}
                    items={page.outputs || []}
                    renderItem={(o) => (
                      <div key={o.id} onClick={() => setEditingOutput(o)} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none group shadow-sm transition-colors hover:border-emerald-500/50 cursor-pointer">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] font-black text-zinc-600 dark:text-zinc-400  font-mono">{o.name}</span>
                          {o.variable_id && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 self-start">
                              Linked: {availableVariables.find(v => v.id === o.variable_id)?.label || 'Variable'}
                            </span>
                          )}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); if (confirm(`Delete output "${o.name}"?`)) removeOutput(o.id) }} className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-colors"><Trash2 className="size-3.5" /></button>
                      </div>
                    )}
                  />

                  <SidebarSection
                    title="Active Triggers"
                    icon={<Zap className="size-3.5 text-purple-500" />}
                    onAdd={() => addAction(page.id, { name: `trigger_${(page.actions || []).length + 1}`, action_type: 'function_call' })}
                    items={page.actions || []}
                    renderItem={(a) => {
                      const linkedFunc = availableFunctions.find(f => f.id === a.function_id)
                      return (
                        <div key={a.id} onClick={() => setEditingAction(a)} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none group shadow-sm transition-colors hover:border-amber-500/50 cursor-pointer">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[11px] font-black text-zinc-600 dark:text-zinc-400 font-mono">{a.name}</span>
                            {linkedFunc ? (
                              <span className="text-[9px] font-black px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/50 self-start">
                                Call: {linkedFunc.name}()
                              </span>
                            ) : (
                              <span className="text-[9px] font-black px-1.5 py-0.5 bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border border-zinc-200 dark:border-zinc-800 self-start">
                                Pure Frontend
                              </span>
                            )}
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); if (confirm(`Delete trigger "${a.name}"?`)) removeAction(a.id) }} className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-colors"><Trash2 className="size-3.5" /></button>
                        </div>
                      )
                    }}
                  />
                </div>

                {/* Behavioral Flows */}
                <div className="space-y-10 pt-10 border-t border-zinc-200 dark:border-zinc-800 pb-10">
                  <FlowSection icon={<ArrowRight className="size-3.5 rotate-180 text-blue-500" />} title="Incoming" screens={incomingScreens} onSelect={onSelectScreen} />
                  <FlowSection icon={<ArrowRight className="size-3.5 text-emerald-500" />} title="Outgoing" screens={outgoingScreens} onSelect={onSelectScreen} />
                </div>
              </motion.div>
            )}

            {activeTab === 'ai' && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="absolute inset-0 flex flex-col overflow-hidden m-0"
              >
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-zinc-50 dark:bg-black/30">
                  {messages.map(msg => (
                    <MessageBubble
                      key={msg.id}
                      msg={msg}
                      copiedId={copiedId}
                      handleCopy={handleCopy}
                      commitScript={commitScript}
                      rejectScript={rejectScript}
                      restoreScript={restoreScript}
                      projectId={projectId}
                    />
                  ))}
                  {isArchitecting && (
                    <div className="flex items-center gap-4 p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl">
                      <Loader2 className="size-4 animate-spin text-black dark:text-white" />
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-black dark:text-white">Stem is cooking....</span>
                        <span className="text-[9px] font-bold text-zinc-400">Synthesizing node-specific logic</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-6 bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-800">
                  <form onSubmit={handleChatSubmit} className="relative group">
                    <Input
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      placeholder={`Describe changes to ${page.title}...`}
                      className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-14 pr-14 text-xs font-bold rounded-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-inner"
                    />
                    <Button
                      type="submit"
                      disabled={isArchitecting || !chatInput.trim()}
                      className="absolute right-2 top-2 size-10 rounded-none bg-black dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95 transition-all shadow-lg"
                    >
                      <Send className="size-4" />
                    </Button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Tabs>

      {editingInput && (
        <EditInputModal
          isOpen={!!editingInput}
          onClose={() => setEditingInput(null)}
          inputItem={editingInput}
          availableVariables={availableVariables}
          onUpdate={updateInput}
          onRemove={removeInput}
        />
      )}

      {editingOutput && (
        <EditOutputModal
          isOpen={!!editingOutput}
          onClose={() => setEditingOutput(null)}
          outputItem={editingOutput}
          availableVariables={availableVariables}
          onUpdate={updateOutput}
          onRemove={removeOutput}
        />
      )}

      {editingAction && (
        <EditActionModal
          isOpen={!!editingAction}
          onClose={() => setEditingAction(null)}
          actionItem={editingAction}
          availableFunctions={availableFunctions}
          onUpdate={updateAction}
          onRemove={removeAction}
        />
      )}

      {editingConstraint && (
        <EditConstraintModal
          isOpen={!!editingConstraint}
          onClose={() => setEditingConstraint(null)}
          constraintItem={editingConstraint.id ? editingConstraint : null}
          availableVariables={availableVariables}
          allPages={allPages}
          currentPageId={page.id}
          onSave={async (payload) => {
            await addConstraint(page.id, payload)
          }}
          onUpdate={updateConstraint}
          onRemove={removeConstraint}
        />
      )}
    </div>
  )
}

function MessageBubble({ msg, copiedId, handleCopy, commitScript, rejectScript, restoreScript, projectId }: any) {
  const [showReview, setShowReview] = useState(false)
  const [isCommitting, setIsCommitting] = useState(false)

  const handleConfirmCommit = async () => {
    setShowReview(false)
    setIsCommitting(true)
    try {
      await commitScript(msg.script!, projectId, msg.id)
    } finally {
      setIsCommitting(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-3", msg.role === 'user' ? "items-end" : "items-start")}>
      <StandardModal
        isOpen={showReview}
        onClose={() => setShowReview(false)}
        title="Review Architecture Commit"
        confirmText={isCommitting ? "Committing..." : "Confirm Commit"}
        onConfirm={handleConfirmCommit}
        className="max-w-md text-black dark:text-white"
      >
        <div className="space-y-4 text-xs p-1">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded">
            <strong>Disclaimer:</strong> This action will synchronize the database schema and logic registry with the STEM-script blueprint. Existing variables, constants, tables, columns, functions, and dependencies will be updated in-place rather than duplicated. Please verify the blueprint below before committing.
          </div>
          <div className="space-y-1">
            <span className="font-mono text-[9px] text-zinc-400">Blueprint Script:</span>
            <pre className="p-3 bg-zinc-950 text-emerald-400 font-mono text-[10px] rounded max-h-[150px] overflow-y-auto">
              <code>{msg.script}</code>
            </pre>
          </div>
        </div>
      </StandardModal>

      <div className={cn(
        "max-w-[90%] p-4 text-[11px] font-bold leading-relaxed shadow-sm transition-all",
        msg.role === 'user'
          ? "bg-black text-white dark:bg-white dark:text-black"
          : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800"
      )}>
        {msg.role === 'user' ? msg.content : <Markdown content={msg.content} />}
      </div>

      {msg.script && (
        msg.is_rejected ? (
          <div className="w-full mt-1 p-3 bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs rounded-none">
            <span className="text-zinc-500 font-semibold italic flex items-center gap-1.5 text-[10px]">
              <X className="size-3 text-red-500" />
              Architecture proposal rejected
            </span>
            <button
              onClick={() => restoreScript(msg.id)}
              className="text-[9px] font-black text-white hover:underline uppercase tracking-wider"
            >
              Restore
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl"
          >
            <div className="h-10 bg-zinc-900/50 flex items-center justify-between px-4 border-b border-zinc-800/50">
              <div className="flex items-center gap-2">
                <Terminal className="size-3.5 text-emerald-500" />
                <span className="text-[10px] font-black  text-zinc-500 tracking-widest">Blueprint Script</span>
              </div>
              <button
                onClick={() => handleCopy(msg.id, msg.script!)}
                className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all rounded-md"
              >
                {copiedId === msg.id ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              </button>
            </div>
            <pre className="p-5 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-[300px] leading-relaxed custom-scrollbar bg-black/50">
              <code>{msg.script}</code>
            </pre>
            <div className="flex border-t border-zinc-850">
              <button
                onClick={() => {
                  if (msg.is_committed) return;
                  setShowReview(true);
                }}
                disabled={isCommitting || msg.is_committed}
                className={cn(
                  "flex-1 h-12 text-[11px] font-black flex items-center justify-center gap-2 transition-all border-r border-zinc-850",
                  msg.is_committed
                    ? "bg-zinc-900 text-zinc-500 cursor-not-allowed"
                    : "bg-white text-black hover:bg-emerald-500 hover:text-white active:scale-[0.98] disabled:opacity-55"
                )}
              >
                {msg.is_committed ? <Check className="size-3.5 text-emerald-500" /> : <Play className="size-3.5" />}
                {msg.is_committed ? 'Architecture Committed' : (isCommitting ? 'Committing...' : 'Commit Architecture')}
              </button>
              {!msg.is_committed && (
                <button
                  type="button"
                  onClick={() => rejectScript(msg.id)}
                  className="px-6 h-12 bg-zinc-900 hover:bg-zinc-800 text-red-500 text-[11px] font-black flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <X className="size-3.5" />
                  Reject
                </button>
              )}
            </div>
          </motion.div>
        )
      )}
    </div>
  )
}


function FlowSection({ icon, title, screens, onSelect }: { icon: any; title: string; screens: any[]; onSelect?: any }) {
  return (
    <div className="space-y-4 px-1">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[10px] font-black text-zinc-400 ">{title} Flows</span>
      </div>
      <div className="space-y-2">
        {screens.length === 0 ? (
          <p className="text-[10px] text-zinc-300 dark:text-zinc-700 italic px-1">No connections defined</p>
        ) : (
          screens.map(s => (
            <motion.div
              key={s.id}
              onClick={() => onSelect?.(s.id)}
              whileHover={{ x: 4 }}
              className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none hover:border-black dark:hover:border-zinc-600 cursor-pointer group transition-all shadow-sm"
            >
              <span className="text-[11px] font-black text-zinc-500 group-hover:text-black dark:group-hover:text-white transition-colors  tracking-tight">{s.title}</span>
              <ChevronRight className="size-3 text-zinc-300 group-hover:text-zinc-500 transition-transform group-hover:translate-x-1" />
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
