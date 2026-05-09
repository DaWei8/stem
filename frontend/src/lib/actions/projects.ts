'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Server Actions for Project Management
 * Ensures all database mutations happen on the server.
 */

export async function createProjectAction(name: string, description?: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('projects')
    .insert([{ 
      name, 
      description, 
      owner_id: user.id 
    }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  revalidatePath('/projects')
  return data
}

export async function updateProjectAction(id: string, updates: { name?: string, description?: string }) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)

  if (error) throw new Error(error.message)
  
  revalidatePath(`/projects/${id}`)
  revalidatePath('/projects')
}

export async function deleteProjectAction(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  
  revalidatePath('/projects')
}

export async function getProjectById(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}
