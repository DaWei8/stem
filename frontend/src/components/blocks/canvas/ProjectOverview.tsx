'use client'

import { useProjectRole } from '@/hooks/useProjectRole'

import { useState, useRef, useEffect, useMemo } from 'react'
import {
  Laptop, Fingerprint, Search, Trash2, ChevronRight, Terminal, Copy, Check, Send, Loader2, Database, Zap, X, Play, Folder, Lock
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { FolderSelect } from './FolderSelect'
import { usePages } from '@/hooks/usePages'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import { useSystemArchitect } from '@/hooks/useSystemArchitect'
import { useUI } from '@/hooks/useUI'
import { StatMini } from './helpers'
import { toast } from 'sonner'
import { Markdown } from '@/components/ui/Markdown'
import { StandardModal } from '@/components/ui/StandardModal'

interface Props {
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
}

export function ProjectOverview({
  pages, variables, inputs, actions, outputs, projectId, onSelectScreen, selectedNodeId
}: Props) {
  const { isViewer } = useProjectRole()
  const [search, setSearch] = useState('')
  const [checkedPageIds, setCheckedPageIds] = useState<string[]>([])
  const [bulkFolder, setBulkFolder] = useState('')
  const [isBulkSaving, setIsBulkSaving] = useState(false)
  const updatePage = usePages(s => s.updatePage)

  const [sidebarTab, setSidebarTab] = useState<'overview' | 'chat'>('overview')
  const [chatInput, setChatInput] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, isArchitecting, generateSystem, commitScript, rejectScript, restoreScript, addMessage } = useSystemArchitect()
  const { canvasFilter, setCanvasFilter } = useUI()

  const stats = useMemo(() => ({
    inputs: inputs.length,
    outputs: outputs.length,
    triggers: actions.length
  }), [inputs, actions, outputs])

  const filteredPages = pages.filter(p => (p.title || p.name || '').toLowerCase().includes(search.toLowerCase()))

  const handleBulkGroup = async () => {
    if (!bulkFolder.trim() || checkedPageIds.length === 0) return
    setIsBulkSaving(true)
    try {
      await Promise.all(
        checkedPageIds.map(id => updatePage(id, { folder: bulkFolder.trim() }))
      )
      toast.success(`Moved ${checkedPageIds.length} screens to "${bulkFolder.trim()}"`)
      setCheckedPageIds([])
      setBulkFolder('')
    } catch (err) {
      toast.error('Bulk grouping failed')
    } finally {
      setIsBulkSaving(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || isArchitecting || !projectId) return
    const prompt = chatInput.trim()
    setChatInput('')
    addMessage({ role: 'user', content: prompt })
    generateSystem(prompt, projectId)
  }

  const handleCopy = (id: string, script: string) => {
    navigator.clipboard.writeText(script)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success('STEM-script copied')
  }

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-black overflow-hidden border-l border-zinc-200 dark:border-zinc-800 shadow-2xl">
      {/* Header */}
      <header className="px-4 pt-2 pb-1 shrink-0 bg-white dark:bg-black/50 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col gap-1.5 mb-2">
          <h2 className="text-sm font-black text-black dark:text-white">System Blueprint</h2>
        </div>

        <Tabs value={sidebarTab} onValueChange={v => setSidebarTab(v as 'overview' | 'chat')} className="w-full">
          <TabsList className="grid grid-cols-2 w-full bg-zinc-100 dark:bg-zinc-950 p-1 h-12">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="chat">
              AI Architect
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {sidebarTab === 'overview' ? (
            <motion.div
              key="ov"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute inset-0 overflow-y-auto p-4 space-y-8 custom-scrollbar"
            >
              {/* Search */}
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Query system components..."
                  className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-11 pl-10 text-[11px] font-bold rounded-md focus:ring-1 focus:ring-black dark:focus:ring-white transition-all shadow-sm"
                />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <StatMini
                  label="Screens"
                  value={pages.length}
                  icon={<Laptop className="size-3" />}
                  active={canvasFilter === 'screens'}
                  onClick={() => setCanvasFilter(canvasFilter === 'screens' ? 'none' : 'screens')}
                />
                <StatMini
                  label="Interfaces"
                  value={stats.inputs}
                  icon={<Fingerprint className="size-3 text-blue-500" />}
                  active={canvasFilter === 'inputs'}
                  onClick={() => setCanvasFilter(canvasFilter === 'inputs' ? 'none' : 'inputs')}
                />
                <StatMini
                  label="Mutations"
                  value={stats.outputs}
                  icon={<Database className="size-3 text-emerald-500" />}
                  active={canvasFilter === 'outputs'}
                  onClick={() => setCanvasFilter(canvasFilter === 'outputs' ? 'none' : 'outputs')}
                />
                <StatMini
                  label="Triggers"
                  value={stats.triggers}
                  icon={<Zap className="size-3 text-amber-500" />}
                  active={canvasFilter === 'triggers'}
                  onClick={() => setCanvasFilter(canvasFilter === 'triggers' ? 'none' : 'triggers')}
                />
              </div>

              {/* Screens List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-900">
                  <div className="flex items-center gap-2">
                    <Laptop className="size-3 text-zinc-400" />
                    <span className="text-xs font-black text-zinc-400">Active Architecture</span>
                  </div>
                  {checkedPageIds.length > 0 && (
                    <button
                      onClick={() => setCheckedPageIds([])}
                      className="text-xs font-black text-zinc-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    >
                      Deselect All
                    </button>
                  )}
                </div>

                {checkedPageIds.length > 0 && !isViewer && (
                  <div className="p-3 bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-md space-y-3 shadow-sm animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-black dark:text-white uppercase tracking-wider">Group {checkedPageIds.length} Screens</span>
                    </div>
                    <FolderSelect value={bulkFolder} onChange={setBulkFolder} placeholder="Move to folder (e.g. Auth Flow)" inputClassName="h-10" />
                    <Button
                      onClick={handleBulkGroup}
                      disabled={isBulkSaving || !bulkFolder.trim()}
                      className="w-full h-10 text-[10px] font-black bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-md gap-1.5 transition-all"
                    >
                      {isBulkSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Folder className="size-3.5" />}
                      Group Screens
                    </Button>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {filteredPages.map(page => {
                    const isChecked = checkedPageIds.includes(page.id)
                    return (
                      <div key={page.id} className="flex items-center gap-2 w-full group/item">
                        {!isViewer && (
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setCheckedPageIds(prev => [...prev, page.id])
                              } else {
                                setCheckedPageIds(prev => prev.filter(id => id !== page.id))
                              }
                            }}
                            onClick={e => e.stopPropagation()}
                            className="border-zinc-300 dark:border-zinc-700 data-[state=checked]:bg-black dark:data-[state=checked]:bg-white"
                          />
                        )}
                        <motion.div
                          onClick={() => onSelectScreen?.(page.id)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={cn(
                            "flex-1 group flex items-center justify-between p-2.5 border rounded-md cursor-pointer transition-all shadow-sm",
                            selectedNodeId?.includes(page.id)
                              ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-zinc-600"
                          )}
                        >
                          <div className="flex flex-col gap-1">
                            <span className="text-[11px] font-black">{page.title || page.name}</span>
                            <span className="text-[9px] font-bold opacity-40">
                              {page.page_type || 'Logic Node'} {page.folder ? `· ${page.folder}` : ''}
                            </span>
                          </div>
                          <ChevronRight className={cn("size-3 transition-transform group-hover:translate-x-1", selectedNodeId?.includes(page.id) ? "text-white dark:text-black" : "text-zinc-300")} />
                        </motion.div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="absolute inset-0 flex flex-col overflow-hidden"
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
                    isViewer={isViewer}
                  />
                ))}
                {isArchitecting && (
                  <div className="flex items-center gap-4 p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl">
                    <Loader2 className="size-4 animate-spin text-black dark:text-white" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-black dark:text-white">Stem is cooking....</span>
                      <span className="text-[9px] font-bold text-zinc-400">Synthesizing architectural logic</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-1 bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-800">
                <form onSubmit={handleChatSubmit} className="relative group">
                  <Input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    disabled={isViewer || isArchitecting}
                    placeholder={isViewer ? "Viewers cannot propose architectural changes..." : "Ask, describe, request ..."}
                    className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-14 pr-14 text-xs font-bold rounded-md focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-inner disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  <Button
                    type="submit"
                    disabled={isViewer || isArchitecting || !chatInput.trim()}
                    className="absolute right-2 top-2 max-w-7 rounded-md bg-black dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
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

function MessageBubble({ msg, copiedId, handleCopy, commitScript, rejectScript, restoreScript, projectId, isViewer }: any) {
  const [showReview, setShowReview] = useState(false)
  const [isCommitting, setIsCommitting] = useState(false)

  const handleConfirmCommit = async () => {
    if (isViewer) return
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
        isOpen={!isViewer && showReview}
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
          <div className="w-full mt-1 p-3 bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs rounded-md">
            <span className="text-zinc-500 font-semibold italic flex items-center gap-1.5 text-[10px]">
              <X className="size-3 text-red-500" />
              Architecture proposal rejected
            </span>
            {!isViewer && (
              <button
                onClick={() => restoreScript(msg.id)}
                className="text-[9px] font-black text-white hover:underline uppercase tracking-wider"
              >
                Restore
              </button>
            )}
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
            {!isViewer ? (
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
            ) : (
              <div className="h-10 bg-zinc-900/30 flex items-center justify-center px-4 border-t border-zinc-800/50">
                <span className="text-[9px] font-bold text-zinc-500 flex items-center gap-1">
                  <Lock className="size-3" /> View Only Proposal
                </span>
              </div>
            )}
          </motion.div>
        )
      )}
    </div>
  )
}

