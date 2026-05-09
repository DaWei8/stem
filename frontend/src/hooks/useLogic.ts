'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { 
  addConstantAction, 
  addFunctionAction, 
  addDependencyAction,
  deleteConstantAction,
  deleteFunctionAction,
  deleteDependencyAction
} from '@/lib/actions/logic'

interface LogicConstant {
  id: string
  name: string
  value: string
  type: string
}

interface LogicFunction {
  id: string
  name: string
  description?: string
  return_type: string
  parameters: any[]
}

interface LogicDependency {
  id: string
  name: string
  version: string
  type: string
}

interface LogicState {
  constants: LogicConstant[]
  functions: LogicFunction[]
  dependencies: LogicDependency[]
  isLoading: boolean
  fetchLogicData: (projectId: string) => Promise<void>
  addConstant: (projectId: string, name: string, value: string, type: string) => Promise<void>
  deleteConstant: (projectId: string, id: string) => Promise<void>
  addFunction: (projectId: string, name: string, description?: string) => Promise<void>
  deleteFunction: (projectId: string, id: string) => Promise<void>
  addDependency: (projectId: string, name: string, version: string, type: string) => Promise<void>
  deleteDependency: (projectId: string, id: string) => Promise<void>
}

const supabase = createClient()

export const useLogic = create<LogicState>((set) => ({
  constants: [],
  functions: [],
  dependencies: [],
  isLoading: false,

  fetchLogicData: async (projectId: string) => {
    set({ isLoading: true })
    try {
      const [constRes, funcRes, depRes] = await Promise.all([
        supabase.from('constants').select('*').eq('project_id', projectId),
        supabase.from('functions').select('*').eq('project_id', projectId),
        supabase.from('dependencies').select('*').eq('project_id', projectId)
      ])

      if (constRes.error) throw constRes.error
      if (funcRes.error) throw funcRes.error
      if (depRes.error) throw depRes.error

      set({
        constants: constRes.data || [],
        functions: funcRes.data || [],
        dependencies: depRes.data || []
      })
    } catch (error: any) {
      toast.error(`Logic fetch failed: ${error.message}`)
    } finally {
      set({ isLoading: false })
    }
  },

  addConstant: async (projectId, name, value, type) => {
    try {
      const data = await addConstantAction(projectId, name, value, type)
      set((state) => ({ constants: [...state.constants, data] }))
      toast.success('Constant defined')
    } catch (error: any) {
      toast.error(`Failed to add constant: ${error.message}`)
    }
  },

  deleteConstant: async (projectId, id) => {
    try {
      await deleteConstantAction(projectId, id)
      set((state) => ({ constants: state.constants.filter(c => c.id !== id) }))
      toast.success('Constant removed')
    } catch (error: any) {
      toast.error(`Delete failed: ${error.message}`)
    }
  },

  addFunction: async (projectId, name, description) => {
    try {
      const data = await addFunctionAction(projectId, name, description)
      set((state) => ({ functions: [...state.functions, data] }))
      toast.success('Function declared')
    } catch (error: any) {
      toast.error(`Failed to add function: ${error.message}`)
    }
  },

  deleteFunction: async (projectId, id) => {
    try {
      await deleteFunctionAction(projectId, id)
      set((state) => ({ functions: state.functions.filter(f => f.id !== id) }))
      toast.success('Function deleted')
    } catch (error: any) {
      toast.error(`Delete failed: ${error.message}`)
    }
  },

  addDependency: async (projectId, name, version, type) => {
    try {
      const data = await addDependencyAction(projectId, name, version, type)
      set((state) => ({ dependencies: [...state.dependencies, data] }))
      toast.success('Dependency attached')
    } catch (error: any) {
      toast.error(`Failed to add dependency: ${error.message}`)
    }
  },

  deleteDependency: async (projectId, id) => {
    try {
      await deleteDependencyAction(projectId, id)
      set((state) => ({ dependencies: state.dependencies.filter(d => d.id !== id) }))
      toast.success('Dependency removed')
    } catch (error: any) {
      toast.error(`Delete failed: ${error.message}`)
    }
  }
}))
