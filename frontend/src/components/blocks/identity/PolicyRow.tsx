'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Eye, Trash2, Link2, Terminal, Cpu } from 'lucide-react'
import { Button } from '@/components/ui/button'

const POLICY_STYLE: Record<string, string> = {
  select: 'border-blue-500/20 text-blue-600 dark:text-blue-400 bg-blue-500/5',
  insert: 'border-emerald-500/20 text-emerald-600 dark:text-green-400 bg-emerald-500/5',
  update: 'border-amber-500/20 text-amber-600 dark:text-amber-400 bg-amber-500/5',
  delete: 'border-red-500/20 text-red-600 dark:text-red-400 bg-red-500/5',
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
}

export function PolicyRow({ policy, tables, userTypes, variables, pages, isActive, onOpenSandbox, onDelete }: Props) {
  const table = tables.find(t => t.id === policy.table_id)
  const userType = userTypes.find(ut => ut.id === policy.user_type_id)

  // Constraint Lineage: find variable references inside the policy expression
  const referencedVars = useMemo(() => {
    if (!policy.policy_logic) return []
    return variables.filter(v =>
      policy.policy_logic.includes(v.name) ||
      policy.policy_logic.includes(v.label) ||
      policy.policy_logic.includes(v.id)
    )
  }, [policy.policy_logic, variables])

  // For each referenced var, find pages that have actions modifying it
  const linkedPages = useMemo(() => {
    if (referencedVars.length === 0) return []
    return pages.filter(p =>
      // simplified: check if page title references variable names (full impl would check actions)
      referencedVars.some(v => p.title?.toLowerCase().includes(v.name?.toLowerCase()))
    ).slice(0, 3)
  }, [referencedVars, pages])

  return (
    <div className={cn(
      'border transition-all group',
      isActive
        ? 'border-violet-500/40 bg-violet-500/5 dark:bg-violet-950/20'
        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 hover:border-zinc-400 dark:hover:border-zinc-600'
    )}>
      <div className="flex items-start gap-4 p-4">
        {/* Icon */}
        <div className="bg-white dark:bg-black size-9 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0">
          <Eye className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs font-black  tracking-tight text-black dark:text-white">{policy.name}</p>
            {referencedVars.length > 0 && (
              <div className="flex items-center gap-1 text-violet-500" title="Constraint Lineage: references tracked variables">
                <Link2 className="size-3" />
                <span className="text-[9px] font-bold">{referencedVars.length} var{referencedVars.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('text-[10px] font-black px-2 py-0.5 border ', POLICY_STYLE[policy.policy_type])}>
              {policy.policy_type}
            </span>
            <span className="text-[10px] text-zinc-400">on</span>
            <span className="text-[10px] font-mono font-black text-black dark:text-white">{table?.name || 'entity'}</span>
            <span className="text-[10px] text-zinc-400">for</span>
            <span className="text-[10px] font-black  px-2 py-0.5 bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300">
              {userType?.name || 'all'}
            </span>
          </div>

          {/* Logic expression */}
          <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 truncate">{policy.policy_logic}</p>

          {/* Constraint Lineage pills */}
          {referencedVars.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[9px] text-zinc-400 ">Lineage:</span>
              {referencedVars.slice(0, 4).map(v => (
                <span key={v.id} className="text-[9px] font-mono px-1.5 py-0.5 bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400">
                  {v.name || v.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onOpenSandbox}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1.5 text-[9px] font-black  border transition-all',
              isActive
                ? 'border-violet-500/50 text-violet-500 bg-violet-500/10'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-violet-500/50 hover:text-violet-500'
            )}
            title="Open WASM Policy Sandbox"
          >
            <Cpu className="size-3" />
            {isActive ? 'Close' : 'Sandbox'}
          </button>
          <Button
            onClick={onDelete}
            size="icon"
            className="size-8 border-zinc-200 dark:border-zinc-800 rounded-none bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-900 transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
