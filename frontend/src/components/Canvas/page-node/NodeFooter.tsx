'use client'

import { cn } from '@/lib/utils'
import { Settings2, Lock, Hash, Type, ToggleLeft, Box } from 'lucide-react'
import { motion } from 'framer-motion'

/* ─── Integrity Score (how "complete" is this logic container) ─── */
function IntegrityBar({ score }: { score: number }) {
  const segments = 5
  const filled = Math.round((score / 100) * segments)
  const color = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
  const shadow = score >= 80 ? 'shadow-emerald-500/30' : score >= 50 ? 'shadow-amber-500/30' : 'shadow-red-500/30'

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-px">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-1.5 h-3 transition-all duration-500',
              i < filled ? `${color} ${shadow} shadow-sm` : 'bg-zinc-900'
            )}
          />
        ))}
      </div>
    </div>
  )
}

interface NodeFooterProps {
  inputCount: number
  actionCount: number
  outputCount: number
  isFiltered?: boolean
  isPermissionDenied?: boolean
  isCompact?: boolean
}

export function NodeFooter({
  inputCount,
  actionCount,
  outputCount,
  isFiltered,
  isPermissionDenied,
  isCompact,
}: NodeFooterProps) {
  const total = inputCount + actionCount + outputCount

  // Compute a simple "mechanical integrity" score
  // Full score if the page has inputs, operations, AND outputs (a complete data flow)
  let score = 0
  if (inputCount > 0) score += 35
  if (actionCount > 0) score += 35
  if (outputCount > 0) score += 30

  return (
    <div className={cn(
      "px-4 bg-black/50 border-t border-zinc-900/50 flex items-center justify-between transition-all",
      isCompact ? "py-1.5" : "py-2.5"
    )}>
      <div className="flex items-center gap-3">
        <span className="text-[9px] font-mono text-zinc-700">
          {isCompact ? `${inputCount}i ${actionCount}o ${outputCount}m` : `${total} ${total === 1 ? 'binding' : 'bindings'}`}
        </span>

        {isPermissionDenied && (
          <div className="flex items-center gap-1 text-red-500">
            <Lock className="size-2.5" />
            <span className="text-[8px] font-black ">Restricted</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        {isFiltered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="size-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          />
        )}
        <IntegrityBar score={score} />
        <Settings2 className="size-3 text-zinc-800 group-hover:text-zinc-500 transition-colors" />
      </div>
    </div>
  )
}
