'use client'

import { create } from 'zustand'
import { Project } from '@/types'
import { toast } from 'sonner'
import {
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
  getProjectById
} from '@/lib/actions/projects'
import { createClient } from '@/lib/supabase/client'

/**
 * Hook for managing projects via Server Actions.
 * Abstracted to ensure no direct DB calls on the frontend.
 */

interface ProjectsState {
  projects: Project[]
  currentProject: Project | null
  isLoading: boolean
  fetchProjects: () => Promise<void>
  fetchProjectById: (id: string) => Promise<void>
  createProject: (name: string, description?: string) => Promise<void>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
}

const supabase = createClient()

export const useProjects = create<ProjectsState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,

  fetchProjects: async () => {
    set({ isLoading: true })
    try {
      // We still use client for fetching for real-time responsiveness if needed,
      // but mutations MUST go through server actions.
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          collaborators (
            id,
            project_id,
            user_id,
            role,
            user:user_id (
              id,
              email,
              full_name,
              avatar_url
            )
          )
        `)
        .order('updated_at', { ascending: false })

      if (error) throw error
      set({ projects: data || [] })
    } catch (error: any) {
      toast.error(`Failed to fetch projects: ${error.message}`)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchProjectById: async (id: string) => {
    set({ isLoading: true })
    try {
      const data = await getProjectById(id)
      set({ currentProject: data })
    } catch (error: any) {
      toast.error(`Failed to fetch project: ${error.message}`)
    } finally {
      set({ isLoading: false })
    }
  },

  createProject: async (name: string, description?: string) => {
    try {
      const newProject = await createProjectAction(name, description)
      set((state) => ({
        projects: [newProject, ...state.projects]
      }))
      toast.success('Project Created successfully')
    } catch (error: any) {
      toast.error(`Project creation failed: ${error.message}`)
    }
  },

  updateProject: async (id: string, updates: Partial<Project>) => {
    try {
      await updateProjectAction(id, { name: updates.name, description: updates.description })
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        currentProject: state.currentProject?.id === id ? { ...state.currentProject, ...updates } : state.currentProject
      }))
      toast.success('Project specification updated')
    } catch (error: any) {
      toast.error(`Update failed: ${error.message}`)
    }
  },

  deleteProject: async (id: string) => {
    try {
      await deleteProjectAction(id)
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id)
      }))
      toast.success('Project purged from registry')
    } catch (error: any) {
      toast.error(`Decline failed: ${error.message}`)
    }
  },
}))
