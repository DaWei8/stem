'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Fingerprint, Database, Play, Terminal, ArrowRight,
  Hash, ToggleLeft, Type, Calendar, Box,
  Plus, Trash2, ChevronRight
} from 'lucide-react'
import { Tooltip } from '@/components/ui/Tooltip'
import { ScreenInput, ScreenAction, ScreenOutput, Variable } from '@/types'
import { AnimatePresence, motion } from 'framer-motion'

/* ─── Variable Type Icons ─── */
const VAR_TYPE_ICON: Record<string, React.ReactNode> = {
  string: <Type className="size-2.5" />,
  number: <Hash className="size-2.5" />,
  boolean: <ToggleLeft className="size-2.5" />,
  date: <Calendar className="size-2.5" />,
  object: <Box className="size-2.5" />,
  array: <Box className="size-2.5" />,
}

/* ─── Shared Section Wrapper (Collapsible + Quick-Add) ─── */
function SectionShell({
  icon,
  title,
  count,
  color,
  isActiveFilter,
  onAdd,
  children,
}: {
  icon: React.ReactNode
  title: string
  count: number
  color: string
  isActiveFilter?: boolean
  onAdd?: () => void
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={cn(
      'px-4 py-2.5 transition-all duration-300 group/section',
      isActiveFilter ? 'bg-white/3 border-l-2 border-white/20' : ''
    )}>
      {/* Section Header — clickable to collapse */}
      <div className="flex items-center justify-between mb-1.5">
        <button
          onClick={(e) => { e.stopPropagation(); setIsCollapsed(!isCollapsed) }}
          className="flex items-center gap-1.5 cursor-pointer select-none"
        >
          <ChevronRight className={cn(
            'size-2.5 text-zinc-700 transition-transform duration-200',
            !isCollapsed && 'rotate-90'
          )} />
          <div className={cn(
            'size-4 flex items-center justify-center transition-all',
            color,
            isActiveFilter && 'drop-shadow-[0_0_6px_currentColor]'
          )}>
            {icon}
          </div>
          <span className={cn(
            'text-[9px] font-black transition-colors',
            isActiveFilter ? 'text-white' : 'text-zinc-600'
          )}>
            {title}
          </span>
          <span className={cn(
            'text-[9px] font-mono transition-colors',
            isActiveFilter ? 'text-zinc-400' : 'text-zinc-700'
          )}>
            {count}
          </span>
        </button>

        {/* Quick-add button — visible on section hover */}
        {onAdd && (
          <button
            onClick={(e) => { e.stopPropagation(); onAdd() }}
            className="size-5 flex items-center justify-center text-zinc-700 hover:text-white hover:bg-zinc-800 transition-all opacity-0 group-hover/section:opacity-100"
          >
            <Plus className="size-3" />
          </button>
        )}
      </div>

      {/* Collapsible content */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Inline Delete Button (shared) ─── */
function ItemDeleteButton({ onDelete }: { onDelete: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onDelete() }}
      className="size-5 flex items-center justify-center text-zinc-800 hover:text-red-500 transition-all opacity-0 group-hover/item:opacity-100 shrink-0"
    >
      <Trash2 className="size-2.5" />
    </button>
  )
}


/* ─── INTERFACES (Inputs/Sinks) ─── */
export function InputsSection({
  inputs,
  variables,
  isActiveFilter,
  onAdd,
  onRemove,
  onRebindVariable,
}: {
  inputs: ScreenInput[]
  variables: Variable[]
  isActiveFilter?: boolean
  onAdd?: () => void
  onRemove?: (id: string) => void
  onRebindVariable?: (inputId: string, variableId: string) => void
}) {
  if (inputs.length === 0 && !onAdd) return null

  return (
    <SectionShell
      icon={<Fingerprint className="size-3" />}
      title="Interfaces"
      count={inputs.length}
      color="text-blue-400"
      isActiveFilter={isActiveFilter}
      onAdd={onAdd}
    >
      <div className="flex flex-col gap-1">
        {inputs.map((input) => {
          const linkedVar = variables.find(v => v.id === input.variable_id)
          const varType = linkedVar?.type || 'unknown'
          const typeIcon = VAR_TYPE_ICON[varType] || <Box className="size-2.5" />

          return (
            <div
              key={input.id}
              className="flex items-center justify-between py-1.5 px-2.5 bg-black/30 border border-zinc-800/50 group/item hover:border-zinc-700 transition-all"
            >
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <span className="text-[10px] font-bold text-zinc-300 group-hover/item:text-white transition-colors truncate">
                  {input.name || input.label}
                </span>
                <div className="flex items-center gap-1">
                  <div className="text-zinc-600">{typeIcon}</div>
                  <select
                    className="bg-transparent text-[8px] font-mono text-zinc-600 hover:text-zinc-300 outline-none cursor-pointer appearance-none"
                    value={input.variable_id || ''}
                    onChange={(e) => onRebindVariable?.(input.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="">No Binding</option>
                    {!linkedVar && input.variable_id && (
                      <option value={input.variable_id}>
                        {input.variable_id.slice(0, 8)}
                      </option>
                    )}
                    {variables.map(v => (
                      <option key={v.id} value={v.id} className="bg-zinc-900 text-zinc-300 font-mono text-[10px]">{v.label}</option>
                    ))}
                  </select>
                  {linkedVar && <span className="text-[8px] font-mono text-zinc-700">: {varType}</span>}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {linkedVar?.scope && (
                  <Tooltip content={`Scope: ${linkedVar.scope}`}>
                    <span className={cn(
                      'text-[7px] font-black  px-1 py-0.5 border cursor-help',
                      linkedVar.scope === 'persistent' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' :
                        linkedVar.scope === 'transient' ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' :
                          'text-violet-400 border-violet-400/20 bg-violet-400/5'
                    )}>
                      {linkedVar.scope === 'persistent' ? 'GLOBAL' : linkedVar.scope === 'transient' ? 'LOCAL' : 'CTX'}
                    </span>
                  </Tooltip>
                )}
                <code className="text-[8px] font-mono text-zinc-600 bg-black/50 px-1.5 py-0.5 border border-zinc-800/50">
                  {input.input_type === 'form_field' ? 'FORM' : 'QUERY'}
                </code>
                {onRemove && <ItemDeleteButton onDelete={() => onRemove(input.id)} />}
              </div>
            </div>
          )
        })}
      </div>
    </SectionShell>
  )
}


/* ─── OPERATIONS (Triggers / Logic Gates) ─── */
export function ActionsSection({
  actions,
  isActiveFilter,
  onAdd,
  onRemove,
}: {
  actions: ScreenAction[]
  isActiveFilter?: boolean
  onAdd?: () => void
  onRemove?: (id: string) => void
}) {
  if (actions.length === 0 && !onAdd) return null

  return (
    <SectionShell
      icon={<Play className="size-3" />}
      title="Operations"
      count={actions.length}
      color="text-purple-400"
      isActiveFilter={isActiveFilter}
      onAdd={onAdd}
    >
      <div className="flex flex-col gap-1">
        {actions.map((action) => (
          <div
            key={action.id}
            className="flex items-center justify-between py-2 px-2.5 bg-black/30 border border-zinc-800/50 group/item hover:border-zinc-700 transition-all"
          >
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-zinc-600  tracking-tight">
                  {action.action_type?.split('_')[0] || 'EXEC'}
                </span>
                <ArrowRight className="w-2.5 h-2.5 text-zinc-800 group-hover/item:text-zinc-500 group-hover/item:translate-x-0.5 transition-all shrink-0" />
                <span className="text-[10px] font-bold text-zinc-200 truncate">
                  {action.name}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <Terminal className="size-2.5 text-zinc-700 shrink-0" />
                <span className="text-[8px] font-mono text-zinc-700 truncate">
                  {action.function_id
                    ? <><span className="text-purple-500/60">fn</span> {action.function_id.slice(0, 8)}()</>
                    : <span className="italic">eval_inline</span>
                  }
                </span>
              </div>
            </div>
            {onRemove && <ItemDeleteButton onDelete={() => onRemove(action.id)} />}
          </div>
        ))}
      </div>
    </SectionShell>
  )
}


/* ─── STATE MUTATIONS (Outputs/Sources) ─── */
export function OutputsSection({
  outputs,
  variables,
  isActiveFilter,
  onAdd,
  onRemove,
  onRebindVariable,
}: {
  outputs: ScreenOutput[]
  variables: Variable[]
  isActiveFilter?: boolean
  onAdd?: () => void
  onRemove?: (id: string) => void
  onRebindVariable?: (outputId: string, variableId: string) => void
}) {
  if (outputs.length === 0 && !onAdd) return null

  return (
    <SectionShell
      icon={<Database className="size-3" />}
      title="State Mutations"
      count={outputs.length}
      color="text-emerald-400"
      isActiveFilter={isActiveFilter}
      onAdd={onAdd}
    >
      <div className="flex flex-col gap-1">
        {outputs.map((output) => {
          const linkedVar = variables.find(v => v.id === output.variable_id)

          return (
            <div
              key={output.id}
              className="flex items-center justify-between py-1.5 px-2.5 bg-black/30 border border-zinc-800/50 group/item hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className={cn(
                  'size-1.5 rounded-full shrink-0',
                  output.output_type === 'webhook' ? 'bg-amber-500' : 'bg-emerald-500'
                )} />
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-zinc-400 group-hover/item:text-zinc-200 transition-colors truncate">
                    {output.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-mono text-zinc-700 shrink-0">→</span>
                    <select
                      className="bg-transparent text-[8px] font-mono text-zinc-600 hover:text-zinc-300 outline-none cursor-pointer appearance-none"
                      value={output.variable_id || ''}
                      onChange={(e) => onRebindVariable?.(output.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="">No Binding</option>
                      {variables.map(v => (
                        <option key={v.id} value={v.id} className="bg-zinc-900 text-zinc-300 font-mono text-[10px]">{v.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <code className="text-[8px] font-mono text-zinc-600 bg-black/50 px-1.5 py-0.5 border border-zinc-800/50">
                  {output.output_type === 'state_update' ? 'MUTATE' :
                    output.output_type === 'webhook' ? 'WEBHOOK' : 'SYNC'}
                </code>
                {onRemove && <ItemDeleteButton onDelete={() => onRemove(output.id)} />}
              </div>
            </div>
          )
        })}
      </div>
    </SectionShell>
  )
}
