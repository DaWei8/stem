'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Plus, Box, Database, ArrowRight } from 'lucide-react'
import { usePages } from '@/hooks/usePages'
import { toast } from 'sonner'
import { useVariables } from '@/hooks/useVariables'

export function CommandPalette({ selectedNodeId, projectId }: { selectedNodeId?: string; projectId: string }) {
  const [isOpen, setIsOpen] = useState(false)

  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const { addPage, addInput, addOutput, addAction } = usePages()
  const { variables } = useVariables()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
    }
  }, [isOpen])

  const executeCommand = async (cmd: string) => {
    const args = cmd.trim().split(' ')
    const action = args[0].toLowerCase()

    try {
      if (action === 'screen' || action === 'add-screen') {
        const name = args.slice(1).join(' ') || 'New Screen'
        await addPage(projectId, name)
        toast.success(`Created screen: ${name}`)
      }

      else if (action === 'mutate') {
        // "mutate user.id"
        if (!selectedNodeId) {
          toast.error("Please select a screen node first to add a mutation.")
          return
        }
        const varName = args.slice(1).join(' ')
        const existingVar = variables.find(v => v.label.toLowerCase() === varName.toLowerCase())

        await addOutput(selectedNodeId, {
          name: `Update ${varName}`,
          output_type: 'state_update',
          variable_id: existingVar?.id || undefined
        })

        toast.success(`Added mutation for ${varName}`)
      }
      else if (action === 'input' || action === 'require') {
        if (!selectedNodeId) {
          toast.error("Please select a screen node first to add an input.")
          return
        }
        const inputName = args.slice(1).join(' ')
        await addInput(selectedNodeId, {
          name: inputName,
          input_type: 'query_param'
        })
        toast.success(`Added input requirement: ${inputName}`)

      }
      else {
        toast.error(`Unknown command: ${action}`)
      }
    } catch (err) {
      toast.error('Failed to execute command')
    }

    setIsOpen(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-100"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-[500px] bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-101 overflow-hidden"
          >
            <div className="flex items-center p-3 border-b border-zinc-200 dark:border-zinc-800">
              <Terminal className="size-4 text-zinc-400 mr-3" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    executeCommand(query)
                  }
                }}
                placeholder="Type a command (e.g., 'screen Dashboard', 'mutate user_status')"
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-black dark:text-white placeholder:text-zinc-500"
              />
              <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400  bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded">
                ENTER
              </div>
            </div>

            <div className="p-2 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="px-3 py-2 text-[10px] font-bold text-zinc-500 ">Available Commands</div>
              <div className="space-y-1">
                <CommandItem icon={<Plus className="size-3" />} cmd="screen [name]" desc="Create a new screen node" />
                <CommandItem icon={<Database className="size-3" />} cmd="mutate [var_name]" desc="Add a state mutation to selected screen" />
                <CommandItem icon={<ArrowRight className="size-3" />} cmd="require [input_name]" desc="Add an input requirement to selected screen" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function CommandItem({ icon, cmd, desc }: { icon: React.ReactNode, cmd: string, desc: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
      <div className="flex items-center gap-3">
        <div className="text-zinc-400">{icon}</div>
        <span className="text-xs font-bold text-black dark:text-white font-mono">{cmd}</span>
      </div>
      <span className="text-[10px] text-zinc-500">{desc}</span>
    </div>
  )
}
