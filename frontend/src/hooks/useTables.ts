'use client'

import { create } from 'zustand'
import { DatabaseTable, DatabaseColumn } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface TablesState {
  tables: DatabaseTable[]
  columns: DatabaseColumn[]
  isLoading: boolean
  fetchProjectData: (projectId: string) => Promise<void>
  addTable: (projectId: string, name: string) => Promise<void>
  deleteTable: (id: string) => Promise<void>
}

const supabase = createClient()

export const useTables = create<TablesState>((set) => ({
  tables: [],
  columns: [],
  isLoading: false,

  fetchProjectData: async (projectId: string) => {
    set({ isLoading: true })
    
    const [tablesRes, columnsRes] = await Promise.all([
      supabase.from('database_tables').select('*').eq('project_id', projectId),
      supabase.from('database_columns').select('*')
    ])

    if (tablesRes.error || columnsRes.error) {
      toast.error('Failed to fetch schema data')
    } else {
      set({ 
        tables: tablesRes.data || [], 
        columns: columnsRes.data || [] 
      })
    }
    set({ isLoading: false })
  },

  addTable: async (projectId, name) => {
    const { data, error } = await supabase
      .from('database_tables')
      .insert([{ name, project_id: projectId }])
      .select()
      .single()

    if (error) {
      toast.error('Failed to create table')
    } else {
      set((state) => ({ tables: [...state.tables, data] }))
      toast.success('Table created')
    }
  },

  deleteTable: async (id) => {
    const { error } = await supabase
      .from('database_tables')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Failed to delete table')
    } else {
      set((state) => ({ tables: state.tables.filter(t => t.id !== id) }))
      toast.success('Table removed')
    }
  }
}))
