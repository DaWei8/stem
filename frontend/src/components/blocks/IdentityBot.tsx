'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StandardModal } from '@/components/ui/StandardModal'
import { useIdentity } from '@/hooks/useIdentity'
import { useIdentityArchitect } from '@/hooks/useIdentityArchitect'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  Copy,
  Loader2,
  Play,
  Send,
  Terminal,
  Users,
  X
} from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { MarkdownText } from '@/components/ui/MarkdownText'

export function IdentityBot() {
  const { id: projectId } = useParams()
  const {
    messages,
    isArchitecting,
    generateSystem,
    commitScript,
    rejectScript,
    restoreScript,
    fetchMessages,
    setIsOpen
  } = useIdentityArchitect()

  const [input, setInput] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { userTypes, policies } = useIdentity()

  const [activeTab, setActiveTab] = useState<'overview' | 'chat'>('chat')
  const [filterQuery, setFilterQuery] = useState('')

  const [showReview, setShowReview] = useState(false)
  const [pendingCommit, setPendingCommit] = useState<{ id: string; script: string } | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    fetchMessages(projectId as string)
  }, [fetchMessages, projectId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isArchitecting || !projectId) return

    const prompt = input.trim()
    setInput('')

    useIdentityArchitect.getState().addMessage({
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

  const handleCommit = (msgId: string, script: string) => {
    setPendingCommit({ id: msgId, script })
    setShowReview(true)
  }

  const executeCommit = async () => {
    if (!projectId || !pendingCommit) return
    setShowReview(false)
    await commitScript(pendingCommit.script, projectId as string, pendingCommit.id)
    setPendingCommit(null)
  }

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 380, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="shrink-0 bg-white dark:bg-black border-l border-zinc-200 dark:border-zinc-800 flex flex-col h-full overflow-hidden transition-colors duration-300 relative"
    >
      <StandardModal
        isOpen={showReview}
        onClose={() => { setShowReview(false); setPendingCommit(null); }}
        title="Review Identity Commit"
        confirmText="Confirm Commit"
        onConfirm={executeCommit}
        className="max-w-md"
      >
        <div className="space-y-4 grid grid-cols-1 text-xs p-1">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded">
            <strong>Disclaimer:</strong> This action will synchronize user roles and RLS policies with the STEM-script blueprint. Existing roles will be updated in-place and policies targeting the same table will be recreated. Please verify the blueprint below before committing.
          </div>
          <div className="space-y-1">
            <span className="font-mono text-[9px] text-zinc-400">Blueprint Script:</span>
            <pre className="p-3 bg-zinc-950 text-emerald-400 font-mono text-[10px] rounded max-h-[150px] overflow-y-auto">
              <code>{pendingCommit?.script}</code>
            </pre>
          </div>
        </div>
      </StandardModal>
      {/* Header Tabs */}
      <div className="flex items-center justify-between px-6 pt-4 shrink-0 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <h3 className="text-sm font-bold flex items-center gap-2 text-black text-nowrap dark:text-white">
          <Users className="size-4 text-violet-500" /> AI Architect
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="size-8 text-zinc-400 hover:text-black dark:hover:text-white rounded-none"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
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
                    <MarkdownText content={msg.content} />
                  </div>

                  {msg.script && (
                    <div className="w-full flex flex-wrap gap-2 mb-1 px-1">
                      {msg.script.includes('DEFINE ROLE') && (
                        <span className="px-2 py-0.5 bg-violet-500/10 text-violet-500 text-[8px] font-black border border-violet-500/20">
                          +{msg.script.match(/DEFINE ROLE/g)?.length} Role(s)
                        </span>
                      )}
                      {msg.script.includes('DEFINE POLICY') && (
                        <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[8px] font-black border border-red-500/20">
                          +{msg.script.match(/DEFINE POLICY/g)?.length} Policy(s)
                        </span>
                      )}
                    </div>
                  )}

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
                      <div className="w-full mt-1 bg-zinc-950 border border-zinc-800 overflow-hidden group/script">
                        <div className="h-9 bg-zinc-50 dark:bg-zinc-900/80 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
                          <div className="flex items-center gap-2">
                            <Terminal className="size-3 text-zinc-400 dark:text-zinc-500" />
                            <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 tracking-widest">STEM-script</span>
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
                        <div className="flex border-t border-zinc-200 dark:border-zinc-800">
                          <button
                            onClick={() => handleCommit(msg.id, msg.script!)}
                            disabled={msg.is_committed}
                            className={cn(
                              "flex-1 h-10 text-[10px] font-black flex items-center justify-center gap-2 transition-all border-r border-zinc-200 dark:border-zinc-800",
                              msg.is_committed
                                ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
                                : "bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-[0.98]"
                            )}
                          >
                            {msg.is_committed ? <Check className="size-3.5" /> : <Play className="size-3.5" />}
                            {msg.is_committed ? 'Architecture Committed' : 'Commit'}
                          </button>
                          {!msg.is_committed && (
                            <button
                              onClick={() => rejectScript(msg.id)}
                              className="px-4 h-10 bg-zinc-900 hover:bg-zinc-800 text-red-500 text-[10px] font-black flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                            >
                              <X className="size-3.5" />
                              Reject
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              ))}
              {isArchitecting && (
                <div className="flex flex-col items-start gap-3">
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-4 flex items-center gap-3 backdrop-blur-sm transition-colors">
                    <Loader2 className="size-3.5 animate-spin text-black dark:text-white" />
                    <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 tracking-widest animate-pulse">Synthesizing Logic...</span>
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
                  placeholder="Define user roles & policies..."
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
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
