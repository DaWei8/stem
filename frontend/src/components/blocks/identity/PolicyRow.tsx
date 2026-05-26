'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Trash2, Link2, Terminal, Cpu, Play, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'

const POLICY_STYLE: Record<string, { border: string; text: string; bg: string }> = {
  select: {
    border: 'border-blue-500/20 dark:border-blue-500/30',
    text: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/5'
  },
  insert: {
    border: 'border-emerald-500/20 dark:border-emerald-500/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/5'
  },
  update: {
    border: 'border-amber-500/20 dark:border-amber-500/30',
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/5'
  },
  delete: {
    border: 'border-red-500/20 dark:border-red-500/30',
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-500/5'
  },
}

interface Props {
  policy: any
  tables: any[]
  userTypes: any[]
  variables: any[]
  pages: any[]
  isActive: boolean
  onOpenSandbox: () => void
  onDelete: () => void
  onEdit: () => void
  isViewer?: boolean
}

export function PolicyRow({ policy, tables, userTypes, variables, pages, isActive, onOpenSandbox, onDelete, onEdit, isViewer = false }: Props) {
  const table = tables.find(t => t.id === policy.table_id)
  const userType = userTypes.find(ut => ut.id === policy.user_type_id)

  const referencedVars = useMemo(() => {
    if (!policy.policy_logic) return []
    return variables.filter(v =>
      policy.policy_logic.includes(v.name) ||
      policy.policy_logic.includes(v.label) ||
      policy.policy_logic.includes(v.id)
    )
  }, [policy.policy_logic, variables])

  const style = POLICY_STYLE[policy.policy_type] || POLICY_STYLE.select

  return (
    <div className={cn(
      'border-b border-zinc-100 dark:border-zinc-900 transition-all hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 group',
      isActive && 'bg-violet-500/5 dark:bg-violet-950/10 border-l-2 border-l-violet-500'
    )}>
      <div className="grid grid-cols-2 w-full gap-10 p-4">
        {/* Left Section: Name & Target Info */}
        <div 
          onClick={isViewer ? undefined : onEdit}
          className={cn("flex flex-col gap-2 select-none", isViewer ? "cursor-default" : "cursor-pointer group/row-title hover:opacity-90")}
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black text-black dark:text-white transition-colors flex items-center gap-1.5">
              {policy.name}
              {!isViewer && (
                <Pencil className="size-3 text-zinc-400 dark:text-zinc-500 opacity-0 group-hover/row-title:opacity-100 transition-opacity" />
              )}
            </span>
            {referencedVars.length > 0 && (
              <span className="inline-flex items-center text-nowrap gap-1 text-[9px] font-bold text-violet-500 bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5" title="Constraint Lineage">
                <Link2 className="size-2.5" />
                <span>{referencedVars.length} lineage ref{referencedVars.length > 1 ? 's' : ''}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 flex-wrap">
            <span>Targets entity</span>
            <span className="font-mono font-bold text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.2 bg-zinc-50 dark:bg-black">
              {table?.name || 'entity'}
            </span>
            <span>for operation</span>
            <span className={cn('px-1.5 py-0.2 border uppercase font-bold text-[9px]', style.border, style.text, style.bg)}>
              {policy.policy_type}
            </span>
            <span>bound to role</span>
            <span className="px-1.5 py-0.2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold uppercase text-[9px]">
              {userType?.name || 'all'}
            </span>
          </div>
        </div>

        <div className='w-full grid grid-cols-6 items-center gap-2'>
          <div className="w-full col-span-4">
            <div className="bg-zinc-100 dark:bg-black/80 border border-zinc-200 dark:border-zinc-800 p-2 font-mono text-[10px] text-zinc-600 dark:text-zinc-400 select-all truncate leading-relaxed">
              <span className="text-zinc-400 dark:text-zinc-600 select-none">WITH CHECK </span>
              {policy.policy_logic || 'true'}
            </div>
          </div>
          <div className="flex items-center justify-end w-full gap-2 col-span-2">
            <Button
              onClick={onOpenSandbox}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black border transition-all h-8',
                isActive
                  ? 'border-violet-500 bg-violet-500 text-white'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-violet-500 hover:text-violet-500 bg-white dark:bg-black'
              )}
              title="Open Sandbox Testing"
            >
              <Play className="size-3" />
              <span>{isActive ? 'Sandbox Active' : 'Test Sandbox'}</span>
            </Button>
            {!isViewer && (
              <Button
                onClick={onDelete}
                size="icon"
                variant="ghost"
                className="size-8 rounded-md border border-zinc-200 dark:border-zinc-800 text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-950 transition-all"
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
