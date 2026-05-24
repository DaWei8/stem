'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Plus, Key, Database } from 'lucide-react'

interface Column {
  id: string
  name: string
  type: string
  is_primary_key: boolean
}

interface Props {
  columns: Column[]
  onAddField: () => void
}

export function ExistingColumnsPanel({ columns, onAddField }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <Label className="text-xs font-black text-zinc-400">Fields & Schema</Label>
        <Button
          type="button"
          onClick={onAddField}
          variant="outline"
          className="h-7 px-3 text-xs border-zinc-200 dark:border-zinc-800 rounded-md font-bold text-black dark:text-white"
        >
          <Plus className="size-3 mr-1" /> Add Field
        </Button>
      </div>
      <div className="border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800">
        {columns.map(col => (
          <div key={col.id} className="p-3 flex items-center justify-between group/field hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors">
            <div className="flex items-center gap-3">
              <div className="size-6 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                {col.is_primary_key ? <Key className="size-3 text-zinc-400" /> : <Database className="size-3 text-zinc-500" />}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold font-mono text-black dark:text-white">{col.name}</span>
                <span className="text-[10px] font-mono text-zinc-400">{col.type}</span>
              </div>
            </div>
          </div>
        ))}
        {columns.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-xs text-zinc-400 italic">No fields defined</p>
          </div>
        )}
      </div>
    </div>
  )
}
