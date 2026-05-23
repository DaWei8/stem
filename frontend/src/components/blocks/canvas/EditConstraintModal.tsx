'use client'

import { useState, useEffect } from 'react'
import { PageConstraint, Variable } from '@/types'
import { StandardModal } from '@/components/ui/StandardModal'
import { Input } from '@/components/ui/input'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  isOpen: boolean
  onClose: () => void
  constraintItem: PageConstraint | null
  availableVariables: Variable[]
  allPages: any[]
  currentPageId: string
  onSave: (constraint: any) => Promise<void>
  onUpdate?: (id: string, updates: any) => Promise<void>
  onRemove?: (id: string) => Promise<void>
}

export function EditConstraintModal({
  isOpen,
  onClose,
  constraintItem,
  availableVariables,
  allPages,
  currentPageId,
  onSave,
  onUpdate,
  onRemove,
}: Props) {
  const [variableId, setVariableId] = useState(constraintItem?.variable_id || '')
  const [operator, setOperator] = useState<string>(constraintItem?.operator || 'eq')
  const [expectedValue, setExpectedValue] = useState<string>(() => {
    const val = constraintItem?.expected_value
    if (val === undefined || val === null) return ''
    if (typeof val === 'object') return JSON.stringify(val)
    return String(val)
  })
  const [errorMessage, setErrorMessage] = useState(constraintItem?.error_message || '')
  const [fallbackPageId, setFallbackPageId] = useState(constraintItem?.fallback_page_id || '')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (constraintItem) {
      setVariableId(constraintItem.variable_id || '')
      setOperator(constraintItem.operator || 'eq')
      const val = constraintItem.expected_value
      if (val === undefined || val === null) setExpectedValue('')
      else if (typeof val === 'object') setExpectedValue(JSON.stringify(val))
      else setExpectedValue(String(val))
      setErrorMessage(constraintItem.error_message || '')
      setFallbackPageId(constraintItem.fallback_page_id || '')
    } else {
      setVariableId(availableVariables[0]?.id || '')
      setOperator('eq')
      setExpectedValue('')
      setErrorMessage('')
      setFallbackPageId('')
    }
  }, [constraintItem, availableVariables])

  const parseValue = (valStr: string) => {
    const trimmed = valStr.trim()
    if (trimmed === '') return null
    if (trimmed === 'true') return true
    if (trimmed === 'false') return false
    if (!isNaN(Number(trimmed)) && trimmed !== '') return Number(trimmed)
    try {
      return JSON.parse(trimmed)
    } catch {
      return trimmed
    }
  }

  const handleSave = async () => {
    if (!variableId) return
    setIsSaving(true)
    try {
      const parsedVal = parseValue(expectedValue)
      const payload = {
        variable_id: variableId,
        operator,
        expected_value: parsedVal,
        error_message: errorMessage || null,
        fallback_page_id: fallbackPageId || null,
      }

      if (constraintItem && onUpdate) {
        await onUpdate(constraintItem.id, payload)
      } else {
        await onSave(payload)
      }
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemove = async () => {
    if (constraintItem && onRemove) {
      if (confirm('Delete this logical constraint?')) {
        await onRemove(constraintItem.id)
        onClose()
      }
    }
  }

  const otherPages = allPages.filter(p => p.id !== currentPageId)

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title={constraintItem ? 'Edit Logic Constraint' : 'Create Logic Constraint'}
      confirmText={isSaving ? 'Saving...' : (constraintItem ? 'Save Changes' : 'Create')}
      onConfirm={handleSave}
      className="max-w-md text-black dark:text-white"
    >
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
              Registry Variable
            </label>
            <select
              value={variableId}
              onChange={(e) => setVariableId(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white h-11 px-3 rounded-none focus:outline-none focus:border-zinc-400 font-mono font-bold"
            >
              {availableVariables.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
              Operator
            </label>
            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white h-11 px-3 rounded-none focus:outline-none focus:border-zinc-400 font-bold"
            >
              <option value="eq">Equals (=)</option>
              <option value="neq">Not Equals (!=)</option>
              <option value="gt">Greater Than (&gt;)</option>
              <option value="gte">Greater or Equal (&gt;=)</option>
              <option value="lt">Less Than (&lt;)</option>
              <option value="lte">Less or Equal (&lt;=)</option>
              <option value="in">In List (array)</option>
              <option value="nin">Not In List (array)</option>
              <option value="contains">Contains (string/array)</option>
              <option value="exists">Exists / Is Set</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
            Expected Value (Raw string, number, boolean, or JSON)
          </label>
          <Input
            value={expectedValue}
            onChange={(e) => setExpectedValue(e.target.value)}
            placeholder="e.g. true, 100, pro, or [&quot;US&quot;, &quot;CA&quot;]"
            className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-none h-11 text-xs font-mono shadow-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
            Custom Error Message
          </label>
          <Input
            value={errorMessage}
            onChange={(e) => setErrorMessage(e.target.value)}
            placeholder="e.g. You must be a pro user to access this page"
            className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-none h-11 text-xs font-bold shadow-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
            Fallback Redirect Screen (Optional)
          </label>
          <select
            value={fallbackPageId}
            onChange={(e) => setFallbackPageId(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white h-11 px-3 rounded-none focus:outline-none focus:border-zinc-400 font-bold"
          >
            <option value="">(None - Fail Simulation)</option>
            {otherPages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title || p.name}
              </option>
            ))}
          </select>
        </div>

        {constraintItem && onRemove && (
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={handleRemove}
              className="text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-none text-[11px] font-black gap-2 h-11 px-4"
            >
              <Trash2 className="size-4" /> Delete Constraint
            </Button>
          </div>
        )}
      </div>
    </StandardModal>
  )
}
