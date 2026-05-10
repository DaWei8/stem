'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addTokenAction(projectId: string, token: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('design_tokens')
    .insert([{ ...token, project_id: projectId }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function updateTokenAction(projectId: string, id: string, token: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('design_tokens')
    .update(token)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function addComponentAction(projectId: string, component: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('components')
    .insert([{ ...component, project_id: projectId }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function updateComponentAction(projectId: string, id: string, component: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('components')
    .update(component)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function deleteTokenAction(projectId: string, id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('design_tokens')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
}

export async function deleteComponentAction(projectId: string, id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('components')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
}
