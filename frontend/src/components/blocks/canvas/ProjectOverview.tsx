'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import {
  Laptop, Fingerprint, Box, Settings2, Search, Trash2, ChevronRight, Terminal, Copy, Check, Play, Send, Loader2, Folder, Zap, Database, Code
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import { useSystemArchitect } from '@/hooks/useSystemArchitect'
import { useUI } from '@/hooks/useUI'
import { StatMini, OverviewSection } from './helpers'
import { toast } from 'sonner'

interface Props {
  pages: any[]; variables: any[]; components: any[]; tokens: any[]; inputs: any[]; actions: any[]; outputs: any[]; projectId: string; onSelectScreen?: (id: string) => void; onDeleteScreen?: (id: string) => void; selectedNodeId: string | undefined
}

export function ProjectOverview({
  pages, variables, components, tokens, inputs, actions, outputs, projectId, onSelectScreen, onDeleteScreen, selectedNodeId
}: Props) {
  const [search, setSearch] = useState('')
  const [sidebarTab, setSidebarTab] = useState<'overview' | 'chat'>('overview')
  const [chatInput, setChatInput] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, isArchitecting, generateSystem, commitScript, addMessage } = useSystemArchitect()
  const { canvasFilter, setCanvasFilter, activeVariableId, setActiveVariableId } = useUI()

  const stats = useMemo(() => ({ inputs: inputs.length, outputs: outputs.length, triggers: actions.length }), [inputs, actions, outputs])
  const filteredPages = pages.filter(p => (p.title || p.name || '').toLowerCase().includes(search.toLowerCase()))
  const filteredVariables = variables.filter(v => (v.label || v.name || '').toLowerCase().includes(search.toLowerCase()))

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

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black overflow-hidden transition-colors">
      <div className="px-6 pt-6 shrink-0 space-y-4">
        <div>
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Project Engine</span>
          <h2 className="text-lg font-bold text-black dark:text-white tracking-tight">System Blueprint</h2>
        </div>
        <Tabs value={sidebarTab} onValueChange={v => setSidebarTab(v as 'overview' | 'chat')} className="w-full">
          <TabsList className="w-full justify-start border-b border-zinc-200 dark:border-zinc-800 p-0 h-10 bg-transparent rounded-none">
            <TabsTrigger value="overview" className="flex-1 px-0 text-xs font-black text-zinc-400 data-[state=active]:text-black dark:data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white bg-transparent">Overview</TabsTrigger>
            <TabsTrigger value="chat" className="flex-1 px-0 text-xs font-black text-zinc-400 data-[state=active]:text-black dark:data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white bg-transparent">AI Architect</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {sidebarTab === 'overview' ? (
            <motion.div key="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto p-6 pt-4 space-y-8 custom-scrollbar">
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter system..." className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 h-9 pl-9 text-[11px] rounded-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <StatMini label="Screens" value={pages.length} icon={<Laptop className="size-3" />} active={canvasFilter === 'screens'} onClick={() => setCanvasFilter(canvasFilter === 'screens' ? 'none' : 'screens')} />
                <StatMini label="Variables" value={variables.length} icon={<Fingerprint className="size-3" />} active={canvasFilter === 'variables'} onClick={() => setCanvasFilter(canvasFilter === 'variables' ? 'none' : 'variables')} />
                <StatMini label="Inputs" value={stats.inputs} icon={<Fingerprint className="size-3 text-blue-500" />} active={canvasFilter === 'inputs'} onClick={() => setCanvasFilter(canvasFilter === 'inputs' ? 'none' : 'inputs')} />
                <StatMini label="Outputs" value={stats.outputs} icon={<Database className="size-3 text-emerald-500" />} active={canvasFilter === 'outputs'} onClick={() => setCanvasFilter(canvasFilter === 'outputs' ? 'none' : 'outputs')} />
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-2"><Laptop className="size-3 text-zinc-400" /><span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active Screens</span></div>
                {filteredPages.map(page => (
                  <div key={page.id} onClick={() => onSelectScreen?.(page.id)} className={cn("group flex items-center justify-between p-2.5 border rounded-none cursor-pointer transition-all", selectedNodeId?.includes(page.id) ? "bg-zinc-100 border-zinc-300 dark:bg-zinc-900" : "bg-zinc-50 dark:bg-black border-transparent hover:border-zinc-200")}>
                    <span className="text-xs font-bold text-zinc-500 group-hover:text-black dark:group-hover:text-white transition-colors">{page.title || page.name}</span>
                    <ChevronRight className="size-3 text-zinc-300 group-hover:text-zinc-500" />
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                {messages.map(msg => (
                  <div key={msg.id} className={cn("flex flex-col gap-2", msg.role === 'user' ? "items-end" : "items-start")}>
                    <div className={cn("max-w-[90%] p-3.5 text-[11px] leading-relaxed font-bold rounded-none", msg.role === 'user' ? "bg-black text-white dark:bg-white dark:text-black" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800")}>{msg.content}</div>
                    {msg.script && (
                      <div className="w-full bg-black border border-zinc-800 overflow-hidden shadow-2xl">
                        <div className="h-8 bg-zinc-900 flex items-center justify-between px-3">
                          <div className="flex items-center gap-2"><Terminal className="size-3 text-zinc-500" /><span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Blueprint Script</span></div>
                          <button onClick={() => handleCopy(msg.id, msg.script!)} className="text-zinc-500 hover:text-white transition-colors">{copiedId === msg.id ? <Check className="size-3" /> : <Copy className="size-3" />}</button>
                        </div>
                        <pre className="p-3 text-[10px] font-mono text-emerald-500 overflow-x-auto max-h-[200px]"><code>{msg.script}</code></pre>
                        <button onClick={() => commitScript(msg.script!, projectId)} className="w-full h-9 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors">Commit Architecture</button>
                      </div>
                    )}
                  </div>
                ))}
                {isArchitecting && <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"><Loader2 className="size-3.5 animate-spin text-black dark:text-white" /><span className="text-[10px] font-black uppercase text-zinc-400 animate-pulse">Architecting...</span></div>}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-black border-t border-zinc-200 dark:border-zinc-800 shrink-0">
                <form onSubmit={handleChatSubmit} className="relative">
                  <Input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Describe your architectural intent..." className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 h-11 pr-12 text-xs font-bold rounded-none" />
                  <Button type="submit" disabled={isArchitecting || !chatInput.trim()} className="absolute right-1 top-1 size-9 rounded-none bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 transition-all"><Send className="size-4" /></Button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
