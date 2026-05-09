'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { 
  addTokenAction, 
  addComponentAction,
  deleteTokenAction,
  deleteComponentAction
} from '@/lib/actions/design'

interface DesignToken {
  id: string
  name: string
  value: string
  type: 'color' | 'typography' | 'spacing' | 'shadow' | 'radius' | 'motion'
}

export interface SystemComponent {
  id: string
  name: string
  type: 'button' | 'input' | 'form' | 'custom' | 'container'
  layout_config: any
  children_ids: string[]
  variable_mappings: Record<string, string>
  project_id: string
}

interface DesignState {
  tokens: DesignToken[]
  components: SystemComponent[]
  isLoading: boolean
  fetchTokens: (projectId: string) => Promise<void>
  addToken: (projectId: string, token: Omit<DesignToken, 'id'>) => Promise<void>
  deleteToken: (projectId: string, id: string) => Promise<void>
  fetchComponents: (projectId: string) => Promise<void>
  addComponent: (projectId: string, component: Omit<SystemComponent, 'id' | 'project_id'>) => Promise<void>
  deleteComponent: (projectId: string, id: string) => Promise<void>
}

const supabase = createClient()

export const useDesignSystem = create<DesignState>((set) => ({
  tokens: [],
  components: [],
  isLoading: false,

  fetchTokens: async (projectId: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(projectId)) return

    set({ isLoading: true })
    try {
      const { data, error } = await supabase
        .from('design_tokens')
        .select('*')
        .eq('project_id', projectId)

      if (error) throw error
      set({ tokens: data || [] })
    } catch (error: any) {
      toast.error(`Fetch tokens failed: ${error.message}`)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchComponents: async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('components')
        .select('*')
        .eq('project_id', projectId)

      if (error) throw error
      set({ components: data || [] })
    } catch (error: any) {
      console.warn('Components table fetch error:', error)
    }
  },

  addToken: async (projectId, token) => {
    try {
      const data = await addTokenAction(projectId, token)
      set((state) => ({ tokens: [...state.tokens, data] }))
      toast.success('Token defined')
    } catch (error: any) {
      toast.error(`Failed to add token: ${error.message}`)
    }
  },

  deleteToken: async (projectId, id) => {
    try {
      await deleteTokenAction(projectId, id)
      set((state) => ({ tokens: state.tokens.filter(t => t.id !== id) }))
      toast.success('Token removed')
    } catch (error: any) {
      toast.error(`Delete failed: ${error.message}`)
    }
  },

  addComponent: async (projectId, component) => {
    try {
      const data = await addComponentAction(projectId, component)
      set((state) => ({ components: [...state.components, data] }))
      toast.success('Component blueprint committed')
    } catch (error: any) {
      toast.error(`Failed to add component: ${error.message}`)
    }
  },

  deleteComponent: async (projectId, id) => {
    try {
      await deleteComponentAction(projectId, id)
      set((state) => ({ components: state.components.filter(c => c.id !== id) }))
      toast.success('Component purged from registry')
    } catch (error: any) {
      toast.error(`Delete failed: ${error.message}`)
    }
  }
}))
