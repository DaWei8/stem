'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useObservability } from '@/hooks/useObservability'
import { usePages } from '@/hooks/usePages'
import { useLogic } from '@/hooks/useLogic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  Activity,
  Plus,
  Trash2,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Zap
} from 'lucide-react'

export function ObservabilityView() {
  const { id: projectId } = useParams() as { id: string }
  const {
    latencyModels,
    costProjections,
    bottlenecks,
    addLatencyModel,
    deleteLatencyModel,
    addBottleneck,
    resolveBottleneck,
    deleteBottleneck,
    getTotalMonthlyCost
  } = useObservability()
  const { pages, actions } = usePages()
  const { functions } = useLogic()

  const [showAddLatency, setShowAddLatency] = useState(false)
  const [showAddBottleneck, setShowAddBottleneck] = useState(false)

  // Latency form state
  const [latEntityId, setLatEntityId] = useState('')
  const [latMin, setLatMin] = useState('')
  const [latMax, setLatMax] = useState('')

  // Bottleneck form state
  const [bnEntityId, setBnEntityId] = useState('')
  const [bnSeverity, setBnSeverity] = useState<string>('medium')
  const [bnDescription, setBnDescription] = useState('')

  const totalCost = getTotalMonthlyCost()
  const unresolvedBottlenecks = bottlenecks.filter(b => !b.is_resolved)
  const avgLatency = latencyModels.length > 0
    ? Math.round(latencyModels.reduce((s, l) => s + l.latency_max_ms, 0) / latencyModels.length)
    : 0

  const handleAddLatency = async () => {
    if (!latEntityId || !latMin || !latMax) return
    await addLatencyModel(projectId, 'page_action', latEntityId, parseInt(latMin), parseInt(latMax))
    setShowAddLatency(false)
    setLatEntityId('')
    setLatMin('')
    setLatMax('')
  }

  const handleAddBottleneck = async () => {
    if (!bnEntityId || !bnDescription) return
    await addBottleneck(projectId, {
      entity_type: 'page',
      entity_id: bnEntityId,
      severity: bnSeverity,
      detection_method: 'manual',
      description: bnDescription
    })
    setShowAddBottleneck(false)
    setBnEntityId('')
    setBnDescription('')
  }

  const severityColor: Record<string, string> = {
    low: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    medium: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    high: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    critical: 'text-red-500 bg-red-500/10 border-red-500/20'
  }

  return (
    <div className="h-full overflow-y-auto bg-zinc-50 dark:bg-black transition-colors">
      <div className="mx-auto px-8 py-10 space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tighter text-black dark:text-white">Observability</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            System health projections, latency modeling, and bottleneck heatmapping.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <SummaryCard
            icon={<Clock className="size-4" />}
            label="Avg Projected Latency"
            value={`${avgLatency}ms`}
            accent={avgLatency > 500 ? 'text-red-500' : 'text-green-500'}
          />
          <SummaryCard
            icon={<DollarSign className="size-4" />}
            label="Est. Monthly Cost"
            value={`$${totalCost.toFixed(2)}`}
            accent="text-blue-500"
          />
          <SummaryCard
            icon={<AlertTriangle className="size-4" />}
            label="Unresolved Bottlenecks"
            value={unresolvedBottlenecks.length.toString()}
            accent={unresolvedBottlenecks.length > 0 ? 'text-amber-500' : 'text-green-500'}
          />
        </div>

        {/* Latency Models */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-black dark:text-white">Latency Models</h2>
            <Button
              onClick={() => setShowAddLatency(!showAddLatency)}
              className="h-8 rounded-none px-3 text-xs font-bold bg-black dark:bg-white text-white dark:text-black"
            >
              <Plus className="size-3 mr-1" /> Add Model
            </Button>
          </div>

          {showAddLatency && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border border-zinc-200 dark:border-zinc-800 p-4 space-y-3 bg-white dark:bg-zinc-950"
            >
              <select
                value={latEntityId}
                onChange={(e) => setLatEntityId(e.target.value)}
                className="w-full h-10 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 px-3 text-xs font-bold text-black dark:text-white"
              >
                <option value="">Select Action or Function</option>
                {actions.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                {functions.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <Input value={latMin} onChange={(e) => setLatMin(e.target.value)} placeholder="Min (ms)" className="h-10 rounded-none text-xs" />
                <Input value={latMax} onChange={(e) => setLatMax(e.target.value)} placeholder="Max (ms)" className="h-10 rounded-none text-xs" />
              </div>
              <Button onClick={handleAddLatency} className="w-full h-9 rounded-none bg-black dark:bg-white text-white dark:text-black text-xs font-bold">
                Commit Latency Projection
              </Button>
            </motion.div>
          )}

          <div className="space-y-2">
            {latencyModels.length === 0 ? (
              <EmptyState message="No latency models defined. Add performance projections to your actions and functions." />
            ) : (
              latencyModels.map(model => {
                const entity = actions.find(a => a.id === model.entity_id) || functions.find(f => f.id === model.entity_id)
                return (
                  <div key={model.id} className="flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 group">
                    <div className="flex items-center gap-3">
                      <Zap className="size-3 text-amber-500" />
                      <span className="text-xs font-bold text-black dark:text-white">{entity?.name || 'Unknown'}</span>
                      <span className="text-[10px] font-mono text-zinc-400">{model.latency_min_ms}ms – {model.latency_max_ms}ms</span>
                    </div>
                    <button
                      onClick={() => deleteLatencyModel(projectId, model.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-red-500"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </section>

        {/* Bottleneck Annotations */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-black dark:text-white">Bottleneck Annotations</h2>
            <Button
              onClick={() => setShowAddBottleneck(!showAddBottleneck)}
              className="h-8 rounded-none px-3 text-xs font-bold bg-black dark:bg-white text-white dark:text-black"
            >
              <Plus className="size-3 mr-1" /> Annotate
            </Button>
          </div>

          {showAddBottleneck && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border border-zinc-200 dark:border-zinc-800 p-4 space-y-3 bg-white dark:bg-zinc-950"
            >
              <select
                value={bnEntityId}
                onChange={(e) => setBnEntityId(e.target.value)}
                className="w-full h-10 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 px-3 text-xs font-bold text-black dark:text-white"
              >
                <option value="">Select Screen</option>
                {pages.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
              <select
                value={bnSeverity}
                onChange={(e) => setBnSeverity(e.target.value)}
                className="w-full h-10 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 px-3 text-xs font-bold text-black dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <Input value={bnDescription} onChange={(e) => setBnDescription(e.target.value)} placeholder="Describe the bottleneck..." className="h-10 rounded-none text-xs" />
              <Button onClick={handleAddBottleneck} className="w-full h-9 rounded-none bg-black dark:bg-white text-white dark:text-black text-xs font-bold">
                Commit Annotation
              </Button>
            </motion.div>
          )}

          <div className="space-y-2">
            {bottlenecks.length === 0 ? (
              <EmptyState message="No bottlenecks detected. Annotate architectural hot paths manually or let the simulation engine discover them." />
            ) : (
              bottlenecks.map(bn => {
                const page = pages.find(p => p.id === bn.entity_id)
                return (
                  <div key={bn.id} className={cn(
                    "flex items-center justify-between p-3 border group",
                    bn.is_resolved ? 'border-green-500/20 bg-green-500/5' : severityColor[bn.severity]
                  )}>
                    <div className="flex items-center gap-3">
                      {bn.is_resolved
                        ? <CheckCircle2 className="size-3 text-green-500" />
                        : <AlertTriangle className="size-3" />
                      }
                      <div>
                        <span className="text-xs font-bold text-black dark:text-white">{page?.title || 'Unknown'}</span>
                        <p className="text-[10px] text-zinc-500">{bn.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!bn.is_resolved && (
                        <button
                          onClick={() => resolveBottleneck(projectId, bn.id)}
                          className="text-[9px] font-bold uppercase text-green-500 hover:underline"
                        >
                          Resolve
                        </button>
                      )}
                      <button
                        onClick={() => deleteBottleneck(projectId, bn.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-red-500"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function SummaryCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
      <div className="text-zinc-400">{icon}</div>
      <div>
        <p className={cn("text-2xl font-black tracking-tighter", accent)}>{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">{label}</p>
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-12 border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
      <p className="text-[11px] text-zinc-400 dark:text-zinc-600 italic max-w-xs text-center">{message}</p>
    </div>
  )
}
