'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { useUser } from './useUser'

export interface ActivityLog {
  id: string
  project_id: string
  action: string
  part_affected: string
  details: string
  user_id: string | null
  user_email: string | null
  user_name: string | null
  created_at: string
}

interface ActivityLogsState {
  logs: ActivityLog[]
  isLoading: boolean
  fetchLogs: (projectId: string) => Promise<void>
  logActivity: (projectId: string, action: string, partAffected: string, details: string) => Promise<void>
}

const supabase = createClient()

export const useActivityLogs = create<ActivityLogsState>((set) => ({
  logs: [],
  isLoading: false,

  fetchLogs: async (projectId: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(projectId)) return

    set({ isLoading: true })
    try {
      const { data, error } = await supabase
        .from('project_activity_logs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error
      set({ logs: data || [] })
    } catch (error: any) {
      console.error('Failed to fetch activity logs:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  logActivity: async (projectId: string, action: string, partAffected: string, details: string) => {
    try {
      let profile = useUser.getState().profile
      if (!profile) {
        await useUser.getState().fetchProfile()
        profile = useUser.getState().profile
      }

      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id || null
      const userEmail = profile?.email || user?.email || null
      const userName = profile?.full_name || null

      const { data, error } = await supabase
        .from('project_activity_logs')
        .insert([{
          project_id: projectId,
          action,
          part_affected: partAffected,
          details,
          user_id: userId,
          user_email: userEmail,
          user_name: userName
        }])
        .select()
        .single()

      if (error) throw error

      if (data) {
        set((state) => ({
          logs: [data, ...state.logs]
        }))
      }
    } catch (error: any) {
      console.error('Failed to log activity:', error)
    }
  }
}))
