'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDatabase } from '@/hooks/useDatabase'
import { cn } from '@/lib/utils'
import { AlertTriangle, Trash2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { ExistingColumnsPanel } from './ExistingColumnsPanel'
import { ColumnDefinitionPanel } from './ColumnDefinitionPanel'

interface Props {
  table: any
  columns: any[]
  variables: any[]
  onClose: () => void
  onDeleted: () => void
}

export function InlineTableEditForm({
  table,
  columns,
  variables,
  onClose,
  onDeleted
}: Props) {
  const updateTable = useDatabase(s => s.updateTable)
  const deleteTable = useDatabase(s => s.deleteTable)
  const addColumn = useDatabase(s => s.addColumn)

  const [editName, setEditName] = useState(table?.name || '')
  const [nameError, setNameError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDefiningColumn, setIsDefiningColumn] = useState(false)
  const [pendingColumns, setPendingColumns] = useState<any[]>([
    { id: 'initial', name: '', type: 'uuid', is_primary_key: true, variable_id: '' }
  ])

  const tableColumns = columns.filter(c => c.table_id === table?.id)

  const validateName = (name: string): boolean => {
    if (!name.trim()) {
      setNameError('Table name is required')
      return false
    }
    if (!/^[a-z0-9_]+$/.test(name.trim())) {
      setNameError('Only lowercase alphanumeric characters and underscores')
      return false
    }
    setNameError('')
    return true
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!table) return
    const cleanName = editName.trim().toLowerCase()
    if (!validateName(cleanName)) return
    setIsSaving(true)
    try {
      await updateTable(table.project_id, table.id, cleanName)
      toast.success(`Table "${cleanName}" updated`)
      onClose()
    } catch (err: unknown) {
      toast.error(`Update failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!table) return
    setIsDeleting(true)
    try {
      await deleteTable(table.project_id, table.id)
      toast.success(`Table "${table.name}" deleted`)
      onDeleted()
    } catch (err: unknown) {
      toast.error(`Delete failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSaveColumns = async () => {
    if (!table) return
    const validCols = pendingColumns.filter(c => c.name.trim() !== '')
    if (validCols.length === 0) return
    const existingNames = new Set(tableColumns.map(c => c.name.toLowerCase()))

    try {
      for (const col of validCols) {
        if (existingNames.has(col.name.toLowerCase())) {
          toast.error(`Column "${col.name}" already exists. Skipping.`)
          continue
        }
        await addColumn(table.project_id, table.id, {
          name: col.name,
          type: col.type,
          is_primary_key: col.is_primary_key,
          variable_id: col.variable_id || undefined
        })
      }
      setPendingColumns([{ id: Math.random().toString(), name: '', type: 'uuid', is_primary_key: false, variable_id: '' }])
      setIsDefiningColumn(false)
    } catch (err: unknown) {
      toast.error(`Failed to deploy fields: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const addPendingRow = () => setPendingColumns([
    ...pendingColumns,
    { id: Math.random().toString(), name: '', type: 'varchar', is_primary_key: false, variable_id: '' }
  ])

  const removePendingRow = (id: string) => {
    if (pendingColumns.length > 1) {
      setPendingColumns(pendingColumns.filter(c => c.id !== id))
    }
  }

  const updatePendingRow = (id: string, updates: any) => {
    setPendingColumns(pendingColumns.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  if (showDeleteConfirm) {
    return (
      <div className="p-4 bg-red-500/5 border border-red-500/20 space-y-4 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="size-4 text-red-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-black text-red-500">Destructive Action</h4>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Delete <span className="font-mono text-black dark:text-white">&quot;{table.name}&quot;</span>? This will drop the table and all columns permanently.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800/60">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isDeleting}
            className="h-8 text-xs gap-1 border-zinc-200 dark:border-zinc-800 rounded-md text-black dark:text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-8 text-xs font-semibold gap-1 bg-red-600 hover:bg-red-700 text-white border-0 rounded-md"
          >
            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 text-zinc-950 dark:text-zinc-50">
      <div className="space-y-2">
        <Label className="text-xs font-black text-zinc-400">Table Identity</Label>
        <Input
          value={editName}
          onChange={e => {
            const val = e.target.value.replace(/\s+/g, '_').toLowerCase()
            setEditName(val)
            if (nameError) validateName(val)
          }}
          className={cn(
            "bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-md h-12 font-mono text-black dark:text-white",
            nameError && "border-red-500/50 focus-visible:ring-red-500/30"
          )}
          placeholder="e.g. products"
          required
        />
        {nameError && (
          <p className="text-[10px] text-red-500 font-bold animate-in fade-in slide-in-from-top-1 duration-150">
            {nameError}
          </p>
        )}
      </div>

      {isDefiningColumn ? (
        <ColumnDefinitionPanel
          pendingColumns={pendingColumns}
          variables={variables}
          onAddRow={addPendingRow}
          onRemoveRow={removePendingRow}
          onUpdateRow={updatePendingRow}
        />
      ) : (
        <ExistingColumnsPanel
          columns={tableColumns}
          onAddField={() => setIsDefiningColumn(true)}
        />
      )}

      <div className="flex gap-2 w-full pt-4 border-t border-zinc-200 dark:border-zinc-800">
        {isDefiningColumn ? (
          <>
            <Button
              type="button"
              onClick={() => setIsDefiningColumn(false)}
              variant="outline"
              className="flex-1 border-zinc-200 dark:border-zinc-800 rounded-md h-10 text-xs text-black dark:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveColumns}
              className="flex-2 bg-black dark:bg-white text-white dark:text-black rounded-md h-10 text-xs font-bold"
            >
              Deploy Fields
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              variant="outline"
              className="h-10 px-4 text-xs gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-500/5 border-red-500/20 dark:border-red-950/30 rounded-md"
            >
              <Trash2 className="size-3" /> Delete
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-black dark:bg-white text-white dark:text-black rounded-md h-10 text-xs font-bold"
            >
              <Save className="size-3 mr-1 inline-block" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        )}
      </div>
    </form>
  )
}
