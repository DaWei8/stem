import { Handle, Position, NodeProps, Node } from '@xyflow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Square, ArrowRight, Play, CheckCircle2, Plus, Settings2, Globe, Database, Fingerprint, Laptop } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScreenInput, ScreenAction, ScreenOutput } from '@/types'
import { useState } from 'react'
import { motion } from 'framer-motion'

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
}

export function PageNode({ data, selected }: NodeProps<Node<PageNodeData>>) {
  const inputs = data.inputs || []
  const actions = data.actions || []
  const outputs = data.outputs || []

  return (
    <div className={cn(
      "w-[300px] group relative transition-all duration-300",
      selected && "z-50"
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
        selected ? "bg-white" : (data.isHighlighted ? "bg-white shadow-[0_0_20px_rgba(255,255,255,0.3)]" : "bg-zinc-800 group-hover:bg-zinc-600"),
        data.simulationStatus === 'success' && "bg-green-500",
        data.simulationStatus === 'error' && "bg-red-500",
        data.simulationStatus === 'warning' && "bg-amber-500"
      )}>
        <Card
          className="bg-black border-none rounded-[11px] shadow-2xl overflow-hidden cursor-pointer"
        >
          {/* Header */}
          <CardHeader className="px-4 bg-black/50 border-b border-zinc-900/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <Laptop className="size-3 text-zinc-600" />
                <span className="text-[9px] uppercase font-bold text-zinc-500">Screen</span>
              </div>
              <div className="flex gap-1">
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
          </CardHeader>

          <CardContent className="p-0 divide-y divide-zinc-900/50">
            {/* Inputs Section */}
            <Section
              icon={<Fingerprint className="size-3" />}
              title="Incoming Data"
              items={inputs}
              color="text-blue-400"
              renderItem={(i) => (
                <div key={i.id} className="flex items-center justify-between py-1 group/item">
                  <span className="text-[10px] font-medium text-zinc-400 group-hover/item:text-zinc-200 transition-colors">{i.name || i.label}</span>
                  <code className="text-[10px] font-mono text-zinc-600 bg-black/50 px-1.5 py-0.5 border border-zinc-800/50 rounded-sm">
                    {i.input_type === 'form_field' ? 'Form' : 'Query'}
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
              renderItem={(a) => (
                <div key={a.id} className="flex items-center gap-2 py-1 px-2.5 bg-black/30 border border-zinc-800/50 mt-1.5 rounded-md group/action">
                  <span className="text-[10px] font-bold text-zinc-500">{a.action_type.split('_')[0]}</span>
                  <ArrowRight className="w-2.5 h-2.5 text-zinc-800 group-hover/action:translate-x-0.5 transition-transform" />
                  <span className="text-[10px] font-medium text-zinc-200 truncate">{a.name}</span>
                </div>
              )}
            />

            {/* Outputs Section */}
            <Section
              icon={<Database className="size-3" />}
              title="State Mutations"
              items={outputs}
              color="text-green-400"
              renderItem={(o) => (
                <div key={o.id} className="flex items-center gap-2.5 py-1">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    o.output_type === 'webhook' ? "bg-amber-500" : "bg-white"
                  )} />
                  <span className="text-[10px] font-medium text-zinc-400">{o.name}</span>
                </div>
              )}
            />
          </CardContent>

          {/* Footer Stats */}
          <div className="px-5 py-3 bg-black/50 border-t border-zinc-900/50 flex items-center justify-between">
            <div className="flex gap-3">
              <span className="text-[10px] font-bold text-zinc-700">
                {inputs.length + actions.length + outputs.length} elements attached
              </span>
            </div>
            <Settings2 className="size-3 text-zinc-800 group-hover:text-zinc-500 transition-colors" />
          </div>
        </Card>
      </div>


      <Handle type="source" position={Position.Bottom} className="bg-white! border-white! w-3 h-3 hover:scale-150 transition-transform" />
    </div>
  )
}

function Section({ icon, title, items, renderItem, color }: { icon: React.ReactNode; title: string; items: any[]; renderItem: (item: any) => React.ReactNode; color: string }) {
  if (items.length === 0) return null
  return (
    <div className="px-5 py-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <div className={cn("size-4 rounded-full bg-black border border-zinc-800 flex items-center justify-center", color)}>
          {icon}
        </div>
        <span className="text-[10px] font-bold text-zinc-500">{title}</span>
      </div>
      <div className="flex flex-col">
        {items.map(renderItem)}
      </div>
    </div>
  )
}

