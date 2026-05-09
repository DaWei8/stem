'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addTableAction(projectId: string, name: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('database_tables')
    .insert([{ project_id: projectId, name }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function deleteTableAction(projectId: string, tableId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('database_tables')
    .delete()
    .eq('id', tableId)

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
}

export async function addColumnAction(projectId: string, tableId: string, column: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('database_columns')
    .insert([{ ...column, table_id: tableId, project_id: projectId }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}
export async function updateTableAction(projectId: string, tableId: string, name: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('database_tables')
    .update({ name })
    .eq('id', tableId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}
