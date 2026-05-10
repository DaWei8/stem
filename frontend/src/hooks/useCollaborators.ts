'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  addCollaboratorAction,
  removeCollaboratorAction,
  updateCollaboratorRoleAction
} from '@/lib/actions/collaborators'

interface Collaborator {
  id: string
  project_id: string
  user_id: string
  role: 'owner' | 'editor' | 'viewer' | 'comment_only'
  user: {
    full_name: string | null
    email: string
  }
}

interface CollaboratorState {
  collaborators: Collaborator[]
  isLoading: boolean
  fetchCollaborators: (projectId: string) => Promise<void>
  inviteCollaborator: (projectId: string, email: string) => Promise<void>
  removeCollaborator: (projectId: string, id: string) => Promise<void>
  updateRole: (projectId: string, id: string, role: string) => Promise<void>
}

const supabase = createClient()

export const useCollaborators = create<CollaboratorState>((set) => ({
  collaborators: [],
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

  inviteCollaborator: async (projectId, email) => {
    try {
      const data = await addCollaboratorAction(projectId, email)
      set((state) => ({ collaborators: [...state.collaborators, data] }))
      toast.success('Collaborator access granted')
    } catch (error: any) {
      toast.error(error.message)
    }
  },

  removeCollaborator: async (projectId, id) => {
    try {
      await removeCollaboratorAction(projectId, id)
      set((state) => ({
        collaborators: state.collaborators.filter(c => c.id !== id)
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
  }
}))
