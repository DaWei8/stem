'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  removeCollaboratorAction,
  updateCollaboratorRoleAction,
  updateCollaboratorPermissionsAction,
  getProjectInvitationsAction,
  addProjectInvitationAction,
  updateProjectInvitationStatusAction,
  deleteProjectInvitationAction,
  getProjectRevokedLogsAction,
  addProjectRevokedLogAction,
  deleteProjectRevokedLogAction
} from '@/lib/actions/collaborators'

export interface Collaborator {
  id: string
  project_id: string
  user_id: string
  role: 'owner' | 'editor' | 'viewer' | 'comment_only'
  can_edit_pages?: boolean
  can_edit_variables?: boolean
  can_edit_constraints?: boolean
  can_run_simulation?: boolean
  can_export?: boolean
  can_invite_others?: boolean
  user: {
    full_name: string | null
    email: string
  }
}

export interface Invitation {
  email: string
  status: 'pending' | 'accepted' | 'rejected'
  role: 'editor' | 'viewer'
  timestamp: string
}

export interface RevokedLog {
  id: string
  email: string
  name: string
  role: string
  timestamp: string
}

interface CollaboratorState {
  collaborators: Collaborator[]
  invites: Invitation[]
  revokedLogs: RevokedLog[]
  isLoading: boolean
  fetchCollaborators: (projectId: string) => Promise<void>
  fetchInvitations: (projectId: string) => Promise<void>
  fetchRevokedLogs: (projectId: string) => Promise<void>
  inviteCollaborator: (projectId: string, email: string, role?: 'editor' | 'viewer') => Promise<void>
  removeCollaborator: (projectId: string, collaborator: Collaborator) => Promise<void>
  updateRole: (projectId: string, id: string, role: string) => Promise<void>
  updatePermissions: (projectId: string, id: string, permissions: Partial<Collaborator>) => Promise<void>
  removeInvitationLog: (projectId: string, email: string) => Promise<void>
  restoreRevokedAccess: (projectId: string, log: RevokedLog) => Promise<void>
}

const supabase = createClient()

export const useCollaborators = create<CollaboratorState>((set, get) => ({
  collaborators: [],
  invites: [],
  revokedLogs: [],
  isLoading: false,

  fetchCollaborators: async (projectId: string) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase
        .from('collaborators')
        .select(`
          *,
          user:user_id (
            full_name,
            email
          )
        `)
        .eq('project_id', projectId)

      if (error) throw error
      set({ collaborators: data || [] })
    } catch (error: any) {
      toast.error(`Collaborator fetch failed: ${error.message}`)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchInvitations: async (projectId: string) => {
    try {
      const invites = await getProjectInvitationsAction(projectId)
      set({ invites })
    } catch (error: any) {
      console.error('Failed to fetch invitations:', error)
    }
  },

  fetchRevokedLogs: async (projectId: string) => {
    try {
      const revokedLogs = await getProjectRevokedLogsAction(projectId)
      set({ revokedLogs })
    } catch (error: any) {
      console.error('Failed to fetch revoked logs:', error)
    }
  },

  inviteCollaborator: async (projectId, email, role = 'editor') => {
    try {
      const normalizedEmail = email.trim().toLowerCase()
      
      // Check if user is already an active collaborator
      const isAlreadyCollaborator = get().collaborators.some(
        (c) => c.user?.email.toLowerCase() === normalizedEmail
      )
      if (isAlreadyCollaborator) {
        toast.info(`${email} is already a collaborator on this project`)
        return
      }

      // Check if there is already a pending invitation
      const hasPendingInvite = get().invites.some(
        (i) => i.email.toLowerCase() === normalizedEmail && i.status === 'pending'
      )
      if (hasPendingInvite) {
        toast.info(`An invitation has already been sent to ${email}`)
        return
      }

      // Create a pending invitation in DB
      const invite = await addProjectInvitationAction(projectId, normalizedEmail, role)
      set((state) => ({
        invites: [invite, ...state.invites.filter(i => i.email !== normalizedEmail)]
      }))
      toast.success(`Invitation sent to ${email}`)
    } catch (error: any) {
      toast.error(`Invitation failed: ${error.message}`)
    }
  },

  removeCollaborator: async (projectId, collaborator) => {
    try {
      await removeCollaboratorAction(projectId, collaborator.id)
      set((state) => ({
        collaborators: state.collaborators.filter(c => c.id !== collaborator.id)
      }))

      // Save revoked log
      const email = collaborator.user?.email || 'unknown@company.com'
      const name = collaborator.user?.full_name || 'Anonymous Member'
      const role = collaborator.role

      const newLog = await addProjectRevokedLogAction(projectId, email, name, role)
      set((state) => ({
        revokedLogs: [newLog, ...state.revokedLogs]
      }))
      
      // Clean up accepted invitation so they can be re-invited
      await deleteProjectInvitationAction(projectId, email)
      set((state) => ({
        invites: state.invites.filter(i => i.email !== email)
      }))

      toast.success('Access revoked')
    } catch (error: any) {
      toast.error(`Failed to remove: ${error.message}`)
    }
  },

  updateRole: async (projectId, id, role) => {
    try {
      const data = await updateCollaboratorRoleAction(projectId, id, role)
      set((state) => ({
        collaborators: state.collaborators.map(c => c.id === id ? data : c)
      }))
      toast.success('Role updated')
    } catch (error: any) {
      toast.error(`Update failed: ${error.message}`)
    }
  },

  updatePermissions: async (projectId, id, permissions) => {
    try {
      const data = await updateCollaboratorPermissionsAction(projectId, id, permissions)
      set((state) => ({
        collaborators: state.collaborators.map(c => c.id === id ? data : c)
      }))
      toast.success('Permissions updated')
    } catch (error: any) {
      toast.error(`Permissions update failed: ${error.message}`)
    }
  },



  removeInvitationLog: async (projectId, email) => {
    try {
      await deleteProjectInvitationAction(projectId, email)
      set((state) => ({
        invites: state.invites.filter(i => i.email !== email)
      }))
      toast.success('Invitation cancelled')
    } catch (error: any) {
      toast.error(`Failed to delete invitation: ${error.message}`)
    }
  },

  restoreRevokedAccess: async (projectId, log) => {
    try {
      // 1. Delete revoked log from DB
      await deleteProjectRevokedLogAction(projectId, log.email)
      set((state) => ({
        revokedLogs: state.revokedLogs.filter(r => r.email !== log.email)
      }))

      // 2. Re-invite (this will either add them directly or create pending invite)
      await get().inviteCollaborator(projectId, log.email, log.role as any || 'editor')
    } catch (error: any) {
      toast.error(`Failed to restore: ${error.message}`)
    }
  }
}))
