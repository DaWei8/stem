'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ── Latency Models ──

export async function addLatencyModelAction(
  projectId: string,
  entityType: string,
  entityId: string,
  latencyMinMs: number,
  latencyMaxMs: number,
  latencyP95Ms?: number,
  notes?: string
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('latency_models')
    .insert([{
      project_id: projectId,
      entity_type: entityType,
      entity_id: entityId,
      latency_min_ms: latencyMinMs,
      latency_max_ms: latencyMaxMs,
      latency_p95_ms: latencyP95Ms,
      notes
    }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function deleteLatencyModelAction(projectId: string, id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('latency_models')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
}

// ── Cost Projections ──

export async function addCostProjectionAction(
  projectId: string,
  payload: {
    entity_type: string
    entity_id: string
    cost_per_invocation_usd?: number
    estimated_monthly_invocations?: number
    estimated_monthly_cost_usd?: number
    cloud_provider?: string
    service_name?: string
    notes?: string
  }
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('cost_projections')
    .insert([{ project_id: projectId, ...payload }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function deleteCostProjectionAction(projectId: string, id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('cost_projections')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
}

// ── Bottleneck Annotations ──

export async function addBottleneckAction(
  projectId: string,
  payload: {
    entity_type: string
    entity_id: string
    severity: string
    detection_method?: string
    description: string
  }
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bottleneck_annotations')
    .insert([{ project_id: projectId, ...payload }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function resolveBottleneckAction(projectId: string, id: string, notes?: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('bottleneck_annotations')
    .update({
      is_resolved: true,
      resolved_at: new Date().toISOString(),
      resolution_notes: notes
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
}

export async function deleteBottleneckAction(projectId: string, id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('bottleneck_annotations')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
}
