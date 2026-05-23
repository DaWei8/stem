'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Wifi, Battery, Signal } from 'lucide-react'

interface PhoneFrameProps {
  children: React.ReactNode
  isSelected?: boolean
  isActiveStep?: boolean
  isStart?: boolean
  isEnd?: boolean
  isHighlighted?: boolean
  isTraced?: boolean
  isFiltered?: boolean
  hasActiveFilter?: boolean
  simulationStatus?: 'success' | 'warning' | 'error' | 'none'
  isPermissionDenied?: boolean
  validationWarnings?: string[]
}

export function PhoneFrame({
  children,
  isSelected,
  isActiveStep,
  isStart,
  isEnd,
  isHighlighted,
  isTraced,
  isFiltered,
  hasActiveFilter,
  simulationStatus,
  isPermissionDenied,
  validationWarnings,
}: PhoneFrameProps) {
  const hasWarnings = validationWarnings && validationWarnings.length > 0

  /* ── Bezel glow color logic ── */
  const bezelClass = cn(
    'rounded-[28px] p-[2px] transition-all duration-500 relative',
    isSelected
      ? 'bg-gradient-to-b from-white/80 via-white/40 to-white/80 shadow-[0_0_30px_rgba(255,255,255,0.25)]'
      : isActiveStep
        ? 'bg-gradient-to-b from-green-400 to-green-600 shadow-[0_0_40px_rgba(34,197,94,0.6)] scale-[1.03]'
        : (isStart || isEnd)
          ? 'bg-gradient-to-b from-green-400/80 to-emerald-500/80 shadow-[0_0_25px_rgba(34,197,94,0.35)]'
          : isTraced
            ? 'bg-gradient-to-b from-white/70 to-white/40 shadow-[0_0_35px_rgba(255,255,255,0.5)] scale-[1.03] animate-pulse'
            : isHighlighted
              ? 'bg-gradient-to-b from-white/50 to-white/20 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
              : isFiltered
                ? 'bg-gradient-to-b from-white/60 to-white/30 shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-[1.01]'
                : 'bg-gradient-to-b from-zinc-600/80 to-zinc-800/80 group-hover:from-zinc-500/80 group-hover:to-zinc-700/80',
    simulationStatus === 'success' && !isStart && !isEnd && 'bg-gradient-to-b from-green-400 to-green-600',
    simulationStatus === 'error' && 'bg-gradient-to-b from-red-400 to-red-600',
    simulationStatus === 'warning' && 'bg-gradient-to-b from-amber-400 to-amber-600',
    hasWarnings && 'bg-gradient-to-b from-amber-400 to-amber-500 animate-pulse',
    isPermissionDenied && 'bg-gradient-to-b from-red-500/50 to-red-600/50 opacity-60',
    hasActiveFilter && !isFiltered && 'opacity-20 grayscale-[0.5] scale-[0.97] blur-[0.5px]',
  )

  return (
    <div className={bezelClass}>
      {/* Inner phone body */}
      <div className="bg-zinc-950 rounded-[26px] overflow-hidden flex flex-col relative">
        {/* ── Status Bar ── */}
        <div className="flex items-center justify-between px-5 pt-2.5 pb-1">
          <span className="text-[8px] font-semibold text-zinc-500 tabular-nums tracking-wide">
            9:41
          </span>
          <div className="flex items-center gap-1">
            <Signal className="size-2.5 text-zinc-600" />
            <Wifi className="size-2.5 text-zinc-600" />
            <Battery className="size-2.5 text-zinc-600" />
          </div>
        </div>

        {/* ── Dynamic Island ── */}
        <div className="flex justify-center pb-1.5">
          <motion.div
            className="w-16 h-[6px] bg-black rounded-full border border-zinc-800/50"
            whileHover={{ width: 80 }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* ── Screen Content ── */}
        <div className="flex-1 flex flex-col min-h-0">
          {children}
        </div>

        {/* ── Home Indicator ── */}
        <div className="flex justify-center py-1.5">
          <div className="w-24 h-[4px] bg-zinc-800 rounded-full" />
        </div>
      </div>
    </div>
  )
}
