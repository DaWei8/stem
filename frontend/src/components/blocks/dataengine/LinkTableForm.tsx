'use client'

import { useState, useMemo } from 'react'
import { Plus, X, Database, Key } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Props {
  tables: any[]
  columns: any[]
  onCancel: () => void
  onLink: (data: {
    tableId: string | 'new'
    tableName?: string
    columnId?: string | 'new'
    columnName?: string
    columnType?: string
  }) => Promise<void>
}

export function LinkTableForm({ tables, columns, onCancel, onLink }: Props) {
  const [tableSelection, setTableSelection] = useState<string>('')
  const [newTableName, setNewTableName] = useState('')
  
  const [columnSelection, setColumnSelection] = useState<string>('')
  const [newColumnName, setNewColumnName] = useState('')
  const [newColumnType, setNewColumnType] = useState('varchar')

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter columns for the selected table
  const tableColumns = useMemo(() => {
    if (!tableSelection || tableSelection === 'new') return []
    return columns.filter(c => c.table_id === tableSelection)
  }, [columns, tableSelection])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const isNewTable = tableSelection === 'new'
    const isNewColumn = columnSelection === 'new' || isNewTable

    if (isNewTable && !newTableName.trim()) {
      toast.error('Table name is required')
      return
    }
    if (isNewColumn && !newColumnName.trim()) {
      toast.error('Column name is required')
      return
    }
    if (!tableSelection) {
      toast.error('Please select a table')
      return
    }
    if (!columnSelection && !isNewTable) {
      toast.error('Please select a column')
      return
    }

    setIsSubmitting(true)
    try {
      const cleanTableName = newTableName.trim().replace(/\s+/g, '_').toLowerCase()
      const cleanColumnName = newColumnName.trim().replace(/\s+/g, '_').toLowerCase()

      await onLink({
        tableId: tableSelection as any,
        tableName: isNewTable ? cleanTableName : undefined,
        columnId: isNewTable ? 'new' : (columnSelection as any),
        columnName: isNewColumn ? cleanColumnName : undefined,
        columnType: isNewColumn ? newColumnType : undefined,
      })
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200 text-left">
      <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-850 pb-2">
        <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Link Database Source</span>
        <button type="button" onClick={onCancel} className="text-zinc-400 hover:text-black dark:hover:text-white">
          <X className="size-3.5" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Table Selection */}
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Database Table</label>
          <select
            value={tableSelection}
            onChange={(e) => {
              setTableSelection(e.target.value)
              setColumnSelection('')
            }}
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white h-9 px-3 rounded-md focus:outline-none focus:border-zinc-400"
            required
          >
            <option value="">Select table...</option>
            {tables.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
            <option value="new">+ Create New Table...</option>
          </select>
        </div>

        {/* New Table Name Input */}
        {tableSelection === 'new' && (
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">New Table Name</label>
            <Input
              value={newTableName}
              onChange={e => setNewTableName(e.target.value)}
              placeholder="e.g. user_profiles"
              className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-md h-9 text-xs font-mono focus-visible:ring-1 focus-visible:ring-zinc-400"
              required
            />
          </div>
        )}

        {/* Column Selection (Only if table is selected and not new) */}
        {tableSelection && tableSelection !== 'new' && (
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Table Column</label>
            <select
              value={columnSelection}
              onChange={(e) => setColumnSelection(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white h-9 px-3 rounded-md focus:outline-none focus:border-zinc-400"
              required
            >
              <option value="">Select column...</option>
              {tableColumns.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.type.toUpperCase()})</option>
              ))}
              <option value="new">+ Create New Column...</option>
            </select>
          </div>
        )}

        {/* New Column Input Fields (If new table or new column option chosen) */}
        {(tableSelection === 'new' || columnSelection === 'new') && (
          <div className="space-y-3 pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">New Column Name</label>
              <Input
                value={newColumnName}
                onChange={e => setNewColumnName(e.target.value)}
                placeholder="e.g. bio_text"
                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-md h-9 text-xs font-mono focus-visible:ring-1 focus-visible:ring-zinc-400"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Column Type</label>
              <select
                value={newColumnType}
                onChange={e => setNewColumnType(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white h-9 px-3 rounded-md focus:outline-none focus:border-zinc-400"
              >
                {['uuid', 'varchar', 'int4', 'timestamp', 'jsonb', 'boolean', 'text'].map(t => (
                  <option key={t} value={t}>{t.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 h-9 text-[10px] font-black uppercase tracking-wider rounded-md bg-black dark:bg-white text-white dark:text-black"
        >
          {isSubmitting ? 'Linking...' : 'Confirm Link'}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="h-9 px-3 text-[10px] font-black uppercase tracking-wider rounded-md border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
