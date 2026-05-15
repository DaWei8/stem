import { Handle, Position, NodeProps, Node } from '@xyflow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Square, ArrowRight, Play, CheckCircle2, Plus, Settings2, Globe, Database, Fingerprint, Laptop, Terminal, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScreenInput, ScreenAction, ScreenOutput } from '@/types'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useUI } from '@/hooks/useUI'
import { Tooltip } from '@/components/ui/Tooltip'


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
}


export function PageNode({ data, selected }: NodeProps<Node<PageNodeData>>) {
  const inputs = data.inputs || []
  const actions = data.actions || []
  const outputs = data.outputs || []
  const isFiltered = data.isFiltered
  const filterType = data.filterType
  const hasActiveFilter = filterType !== 'none'
  const { isChaosMode } = useUI()


  return (
    <div className={cn(
      "w-[300px] group relative transition-all duration-500",
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

      <div className={cn(
        "relative p-px transition-all duration-500 rounded-xl overflow-hidden",
        selected ? "bg-white" : (
          (data.isStart || data.isEnd) ? "bg-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)]" :
            (data.isHighlighted ? "bg-white shadow-[0_0_20px_rgba(255,255,255,0.3)]" :
              (data.isTraced ? "bg-white shadow-[0_0_40px_rgba(255,255,255,0.6)] scale-[1.05] z-50 animate-pulse" :
                (isFiltered ? "bg-white shadow-[0_0_25px_rgba(255,255,255,0.5)] scale-[1.02]" : "bg-zinc-800 group-hover:bg-zinc-600")))
        ),
        data.simulationStatus === 'success' && !data.isStart && !data.isEnd && "bg-green-500",
        data.simulationStatus === 'error' && "bg-red-500",
        data.simulationStatus === 'warning' && "bg-amber-500",
        data.validationWarnings && data.validationWarnings.length > 0 && "bg-amber-400 animate-pulse"
      )}>
        {data.validationWarnings && data.validationWarnings.length > 0 && (
          <Tooltip content={`Architectural Warning: ${data.validationWarnings[0]}`}>
            <div className="absolute -top-3 -right-3 z-50 bg-amber-500 text-black p-1.5 rounded-full shadow-lg border-2 border-black">
              <ShieldAlert className="size-4" />
            </div>
          </Tooltip>
        )}

        <Card
          className="bg-black border-none rounded-[11px] shadow-2xl overflow-hidden cursor-pointer"
        >
          {/* Header */}
          <CardHeader className="px-4 bg-black/50 border-b border-zinc-900/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <Laptop className="size-3 text-zinc-600" />
                <span className={cn(
                  "text-[9px] uppercase font-bold transition-colors",
                  filterType === 'screens' ? "text-white" : "text-zinc-500"
                )}>Screen</span>
              </div>
              <div className="flex gap-1">
                {data.isNew && (
                  <Tooltip content="New Component (Unsaved Snapshot)">
                    <span className="text-[7px] font-black bg-blue-500 text-white px-1 py-0.5 rounded-sm mr-1 animate-pulse cursor-help">NEW</span>
                  </Tooltip>
                )}
                <div className="size-1 rounded-full bg-zinc-800" />
                <div className="size-1 rounded-full bg-zinc-800" />
              </div>

            </div>
            <CardTitle className="text-sm font-bold text-white group-hover:text-zinc-200 transition-colors">
              {data.label}
            </CardTitle>
            {data.description && (
              <p className="text-[10px] text-zinc-500 line-clamp-1 font-medium leading-relaxed">
                {data.description}
              </p>
            )}

            {isChaosMode && (actions.length > 0 || outputs.length > 0) && (
              <motion.button
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation()
                  // Simulated failure trigger logic could be dispatched here
                }}
                className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded text-[9px] font-black uppercase tracking-widest transition-colors"
              >
                <ShieldAlert className="size-3" /> Trigger Failure
              </motion.button>
            )}
          </CardHeader>

          <CardContent className="p-0 divide-y divide-zinc-900/50">
            {/* Inputs Section */}
            <Section
              icon={<Fingerprint className="size-3" />}
              title="Incoming Data"
              items={inputs}
              color="text-blue-400"
              isActiveFilter={filterType === 'inputs' || filterType === 'variables'}
              renderItem={(i) => (
                <div key={i.id} className="flex items-center justify-between py-1 group/item">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium text-zinc-400 group-hover/item:text-zinc-200 transition-colors">{i.name || i.label}</span>
                    <span className="text-[8px] font-mono text-zinc-600 truncate max-w-[120px]">
                      {i.variable_id ? `var::${i.variable_id.slice(0, 8)}` : 'static_input'}
                    </span>
                  </div>
                  <code className="text-[9px] font-mono text-zinc-500 bg-black/50 px-1.5 py-0.5 border border-zinc-800/50 rounded-sm">
                    {i.input_type === 'form_field' ? 'FORM' : 'QUERY'}
                  </code>
                </div>
              )}
            />

            {/* Actions Section */}
            <Section
              icon={<Play className="size-3" />}
              title="Triggers & Logic"
              items={actions}
              color="text-purple-400"
              isActiveFilter={filterType === 'triggers'}
              renderItem={(a) => (
                <div key={a.id} className="flex flex-col py-1.5 px-2.5 bg-black/30 border border-zinc-800/50 mt-1.5 rounded-md group/action hover:border-zinc-600 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-tighter">{a.action_type?.split('_')[0] || 'ACT'}</span>
                    <ArrowRight className="w-2.5 h-2.5 text-zinc-800 group-hover/action:translate-x-0.5 transition-transform" />
                    <span className="text-[10px] font-bold text-zinc-200 truncate">{a.name}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 opacity-60">
                    <Terminal className="size-2.5 text-zinc-500" />
                    <span className="text-[8px] font-mono text-zinc-500 italic">
                      {a.function_id ? `fn ${a.function_id.slice(0, 8)}()` : 'eval_inline'}
                    </span>
                  </div>
                </div>
              )}
            />

            {/* Outputs Section */}
            <Section
              icon={<Database className="size-3" />}
              title="State Mutations"
              items={outputs}
              color="text-green-400"
              isActiveFilter={filterType === 'outputs'}
              renderItem={(o) => (
                <div key={o.id} className="flex items-center justify-between py-1 group/output">
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      o.output_type === 'webhook' ? "bg-amber-500" : "bg-white"
                    )} />
                    <span className="text-[10px] font-medium text-zinc-400 group-hover/output:text-zinc-200 transition-colors">{o.name}</span>
                  </div>
                  <span className="text-[8px] font-mono text-zinc-600">
                    {o.output_type === 'state_update' ? 'MUTATE' : 'SYNC'}
                  </span>
                </div>
              )}
            />
          </CardContent>

          {/* Footer Stats */}
          <div className="px-5 py-3 bg-black/50 border-t border-zinc-900/50 flex items-center justify-between">
            <div className="flex gap-3">
              <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-tighter">
                {inputs.length + actions.length + outputs.length} attachments
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isFiltered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="size-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                />
              )}
              <Settings2 className="size-3 text-zinc-800 group-hover:text-zinc-500 transition-colors" />
            </div>
          </div>
        </Card>
      </div>


      <Handle type="source" position={Position.Bottom} className="bg-white! border-white! w-3 h-3 hover:scale-150 transition-transform" />

      {/* Negative Port (Failure) */}
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

function Section({ icon, title, items, renderItem, color, isActiveFilter }: { icon: React.ReactNode; title: string; items: any[]; renderItem: (item: any) => React.ReactNode; color: string; isActiveFilter?: boolean }) {
  if (items.length === 0) return null
  return (
    <div className={cn(
      "px-5 py-3 flex flex-col gap-1 transition-all duration-500",
      isActiveFilter ? "bg-white/5 border-l-2 border-white/20" : ""
    )}>
      <div className="flex items-center gap-1.5">
        <Tooltip content={title}>
          <div className={cn("size-4 rounded-full bg-black border border-zinc-800 flex items-center justify-center transition-all cursor-help", color, isActiveFilter && "scale-110 shadow-[0_0_10px_currentColor]")}>
            {icon}
          </div>
        </Tooltip>
        <span className={cn(
          "text-[10px] font-bold uppercase transition-colors",
          isActiveFilter ? "text-white" : "text-zinc-500"
        )}>{title}</span>
      </div>
      <div className="flex flex-col">
        {items.map(renderItem)}
      </div>
    </div>
  )
}


