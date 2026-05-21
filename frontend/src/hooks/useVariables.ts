'use client'

import { create } from 'zustand'
import { Variable } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { 
  addVariableAction, 
  updateVariableAction, 
  deleteVariableAction 
} from '@/lib/actions/variables'

/**
 * Hook for managing variables via Server Actions.
 * Ensures no direct database mutations happen on the frontend.
 */

interface VariablesState {
  variables: Variable[]
  isLoading: boolean
  error: string | null
  fetchVariables: (projectId: string) => Promise<void>
  addVariable: (projectId: string, variable: Omit<Variable, 'id' | 'registry_uuid' | 'project_id'>, silent?: boolean) => Promise<void>
  updateVariable: (projectId: string, id: string, updates: Partial<Variable>) => Promise<void>
  deleteVariable: (projectId: string, id: string) => Promise<void>
}

const supabase = createClient()

export const useVariables = create<VariablesState>((set, get) => ({
  variables: [],
  isLoading: false,
  error: null,

  fetchVariables: async (projectId: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(projectId)) return

    set({ isLoading: true })
    try {
      const { data, error } = await supabase
        .from('variables')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })

      if (error) throw error
      set({ variables: data || [], error: null })
    } catch (error: any) {
      toast.error(`Failed to fetch variables: ${error.message}`)
      set({ error: error.message })
    } finally {
      set({ isLoading: false })
    }
  },

  addVariable: async (projectId, newVar, silent) => {
    try {
      const data = await addVariableAction(projectId, newVar)
      set((state) => ({ variables: [...state.variables, data] }))
      if (!silent) {
        toast.success('Variable added to registry')
      }
    } catch (error: any) {
      if (error.message?.includes('unique constraint "variables_project_id_label_key"')) {
        toast.error('A variable with this identifier already exists in the project registry.')
      } else {
        toast.error(`Failed to add variable: ${error.message}`)
      }
    }
  },

  updateVariable: async (projectId, id, updates) => {
    try {
      await updateVariableAction(projectId, id, updates)
      set((state) => ({
        variables: state.variables.map((v) =>
          v.id === id ? { ...v, ...updates } : v
        ),
      }))
      toast.success('Variable updated')
    } catch (error: any) {
      toast.error(`Update failed: ${error.message}`)
    }
  },

  deleteVariable: async (projectId, id) => {
    try {
      await deleteVariableAction(projectId, id)
      set((state) => ({
        variables: state.variables.filter((v) => v.id !== id),
      }))
      toast.success('Variable removed')
    } catch (error: any) {
      toast.error(`Decline failed: ${error.message}`)
    }
  },
}))
