'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  addUserTypeAction,
  deleteUserTypeAction,
  updateUserTypeAction,
  addPolicyAction,
  deletePolicyAction
} from '@/lib/actions/identity'

import { UserType, RLSPolicy } from '@/types'


interface IdentityState {
  userTypes: UserType[]
  policies: RLSPolicy[]
  isLoading: boolean
  fetchIdentityData: (projectId: string) => Promise<void>
  addUserType: (projectId: string, payload: any) => Promise<void>
  deleteUserType: (projectId: string, id: string) => Promise<void>
  updateUserType: (projectId: string, id: string, payload: any) => Promise<void>
  addPolicy: (projectId: string, policy: any) => Promise<void>
  deletePolicy: (projectId: string, id: string) => Promise<void>
}

const supabase = createClient()

export const useIdentity = create<IdentityState>((set) => ({
  userTypes: [],
  policies: [],
  isLoading: false,

  fetchIdentityData: async (projectId: string) => {
    set({ isLoading: true })
    try {
      const [utRes, polRes] = await Promise.all([
        supabase.from('user_types').select('*').eq('project_id', projectId),
        supabase.from('rls_policies').select('*').eq('project_id', projectId)
      ])

      if (utRes.error) throw utRes.error
      if (polRes.error) throw polRes.error

      set({
        userTypes: utRes.data || [],
        policies: polRes.data || []
      })
    } catch (error: any) {
      toast.error(`Identity fetch failed: ${error.message}`)
    } finally {
      set({ isLoading: false })
    }
  },

  addUserType: async (projectId, payload) => {
    try {
      const data = await addUserTypeAction(projectId, payload)
      set((state) => ({ userTypes: [...state.userTypes, data] }))
      toast.success('Role Created')
    } catch (error: any) {
      toast.error(`Failed to add role: ${error.message}`)
    }
  },

  deleteUserType: async (projectId, id) => {
    try {
      await deleteUserTypeAction(projectId, id)
      set((state) => ({
        userTypes: state.userTypes.filter(ut => ut.id !== id),
        policies: state.policies.filter(p => p.user_type_id !== id)
      }))
      toast.success('Role removed from identity model')
    } catch (error: any) {
      toast.error(`Delete failed: ${error.message}`)
    }
  },

  updateUserType: async (projectId, id, payload) => {
    try {
      const data = await updateUserTypeAction(projectId, id, payload)
      set((state) => ({
        userTypes: state.userTypes.map(ut => ut.id === id ? data : ut)
      }))
      toast.success('Role orchestration updated')
    } catch (error: any) {
      toast.error(`Update failed: ${error.message}`)
    }
  },

  addPolicy: async (projectId, policy) => {
    try {
      const data = await addPolicyAction(projectId, policy)
      set((state) => ({ policies: [...state.policies, data] }))
      toast.success('RLS policy committed')
    } catch (error: any) {
      toast.error(`Failed to add policy: ${error.message}`)
    }
  },

  deletePolicy: async (projectId, id) => {
    try {
      await deletePolicyAction(projectId, id)
      set((state) => ({ policies: state.policies.filter(p => p.id !== id) }))
      toast.success('Policy revoked')
    } catch (error: any) {
      toast.error(`Delete failed: ${error.message}`)
    }
  }
}))
