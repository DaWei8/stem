'use client'

import React from 'react'
import { Cpu, Lock, Unlock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ModelOption {
  id: string
  name: string
  provider: 'google' | 'openai' | 'anthropic'
  desc: string
  inputRate: string
  outputRate: string
  requiresKey: boolean
}

interface ActiveModelSelectorProps {
  models: ModelOption[]
  activeModel: string
  selectModel: (modelId: string, isUnlocked: boolean) => void
  isModelUnlocked: (model: ModelOption) => boolean
  googleKey: string
}

export const ActiveModelSelector: React.FC<ActiveModelSelectorProps> = ({
  models,
  activeModel,
  selectModel,
  isModelUnlocked,
  googleKey
}) => {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 pb-2 border-b border-zinc-900">
        <Cpu className="size-5 text-zinc-400" />
        <h2 className="text-lg font-bold">Active System Architect Model</h2>
      </div>
      <p className="text-[11px] text-zinc-400 font-medium">
        Select the active model to orchestrate your application logic. Models require their respective API Key above to unlock.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {models.map((model) => {
          const unlocked = isModelUnlocked(model)
          const selected = activeModel === model.id

          return (
            <button
              key={model.id}
              onClick={() => selectModel(model.id, unlocked)}
              className={cn(
                "p-5 text-left border flex flex-col justify-between min-h-[160px] transition-all relative group",
                selected
                  ? "border-white bg-white/5 ring-1 ring-white"
                  : unlocked
                    ? "border-zinc-800 hover:border-zinc-500 bg-zinc-950/20"
                    : "border-zinc-900 bg-zinc-950/10 opacity-40 cursor-not-allowed"
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black tracking-tight text-white">{model.name}</span>
                  {selected ? (
                    <span className="size-2 bg-emerald-500 rounded-full" />
                  ) : !unlocked ? (
                    <Lock className="size-3 text-zinc-650" />
                  ) : (
                    <Unlock className="size-3 text-zinc-550 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
                <p className="text-[9.5px] text-zinc-500 font-medium leading-relaxed mt-1.5">{model.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-900 flex flex-col gap-1">
                <div className="flex items-center justify-between text-[8px] font-mono font-black uppercase text-zinc-600">
                  <span>Input toll</span>
                  <span className="text-zinc-400">{model.inputRate}</span>
                </div>
                <div className="flex items-center justify-between text-[8px] font-mono font-black uppercase text-zinc-600">
                  <span>Output toll</span>
                  <span className="text-zinc-400">{model.outputRate}</span>
                </div>
                {!model.requiresKey && !googleKey && (
                  <div className="flex items-center gap-1 mt-1 text-[8px] text-amber-500/80 font-bold font-mono">
                    <AlertTriangle className="size-2" /> Fallback pool
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
