'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'

interface Variable {
  id: string
  label: string
}

interface PendingColumn {
  id: string
  name: string
  type: string
  is_primary_key: boolean
  variable_id?: string
}

interface Props {
  pendingColumns: PendingColumn[]
  variables: Variable[]
  onAddRow: () => void
  onRemoveRow: (id: string) => void
  onUpdateRow: (id: string, updates: Partial<PendingColumn>) => void
}

export function ColumnDefinitionPanel({
  pendingColumns,
  variables,
  onAddRow,
  onRemoveRow,
  onUpdateRow
}: Props) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-black text-zinc-400">Define Schema Fields</Label>
          <Button
            type="button"
            onClick={onAddRow}
            variant="outline"
            className="h-7 px-3 text-[10px] border-zinc-200 dark:border-zinc-800 rounded-md font-black text-black dark:text-white"
          >
            <Plus className="size-3 mr-1" /> Add Row
          </Button>
        </div>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {pendingColumns.map(col => (
            <div key={col.id} className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4 relative group/row">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-bold text-zinc-400">Name</Label>
                  <Input
                    value={col.name}
                    onChange={e => onUpdateRow(col.id, { name: e.target.value.replace(/\s+/g, '_').toLowerCase() })}
                    placeholder="column_name"
                    className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-md h-9 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-bold text-zinc-400">Type</Label>
                  <Select value={col.type} onValueChange={v => onUpdateRow(col.id, { type: v || 'varchar' })}>
                    <SelectTrigger className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-md h-9 text-xs w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-md text-black dark:text-white">
                      {['uuid', 'varchar', 'int4', 'timestamp', 'jsonb', 'boolean', 'text'].map(t => (
                        <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-1.5">
                  <Label className="text-[9px] font-bold text-zinc-400">Registry Binding</Label>
                  <Select value={col.variable_id || ''} onValueChange={v => onUpdateRow(col.id, { variable_id: v || undefined })}>
                    <SelectTrigger className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-md h-9 text-xs w-full">
                      <SelectValue placeholder="Map to variable..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-md text-black dark:text-white">
                      {variables.map(v => (
                        <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <Checkbox
                    id={`pk-${col.id}`}
                    checked={col.is_primary_key}
                    onCheckedChange={c => onUpdateRow(col.id, { is_primary_key: !!c })}
                    className="border-zinc-300 dark:border-zinc-700 data-[state=checked]:bg-black dark:data-[state=checked]:bg-white"
                  />
                  <Label htmlFor={`pk-${col.id}`} className="text-[10px] font-bold text-zinc-500 cursor-pointer">PK</Label>
                </div>
              </div>
              {pendingColumns.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveRow(col.id)}
                  className="absolute -top-2 -right-2 size-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity shadow-lg"
                >
                  <Trash2 className="size-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
