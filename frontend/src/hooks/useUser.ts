'use client'

import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { create } from 'zustand'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  organization: string | null
  role: string
  subscription_tier: string
  max_projects: number
  max_collaborators: number
}

interface UserState {
  profile: UserProfile | null
  isLoading: boolean
  fetchProfile: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

const supabase = createClient()

export const useUser = create<UserState>((set) => ({
  profile: null,
  isLoading: false,

  fetchProfile: async () => {
    set({ isLoading: true })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      set({ profile: data })
    } catch (error: any) {
      console.error('Error fetching profile:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  updateProfile: async (updates) => {
    set({ isLoading: true })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      set((state) => ({
        profile: state.profile ? { ...state.profile, ...updates } : null
      }))

      toast.success('Profile updated successfully')
    } catch (error: any) {
      toast.error(`Update failed: ${error.message}`)
    } finally {
      set({ isLoading: false })
    }
  }
}))
