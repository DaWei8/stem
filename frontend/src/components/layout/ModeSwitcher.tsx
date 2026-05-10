'use client'

import { useUI, ProjectMode } from '@/hooks/useUI'
import { cn } from '@/lib/utils'
import { Layout, Code2, Compass } from 'lucide-react'
import { motion } from 'framer-motion'

export function ModeSwitcher() {
  const { activeMode, setActiveMode } = useUI()

  const modes: { id: ProjectMode; label: string; icon: any }[] = [
    { id: 'architect', label: 'All', icon: Compass },
    { id: 'design', label: 'Design', icon: Layout },
    { id: 'dev', label: 'Dev', icon: Code2 },
  ]

  return (
    <div className="relative w-full mb-6">
      <div className="bg-white/80 dark:bg-black/90 border-x border-b border-zinc-200 dark:border-zinc-800/50 p-1 flex items-center rounded-b-xl mx-1 transition-colors">
        <div className="grid grid-cols-3 gap-1 w-full group/container">
          {modes.map((mode) => {
            const Icon = mode.icon
            const isActive = activeMode === mode.id
            return (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={cn(
                  "relative flex items-center justify-center gap-2 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                  isActive
                    ? "text-black dark:text-zinc-200"
                    : "text-zinc-400 dark:text-zinc-600 hover:text-black dark:hover:text-zinc-300 group-hover/container:opacity-50 hover:opacity-100!"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-mode"
                    className="absolute inset-0 bg-zinc-100 dark:bg-white/10 border border-zinc-200 dark:border-white/10 shadow-sm dark:shadow-none"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                  />
                )}
                <Icon className={cn("w-3.5 h-3.5 relative z-10", isActive ? "text-black dark:text-white" : "text-zinc-400 dark:text-zinc-600 transition-colors duration-300 group-hover:text-black dark:group-hover:text-zinc-300")} />
                <span className="relative z-10">{mode.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
