'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getDocVersionsAction(projectId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('documentation_versions')
    .select('*')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function createDocVersionAction(projectId: string, name: string, description?: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('documentation_versions')
    .insert([{
      project_id: projectId,
      name,
      description: description || '',
      status: 'draft',
      content: ''
    }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function updateDocVersionAction(
  projectId: string,
  id: string,
  updates: { name?: string; description?: string; status?: 'active' | 'archived' | 'draft'; content?: string }
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('documentation_versions')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function deleteDocVersionAction(projectId: string, id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('documentation_versions')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
}
