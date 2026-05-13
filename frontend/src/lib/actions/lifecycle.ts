'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ── Feature Flags ──

export async function addFeatureFlagAction(
  projectId: string,
  payload: {
    flag_key: string
    label: string
    description?: string
    lifecycle_stage?: string
  }
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('feature_flags')
    .insert([{
      project_id: projectId,
      is_enabled: false,
      rollout_percentage: 0,
      ...payload
    }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function updateFeatureFlagAction(
  projectId: string,
  id: string,
  updates: Record<string, unknown>
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('feature_flags')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function deleteFeatureFlagAction(projectId: string, id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('feature_flags')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
}

// ── Feature Flag Gates ──

export async function addFlagGateAction(
  projectId: string,
  flagId: string,
  pageId: string,
  gateType: string,
  fallbackPageId?: string
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('feature_flag_gates')
    .insert([{
      feature_flag_id: flagId,
      page_id: pageId,
      gate_type: gateType,
      fallback_page_id: fallbackPageId
    }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function deleteFlagGateAction(projectId: string, id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('feature_flag_gates')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
}

// ── Schema Migration Registry ──

export async function addSchemaMigrationAction(
  projectId: string,
  payload: {
    from_version: string
    to_version: string
    migration_name: string
    description?: string
  }
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('schema_migration_registry')
    .insert([{
      project_id: projectId,
      status: 'draft',
      ...payload
    }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function updateSchemaMigrationAction(
  projectId: string,
  id: string,
  updates: Record<string, unknown>
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('schema_migration_registry')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function deleteSchemaMigrationAction(projectId: string, id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('schema_migration_registry')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
}

// ── Migration Transforms ──

export async function addMigrationTransformAction(
  projectId: string,
  migrationId: string,
  payload: {
    transform_type: string
    variable_id?: string
    table_id?: string
    old_definition?: Record<string, unknown>
    new_definition?: Record<string, unknown>
    transform_logic?: string
    is_reversible?: boolean
  }
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('migration_transforms')
    .insert([{
      migration_id: migrationId,
      is_reversible: true,
      ...payload
    }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function deleteMigrationTransformAction(projectId: string, id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('migration_transforms')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
}
