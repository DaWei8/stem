'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Variable } from '@/types'

/**
 * Server Actions for Variable Registry
 * Centralizes all database mutations for variables.
 */

export async function addVariableAction(projectId: string, variable: any) {
  const supabase = await createClient()
  
  // Generate a registry_uuid if not provided (required by schema)
  const registry_uuid = `var_${Math.random().toString(36).substring(2, 10)}`

  const { data, error } = await supabase
    .from('variables')
    .insert([{ ...variable, project_id: projectId, registry_uuid }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function updateVariableAction(projectId: string, id: string, updates: any) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('variables')
    .update(updates)
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
