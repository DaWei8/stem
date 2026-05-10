'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addCollaboratorAction(projectId: string, email: string, role: string = 'viewer') {
  const supabase = await createClient()
  
  // 1. Find user by email
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (userError || !userData) {
    throw new Error('User not found. They must have a STEM account to be invited.')
  }

  // 2. Insert into collaborators
  const { data, error } = await supabase
    .from('collaborators')
    .insert([{
      project_id: projectId,
      user_id: userData.id,
      role
    }])
    .select(`
      *,
      user:user_id (
        full_name,
        email
      )
    `)
    .single()

  if (error) throw new Error(error.message)
  
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function removeCollaboratorAction(projectId: string, id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('collaborators')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  
  revalidatePath(`/projects/${projectId}`)
}

export async function updateCollaboratorRoleAction(projectId: string, id: string, role: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('collaborators')
    .update({ role })
    .eq('id', id)
    .select(`
      *,
      user:user_id (
        full_name,
        email
      )
    `)
    .single()

  if (error) throw new Error(error.message)
  
  revalidatePath(`/projects/${projectId}`)
  return data
}
