'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Screen, ScreenInput, ScreenAction, ScreenOutput, Transition } from '@/types'

interface PagesState {
  pages: Screen[]
  inputs: ScreenInput[]
  actions: ScreenAction[]
  outputs: ScreenOutput[]
  transitions: Transition[]
  isLoading: boolean
  error: string | null
  fetchProjectPages: (projectId: string) => Promise<void>
  addPage: (projectId: string, name: string) => Promise<Screen | null>
  addTransition: (sourceId: string, targetId: string, triggerType?: string, isFailurePath?: boolean) => Promise<void>
  removeTransition: (id: string) => Promise<void>
  updateTransition: (id: string, updates: Partial<Transition>) => Promise<void>
  removePage: (id: string) => Promise<void>
  updatePage: (id: string, updates: Partial<Screen>) => Promise<void>
  addInput: (pageId: string, input: Partial<ScreenInput>) => Promise<void>
  addAction: (pageId: string, action: Partial<ScreenAction>) => Promise<void>
  addOutput: (pageId: string, output: Partial<ScreenOutput>) => Promise<void>
  removeInput: (id: string) => Promise<void>
  removeAction: (id: string) => Promise<void>
  removeOutput: (id: string) => Promise<void>
  updateInput: (id: string, updates: Partial<ScreenInput>) => Promise<void>
  updateOutput: (id: string, updates: Partial<ScreenOutput>) => Promise<void>
  updateAction: (id: string, updates: Partial<ScreenAction>) => Promise<void>
  selectedNodeId: string | null
  setSelectedNodeId: (id: string | null) => void
}

const supabase = createClient()

