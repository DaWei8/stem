'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Variable } from '@/types'

/**
 * Server Actions for Variable Registry
 * Centralizes all database mutations for variables.
 */

function normalizeVariable(variable: any) {
  const normalized = { ...variable }
  
  // Map and validate scope
  let scope = (normalized.scope || '').toString().trim().toLowerCase()
  if (scope === 'db' || scope === 'persistent') {
    scope = 'persistent'
  } else if (scope === 'ram' || scope === 'transient') {
    scope = 'transient'
  } else if (scope === 'cache' || scope === 'flow' || scope === 'contextual') {
    scope = 'contextual'
  } else {
    scope = 'persistent' // default fallback
  }
  normalized.scope = scope

  // Map and validate type
  let type = (normalized.type || '').toString().trim().toLowerCase()
  if (type === 'dictionary') {
    type = 'object'
  }
  if (!['string', 'number', 'boolean', 'date', 'object', 'array', 'custom'].includes(type)) {
    type = 'string' // default fallback
  }
  normalized.type = type

  return normalized
}

export async function addVariableAction(projectId: string, variable: any) {
  const supabase = await createClient()
  
  // Generate a registry_uuid if not provided (required by schema)
  const registry_uuid = `var_${Math.random().toString(36).substring(2, 10)}`
  
  const normalized = normalizeVariable(variable)

  const { data, error } = await supabase
    .from('variables')
    .insert([{ ...normalized, project_id: projectId, registry_uuid }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function updateVariableAction(projectId: string, id: string, updates: any) {
  const supabase = await createClient()
  
  // Create a copy and only normalize fields that are being updated
  const updatedFields = { ...updates }
  if (updatedFields.scope !== undefined || updatedFields.type !== undefined) {
    const tempNormalized = normalizeVariable(updatedFields)
    if (updatedFields.scope !== undefined) updatedFields.scope = tempNormalized.scope
    if (updatedFields.type !== undefined) updatedFields.type = tempNormalized.type
  }
  
  const { error } = await supabase
    .from('variables')
    .update(updatedFields)
    .eq('id', id)

  if (error) throw new Error(error.message)
  
  revalidatePath(`/projects/${projectId}`)
}

export async function deleteVariableAction(projectId: string, id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('variables')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  
  revalidatePath(`/projects/${projectId}`)
}

