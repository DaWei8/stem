'use client'

import { Plus, Trash2, Edit3, Check, X, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { PersonaInstance } from '@/hooks/usePersonaManager'

interface Props {
  instances: PersonaInstance[]
  selectedInstanceId: string | null
  setSelectedInstanceId: (id: string | null) => void
  isAddingInstance: boolean
  setIsAddingInstance: (adding: boolean) => void
  newInstanceName: string
  setNewInstanceName: (name: string) => void
  handleAddInstance: () => void
  editingInstanceNameId: string | null
  setEditingInstanceNameId: (id: string | null) => void
  tempInstanceName: string
  setTempInstanceName: (name: string) => void
  handleUpdateInstanceName: (id: string) => void
  handleDeleteInstance: (id: string) => void
  roleColor?: string
}

const COLOR_MAP: Record<string, { border: string; text: string; bg: string }> = {
  zinc: { border: 'border-zinc-500', text: 'text-zinc-400', bg: 'bg-zinc-500/10' },
  red: { border: 'border-red-500', text: 'text-red-400', bg: 'bg-red-500/10' },
  orange: { border: 'border-orange-500', text: 'text-orange-400', bg: 'bg-orange-500/10' },
  yellow: { border: 'border-yellow-500', text: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  green: { border: 'border-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  blue: { border: 'border-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/10' },
  indigo: { border: 'border-indigo-500', text: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  violet: { border: 'border-violet-500', text: 'text-violet-400', bg: 'bg-violet-500/10' },
}

export function PersonaList({
  instances,
  selectedInstanceId,
  setSelectedInstanceId,
  isAddingInstance,
  setIsAddingInstance,
  newInstanceName,
  setNewInstanceName,
  handleAddInstance,
  editingInstanceNameId,
  setEditingInstanceNameId,
  tempInstanceName,
  setTempInstanceName,
  handleUpdateInstanceName,
  handleDeleteInstance,
  roleColor = 'zinc'
}: Props) {
  const accent = COLOR_MAP[roleColor] || COLOR_MAP.zinc

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
        <div className="flex items-center gap-1.5 pb-1">
          <User className="size-3.5 text-zinc-500 shrink-0" />
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
            Instances ({instances.length})
          </span>
        </div>

        <div className="space-y-2">
          {instances.map(inst => {
            const isSelected = selectedInstanceId === inst.id
            const isEditing = editingInstanceNameId === inst.id

            return (
              <div
                key={inst.id}
                onClick={() => !isEditing && setSelectedInstanceId(inst.id)}
                className={cn(
                  "group relative flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer",
                  isSelected
                    ? `bg-zinc-950/40 border-l-4 ${accent.border} border-zinc-800`
                    : "border-zinc-900 bg-zinc-950/10 hover:bg-zinc-900/50 hover:border-zinc-800 text-zinc-400 hover:text-zinc-100"
                )}
              >
                {isEditing ? (
                  <div className="flex items-center gap-1.5 w-full" onClick={e => e.stopPropagation()}>
                    <Input
                      value={tempInstanceName}
                      onChange={e => setTempInstanceName(e.target.value)}
                      className="h-8 text-xs bg-black border-zinc-800 focus-visible:ring-1 focus-visible:ring-zinc-700 rounded-lg px-2 py-1"
                      autoFocus
                      onKeyDown={e => e.key === 'Enter' && handleUpdateInstanceName(inst.id)}
                    />
                    <button onClick={() => handleUpdateInstanceName(inst.id)} className="p-1 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors"><Check className="size-4" /></button>
                    <button onClick={() => setEditingInstanceNameId(null)} className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"><X className="size-4" /></button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={cn("size-6 rounded-lg flex items-center justify-center shrink-0 bg-zinc-900", isSelected && accent.bg)}>
                        <User className={cn("size-3", isSelected ? accent.text : "text-zinc-500")} />
                      </div>
                      <span className="text-xs font-semibold truncate pr-2">{inst.name}</span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingInstanceNameId(inst.id); setTempInstanceName(inst.name) }}
                        className="p-1 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition-colors"
                      >
                        <Edit3 className="size-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteInstance(inst.id) }}
                        className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          })}

          {instances.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 px-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/10">
              <User className="size-8 text-zinc-700 mb-2" />
              <p className="text-xs text-zinc-500 font-medium italic text-center">No personas defined.</p>
              <p className="text-[10px] text-zinc-600 text-center mt-1">Create an instance to start customizing mock data.</p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-900 mt-4 shrink-0">
        {isAddingInstance ? (
          <div className="space-y-2.5 bg-zinc-950/20 p-3 border border-zinc-900 rounded-xl">
            <Input
              placeholder="e.g., Enterprise Buyer"
              value={newInstanceName}
              onChange={e => setNewInstanceName(e.target.value)}
              className="h-9 text-xs bg-black border-zinc-800 focus-visible:ring-1 focus-visible:ring-zinc-700 rounded-lg"
              onKeyDown={e => e.key === 'Enter' && handleAddInstance()}
              autoFocus
            />
            <div className="flex gap-2">
              <Button onClick={handleAddInstance} className="flex-1 h-8 text-xs font-semibold rounded-lg bg-white text-black hover:bg-zinc-200">Add</Button>
              <Button onClick={() => setIsAddingInstance(false)} variant="ghost" className="h-8 text-xs font-semibold rounded-lg text-zinc-400 hover:text-white">Cancel</Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setIsAddingInstance(true)} variant="outline" className="w-full h-10 text-xs font-bold rounded-xl gap-2 border-zinc-800 bg-zinc-950/20 hover:bg-zinc-900/50 hover:text-white transition-all">
            <Plus className="size-4 text-zinc-400" /> New Persona Instance
          </Button>
        )}
      </div>
    </div>
  )
}
