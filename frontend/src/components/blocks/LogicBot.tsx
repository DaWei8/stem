'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Copy, Check, Trash2, Layout, Database, Terminal,
  Shield, Zap, Package, BoxSelect, Search, ChevronRight,
  Activity, Send, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSystemArchitect } from '@/hooks/useSystemArchitect'
import { usePages } from '@/hooks/usePages'
import { useVariables } from '@/hooks/useVariables'
import { useDesignSystem } from '@/hooks/useDesignSystem'
import { useIdentity } from '@/hooks/useIdentity'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function LogicBot() {
  const { id: projectId } = useParams()
  const {
    messages,
    isArchitecting,
    generateSystem,
    commitScript,
    clearHistory
  } = useSystemArchitect()

  const [input, setInput] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { pages, transitions } = usePages()
  const { variables } = useVariables()
  const { tokens, components } = useDesignSystem()
  const { policies } = useIdentity()

  const [activeTab, setActiveTab] = useState<'overview' | 'chat'>('overview')
  const [filterQuery, setFilterQuery] = useState('')

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // --- The "Mirror Effect": Acknowledge manual canvas changes ---
  const prevPagesLength = useRef(pages.length)
  const prevTransLength = useRef(transitions.length)

  useEffect(() => {
    if (pages.length !== prevPagesLength.current) {
      const added = pages.length > prevPagesLength.current
      const diff = Math.abs(pages.length - prevPagesLength.current)
      
      useSystemArchitect.getState().addMessage({
        role: 'assistant',
        content: `[SYSTEM] ${added ? 'Detected' : 'Removed'} ${diff} node(s) on the canvas. I have updated my structural map accordingly.`
      })
      prevPagesLength.current = pages.length
    }
  }, [pages.length])

  useEffect(() => {
    if (transitions.length !== prevTransLength.current) {
      const added = transitions.length > prevTransLength.current
      useSystemArchitect.getState().addMessage({
        role: 'assistant',
        content: `[SYSTEM] ${added ? 'New link established' : 'A flow connection was severed'} on the canvas. Context updated.`
      })
      prevTransLength.current = transitions.length
    }
  }, [transitions.length])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isArchitecting || !projectId) return

    const prompt = input.trim()
    setInput('')

    useSystemArchitect.getState().addMessage({
      role: 'user',
      content: prompt
    })

    generateSystem(prompt, projectId as string)
  }

  const handleCopy = (id: string, script: string) => {
    navigator.clipboard.writeText(script)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success('STEM-script copied')
  }

  const handleCommit = async (script: string) => {
    if (!projectId) return
    await commitScript(script, projectId as string)
  }

  const stats = [
    { label: 'Screens', value: pages.length, icon: <Layout className="size-3.5" /> },
    { label: 'Variables', value: variables.length, icon: <Activity className="size-3.5" /> },
    { label: 'Components', value: components.length, icon: <Package className="size-3.5" /> },
    { label: 'Tokens', value: tokens.length, icon: <BoxSelect className="size-3.5" /> },
    { label: 'Inputs', value: 1, icon: <Activity className="size-3.5" /> },
    { label: 'Outputs', value: 1, icon: <Database className="size-3.5" /> },
    { label: 'Triggers', value: 1, icon: <Zap className="size-3.5" /> },
    { label: 'Logic', value: 'Verified', icon: <Shield className="size-3.5 text-green-500" /> },
  ]

  const filteredPages = pages.filter(p =>
    p.title.toLowerCase().includes(filterQuery.toLowerCase())
  )

  return (
    <div className="w-[380px] shrink-0 bg-white dark:bg-black border-l border-zinc-200 dark:border-zinc-800 flex flex-col h-full overflow-hidden transition-colors duration-300">

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-y-auto px-6 pt-4 pb-6 space-y-8 custom-scrollbar"
            >
              {/* Search / Filter */}
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400 dark:text-zinc-600 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                <Input
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filter system elements..."
                  className="bg-zinc-50 dark:bg-black/50 border-zinc-200 dark:border-zinc-800 rounded-none pl-10 h-11 text-[11px] font-mono focus:ring-1 focus:ring-black/10 dark:focus:ring-white/10 transition-all text-black dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                {stats.map((stat, i) => (
                  <div key={i} className="p-4 border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/50 hover:bg-zinc-100 dark:hover:bg-zinc-900/40 transition-colors group">
                    <div className="flex items-center gap-2 mb-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                      <div className="text-zinc-400 dark:text-zinc-500 group-hover:text-black dark:group-hover:text-zinc-300 transition-colors">{stat.icon}</div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 group-hover:text-black dark:group-hover:text-zinc-300 transition-colors">
                        {stat.label}
                      </span>
                    </div>
                    <div className="text-lg font-black text-black dark:text-white transition-colors">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Active Screens List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-2 transition-colors">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Active Screens</h4>
                  <span className="text-[10px] font-black text-zinc-300 dark:text-zinc-700 transition-colors">({pages.length})</span>
                </div>
                <div className="flex flex-col">
                  {filteredPages.map(page => (
                    <button
                      key={page.id}
                      className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-900/30 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/50 hover:border-black dark:hover:border-zinc-700 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 group-hover:bg-black dark:group-hover:bg-white transition-all shadow-[0_0_8px_transparent] group-hover:shadow-[0_0_8px_black] dark:group-hover:shadow-[0_0_8px_white]" />
                        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                          {page.title}
                        </span>
                      </div>
                      <ChevronRight className="size-3.5 text-zinc-200 dark:text-zinc-800 group-hover:text-black dark:group-hover:text-zinc-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4 space-y-6 custom-scrollbar scroll-smooth">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn(
                    "flex flex-col gap-3",
                    msg.role === 'user' ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "max-w-[90%] p-4 text-[11px] leading-relaxed font-medium transition-colors",
                      msg.role === 'user'
                        ? "bg-black dark:bg-white text-white dark:text-black"
                        : "bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 backdrop-blur-md"
                    )}>
                      {msg.content}
                    </div>

                    {msg.script && (
                      <div className="w-full flex flex-wrap gap-2 mb-1 px-1">
                        {msg.script.includes('DEFINE SCREEN') && (
                          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase tracking-widest border border-blue-500/20">
                            +{msg.script.match(/DEFINE SCREEN/g)?.length} Screen(s)
                          </span>
                        )}
                        {msg.script.includes('CONNECT') && (
                          <span className="px-2 py-0.5 bg-purple-500/10 text-purple-500 text-[8px] font-black uppercase tracking-widest border border-purple-500/20">
                            +{msg.script.match(/CONNECT/g)?.length} Connection(s)
                          </span>
                        )}
                        {(msg.script.includes('ADD INPUT') || msg.script.includes('ADD MUTATION')) && (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">
                            +{ (msg.script.match(/ADD INPUT|ADD MUTATION/g)?.length) } Logical Ops
                          </span>
                        )}
                      </div>
                    )}

                    {msg.script && (
                      <div className="w-full mt-1 bg-zinc-950 border border-zinc-800 overflow-hidden group/script">
                        <div className="h-9 bg-zinc-50 dark:bg-zinc-900/80 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
                          <div className="flex items-center gap-2">
                            <Terminal className="size-3 text-zinc-400 dark:text-zinc-500" />
                            <span className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest">STEM-script</span>
                          </div>
                          <button
                            onClick={() => handleCopy(msg.id, msg.script!)}
                            className="p-1 hover:text-black dark:hover:text-white text-zinc-400 dark:text-zinc-500 transition-colors"
                          >
                            {copiedId === msg.id ? <Check className="size-3" /> : <Copy className="size-3" />}
                          </button>
                        </div>
                        <pre className="p-4 text-[10px] font-mono text-emerald-600 dark:text-green-400 overflow-x-auto selection:bg-emerald-500/20 max-h-[250px] transition-colors">
                          <code>{msg.script}</code>
                        </pre>
                        <button
                          onClick={() => handleCommit(msg.script!)}
                          className="w-full h-10 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-[0.98] border-t border-zinc-200 dark:border-zinc-800"
                        >
                          <Play className="size-3.5" />
                          Commit Architecture
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {isArchitecting && (
                  <div className="flex flex-col items-start gap-3">
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-4 flex items-center gap-3 backdrop-blur-sm transition-colors">
                      <Loader2 className="size-3.5 animate-spin text-black dark:text-white" />
                      <span className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest animate-pulse">Synthesizing Logic...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/30 border-t border-zinc-200 dark:border-zinc-800 shrink-0 transition-colors">
                <form onSubmit={handleSubmit} className="relative">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Define architectural intent..."
                    className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none h-12 pr-14 text-xs focus:ring-1 focus:ring-black/10 dark:focus:ring-white/10 transition-all text-black dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 font-medium"
                  />
                  <Button
                    type="submit"
                    disabled={isArchitecting || !input.trim()}
                    className="absolute right-1 top-1 size-10 rounded-none bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 p-0 transition-all active:scale-95"
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
