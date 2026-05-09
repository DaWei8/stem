'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addConstantAction(projectId: string, name: string, value: string, type: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('constants')
    .insert([{ project_id: projectId, name, value, type }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function addFunctionAction(projectId: string, name: string, description?: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('functions')
    .insert([{ 
      project_id: projectId, 
      name, 
      description,
      return_type: 'void',
      parameters: []
    }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function addDependencyAction(projectId: string, name: string, version: string, type: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('dependencies')
    .insert([{ project_id: projectId, name, version, type }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function deleteConstantAction(projectId: string, id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('constants')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
}

export async function deleteFunctionAction(projectId: string, id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('functions')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
}

export async function deleteDependencyAction(projectId: string, id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('dependencies')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
}
