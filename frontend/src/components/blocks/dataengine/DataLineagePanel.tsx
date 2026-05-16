'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  X, Layers, Database, Monitor, Zap, ShieldCheck, ArrowRight, AlertTriangle
} from 'lucide-react'

interface Props {
  variable: any
  inputs: any[]
  outputs: any[]
  actions: any[]
  pages: any[]
  columns: any[]
  tables: any[]
  policies: any[]
  functions: any[]
  onClose: () => void
}

export function DataLineagePanel({
  variable, inputs, outputs, actions, pages,
  columns, tables, policies, functions, onClose
}: Props) {
  // 1. Screens that READ this variable (inputs mapped to it)
  const readerScreens = useMemo(() => {
    const pageIds = inputs.filter(i => i.variable_id === variable.id).map(i => i.page_id)
    return pages.filter(p => pageIds.includes(p.id))
  }, [inputs, variable.id, pages])

  // 2. Screens that WRITE this variable (outputs mapped to it)
  const writerScreens = useMemo(() => {
    const pageIds = outputs.filter(o => o.variable_id === variable.id).map(o => o.page_id)
    return pages.filter(p => pageIds.includes(p.id))
  }, [outputs, variable.id, pages])

  // 3. DB columns linked to this variable
  const linkedColumns = useMemo(() => {
    return columns.filter(c => c.variable_id === variable.id).map(col => {
      const table = tables.find(t => t.id === col.table_id)
      return { ...col, tableName: table?.name || 'unknown' }
    })
  }, [columns, variable.id, tables])

  // 4. RLS policies on tables that contain this variable's columns
  const relatedPolicies = useMemo(() => {
    const tableIds = linkedColumns.map(c => c.table_id)
    return policies.filter(p => tableIds.includes(p.table_id))
  }, [linkedColumns, policies])

  // 5. Functions that reference this variable (by name match in description/parameters)
  const relatedFunctions = useMemo(() => {
    return functions.filter(f =>
      f.name?.includes(variable.label) ||
      f.description?.includes(variable.label) ||
      f.parameters?.some((p: any) => p.name?.includes(variable.label))
    )
  }, [functions, variable.label])

  const isOrphan = readerScreens.length === 0 && writerScreens.length === 0 && linkedColumns.length === 0

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 380, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="h-full border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 overflow-y-auto overflow-x-hidden shrink-0"
    >
      <div className="p-5 space-y-6 w-[380px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-blue-500" />
            <span className="text-xs font-black text-black dark:text-white ">Lineage</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
            <X className="size-4" />
          </button>
        </div>

        {/* Variable identity */}
        <div className="p-3 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-2">
          <p className="text-sm font-black text-black dark:text-white font-mono">{variable.label}</p>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold px-2 py-0.5 border border-blue-500/20 text-blue-500 bg-blue-500/5">{variable.type}</span>
            <span className="text-[9px] font-bold px-2 py-0.5 border border-zinc-200 dark:border-zinc-800 text-zinc-400">{variable.scope}</span>
          </div>
          {variable.description && (
            <p className="text-[10px] text-zinc-400 leading-relaxed">{variable.description}</p>
          )}
        </div>

        {/* Orphan warning */}
        {isOrphan && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/5 border border-amber-500/20">
            <AlertTriangle className="size-3.5 text-amber-500 shrink-0" />
            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
              This variable is an orphan — not referenced by any screen, column, or output. Consider removing it or linking it.
            </p>
          </div>
        )}

        {/* DB Source */}
        {linkedColumns.length > 0 && (
          <LineageSection icon={<Database className="size-3.5 text-emerald-500" />} title="Database Source" count={linkedColumns.length} color="emerald">
            {linkedColumns.map(col => (
              <LineageItem key={col.id} label={`${col.tableName}.${col.name}`} sublabel={col.type} />
            ))}
          </LineageSection>
        )}

        {/* Screens that READ */}
        {readerScreens.length > 0 && (
          <LineageSection icon={<Monitor className="size-3.5 text-blue-500" />} title="Read By (Inputs)" count={readerScreens.length} color="blue">
            {readerScreens.map(p => (
              <LineageItem key={p.id} label={p.title || p.name} sublabel={p.folder || 'Root'} />
            ))}
          </LineageSection>
        )}

        {/* Screens that WRITE */}
        {writerScreens.length > 0 && (
          <LineageSection icon={<ArrowRight className="size-3.5 text-violet-500" />} title="Written By (Outputs)" count={writerScreens.length} color="violet">
            {writerScreens.map(p => (
              <LineageItem key={p.id} label={p.title || p.name} sublabel={p.folder || 'Root'} />
            ))}
          </LineageSection>
        )}

        {/* RLS Policies */}
        {relatedPolicies.length > 0 && (
          <LineageSection icon={<ShieldCheck className="size-3.5 text-red-500" />} title="RLS Policies" count={relatedPolicies.length} color="red">
            {relatedPolicies.map(p => (
              <LineageItem key={p.id} label={p.name} sublabel={`${p.policy_type} — ${p.policy_logic}`} />
            ))}
          </LineageSection>
        )}

        {/* Functions */}
        {relatedFunctions.length > 0 && (
          <LineageSection icon={<Zap className="size-3.5 text-amber-500" />} title="Functions" count={relatedFunctions.length} color="amber">
            {relatedFunctions.map(f => (
              <LineageItem key={f.id} label={f.name} sublabel={f.description || 'No description'} />
            ))}
          </LineageSection>
        )}
      </div>
    </motion.div>
  )
}

/* ────── Sub-components ────── */

function LineageSection({ icon, title, count, color, children }: {
  icon: React.ReactNode; title: string; count: number; color: string; children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-[10px] font-black text-zinc-500 ">{title}</span>
        </div>
        <span className={cn('text-[10px] font-bold', `text-${color}-500`)}>{count}</span>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function LineageItem({ label, sublabel }: { label: string; sublabel: string }) {
  return (
    <div className="flex items-center justify-between p-2.5 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors group">
      <div className="flex flex-col min-w-0">
        <span className="text-[11px] font-bold text-black dark:text-white truncate">{label}</span>
        <span className="text-[9px] text-zinc-400 truncate">{sublabel}</span>
      </div>
    </div>
  )
}
