'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, Terminal, Cpu, X, Play, Copy, Check, MessageSquare, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSystemArchitect } from '@/hooks/useSystemArchitect'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function LogicBot() {
  const { id: projectId } = useParams()
  const {
    messages,
    isArchitecting,
    isOpen,
    setIsOpen,
    generateSystem,
    commitScript,
    clearHistory
  } = useSystemArchitect()

  const [input, setInput] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isArchitecting || !projectId) return

    const prompt = input.trim()
    setInput('')

    // Add user message immediately
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

  return (
    <>
      {/* Floating Trigger */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 size-14 rounded-full shadow-2xl flex items-center justify-center z-50 transition-colors",
          isOpen ? "bg-white text-black" : "bg-zinc-900 text-white border border-zinc-800"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="size-6" />
            </motion.div>
          ) : (
            <motion.div
              key="bot"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="relative"
            >
              <Sparkles className="size-6" />
              <div className="absolute -top-1 -right-1 size-3 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Interface - Slide-in Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-black border-l border-zinc-800 shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-8 border-b border-zinc-900 bg-zinc-900/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="size-12 bg-white flex items-center justify-center rounded-none shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    <Cpu className="size-6 text-black" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">System Architect</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearHistory}
                    className="size-10 rounded-none text-zinc-600 hover:text-white hover:bg-zinc-900 transition-all"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="size-10 rounded-none text-zinc-600 hover:text-white hover:bg-zinc-900 transition-all"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar scroll-smooth bg-linear-to-b from-black to-zinc-900/20">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn(
                    "flex flex-col gap-3",
                    msg.role === 'user' ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "max-w-[90%] p-5 text-[11px] leading-relaxed font-medium shadow-xl",
                      msg.role === 'user'
                        ? "bg-white text-black rounded-none"
                        : "bg-zinc-900/50 text-zinc-300 border border-zinc-800 rounded-none backdrop-blur-md"
                    )}>
                      {msg.content}
                    </div>

                    {msg.script && (
                      <div className="w-full mt-2 bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl group/script">
                        <div className="h-10 bg-zinc-900/80 flex items-center justify-between px-4 border-b border-zinc-800">
                          <div className="flex items-center gap-2">
                            <Terminal className="size-3.5 text-zinc-500" />
                            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">STEM-script Registry</span>
                          </div>
                          <button
                            onClick={() => handleCopy(msg.id, msg.script!)}
                            className="p-1.5 hover:text-white text-zinc-500 transition-colors"
                          >
                            {copiedId === msg.id ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                          </button>
                        </div>
                        <pre className="p-6 text-[10px] font-mono text-green-400 overflow-x-auto selection:bg-green-500/20 max-h-[300px]">
                          <code>{msg.script}</code>
                        </pre>
                        <button
                          onClick={() => handleCommit(msg.script!)}
                          className="w-full h-12 bg-white text-black text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-[0.98] border-t border-zinc-800"
                        >
                          <Play className="size-4" />
                          Commit System Architecture
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {isArchitecting && (
                  <div className="flex flex-col items-start gap-3">
                    <div className="bg-zinc-900/50 border border-zinc-800 p-5 flex items-center gap-4 backdrop-blur-sm shadow-xl">
                      <div className="relative">
                        <Loader2 className="size-4 animate-spin text-white" />
                        <div className="absolute inset-0 size-4 bg-white/20 blur-md animate-pulse" />
                      </div>
                      <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest animate-pulse">Synthesizing Logic...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-zinc-900/40 border-t border-zinc-800 backdrop-blur-xl shrink-0">
                <form onSubmit={handleSubmit} className="relative group">
                  <div className="absolute -inset-0.5 bg-linear-to-r from-zinc-800 to-zinc-700 opacity-0 group-focus-within:opacity-100 transition-opacity blur-xs rounded-none" />
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Define architectural intent..."
                    className="relative bg-black border-zinc-800 rounded-none h-14 pr-16 text-xs focus:border-white transition-all placeholder:text-zinc-700 font-medium"
                  />
                  <Button
                    type="submit"
                    disabled={isArchitecting || !input.trim()}
                    className="absolute right-1.5 top-1.5 size-11 rounded-none bg-white text-black hover:bg-zinc-200 p-0 transition-all active:scale-95"
                  >
                    <Send className="size-5" />
                  </Button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
