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
    <div className="relative w-full mb-4">
      <div className="bg-black/90 backdrop-blur-2xl border border-zinc-800/50 p-1 flex items-center">
        <div className="grid grid-cols-3 gap-1 group/container">
          {modes.map((mode) => {
            const Icon = mode.icon
            const isActive = activeMode === mode.id

            return (
              <motion.button
                key={mode.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveMode(mode.id)}
                className={cn(
                  "relative flex items-center justify-center gap-1 px-3 py-2.5 text-xs font-black transition-all duration-300",
                  isActive
                    ? "text-zinc-200"
                    : "text-zinc-600 hover:text-zinc-300 group-hover/container:opacity-50 hover:opacity-100!"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-mode"
                    className="absolute inset-0 bg-white/10"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                  />
                )}
                <Icon className={cn("w-4 min-w-4 h-4 relative z-10", isActive ? "text-white" : "text-zinc-600 transition-colors duration-300 group-hover:text-zinc-300")} />
                <span className="relative z-10">{mode.label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
