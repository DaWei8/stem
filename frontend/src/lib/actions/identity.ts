'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addUserTypeAction(projectId: string, payload: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_types')
    .insert([{ ...payload, project_id: projectId }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function deleteUserTypeAction(projectId: string, id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('user_types')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
}

export async function updateUserTypeAction(projectId: string, id: string, payload: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_types')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function addPolicyAction(projectId: string, policy: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('rls_policies')
    .insert([{ ...policy, project_id: projectId }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function deletePolicyAction(projectId: string, id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('rls_policies')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
}
