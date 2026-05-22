'use client'

import { useState, useEffect } from 'react'
import { ScreenOutput, Variable } from '@/types'
import { StandardModal } from '@/components/ui/StandardModal'
import { Input } from '@/components/ui/input'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  isOpen: boolean
  onClose: () => void
  outputItem: ScreenOutput
  availableVariables: Variable[]
  onUpdate: (id: string, updates: Partial<ScreenOutput>) => Promise<void>
  onRemove: (id: string) => Promise<void>
}

export function EditOutputModal({
  isOpen,
  onClose,
  outputItem,
  availableVariables,
  onUpdate,
  onRemove,
}: Props) {
  const [name, setName] = useState(outputItem.name)
  const [outputType, setOutputType] = useState(outputItem.output_type || 'state_update')
  const [variableId, setVariableId] = useState(outputItem.variable_id || '')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setName(outputItem.name)
    setOutputType(outputItem.output_type || 'state_update')
    setVariableId(outputItem.variable_id || '')
  }, [outputItem])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onUpdate(outputItem.id, {
        name,
        output_type: outputType,
        variable_id: variableId || null,
      })
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemove = async () => {
    if (confirm(`Are you sure you want to delete output "${name}"?`)) {
      await onRemove(outputItem.id)
      onClose()
    }
  }

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit State Mutation (Output)"
      confirmText={isSaving ? 'Saving...' : 'Save Changes'}
      onConfirm={handleSave}
      className="max-w-md text-black dark:text-white"
    >
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
            Output Identifier / Mutation
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. update_cart"
            className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-none h-11 text-xs font-bold shadow-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
              Mutation Type
            </label>
            <select
              value={outputType}
              onChange={(e) => setOutputType(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white h-11 px-3 rounded-none focus:outline-none focus:border-zinc-400 font-bold"
            >
              <option value="state_update">State Update</option>
              <option value="database_write">Database Write</option>
              <option value="session_clear">Clear Session</option>
              <option value="toast_notification">Toast Notification</option>
              <option value="redirect">Client Redirect</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
              Target Registry Variable
            </label>
            <select
              value={variableId}
              onChange={(e) => setVariableId(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white h-11 px-3 rounded-none focus:outline-none focus:border-zinc-400 font-mono font-bold"
            >
              <option value="">(None)</option>
              {availableVariables.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label} ({v.scope})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={handleRemove}
            className="text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-none text-[11px] font-black gap-2 h-11 px-4"
          >
            <Trash2 className="size-4" /> Delete Output
          </Button>
        </div>
      </div>
    </StandardModal>
  )
}
