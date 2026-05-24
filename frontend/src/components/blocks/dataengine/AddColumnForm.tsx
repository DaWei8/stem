'use client'

import { useState } from 'react'
import { Plus, X, Key, Database, Layers } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface Props {
  variables: any[]
  onAdd: (data: { name: string; type: string; is_primary_key: boolean; variable_id?: string }) => Promise<void>
  onCancel: () => void
}

export function AddColumnForm({ variables, onAdd, onCancel }: Props) {
  const [name, setName] = useState('')
  const [type, setType] = useState('varchar')
  const [isPrimaryKey, setIsPrimaryKey] = useState(false)
  const [variableId, setVariableId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Field name is required')
      return
    }

    // Clean name to snake_case
    const cleanedName = name.trim().replace(/\s+/g, '_').toLowerCase()

    setIsSubmitting(true)
    try {
      await onAdd({
        name: cleanedName,
        type,
        is_primary_key: isPrimaryKey,
        variable_id: (variableId && variableId !== 'none') ? variableId : undefined
      })
      toast.success(`Field "${cleanedName}" created`)
      setName('')
      setIsPrimaryKey(false)
      setVariableId('')
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-2">
        <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Define New Field</span>
        <button type="button" onClick={onCancel} className="text-zinc-400 hover:text-black dark:hover:text-white">
          <X className="size-3.5" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Field Name */}
        <div className="space-y-1">
          <Label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Field Name</Label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. status_code"
            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-md h-8 text-xs font-mono"
            required
            autoFocus
          />
        </div>

        {/* Data Type */}
        <div className="space-y-1">
          <Label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Data Type</Label>
          <Select value={type} onValueChange={(val) => setType(val || '')}>
            <SelectTrigger className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-md h-8 text-xs w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-md text-black dark:text-white">
              {['uuid', 'varchar', 'int4', 'timestamp', 'jsonb', 'boolean', 'text'].map(t => (
                <SelectItem key={t} value={t} className="text-xs">{t.toUpperCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Registry Binding */}
        <div className="space-y-1">
          <Label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Registry Binding (Optional)</Label>
          <Select value={variableId} onValueChange={(val) => setVariableId(val || '')}>
            <SelectTrigger className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-md h-8 text-xs w-full">
              <SelectValue placeholder="Map to variable..." />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-md text-black dark:text-white">
              <SelectItem value="none" className="text-xs italic text-zinc-400">None</SelectItem>
              {variables.map(v => (
                <SelectItem key={v.id} value={v.id} className="text-xs font-mono">{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Primary Key Checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <Checkbox
            id="drawer-pk"
            checked={isPrimaryKey}
            onCheckedChange={c => setIsPrimaryKey(!!c)}
            className="border-zinc-300 dark:border-zinc-700 data-[state=checked]:bg-black dark:data-[state=checked]:bg-white rounded-md"
          />
          <Label htmlFor="drawer-pk" className="text-[10px] font-bold text-zinc-500 cursor-pointer flex items-center gap-1">
            <Key className="size-3 text-amber-500" />
            <span>Mark as Primary Key (PK)</span>
          </Label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1 border-zinc-200 dark:border-zinc-800 rounded-md h-9 text-[10px] uppercase font-bold"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-md h-9 text-[10px] uppercase font-bold"
        >
          {isSubmitting ? 'Adding...' : 'Add Field'}
        </Button>
      </div>
    </form>
  )
}
