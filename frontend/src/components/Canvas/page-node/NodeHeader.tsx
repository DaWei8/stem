'use client'

import { cn } from '@/lib/utils'
import { 
  Laptop, Layout, PanelRight, MessageSquare, 
  ShieldAlert, Zap, AlertTriangle, Minimize2, Maximize2 
} from 'lucide-react'
import { Tooltip } from '@/components/ui/Tooltip'
import { motion } from 'framer-motion'

const PAGE_TYPE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  screen: { icon: <Laptop className="size-3" />, label: 'Screen', color: 'text-zinc-500' },
  modal: { icon: <Layout className="size-3" />, label: 'Modal', color: 'text-violet-400' },
  drawer: { icon: <PanelRight className="size-3" />, label: 'Drawer', color: 'text-blue-400' },
  popover: { icon: <MessageSquare className="size-3" />, label: 'Popover', color: 'text-amber-400' },
}

interface NodeHeaderProps {
  label: string
  description?: string
  pageType?: string
  isNew?: boolean
  filterType?: string
  isChaosMode?: boolean
  hasActions: boolean
  hasOutputs?: boolean
  validationWarnings?: string[]
  onTriggerFailure?: () => void
  onToggleCompact?: () => void
  isCompact?: boolean
}

export function NodeHeader({
  label,
  description,
  pageType,
  isNew,
  filterType,
  isChaosMode,
  hasActions,
  hasOutputs,
  validationWarnings,
  onTriggerFailure,
  onToggleCompact,
  isCompact,
}: NodeHeaderProps) {
  const config = PAGE_TYPE_CONFIG[pageType || 'screen'] || PAGE_TYPE_CONFIG.screen

  return (
    <div className="px-4 pt-4 pb-3 border-b border-zinc-900/50">
      {/* Type badge row */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <div className={cn('size-4 flex items-center justify-center', config.color)}>
            {config.icon}
          </div>
          <span className={cn(
            'text-[9px] uppercase font-black tracking-[0.15em] transition-colors',
            filterType === 'screens' ? 'text-white' : config.color
          )}>
            {config.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isNew && (
            <Tooltip content="New Component (Unsaved Snapshot)">
              <span className="text-[7px] font-black bg-blue-500 text-white px-1.5 py-0.5 animate-pulse cursor-help">
                NEW
              </span>
            </Tooltip>
          )}
          {validationWarnings && validationWarnings.length > 0 && (
            <Tooltip content={`Warning: ${validationWarnings[0]}`}>
              <div className="size-4 flex items-center justify-center text-amber-500 cursor-help">
                <AlertTriangle className="size-3" />
              </div>
            </Tooltip>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleCompact?.() }}
            className="size-5 flex items-center justify-center text-zinc-700 hover:text-white hover:bg-zinc-800 transition-all rounded"
            title={isCompact ? "Expand" : "Collapse"}
          >
            {isCompact ? <Maximize2 className="size-3" /> : <Minimize2 className="size-3" />}
          </button>
          <div className="flex gap-0.5">
            <div className="size-1 rounded-full bg-zinc-800" />
            <div className="size-1 rounded-full bg-zinc-800" />
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-white group-hover:text-zinc-200 transition-colors leading-tight">
        {label}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-[10px] text-zinc-600 line-clamp-1 font-medium mt-1 leading-relaxed">
          {description}
        </p>
      )}

      {/* Chaos Mode: Failure Trigger */}
      {isChaosMode && (hasActions || hasOutputs) && (
        <motion.button
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation()
            onTriggerFailure?.()
          }}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-[9px] font-black uppercase tracking-widest transition-colors"
        >
          <Zap className="size-3" /> Inject Fault
        </motion.button>
      )}
    </div>
  )
}
