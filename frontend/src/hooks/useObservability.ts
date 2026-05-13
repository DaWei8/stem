'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { LatencyModel, CostProjection, BottleneckAnnotation } from '@/types'
import {
  addLatencyModelAction,
  deleteLatencyModelAction,
  addCostProjectionAction,
  deleteCostProjectionAction,
  addBottleneckAction,
  resolveBottleneckAction,
  deleteBottleneckAction
} from '@/lib/actions/observability'

interface ObservabilityState {
  latencyModels: LatencyModel[]
  costProjections: CostProjection[]
  bottlenecks: BottleneckAnnotation[]
  isLoading: boolean
  fetchObservabilityData: (projectId: string) => Promise<void>
  addLatencyModel: (projectId: string, entityType: string, entityId: string, min: number, max: number, p95?: number, notes?: string) => Promise<void>
  deleteLatencyModel: (projectId: string, id: string) => Promise<void>
  addCostProjection: (projectId: string, payload: { entity_type: string; entity_id: string; cost_per_invocation_usd?: number; estimated_monthly_invocations?: number; estimated_monthly_cost_usd?: number; cloud_provider?: string; service_name?: string; notes?: string }) => Promise<void>
  deleteCostProjection: (projectId: string, id: string) => Promise<void>
  addBottleneck: (projectId: string, payload: { entity_type: string; entity_id: string; severity: string; detection_method?: string; description: string }) => Promise<void>
  resolveBottleneck: (projectId: string, id: string, notes?: string) => Promise<void>
  deleteBottleneck: (projectId: string, id: string) => Promise<void>
  getLatencyForEntity: (entityType: string, entityId: string) => LatencyModel | undefined
  getBottlenecksForEntity: (entityId: string) => BottleneckAnnotation[]
  getTotalPathLatency: (pageIds: string[]) => { min: number; max: number; p95: number }
  getTotalMonthlyCost: () => number
}

const supabase = createClient()

export const useObservability = create<ObservabilityState>((set, get) => ({
  latencyModels: [],
  costProjections: [],
  bottlenecks: [],
  isLoading: false,

  fetchObservabilityData: async (projectId: string) => {
    set({ isLoading: true })
    try {
      const [latRes, costRes, bottleRes] = await Promise.all([
        supabase.from('latency_models').select('*').eq('project_id', projectId),
        supabase.from('cost_projections').select('*').eq('project_id', projectId),
        supabase.from('bottleneck_annotations').select('*').eq('project_id', projectId)
      ])

      if (latRes.error) throw latRes.error
      if (costRes.error) throw costRes.error
      if (bottleRes.error) throw bottleRes.error

      set({
        latencyModels: latRes.data || [],
        costProjections: costRes.data || [],
        bottlenecks: bottleRes.data || []
      })
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Observability fetch failed: ${msg}`)
    } finally {
      set({ isLoading: false })
    }
  },

  addLatencyModel: async (projectId, entityType, entityId, min, max, p95, notes) => {
    try {
      const data = await addLatencyModelAction(projectId, entityType, entityId, min, max, p95, notes)
      set((state) => ({ latencyModels: [...state.latencyModels, data] }))
      toast.success('Latency model projected')
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to add latency model: ${msg}`)
    }
  },

  deleteLatencyModel: async (projectId, id) => {
    try {
      await deleteLatencyModelAction(projectId, id)
      set((state) => ({ latencyModels: state.latencyModels.filter(l => l.id !== id) }))
      toast.success('Latency model removed')
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Delete failed: ${msg}`)
    }
  },

  addCostProjection: async (projectId, payload) => {
    try {
      const data = await addCostProjectionAction(projectId, payload)
      set((state) => ({ costProjections: [...state.costProjections, data] }))
      toast.success('Cost projection mapped')
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to add cost projection: ${msg}`)
    }
  },

  deleteCostProjection: async (projectId, id) => {
    try {
      await deleteCostProjectionAction(projectId, id)
      set((state) => ({ costProjections: state.costProjections.filter(c => c.id !== id) }))
      toast.success('Cost projection removed')
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Delete failed: ${msg}`)
    }
  },

  addBottleneck: async (projectId, payload) => {
    try {
      const data = await addBottleneckAction(projectId, payload)
      set((state) => ({ bottlenecks: [...state.bottlenecks, data] }))
      toast.success('Bottleneck annotated')
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to add bottleneck: ${msg}`)
    }
  },

  resolveBottleneck: async (projectId, id, notes) => {
    try {
      await resolveBottleneckAction(projectId, id, notes)
      set((state) => ({
        bottlenecks: state.bottlenecks.map(b =>
          b.id === id ? { ...b, is_resolved: true, resolution_notes: notes } : b
        )
      }))
      toast.success('Bottleneck resolved')
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Resolve failed: ${msg}`)
    }
  },

  deleteBottleneck: async (projectId, id) => {
    try {
      await deleteBottleneckAction(projectId, id)
      set((state) => ({ bottlenecks: state.bottlenecks.filter(b => b.id !== id) }))
      toast.success('Bottleneck annotation removed')
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Delete failed: ${msg}`)
    }
  },

  // ── Derived Computations (Architectural Mesh) ──

  getLatencyForEntity: (entityType, entityId) => {
    return get().latencyModels.find(
      l => l.entity_type === entityType && l.entity_id === entityId
    )
  },

  getBottlenecksForEntity: (entityId) => {
    return get().bottlenecks.filter(b => b.entity_id === entityId && !b.is_resolved)
  },

  getTotalPathLatency: (pageIds) => {
    const models = get().latencyModels.filter(
      l => l.entity_type === 'page_action' && pageIds.includes(l.entity_id)
    )
    return {
      min: models.reduce((sum, m) => sum + m.latency_min_ms, 0),
      max: models.reduce((sum, m) => sum + m.latency_max_ms, 0),
      p95: models.reduce((sum, m) => sum + (m.latency_p95_ms || m.latency_max_ms), 0)
    }
  },

  getTotalMonthlyCost: () => {
    return get().costProjections.reduce(
      (sum, c) => sum + (c.estimated_monthly_cost_usd || 0), 0
    )
  }
}))
