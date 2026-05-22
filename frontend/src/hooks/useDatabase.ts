'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  addTableAction,
  deleteTableAction,
  updateTableAction,
  addColumnAction,
  linkColumnToVariableAction,
  updateColumnAction,
  deleteColumnAction
} from '@/lib/actions/database'

interface DBTable {
  id: string
  name: string
  project_id: string
}

interface DBColumn {
  id: string
  table_id: string
  name: string
  type: string
  is_primary_key: boolean
  variable_id?: string
  project_id: string
}

interface DatabaseState {
  tables: DBTable[]
  columns: DBColumn[]
  isLoading: boolean
  fetchProjectData: (projectId: string) => Promise<void>
  addTable: (projectId: string, name: string, silent?: boolean) => Promise<any>
  deleteTable: (projectId: string, tableId: string) => Promise<void>
  updateTable: (projectId: string, tableId: string, name: string) => Promise<void>
  addColumn: (projectId: string, tableId: string, column: any, silent?: boolean) => Promise<any>
  updateColumn: (projectId: string, columnId: string, updates: any) => Promise<void>
  deleteColumn: (projectId: string, columnId: string) => Promise<void>
  linkColumnToVariable: (projectId: string, columnId: string, variableId: string | null) => Promise<void>
}

const supabase = createClient()

export const useDatabase = create<DatabaseState>((set) => ({
  tables: [],
  columns: [],
  isLoading: false,

  fetchProjectData: async (projectId: string) => {
    set({ isLoading: true })
    try {
      const [tablesRes, columnsRes] = await Promise.all([
        supabase.from('database_tables').select('*').eq('project_id', projectId),
        supabase.from('database_columns').select('*').eq('project_id', projectId)
      ])

      if (tablesRes.error) throw tablesRes.error
      if (columnsRes.error) throw columnsRes.error

      set({
        tables: tablesRes.data || [],
        columns: columnsRes.data || []
      })
    } catch (error: any) {
      toast.error(`Fetch failed: ${error.message}`)
    } finally {
      set({ isLoading: false })
    }
  },

  addTable: async (projectId, name, silent) => {
    try {
      const data = await addTableAction(projectId, name)
      set((state) => ({ tables: [...state.tables, data] }))
      if (!silent) {
        toast.success('Table Created')
      }
      return data
    } catch (error: any) {
      toast.error(`Failed to add table: ${error.message}`)
      throw error
    }
  },

  deleteTable: async (projectId, tableId) => {
    try {
      await deleteTableAction(projectId, tableId)
      set((state) => ({
        tables: state.tables.filter((t) => t.id !== tableId),
        columns: state.columns.filter((c) => c.table_id !== tableId)
      }))
      toast.success('Table removed from schema')
    } catch (error: any) {
      toast.error(`Delete failed: ${error.message}`)
    }
  },
  updateTable: async (projectId, tableId, name) => {
    try {
      const data = await updateTableAction(projectId, tableId, name)
      set((state) => ({
        tables: state.tables.map((t) => (t.id === tableId ? data : t))
      }))
      toast.success('Table configuration updated')
    } catch (error: any) {
      toast.error(`Update failed: ${error.message}`)
    }
  },

  addColumn: async (projectId, tableId, column, silent) => {
    try {
      const data = await addColumnAction(projectId, tableId, column)
      set((state) => ({ columns: [...state.columns, data] }))
      if (!silent) {
        toast.success('Column added to specification')
      }
      return data
    } catch (error: any) {
      toast.error(`Failed to add column: ${error.message}`)
      throw error
    }
  },
  updateColumn: async (projectId, columnId, updates) => {
    try {
      const data = await updateColumnAction(projectId, columnId, updates)
      set((state) => ({
        columns: state.columns.map((c) => (c.id === columnId ? data : c))
      }))
      toast.success('Field updated')
    } catch (error: any) {
      toast.error(`Update failed: ${error.message}`)
    }
  },
  deleteColumn: async (projectId, columnId) => {
    try {
      await deleteColumnAction(projectId, columnId)
      set((state) => ({
        columns: state.columns.filter((c) => c.id !== columnId)
      }))
      toast.success('Field removed')
    } catch (error: any) {
      toast.error(`Delete failed: ${error.message}`)
    }
  },
  linkColumnToVariable: async (projectId, columnId, variableId) => {
    try {
      const data = await linkColumnToVariableAction(projectId, columnId, variableId)
      set((state) => ({
        columns: state.columns.map((c) => (c.id === columnId ? data : c))
      }))
      if (variableId) {
        toast.success('Column linked to variable')
      } else {
        toast.success('Column unlinked')
      }
    } catch (error: any) {
      toast.error(`Linking failed: ${error.message}`)
    }
  }
}))
