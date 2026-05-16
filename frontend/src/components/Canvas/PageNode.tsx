import { useState } from 'react'
import { Handle, Position, NodeProps, Node } from '@xyflow/react'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Fingerprint, Play, Database } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScreenInput, ScreenAction, ScreenOutput } from '@/types'
import { motion } from 'framer-motion'
import { useUI } from '@/hooks/useUI'
import { useVariables } from '@/hooks/useVariables'
import { usePages } from '@/hooks/usePages'

import { NodeHeader } from './page-node/NodeHeader'
import { InputsSection, ActionsSection, OutputsSection } from './page-node/NodeSections'
import { NodeFooter } from './page-node/NodeFooter'


export type PageNodeData = {
  label: string
  page_id: string
  page?: any
  description?: string
  inputs?: ScreenInput[]
  actions?: ScreenAction[]
  outputs?: ScreenOutput[]
  constraints?: any[]
  functions?: any[]
  variables?: any[]
  context?: any
  onAddNextPage?: (parentId: string) => void
  simulationStatus?: 'success' | 'warning' | 'error' | 'none'
  isHighlighted?: boolean
  isStart?: boolean
  isEnd?: boolean
  isFiltered?: boolean
  filterType?: string
  isTraced?: boolean
  isNew?: boolean
  validationWarnings?: string[]
  activeStep?: boolean
}


