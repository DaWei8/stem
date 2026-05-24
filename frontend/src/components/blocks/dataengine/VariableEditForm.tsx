'use client'

import { useState, useMemo } from 'react'
import { Variable, VariableType, VariableScope } from '@/types'
import { useVariables } from '@/hooks/useVariables'
import { usePages } from '@/hooks/usePages'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Save, RotateCcw, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  variable: Variable
  projectId: string
  onClose: () => void
}

const supabase = createClient()

export function VariableEditForm({ variable, projectId, onClose }: Props) {
  const { updateVariable } = useVariables()
  const { pages, inputs, fetchProjectPages } = usePages()

  // Form local state
  const [editLabel, setEditLabel] = useState(variable.label)
  const [editType, setEditType] = useState<VariableType>(variable.type)
  const [editDesc, setEditDesc] = useState(variable.description || '')
  
  // Custom scope mapping (local/shared/global)
  // local = transient, shared = contextual, global = persistent
  const initialScopeType = useMemo(() => {
    if (variable.scope === 'transient') return 'local'
    if (variable.scope === 'contextual') return 'shared'
    return 'global'
  }, [variable.scope])

  const [scopeType, setScopeType] = useState<'local' | 'shared' | 'global'>(initialScopeType)

  // Find currently bound pages for this variable
  const currentlyBoundPageIds = useMemo(() => {
    const pageIds = new Set<string>()
    inputs.forEach(i => {
      if (i.variable_id === variable.id) pageIds.add(i.page_id)
    })
    return Array.from(pageIds)
  }, [inputs, variable.id])

  const [selectedPageId, setSelectedPageId] = useState<string>(
    currentlyBoundPageIds[0] || pages[0]?.id || ''
  )
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>(currentlyBoundPageIds)
  const [isSaving, setIsSaving] = useState(false)

  const handleCheckboxChange = (pageId: string, checked: boolean) => {
    if (checked) {
      setSelectedPageIds(prev => [...prev, pageId])
    } else {
      setSelectedPageIds(prev => prev.filter(id => id !== pageId))
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editLabel.trim()) {
      toast.error('Variable label is required')
      return
    }

    setIsSaving(true)
    try {
      // 1. Map UI scope type back to database variable scope
      let dbScope: VariableScope = 'persistent'
      if (scopeType === 'local') dbScope = 'transient'
      else if (scopeType === 'shared') dbScope = 'contextual'

      // 2. Save variable to DB
      await updateVariable(projectId, variable.id, {
        label: editLabel.trim(),
        type: editType,
        scope: dbScope,
        description: editDesc.trim() || null
      })

      // 3. Update page input bindings
      const targetPageIds = new Set<string>()
      if (scopeType === 'local' && selectedPageId) {
        targetPageIds.add(selectedPageId)
      } else if (scopeType === 'shared') {
        selectedPageIds.forEach(id => targetPageIds.add(id))
      }

      // Delete bindings that are no longer active
      const inputsToDelete = inputs.filter(
        i => i.variable_id === variable.id && !targetPageIds.has(i.page_id)
      )
      if (inputsToDelete.length > 0) {
        const deleteIds = inputsToDelete.map(i => i.id)
        await supabase.from('page_inputs').delete().in('id', deleteIds)
      }

      // Create new page bindings if they don't exist yet
      if (scopeType !== 'global') {
        const insertRows: any[] = []
        for (const pageId of Array.from(targetPageIds)) {
          const alreadyLinked = inputs.some(
            i => i.variable_id === variable.id && i.page_id === pageId
          )
          if (!alreadyLinked) {
            insertRows.push({
              page_id: pageId,
              variable_id: variable.id,
              name: editLabel.trim(),
              input_type: 'form_field',
              project_id: projectId
            })
          }
        }
        if (insertRows.length > 0) {
          await supabase.from('page_inputs').insert(insertRows)
        }
      }

      // 4. Force global sync for page inputs
      await fetchProjectPages(projectId)

      toast.success('Variable and page bindings updated successfully')
      onClose()
    } catch (err: any) {
      console.error(err)
      toast.error(`Update failed: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5 text-zinc-950 dark:text-zinc-50">
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
          Identifier Name
        </label>
        <Input
          value={editLabel}
          onChange={e => setEditLabel(e.target.value)}
          className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-md font-mono text-xs"
          placeholder="e.g. user_display_name"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
          Value Type
        </label>
        <select
          value={editType}
          onChange={e => setEditType(e.target.value as VariableType)}
          className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs h-9 px-3 rounded-md focus:outline-none focus:border-zinc-400"
        >
          <option value="string">String (Text)</option>
          <option value="number">Number (Float/Int)</option>
          <option value="boolean">Boolean (True/False)</option>
          <option value="date">Date Time</option>
          <option value="array">Array (List)</option>
          <option value="object">Object (Structure)</option>
          <option value="custom">Custom Type</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
          Scope Availability
        </label>
        <select
          value={scopeType}
          onChange={e => setScopeType(e.target.value as any)}
          className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs h-9 px-3 rounded-md focus:outline-none focus:border-zinc-400"
        >
          <option value="local">Local (For exactly one page)</option>
          <option value="shared">Shared (For one or more pages but not all)</option>
          <option value="global">Global (Active for all pages)</option>
        </select>
      </div>

      {/* Local Scope Page Selector */}
      {scopeType === 'local' && (
        <div className="space-y-1.5 animate-fadeIn">
          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
            Target Page/Screen
          </label>
          {pages.length > 0 ? (
            <select
              value={selectedPageId}
              onChange={e => setSelectedPageId(e.target.value)}
              className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs h-9 px-3 rounded-md focus:outline-none focus:border-zinc-400"
            >
              {pages.map(page => (
                <option key={page.id} value={page.id}>
                  {page.title || page.name} ({page.folder || 'Root'})
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-amber-500 bg-amber-500/10 p-2 border border-amber-500/20 rounded-md">
              <AlertCircle className="size-3.5 shrink-0" />
              <span>No pages found in this project. Create a page first.</span>
            </div>
          )}
        </div>
      )}

      {/* Shared Scope Checkbox List */}
      {scopeType === 'shared' && (
        <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 animate-fadeIn">
          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
            Select Shared Pages
          </label>
          {pages.length > 0 ? (
            <div className="space-y-2 bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 p-3 rounded-md">
              {pages.map(page => (
                <div key={page.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`page-${page.id}`}
                    checked={selectedPageIds.includes(page.id)}
                    onCheckedChange={(checked) => handleCheckboxChange(page.id, !!checked)}
                  />
                  <label htmlFor={`page-${page.id}`} className="text-[11px] font-medium cursor-pointer">
                    {page.title || page.name} <span className="text-[9px] text-zinc-400">({page.folder || 'Root'})</span>
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-amber-500 bg-amber-500/10 p-2 border border-amber-500/20 rounded-md">
              <AlertCircle className="size-3.5 shrink-0" />
              <span>No pages found in this project.</span>
            </div>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
          Description
        </label>
        <Textarea
          value={editDesc}
          onChange={e => setEditDesc(e.target.value)}
          className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-md min-h-[70px] text-xs resize-none"
          placeholder="Brief description of what this variable is used for."
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSaving}
          className="h-8 text-xs gap-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
        >
          <RotateCcw className="size-3" /> Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSaving}
          className="h-8 text-xs font-semibold gap-1 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 border-0"
        >
          <Save className="size-3" /> {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
