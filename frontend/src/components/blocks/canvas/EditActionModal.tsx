'use client'

import { useState, useEffect } from 'react'
import { ScreenAction } from '@/types'
import { StandardModal } from '@/components/ui/StandardModal'
import { Input } from '@/components/ui/input'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  isOpen: boolean
  onClose: () => void
  actionItem: ScreenAction
  availableFunctions: any[]
  onUpdate: (id: string, updates: Partial<ScreenAction>) => Promise<void>
  onRemove: (id: string) => Promise<void>
}

export function EditActionModal({
  isOpen,
  onClose,
  actionItem,
  availableFunctions,
  onUpdate,
  onRemove,
}: Props) {
  const [name, setName] = useState(actionItem.name)
  const [actionType, setActionType] = useState(actionItem.action_type || 'function_call')
  const [functionId, setFunctionId] = useState(actionItem.function_id || '')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setName(actionItem.name)
    setActionType(actionItem.action_type || 'function_call')
    setFunctionId(actionItem.function_id || '')
  }, [actionItem])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onUpdate(actionItem.id, {
        name,
        action_type: actionType,
        function_id: functionId || null,
      })
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemove = async () => {
    if (confirm(`Are you sure you want to delete trigger "${name}"?`)) {
      await onRemove(actionItem.id)
      onClose()
    }
  }

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Active Trigger (Frontend Function)"
      confirmText={isSaving ? 'Saving...' : 'Save Changes'}
      onConfirm={handleSave}
      className="max-w-md text-black dark:text-white"
    >
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
            Trigger Identifier / Frontend Function Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. on_click_submit"
            className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-md h-11 text-xs font-bold shadow-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
              Trigger Type
            </label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white h-11 px-3 rounded-md focus:outline-none focus:border-zinc-400 font-bold"
            >
              <option value="function_call">Function Call (Backend Linked)</option>
              <option value="navigation">Navigation / Link</option>
              <option value="ui_event">UI Event (e.g. Scroll, Focus)</option>
              <option value="analytics_log">Analytics Log</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
              Link Backend Cloud Function
            </label>
            <select
              value={functionId}
              disabled={actionType !== 'function_call'}
              onChange={(e) => setFunctionId(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white h-11 px-3 rounded-md focus:outline-none focus:border-zinc-400 font-mono font-bold disabled:opacity-50"
            >
              <option value="">(None - Pure Frontend Logic)</option>
              {availableFunctions.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
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
            className="text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-md text-[11px] font-black gap-2 h-11 px-4"
          >
            <Trash2 className="size-4" /> Delete Trigger
          </Button>
        </div>
      </div>
    </StandardModal>
  )
}
