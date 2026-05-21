'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Database, HelpCircle, Key, Layers, Plus, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AddColumnForm } from './AddColumnForm'

interface Props {
  table: any
  columns: any[]
  variables: any[]
  onSelectVariable?: (id: string) => void
  onClose: () => void
  onAddColumn?: (tableId: string, column: any) => Promise<void>
}

export function TableDetailsDrawer({
  table,
  columns,
  variables,
  onSelectVariable,
  onClose,
  onAddColumn
}: Props) {
  const [isAddingField, setIsAddingField] = useState(false)
  // Find linked variables for the table's columns
  const fields = useMemo(() => {
    return columns.map(col => {
      const linkedVar = variables.find(v => v.id === col.variable_id)
      return {
        ...col,
        variable: linkedVar
      }
    })
  }, [columns, variables])

  const pkCount = useMemo(() => columns.filter(c => c.is_primary_key).length, [columns])
  const linkedVarsCount = useMemo(() => columns.filter(c => c.variable_id).length, [columns])

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
            <Database className="size-4 text-emerald-500" />
            <span className="text-xs font-black text-black dark:text-white uppercase tracking-wider">Table Schema</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
            aria-label="Close details"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Table identity */}
        <div className="p-3 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-2">
          <p className="text-sm font-black text-black dark:text-white lowercase font-mono break-all">{table.name}</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[9px] font-bold px-2 py-0.5 border border-emerald-500/20 text-emerald-500 bg-emerald-500/5 uppercase">
              Persistent Entity
            </span>
            <span className="text-[9px] font-bold px-2 py-0.5 border border-zinc-200 dark:border-zinc-800 text-zinc-400">
              Columns: {columns.length}
            </span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800">
            <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Primary Keys</p>
            <div className="flex items-center gap-1.5">
              <Key className="size-3.5 text-zinc-400" />
              <span className="text-xs font-black text-black dark:text-white">{pkCount}</span>
            </div>
          </div>
          <div className="p-3 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800">
            <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Linked Variables</p>
            <div className="flex items-center gap-1.5">
              <Layers className="size-3.5 text-blue-500" />
              <span className="text-xs font-black text-black dark:text-white">{linkedVarsCount}</span>
            </div>
          </div>
        </div>

        {/* Column Fields List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 tracking-widest uppercase">Schema Fields</p>
            {onAddColumn && !isAddingField && (
              <button
                onClick={() => setIsAddingField(true)}
                className="text-[9px] font-black cursor-pointer text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 uppercase tracking-wider flex items-center gap-0.5"
              >
                <Plus className="size-2.5" /> Add Field
              </button>
            )}
          </div>
          <div className="space-y-1.5">
            {isAddingField && onAddColumn && (
              <AddColumnForm
                variables={variables}
                onCancel={() => setIsAddingField(false)}
                onAdd={async (data) => {
                  await onAddColumn(table.id, data)
                  setIsAddingField(false)
                }}
              />
            )}

            {fields.map(col => (
              <div
                key={col.id}
                className="p-3 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex flex-col gap-2 group hover:border-zinc-400 dark:hover:border-zinc-650 transition-colors"
              >
                <div className="flex items-start justify-between min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    {col.is_primary_key ? (
                      <span title="Primary Key">
                        <Key className="size-3 text-emerald-500 shrink-0" />
                      </span>
                    ) : (
                      <Database className="size-3 text-zinc-400 shrink-0" />
                    )}
                    <span className="text-xs font-bold font-mono text-black dark:text-white truncate">
                      {col.name}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-400 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 px-1 py-0.5 shrink-0 uppercase">
                    {col.type}
                  </span>
                </div>

                {col.variable && (
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Layers className="size-3 text-blue-500 shrink-0" />
                      <span className="text-[10px] font-mono text-zinc-400 truncate">
                        Linked: <span className="text-blue-500 font-bold">{col.variable.label}</span>
                      </span>
                    </div>
                    {onSelectVariable && (
                      <button
                        onClick={() => onSelectVariable(col.variable.id)}
                        className="text-[9px] font-bold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-0.5 transition-colors"
                      >
                        Trace <ArrowRight className="size-2.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {fields.length === 0 && !isAddingField && (
              <button
                onClick={() => setIsAddingField(true)}
                className="w-full py-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-450 dark:hover:border-zinc-650 transition-colors flex flex-col items-center justify-center gap-1.5"
              >
                <HelpCircle className="size-5 text-zinc-400 mx-auto mb-1" />
                <p className="text-[10px] font-bold text-zinc-400 uppercase">No fields defined</p>
                {onAddColumn && (
                  <span className="text-[9px] font-black cursor-pointer text-emerald-500 uppercase mt-1">+ Click to Add Field</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
