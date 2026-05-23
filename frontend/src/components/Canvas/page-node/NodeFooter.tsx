'use client'

import { cn } from '@/lib/utils'
import { Lock } from 'lucide-react'
import { motion } from 'framer-motion'

/* ─── Integrity Score (how "complete" is this logic container) ─── */
function IntegrityDots({ score }: { score: number }) {
  const segments = 4
  const filled = Math.round((score / 100) * segments)
  const color = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="flex gap-px">
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'size-1 rounded-full transition-all duration-500',
            i < filled ? color : 'bg-zinc-800'
          )}
        />
      ))}
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
  // Compute a simple "mechanical integrity" score
  let score = 0
  if (inputCount > 0) score += 35
  if (actionCount > 0) score += 35
  if (outputCount > 0) score += 30

  return (
    <div className="px-3 py-1.5 flex items-center justify-between border-t border-zinc-800/30">
      <div className="flex items-center gap-2">
        <span className="text-[7px] font-mono text-zinc-700 tabular-nums">
          {inputCount}i · {actionCount}o · {outputCount}m
        </span>

        {isPermissionDenied && (
          <div className="flex items-center gap-0.5 text-red-500">
            <Lock className="size-2" />
            <span className="text-[7px] font-black">RLS</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {isFiltered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="size-1 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]"
          />
        )}
        <IntegrityDots score={score} />
      </div>
    </div>
  )
}
