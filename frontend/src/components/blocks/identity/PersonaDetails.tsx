'use client'

import { Trash2, User, PlusCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Variable } from '@/types'
import { cn } from '@/lib/utils'
import { PersonaInstance } from '@/hooks/usePersonaManager'

interface Props {
  selectedInstance: PersonaInstance | null
  availableVariables: Variable[]
  handleAddVariableValue: (varId: string) => void
  handleUpdateVariableValue: (varLabel: string, value: any) => void
  handleRemoveVariableValue: (varLabel: string) => void
}

const TYPE_COLORS: Record<string, string> = {
  boolean: 'text-violet-400 bg-violet-950/20 border-violet-800/40',
  number: 'text-blue-400 bg-blue-950/20 border-blue-800/40',
  string: 'text-emerald-400 bg-emerald-950/20 border-emerald-800/40',
  object: 'text-amber-400 bg-amber-950/20 border-amber-800/40',
  array: 'text-amber-400 bg-amber-950/20 border-amber-800/40',
}

export function PersonaDetails({
  selectedInstance,
  availableVariables,
  handleAddVariableValue,
  handleUpdateVariableValue,
  handleRemoveVariableValue
}: Props) {
  if (!selectedInstance) {
    return (
      <div className="h-full flex flex-col items-center justify-center border border-dashed border-zinc-800 bg-zinc-950/5 rounded-2xl py-20 text-center">
        <User className="size-10 text-zinc-800 mb-2 animate-pulse" />
        <p className="text-sm text-zinc-400 font-semibold">Select or add a persona</p>
        <p className="text-xs text-zinc-600 mt-1 max-w-[200px]">Choose an instance from the left sidebar to configure its variables state.</p>
      </div>
    )
  }

  const renderValueInput = (variable: Variable, currentValue: any) => {
    if (variable.type === 'boolean') {
      return (
        <select
          value={String(currentValue)}
          onChange={(e) => handleUpdateVariableValue(variable.label, e.target.value === 'true')}
          className="bg-black border border-zinc-800 text-xs text-zinc-100 h-9 px-2 rounded-lg font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-700 cursor-pointer"
        >
          <option value="false">false</option>
          <option value="true">true</option>
        </select>
      )
    }

    if (variable.type === 'number') {
      return (
        <Input
          type="number"
          value={currentValue !== undefined ? Number(currentValue) : 0}
          onChange={(e) => handleUpdateVariableValue(variable.label, Number(e.target.value))}
          className="bg-black border border-zinc-800 text-xs text-zinc-100 h-9 font-mono focus-visible:ring-1 focus-visible:ring-zinc-700 rounded-lg w-28 text-right"
        />
      )
    }

    if (variable.type === 'object' || variable.type === 'array') {
      return (
        <textarea
          value={typeof currentValue === 'object' ? JSON.stringify(currentValue) : String(currentValue)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value)
              handleUpdateVariableValue(variable.label, parsed)
            } catch {
              handleUpdateVariableValue(variable.label, e.target.value)
            }
          }}
          className="bg-black border border-zinc-800 text-xs text-zinc-100 p-2 font-mono h-20 w-full resize-none rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-700 mt-1.5"
          placeholder="{}"
        />
      )
    }

    return (
      <Input
        value={String(currentValue || '')}
        onChange={(e) => handleUpdateVariableValue(variable.label, e.target.value)}
        className="bg-black border border-zinc-800 text-xs text-zinc-100 h-9 focus-visible:ring-1 focus-visible:ring-zinc-700 rounded-lg flex-1 min-w-[120px]"
      />
    )
  }

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4 shrink-0">
        <div>
          <h4 className="text-base font-extrabold text-white">{selectedInstance.name}</h4>
          <p className="text-xs text-zinc-500 font-medium">Configure simulated context variables for this instance</p>
        </div>

        <select
          value=""
          onChange={(e) => {
            if (e.target.value) handleAddVariableValue(e.target.value)
          }}
          className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 hover:text-white h-9 px-3 rounded-lg font-bold cursor-pointer hover:bg-zinc-900/50 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-700"
        >
          <option value="" disabled>+ Bind Variable</option>
          {availableVariables.map(v => (
            <option key={v.id} value={v.id}>{v.label} ({v.type})</option>
          ))}
        </select>
      </div>

      <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2 pb-6">
        {Object.entries(selectedInstance.values).map(([label, value]) => {
          const variable = availableVariables.find(v => v.label === label)
          const typeColor = variable ? (TYPE_COLORS[variable.type] || 'text-zinc-400 bg-zinc-950 border-zinc-800') : 'text-rose-500 bg-rose-950/20 border-rose-800/40'

          return (
            <div key={label} className="p-3.5 bg-zinc-950/40 border border-zinc-900 rounded-xl hover:border-zinc-800 transition-colors flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-zinc-300">{label}</span>
                  {variable && (
                    <span className={cn("text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded border", typeColor)}>
                      {variable.type}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveVariableValue(label)}
                  className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                {variable ? (
                  <div className="w-full flex justify-end">
                    {renderValueInput(variable, value)}
                  </div>
                ) : (
                  <span className="text-[10px] text-rose-500 font-semibold italic">Stale variable: label mapping missing in registry.</span>
                )}
              </div>
            </div>
          )
        })}

        {Object.keys(selectedInstance.values).length === 0 && (
          <div className="py-20 border border-dashed border-zinc-800 rounded-xl text-center flex flex-col items-center justify-center gap-3 bg-zinc-950/10">
            <div className="size-10 rounded-full bg-zinc-900/50 flex items-center justify-center border border-zinc-800">
              <PlusCircle className="size-5 text-zinc-600" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-zinc-400 font-semibold">No variables bound</p>
              <p className="text-[10px] text-zinc-600 max-w-[240px] mx-auto">Click the "+ Bind Variable" button to define values for simulation testing.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