export const usePages = create<PagesState>((set) => ({
  pages: [],
  inputs: [],
  actions: [],
  outputs: [],
  transitions: [],
  isLoading: false,
  error: null,
  selectedNodeId: null,

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  fetchProjectPages: async (projectId: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(projectId)) return

    set({ isLoading: true })
    
    try {
      const [pagesRes, inputsRes, actionsRes, outputsRes, transRes] = await Promise.all([
        supabase.from('pages').select('*').eq('project_id', projectId),
        supabase.from('page_inputs').select('*'),
        supabase.from('page_actions').select('*'),
        supabase.from('page_outputs').select('*'),
        supabase.from('page_flows').select('*').eq('project_id', projectId)
      ])

      const error = pagesRes.error || inputsRes.error || actionsRes.error || outputsRes.error || transRes.error
      
      if (error) {
        console.error('Fetch error:', error)
        toast.error(`Fetch failed: ${error.message}`)
      } else {
        const projectPageIds = new Set(pagesRes.data?.map(s => s.id) || [])
        
        set({ 
          pages: pagesRes.data || [],
          inputs: (inputsRes.data || []).filter(i => projectPageIds.has(i.page_id)),
          actions: (actionsRes.data || []).filter(a => projectPageIds.has(a.page_id)),
          outputs: (outputsRes.data || []).filter(o => projectPageIds.has(o.page_id)),
          transitions: transRes.data || []
        })
      }
    } catch (err: any) {
      console.error('Unexpected error during fetch:', err)
      toast.error('An unexpected error occurred while fetching page data')
    } finally {
      set({ isLoading: false })
    }
  },

  addPage: async (projectId, name) => {
    // Optimistic ID for instant rendering
    const tempId = `temp-${Math.random().toString(36).substring(7)}`
    const tempPage: Screen = {
      id: tempId,
      project_id: projectId,
      title: name,
      page_type: 'screen',
      canvas_x: 0,
      canvas_y: 0
    }

    const previousPages = usePages.getState().pages
    set((state) => ({ pages: [...state.pages, tempPage] }))

    const { data, error } = await supabase
      .from('pages')
      .insert([{ 
        project_id: projectId, 
        title: name,
        page_type: 'screen' 
      }])
      .select()
      .single()

    if (error) {
      toast.error('Failed to create page')
      set({ pages: previousPages })
      return null
    } else {
      // Replace temp page with real data
      set((state) => ({ 
        pages: state.pages.map(p => p.id === tempId ? data : p) 
      }))
      return data
    }
  },

  addTransition: async (sourceId, targetId, triggerType, isFailurePath) => {
    const { pages } = usePages.getState()
    const projectId = pages.find(p => p.id === sourceId)?.project_id

    if (!projectId) {
      console.error('Project ID not found for page:', sourceId)
      return
    }

    const { data, error } = await supabase
      .from('page_flows')
      .insert([{ 
        project_id: projectId,
        from_page_id: sourceId, 
        to_page_id: targetId,
        trigger_type: triggerType || (isFailurePath ? 'failure' : 'auto'),
        is_failure_path: isFailurePath || false
      }])
      .select()
      .single()

    if (error) {
      console.error('Failed to create transition:', error)
      // If it's an RLS error, we notify the user more clearly
      if (error.code === '42501') {
        toast.error('Database Permission Error: You do not have permission to connect these pages.')
      } else {
        toast.error(`Transition failed: ${error.message}`)
      }
    } else {
      set((state) => ({ transitions: [...state.transitions, data] }))
    }
  },

  removeTransition: async (id) => {
    const { error } = await supabase
      .from('page_flows')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to remove transition:', error)
      toast.error('Failed to disconnect screens')
    } else {
      set((state) => ({
        transitions: state.transitions.filter((t) => t.id !== id),
      }))
      toast.success('Link removed')
    }
  },

  updateTransition: async (id, updates) => {
    const { error } = await supabase
      .from('page_flows')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Failed to update transition:', error)
      toast.error('Failed to update link')
    } else {
      set((state) => ({
        transitions: state.transitions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      }))
    }
  },

  removePage: async (id) => {
    const previousState = {
      pages: usePages.getState().pages,
      inputs: usePages.getState().inputs,
      actions: usePages.getState().actions,
      outputs: usePages.getState().outputs,
      transitions: usePages.getState().transitions
    }

    // Optimistic delete
    set((state) => ({
      pages: state.pages.filter((p) => p.id !== id),
      inputs: state.inputs.filter((i) => i.page_id !== id),
      actions: state.actions.filter((a) => a.page_id !== id),
      outputs: state.outputs.filter((o) => o.page_id !== id),
      transitions: state.transitions.filter(
        (t) => t.from_page_id !== id && t.to_page_id !== id
      ),
    }))

    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to remove page:', error)
      toast.error('Failed to delete screen')
      set(previousState)
    } else {
      toast.success('Screen deleted')
    }
  },

  updatePage: async (id: string, updates: Partial<Screen>) => {
    const previousPages = usePages.getState().pages
    
    // Optimistic update
    set((state) => ({
      pages: state.pages.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }))

    const { error } = await supabase
      .from('pages')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Failed to update page:', error)
      toast.error('Failed to save changes')
      set({ pages: previousPages })
    }
  },

  addInput: async (pageId: string, input: Partial<ScreenInput>) => {
    const { data, error } = await supabase
      .from('page_inputs')
      .insert([{ ...input, page_id: pageId }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error adding input:', error)
      toast.error(`Failed to add input: ${error.message}`)
    } else {
      set((state) => ({ inputs: [...state.inputs, data] }))
      toast.success('Input added')
    }
  },

  addAction: async (pageId: string, action: Partial<ScreenAction>) => {
    const { data, error } = await supabase
      .from('page_actions')
      .insert([{ ...action, page_id: pageId }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error adding action:', error)
      toast.error(`Failed to add action: ${error.message}`)
    } else {
      set((state) => ({ actions: [...state.actions, data] }))
      toast.success('Action added')
    }
  },

  addOutput: async (pageId: string, output: Partial<ScreenOutput>) => {
    const { data, error } = await supabase
      .from('page_outputs')
      .insert([{ ...output, page_id: pageId }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error adding output:', error)
      toast.error(`Failed to add output: ${error.message}`)
    } else {
      set((state) => ({ outputs: [...state.outputs, data] }))
      toast.success('Output added')
    }
  },

  removeInput: async (id: string) => {
    const previous = usePages.getState().inputs
    set((state) => ({ inputs: state.inputs.filter((i) => i.id !== id) }))

    const { error } = await supabase.from('page_inputs').delete().eq('id', id)
    if (error) {
      toast.error('Failed to remove input')
      set({ inputs: previous })
    }
  },

  removeAction: async (id: string) => {
    const previous = usePages.getState().actions
    set((state) => ({ actions: state.actions.filter((a) => a.id !== id) }))

    const { error } = await supabase.from('page_actions').delete().eq('id', id)
    if (error) {
      toast.error('Failed to remove trigger')
      set({ actions: previous })
    }
  },

  removeOutput: async (id: string) => {
    const previous = usePages.getState().outputs
    set((state) => ({ outputs: state.outputs.filter((o) => o.id !== id) }))

    const { error } = await supabase.from('page_outputs').delete().eq('id', id)
    if (error) {
      toast.error('Failed to remove output')
      set({ outputs: previous })
    }
  },

  updateInput: async (id, updates) => {
    const previous = usePages.getState().inputs
    set((state) => ({
      inputs: state.inputs.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    }))

    const { error } = await supabase.from('page_inputs').update(updates).eq('id', id)
    if (error) {
      toast.error('Failed to update input')
      set({ inputs: previous })
    }
  },

  updateOutput: async (id, updates) => {
    const previous = usePages.getState().outputs
    set((state) => ({
      outputs: state.outputs.map((o) => (o.id === id ? { ...o, ...updates } : o)),
    }))

    const { error } = await supabase.from('page_outputs').update(updates).eq('id', id)
    if (error) {
      toast.error('Failed to update output')
      set({ outputs: previous })
    }
  },

  updateAction: async (id, updates) => {
    const previous = usePages.getState().actions
    set((state) => ({
      actions: state.actions.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }))

    const { error } = await supabase.from('page_actions').update(updates).eq('id', id)
    if (error) {
      toast.error('Failed to update action')
      set({ actions: previous })
    }
  }
}))