export function PageNode({ data, selected }: NodeProps<Node<PageNodeData>>) {
  const inputs = data.inputs || []
  const actions = data.actions || []
  const outputs = data.outputs || []
  const isFiltered = data.isFiltered
  const filterType = data.filterType
  const hasActiveFilter = filterType !== 'none'
  const { isChaosMode } = useUI()
  const variables = useVariables((s) => s.variables)
  const addInput = usePages(s => s.addInput)
  const addAction = usePages(s => s.addAction)
  const addOutput = usePages(s => s.addOutput)
  const removeInput = usePages(s => s.removeInput)
  const removeAction = usePages(s => s.removeAction)
  const removeOutput = usePages(s => s.removeOutput)
  const updateInput = usePages(s => s.updateInput)
  const updateOutput = usePages(s => s.updateOutput)
  const isPermissionDenied = filterType === 'permission'
  const isEmpty = inputs.length === 0 && actions.length === 0 && outputs.length === 0
  
  const [isCompact, setIsCompact] = useState(false)

  /* ─── Inline Add Handlers ─── */
  const handleAddInput = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (variables.length === 0) return
    addInput(data.page_id, {
      name: `input_${inputs.length + 1}`,
      input_type: 'form_field',
      variable_id: variables[0].id,
    })
  }

  const handleAddAction = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    addAction(data.page_id, {
      name: `trigger_${actions.length + 1}`,
      action_type: 'function_call',
    })
  }

  const handleAddOutput = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    addOutput(data.page_id, {
      name: `mutation_${outputs.length + 1}`,
      output_type: 'state_update',
    })
  }

  return (
    <div className={cn(
      "w-[320px] group relative transition-all duration-500",
      selected && "z-50",
      hasActiveFilter && !isFiltered && "opacity-20 grayscale-[0.5] scale-[0.98] blur-[0.5px]"
    )}>
      <Handle type="target" position={Position.Top} className="bg-zinc-800! border-zinc-700! w-3 h-3 hover:scale-150 transition-transform" />

      {/* Hover Add Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => data.onAddNextPage?.(data.page_id)}
        className="absolute -right-6 top-1/2 -translate-y-1/2 bg-white text-black size-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-50 border border-black shadow-[0_0_20px_rgba(255,255,255,0.2)] rounded-full"
      >
        <Plus className="size-4" />
      </motion.button>

      {/* Outer Glow Shell */}
      <div className={cn(
        "relative p-px transition-all duration-500 rounded-xl overflow-hidden",
        selected ? "bg-white" : (
          data.activeStep ? "bg-green-500 shadow-[0_0_40px_rgba(34,197,94,0.6)] scale-[1.05] z-50" : (
            (data.isStart || data.isEnd) ? "bg-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)]" :
              (data.isHighlighted ? "bg-white shadow-[0_0_20px_rgba(255,255,255,0.3)]" :
                (data.isTraced ? "bg-white shadow-[0_0_40px_rgba(255,255,255,0.6)] scale-[1.05] z-50 animate-pulse" :
                  (isFiltered ? "bg-white shadow-[0_0_25px_rgba(255,255,255,0.5)] scale-[1.02]" : "bg-zinc-800 group-hover:bg-zinc-600")))
          )
        ),
        data.simulationStatus === 'success' && !data.isStart && !data.isEnd && "bg-green-500",
        data.simulationStatus === 'error' && "bg-red-500",
        data.simulationStatus === 'warning' && "bg-amber-500",
        data.validationWarnings && data.validationWarnings.length > 0 && "bg-amber-400 animate-pulse",
        isPermissionDenied && "bg-red-500/50 opacity-60"
      )}>

        <Card className="bg-black border-none rounded-[11px] shadow-2xl overflow-hidden cursor-pointer">
          {/* Level 1: Page Identity */}
          <NodeHeader
            label={data.label}
            description={data.description}
            pageType={data.page?.page_type}
            isNew={data.isNew}
            filterType={filterType}
            isChaosMode={isChaosMode}
            hasActions={actions.length > 0}
            hasOutputs={outputs.length > 0}
            validationWarnings={data.validationWarnings}
            onToggleCompact={() => setIsCompact(!isCompact)}
            isCompact={isCompact}
          />

          {/* Level 2-4: Functional Modules */}
          {!isCompact && (
            <CardContent className="p-0 divide-y divide-zinc-900/30">
              {/* Interfaces (Inputs/Ports) */}
              <InputsSection
                inputs={inputs}
                variables={variables}
                isActiveFilter={filterType === 'inputs' || filterType === 'variables'}
                onAdd={handleAddInput}
                onRemove={(id) => removeInput(id)}
                onRebindVariable={(inputId, varId) => updateInput(inputId, { variable_id: varId })}
              />

              {/* Operations (Triggers/Logic) */}
              <ActionsSection
                actions={actions}
                isActiveFilter={filterType === 'triggers'}
                onAdd={handleAddAction}
                onRemove={(id) => removeAction(id)}
              />

              {/* State Mutations (Outputs) */}
              <OutputsSection
                outputs={outputs}
                variables={variables}
                isActiveFilter={filterType === 'outputs'}
                onAdd={handleAddOutput}
                onRemove={(id) => removeOutput(id)}
                onRebindVariable={(outputId, varId) => updateOutput(outputId, { variable_id: varId })}
              />

              {/* Actionable empty state */}
              {isEmpty && (
                <div className="px-4 py-5 flex flex-col items-center gap-3">
                  <div className="flex gap-0.5">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-1 h-4 bg-zinc-900 rounded-full" />
                    ))}
                  </div>
                  <span className="text-[9px] text-zinc-700 font-mono italic">
                    No logic defined
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleAddInput}
                      className="flex items-center gap-1 text-[8px] font-bold text-blue-400/70 hover:text-blue-400 px-2 py-1 border border-blue-400/20 hover:border-blue-400/40 bg-blue-400/5 transition-all"
                    >
                      <Fingerprint className="size-2.5" /> Interface
                    </button>
                    <button
                      onClick={handleAddAction}
                      className="flex items-center gap-1 text-[8px] font-bold text-purple-400/70 hover:text-purple-400 px-2 py-1 border border-purple-400/20 hover:border-purple-400/40 bg-purple-400/5 transition-all"
                    >
                      <Play className="size-2.5" /> Operation
                    </button>
                    <button
                      onClick={handleAddOutput}
                      className="flex items-center gap-1 text-[8px] font-bold text-emerald-400/70 hover:text-emerald-400 px-2 py-1 border border-emerald-400/20 hover:border-emerald-400/40 bg-emerald-400/5 transition-all"
                    >
                      <Database className="size-2.5" /> Mutation
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          )}

          {/* Footer: Integrity + Stats */}
          <NodeFooter
            inputCount={inputs.length}
            actionCount={actions.length}
            outputCount={outputs.length}
            isFiltered={isFiltered}
            isPermissionDenied={isPermissionDenied}
            isCompact={isCompact}
          />
        </Card>
      </div>

      {/* Source Handle (Success Path) */}
      <Handle type="source" position={Position.Bottom} className="bg-white! border-white! w-3 h-3 hover:scale-150 transition-transform" />

      {/* Negative Port (Failure Path) */}
      <Handle
        type="source"
        position={Position.Right}
        id="failure"
        className="bg-red-500! border-red-500! w-3 h-3 hover:scale-150 transition-transform shadow-[0_0_10px_rgba(239,68,68,0.5)]"
        style={{ top: '70%' }}
      />
    </div>
  )
}
