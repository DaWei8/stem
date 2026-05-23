'use client'

import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/lib/utils'
import {
  AlertTriangle,
  Laptop, Layout,
  Maximize2,
  MessageSquare,
  Minimize2,
  PanelRight
} from 'lucide-react'

const PAGE_TYPE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string; bgClass: string }> = {
  screen: { icon: <Laptop className="size-2.5" />, label: 'Screen', color: 'text-zinc-400', bgClass: 'bg-zinc-800' },
  modal: { icon: <Layout className="size-2.5" />, label: 'Modal', color: 'text-violet-400', bgClass: 'bg-violet-500/15' },
  drawer: { icon: <PanelRight className="size-2.5" />, label: 'Drawer', color: 'text-blue-400', bgClass: 'bg-blue-500/15' },
  popover: { icon: <MessageSquare className="size-2.5" />, label: 'Popover', color: 'text-amber-400', bgClass: 'bg-amber-500/15' },
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
    <div className="px-3 pt-2 pb-2">
      {/* Type badge + controls row */}
      <div className="flex items-center justify-between mb-1.5">
        <div className={cn(
          'flex items-center rounded! gap-1 px-1.5 pr-2 py-0.5',
          config.bgClass,
        )}>
          <div className={cn('flex items-center justify-center', config.color)}>
            {config.icon}
          </div>
          <span className={cn(
            'text-[9px] font-black',
            filterType === 'screens' ? 'text-white' : config.color
          )}>
            {config.label}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {isNew && (
            <Tooltip content="New Screen (Unsaved)">
              <span className="text-[6px] font-black bg-blue-500 text-white px-1 py-px rounded animate-pulse cursor-help">
                NEW
              </span>
            </Tooltip>
          )}
          {validationWarnings && validationWarnings.length > 0 && (
            <Tooltip content={`Warning: ${validationWarnings[0]}`}>
              <div className="size-3.5 flex items-center justify-center text-amber-500 cursor-help">
                <AlertTriangle className="size-2.5" />
              </div>
            </Tooltip>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleCompact?.() }}
            className="size-4 flex items-center justify-center text-zinc-700 hover:text-white hover:bg-zinc-800 transition-all rounded"
            title={isCompact ? 'Expand' : 'Collapse'}
          >
            {isCompact ? <Maximize2 className="size-2.5" /> : <Minimize2 className="size-2.5" />}
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xs font-bold text-white leading-tight truncate">
        {label}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-[9px] text-zinc-600 line-clamp-1 font-medium mt-0.5 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
}
