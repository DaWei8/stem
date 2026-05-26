'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// --- Collaborators CRUD ---

export async function addCollaboratorAction(projectId: string, email: string, role: string = 'viewer') {
  const supabase = await createClient()
  
  // 1. Find user by email (case-insensitive)
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .ilike('email', email.trim())
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

export async function updateCollaboratorPermissionsAction(
  projectId: string,
  id: string,
  permissions: {
    can_edit_pages?: boolean
    can_edit_variables?: boolean
    can_edit_constraints?: boolean
    can_run_simulation?: boolean
    can_export?: boolean
    can_invite_others?: boolean
  }
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('collaborators')
    .update(permissions)
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


// --- Project Invitations CRUD ---

export async function getProjectInvitationsAction(projectId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('project_invitations')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data.map((inv: any) => ({
    email: inv.email,
    status: inv.status,
    role: inv.role,
    timestamp: inv.created_at
  }))
}

export async function addProjectInvitationAction(projectId: string, email: string, role: 'editor' | 'viewer') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('project_invitations')
    .upsert([{
      project_id: projectId,
      email: email.trim().toLowerCase(),
      role,
      status: 'pending',
      invited_by: user.id,
      updated_at: new Date().toISOString()
    }], { onConflict: 'project_id,email' })
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  revalidatePath(`/projects/${projectId}`)
  return {
    email: data.email,
    status: data.status,
    role: data.role,
    timestamp: data.created_at
  }
}

export async function updateProjectInvitationStatusAction(projectId: string, email: string, status: 'pending' | 'accepted' | 'rejected') {
  const supabase = await createClient()
  
  // 1. Get current user profile or email
  const { data: { user } } = await supabase.auth.getUser()
  
  // 2. Fetch invitation to check if user has access to accept/reject or if simulated
  const { data: invitation, error: getError } = await supabase
    .from('project_invitations')
    .select('*')
    .eq('project_id', projectId)
    .eq('email', email.trim().toLowerCase())
    .single()

  if (getError || !invitation) {
    throw new Error('Invitation not found')
  }

  const adminDb = createAdminClient()

  // 3. If accepted, check user account & add to collaborators
  if (status === 'accepted') {
    // Try to find the user in public.users (case-insensitive)
    const { data: userData, error: userError } = await adminDb
      .from('users')
      .select('id')
      .ilike('email', email.trim())
      .single()

    if (!userError && userData) {
      // Create collaborator row using adminDb to bypass RLS write policies
      const { error: collError } = await adminDb
        .from('collaborators')
        .insert([{
          project_id: projectId,
          user_id: userData.id,
          role: invitation.role
        }])

      if (collError && !collError.message.includes('duplicate key')) {
        throw new Error(`Failed to create collaborator: ${collError.message}`)
      }
    }
  }

  // 4. Update the invitation record status using adminDb to bypass RLS update policies
  const { data, error: updateError } = await adminDb
    .from('project_invitations')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('project_id', projectId)
    .eq('email', email.trim().toLowerCase())
    .select()
    .single()

  if (updateError) throw new Error(updateError.message)

  revalidatePath('/projects')
  revalidatePath(`/projects/${projectId}`)
  
  return {
    email: data.email,
    status: data.status,
    role: data.role,
    timestamp: data.created_at
  }
}

export async function deleteProjectInvitationAction(projectId: string, email: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('project_invitations')
    .delete()
    .eq('project_id', projectId)
    .eq('email', email.trim().toLowerCase())

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
}

export async function getPendingUserInvitationsAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) return []

  const { data, error } = await supabase
    .from('project_invitations')
    .select('*')
    .eq('email', user.email.toLowerCase())
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch pending user invitations:', error)
    return []
  }

  if (!data || data.length === 0) return []

  const projectIds = data.map((inv: any) => inv.project_id)
  const adminDb = createAdminClient()

  const { data: projects, error: projError } = await adminDb
    .from('projects')
    .select(`
      id,
      name,
      description,
      owner_id,
      created_at,
      updated_at,
      collaborators (
        id,
        project_id,
        user_id,
        role,
        user:user_id (
          id,
          email,
          full_name,
          avatar_url
        )
      )
    `)
    .in('id', projectIds)

  if (projError) {
    console.error('Failed to fetch project details for invitations:', projError)
  }

  const projectsMap = new Map(projects?.map((p: any) => [p.id, p]) || [])

  return data.map((inv: any) => ({
    ...inv,
    project: projectsMap.get(inv.project_id) || null
  }))
}

// --- Revoked Access Logs CRUD ---

export async function getProjectRevokedLogsAction(projectId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('project_revoked_logs')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data.map((log: any) => ({
    id: log.id,
    email: log.email,
    name: log.name,
    role: log.role,
    timestamp: log.created_at
  }))
}

export async function addProjectRevokedLogAction(projectId: string, email: string, name: string, role: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('project_revoked_logs')
    .insert([{
      project_id: projectId,
      email: email.trim().toLowerCase(),
      name,
      role,
      revoked_by: user?.id || null
    }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  revalidatePath(`/projects/${projectId}`)
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    role: data.role,
    timestamp: data.created_at
  }
}

export async function deleteProjectRevokedLogAction(projectId: string, email: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('project_revoked_logs')
    .delete()
    .eq('project_id', projectId)
    .eq('email', email.trim().toLowerCase())

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
}
