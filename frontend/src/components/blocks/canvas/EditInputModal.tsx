'use client'

import { useState, useEffect } from 'react'
import { ScreenInput, Variable } from '@/types'
import { StandardModal } from '@/components/ui/StandardModal'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  isOpen: boolean
  onClose: () => void
  inputItem: ScreenInput
  availableVariables: Variable[]
  onUpdate: (id: string, updates: Partial<ScreenInput>) => Promise<void>
  onRemove: (id: string) => Promise<void>
}

export function EditInputModal({
  isOpen,
  onClose,
  inputItem,
  availableVariables,
  onUpdate,
  onRemove,
}: Props) {
  const [name, setName] = useState(inputItem.name)
  const [label, setLabel] = useState(inputItem.label || '')
  const [inputType, setInputType] = useState(inputItem.input_type || 'form_field')
  const [variableId, setVariableId] = useState(inputItem.variable_id || '')
  const [isRequired, setIsRequired] = useState(inputItem.is_required || false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setName(inputItem.name)
    setLabel(inputItem.label || '')
    setInputType(inputItem.input_type || 'form_field')
    setVariableId(inputItem.variable_id || '')
    setIsRequired(inputItem.is_required || false)
  }, [inputItem])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onUpdate(inputItem.id, {
        name,
        label: label || null,
        input_type: inputType,
        variable_id: variableId || null,
        is_required: isRequired,
      })
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemove = async () => {
    if (confirm(`Are you sure you want to delete input "${name}"?`)) {
      await onRemove(inputItem.id)
      onClose()
    }
  }

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Input Interface"
      confirmText={isSaving ? 'Saving...' : 'Save Changes'}
      onConfirm={handleSave}
      className="max-w-md text-black dark:text-white"
    >
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
            Input Name / Key
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. email_input"
            className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-none h-11 text-xs font-bold shadow-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
            User-Facing Label
          </label>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Enter email address"
            className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-none h-11 text-xs font-bold shadow-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
              Input Type
            </label>
            <select
              value={inputType}
              onChange={(e) => setInputType(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white h-11 px-3 rounded-none focus:outline-none focus:border-zinc-400 font-bold"
            >
              <option value="form_field">Form Field</option>
              <option value="query_param">Query Param</option>
              <option value="url_path">URL Path Segment</option>
              <option value="header">Request Header</option>
              <option value="cookie">Cookie</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
              Link Registry Variable
            </label>
            <select
              value={variableId}
              onChange={(e) => setVariableId(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white h-11 px-3 rounded-none focus:outline-none focus:border-zinc-400 font-mono font-bold"
            >
              <option value="">(None - Transient)</option>
              {availableVariables.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label} ({v.scope})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-zinc-800">
          <Checkbox
            id="is_required_input"
            checked={isRequired}
            onCheckedChange={(v) => setIsRequired(!!v)}
            className="border-zinc-300 dark:border-zinc-700 data-[state=checked]:bg-black dark:data-[state=checked]:bg-white"
          />
          <label htmlFor="is_required_input" className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider cursor-pointer">
            Required Input (Simulation fails if not set)
          </label>
        </div>

        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={handleRemove}
            className="text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-none text-[11px] font-black gap-2 h-11 px-4"
          >
            <Trash2 className="size-4" /> Delete Input
          </Button>
        </div>
      </div>
    </StandardModal>
  )
}
