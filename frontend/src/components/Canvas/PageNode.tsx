'use client'

import { usePages } from '@/hooks/usePages'
import { useUI } from '@/hooks/useUI'
import { useVariables } from '@/hooks/useVariables'
import { cn } from '@/lib/utils'
import { ScreenAction, ScreenInput, ScreenOutput } from '@/types'
import { Handle, Node, NodeProps, Position } from '@xyflow/react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useState, useCallback } from 'react'

import { PhoneFrame } from './page-node/PhoneFrame'
import { NodeHeader } from './page-node/NodeHeader'
import { NodeFooter } from './page-node/NodeFooter'
import { ModuleStrips } from './page-node/ModuleStrips'
import { LiveUrlBar } from './page-node/LiveUrlBar'


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
  const updatePage = usePages(s => s.updatePage)
  const isPermissionDenied = filterType === 'permission'

  const [isCompact, setIsCompact] = useState(false)

  /* ─── Inline Add Handlers ─── */
  const handleAddInput = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (variables.length === 0) return
    addInput(data.page_id, {
      name: `input_${inputs.length + 1}`,
      input_type: 'form_field',
      variable_id: variables[0].id,
    })
  }, [variables, addInput, data.page_id, inputs.length])

  const handleAddAction = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    addAction(data.page_id, {
      name: `trigger_${actions.length + 1}`,
      action_type: 'function_call',
    })
  }, [addAction, data.page_id, actions.length])

  const handleAddOutput = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    addOutput(data.page_id, {
      name: `mutation_${outputs.length + 1}`,
      output_type: 'state_update',
    })
  }, [addOutput, data.page_id, outputs.length])

  const handleLiveUrlChange = useCallback((url: string) => {
    updatePage(data.page_id, { live_url: url || null })
  }, [updatePage, data.page_id])

  return (
    <div className={cn(
      "w-[280px] group relative transition-all duration-500",
      selected && "z-50",
    )}>
      <Handle type="target" position={Position.Top} className="bg-zinc-800! border-zinc-700! w-3 h-3 hover:scale-150 transition-transform" />

      {/* Hover Add Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => data.onAddNextPage?.(data.page_id)}
        className="absolute -right-6 top-1/2 -translate-y-1/2 bg-white text-black size-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-50 border border-black shadow-[0_0_20px_rgba(255,255,255,0.2)] rounded-full"
      >
        <Plus className="size-3.5" />
      </motion.button>

      {/* ── Phone Frame Mockup ── */}
      <PhoneFrame
        isSelected={selected}
        isActiveStep={data.activeStep}
        isStart={data.isStart}
        isEnd={data.isEnd}
        isHighlighted={data.isHighlighted}
        isTraced={data.isTraced}
        isFiltered={isFiltered}
        hasActiveFilter={hasActiveFilter}
        simulationStatus={data.simulationStatus}
        isPermissionDenied={isPermissionDenied}
        validationWarnings={data.validationWarnings}
      >
        {/* Screen Header */}
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

        {/* Module Strips */}
        {!isCompact && (
          <ModuleStrips
            inputCount={inputs.length}
            actionCount={actions.length}
            outputCount={outputs.length}
            onAddInput={handleAddInput}
            onAddAction={handleAddAction}
            onAddOutput={handleAddOutput}
            inputNames={inputs.map(i => i.name)}
            actionNames={actions.map(a => a.name)}
            outputNames={outputs.map(o => o.name)}
          />
        )}

        {/* Live URL Bar */}
        <LiveUrlBar
          url={data.page?.live_url}
          onChange={handleLiveUrlChange}
        />

        {/* Footer Stats */}
        <NodeFooter
          inputCount={inputs.length}
          actionCount={actions.length}
          outputCount={outputs.length}
          isFiltered={isFiltered}
          isPermissionDenied={isPermissionDenied}
          isCompact={isCompact}
        />
      </PhoneFrame>

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
