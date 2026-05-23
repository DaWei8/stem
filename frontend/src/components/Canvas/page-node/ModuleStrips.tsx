'use client'

import { cn } from '@/lib/utils'
import { Fingerprint, Play, Database, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ModuleStripsProps {
  inputCount: number
  actionCount: number
  outputCount: number
  onAddInput?: (e?: React.MouseEvent) => void
  onAddAction?: (e?: React.MouseEvent) => void
  onAddOutput?: (e?: React.MouseEvent) => void
  inputNames?: string[]
  actionNames?: string[]
  outputNames?: string[]
}

function StripPill({
  icon,
  label,
  count,
  accentClass,
  bgClass,
  names,
  onAdd,
}: {
  icon: React.ReactNode
  label: string
  count: number
  accentClass: string
  bgClass: string
  names?: string[]
  onAdd?: (e?: React.MouseEvent) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const hasItems = count > 0

  return (
    <div className="flex flex-col">
      <button
        onClick={(e) => {
          e.stopPropagation()
          if (hasItems) setExpanded(!expanded)
          else onAdd?.(e)
        }}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[8px] font-bold tracking-wide transition-all',
          hasItems
            ? `${bgClass} ${accentClass} hover:brightness-125`
            : `bg-zinc-900/50 text-zinc-700 hover:text-zinc-500 hover:bg-zinc-900 border border-dashed border-zinc-800`,
        )}
      >
        {icon}
        <span>{count > 0 ? count : '+'}</span>
        <span className="hidden min-[0px]:inline">{label}</span>
        {hasItems && (
          expanded
            ? <ChevronUp className="size-2 ml-auto" />
            : <ChevronDown className="size-2 ml-auto" />
        )}
      </button>
      <AnimatePresence>
        {expanded && names && names.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-0.5 pt-1 pl-3">
              {names.map((name, i) => (
                <span key={i} className={cn('text-[7px] font-mono truncate', accentClass, 'opacity-70')}>
                  {name}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ModuleStrips({
  inputCount,
  actionCount,
  outputCount,
  onAddInput,
  onAddAction,
  onAddOutput,
  inputNames = [],
  actionNames = [],
  outputNames = [],
}: ModuleStripsProps) {
  const totalCount = inputCount + actionCount + outputCount

  return (
    <div className="px-3 py-2 border-t border-zinc-800/50">
      {/* Module label */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[7px] font-black tracking-[0.2em] text-zinc-600 uppercase">
          Modules
        </span>
        <span className="text-[7px] font-mono text-zinc-700">
          {totalCount}
        </span>
      </div>

      {/* Strip pills */}
      <div className="flex flex-col gap-1">
        <StripPill
          icon={<Fingerprint className="size-2.5" />}
          label="Interfaces"
          count={inputCount}
          accentClass="text-blue-400"
          bgClass="bg-blue-500/10 border border-blue-500/20"
          names={inputNames}
          onAdd={onAddInput}
        />
        <StripPill
          icon={<Play className="size-2.5" />}
          label="Triggers"
          count={actionCount}
          accentClass="text-violet-400"
          bgClass="bg-violet-500/10 border border-violet-500/20"
          names={actionNames}
          onAdd={onAddAction}
        />
        <StripPill
          icon={<Database className="size-2.5" />}
          label="Mutations"
          count={outputCount}
          accentClass="text-emerald-400"
          bgClass="bg-emerald-500/10 border border-emerald-500/20"
          names={outputNames}
          onAdd={onAddOutput}
        />
      </div>
    </div>
  )
}
