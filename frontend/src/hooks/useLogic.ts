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
  deleteDependencyAction,
  updateConstantAction,
  updateFunctionAction,
  updateDependencyAction
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
  implementation_code?: string
  implementation_language?: string
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
  addConstant: (projectId: string, name: string, value: string, type: string, silent?: boolean) => Promise<void>
  updateConstant: (projectId: string, id: string, name: string, value: string, type: string) => Promise<void>
  deleteConstant: (projectId: string, id: string) => Promise<void>
  addFunction: (projectId: string, name: string, description?: string, silent?: boolean) => Promise<void>
  updateFunction: (
    projectId: string,
    id: string,
    name: string,
    description: string | null,
    parameters: any[],
    returnType: string | null,
    implementationCode: string | null,
    implementationLanguage?: string | null
  ) => Promise<void>
  deleteFunction: (projectId: string, id: string) => Promise<void>
  addDependency: (projectId: string, name: string, version: string, type: string, silent?: boolean) => Promise<void>
  updateDependency: (
    projectId: string,
    id: string,
    name: string,
    version: string,
    type: string
  ) => Promise<void>
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

  addConstant: async (projectId, name, value, type, silent) => {
    try {
      const data = await addConstantAction(projectId, name, value, type)
      set((state) => ({ constants: [...state.constants, data] }))
      if (!silent) {
        toast.success('Constant defined')
      }
    } catch (error: any) {
      toast.error(`Failed to add constant: ${error.message}`)
    }
  },

  updateConstant: async (projectId, id, name, value, type) => {
    try {
      const data = await updateConstantAction(projectId, id, name, value, type)
      set((state) => ({
        constants: state.constants.map(c => c.id === id ? data : c)
      }))
      toast.success('Constant updated successfully')
    } catch (error: any) {
      toast.error(`Update failed: ${error.message}`)
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

  addFunction: async (projectId, name, description, silent) => {
    try {
      const data = await addFunctionAction(projectId, name, description)
      set((state) => ({ functions: [...state.functions, data] }))
      if (!silent) {
        toast.success('Function declared')
      }
    } catch (error: any) {
      toast.error(`Failed to add function: ${error.message}`)
    }
  },

  updateFunction: async (projectId, id, name, description, parameters, returnType, implementationCode, implementationLanguage) => {
    try {
      const data = await updateFunctionAction(projectId, id, name, description, parameters, returnType, implementationCode, implementationLanguage)
      set((state) => ({
        functions: state.functions.map(f => f.id === id ? data : f)
      }))
      toast.success('Function updated successfully')
    } catch (error: any) {
      toast.error(`Update failed: ${error.message}`)
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

  addDependency: async (projectId, name, version, type, silent) => {
    try {
      const data = await addDependencyAction(projectId, name, version, type)
      set((state) => ({ dependencies: [...state.dependencies, data] }))
      if (!silent) {
        toast.success('Dependency attached')
      }
    } catch (error: any) {
      toast.error(`Failed to add dependency: ${error.message}`)
    }
  },

  updateDependency: async (projectId, id, name, version, type) => {
    try {
      const data = await updateDependencyAction(projectId, id, name, version, type)
      set((state) => ({
        dependencies: state.dependencies.map(d => d.id === id ? data : d)
      }))
      toast.success('Dependency updated successfully')
    } catch (error: any) {
      toast.error(`Update failed: ${error.message}`)
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
