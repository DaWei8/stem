'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getSecurityAuditsAction(projectId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('security_audits')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function createSecurityAuditAction(
  projectId: string,
  reportContent: string,
  flawsCount: number,
  meta?: any
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('security_audits')
    .insert([{
      project_id: projectId,
      report_content: reportContent,
      flaws_count: flawsCount,
      meta: meta || {}
    }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  return data
}

export async function deleteSecurityAuditAction(projectId: string, id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('security_audits')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
}
