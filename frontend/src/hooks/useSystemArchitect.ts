'use client'

import { create } from 'zustand'
import { Screen, Transition } from '@/types'
import { usePages } from './usePages'
import { useDatabase } from './useDatabase'
import { useIdentity } from './useIdentity'
import { useVariables } from './useVariables'
import { useDesignSystem } from './useDesignSystem'
import { useObservability } from './useObservability'
import { useLifecycle } from './useLifecycle'
import { useProjects } from './useProjects'
import { generateProjectDocumentation } from '@/lib/exportUtils'
import { toast } from 'sonner'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  script?: string
  timestamp: number
}

interface SystemArchitectState {
  messages: Message[]
  isArchitecting: boolean
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  generateSystem: (prompt: string, projectId: string) => Promise<void>
  commitScript: (script: string, projectId: string) => Promise<void>
  clearHistory: () => void
}

export const useSystemArchitect = create<SystemArchitectState>((set, get) => ({
  messages: [
    {
      id: 'welcome',
      role: 'assistant',
      content: 'I am the STEM System Architect. Describe your behavioral intent, and I will generate the deterministic logic and visual flow for your system.',
      timestamp: Date.now()
    }
  ],
  isArchitecting: false,
  isOpen: false,

  setIsOpen: (open) => set({ isOpen: open }),

  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, { ...msg, id: Math.random().toString(36).substring(7), timestamp: Date.now() }]
  })),

  clearHistory: () => set({ 
    messages: [{
      id: 'welcome',
      role: 'assistant',
      content: 'I am the STEM System Architect. Describe your behavioral intent, and I will generate the deterministic logic and visual flow for your system.',
      timestamp: Date.now()
    }] 
  }),

  generateSystem: async (prompt, projectId) => {
    set({ isArchitecting: true })
    
    try {
      // 1. Gather all current state to provide context to the AI
      const { currentProject } = useProjects.getState()
      const { pages, transitions, inputs, actions, outputs } = usePages.getState()
      const { tables, columns } = useDatabase.getState()
      const { userTypes, policies } = useIdentity.getState()
      const { variables } = useVariables.getState()
      const { tokens, components } = useDesignSystem.getState()
      const { latencyModels, costProjections, bottlenecks } = useObservability.getState()
      const { featureFlags, flagGates, migrations, transforms } = useLifecycle.getState()

      const projectData = {
        project: currentProject,
        architecture: { pages, transitions, inputs, actions, outputs },
        schema: { tables, columns },
        identity: { userTypes, policies },
        logic: { variables },
        designSystem: { tokens, components },
        observability: { latencyModels, costProjections, bottlenecks },
        lifecycle: { featureFlags, flagGates, migrations, transforms },
        meta: { version: '0.1.0-alpha', engine: 'STEM-CORE-V1' }
      }

      // 2. Generate the deterministic text string of the system
      const currentStateString = generateProjectDocumentation(projectData)

      // 3. Send to API Endpoint
      const response = await fetch('/api/architect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          currentState: currentStateString
        })
      })

      if (!response.ok) {
        throw new Error('API Request failed')
      }

      const data = await response.json()

      // 4. Update Chat UI
      get().addMessage({
        role: 'assistant',
        content: data.content,
        script: data.script
      })
    } catch (error) {
      console.error(error)
      toast.error('AI Architecting failed. Check API connection.')
    } finally {
      set({ isArchitecting: false })
    }
  },

  commitScript: async (script, projectId) => {
    const { addPage, addTransition, pages } = usePages.getState()
    
    toast.loading('Committing system architecture...')
    
    try {
      const lines = script.split('\\n')
      const screens: Record<string, string> = {} // name -> id
      
      // Seed existing screens to prevent duplicates
      pages.forEach(p => {
        if (p.title) screens[p.title] = p.id
      })
      
      // 1. Parse & Create Missing Screens
      for (const line of lines) {
        const screenMatch = line.match(/screen\\s+"([^"]+)"/)
        if (screenMatch) {
          const name = screenMatch[1]
          if (!screens[name]) {
            const page = await addPage(projectId, name)
            if (page) screens[name] = page.id
          }
        }
      }
      
      // 2. Parse & Create Flows
      for (const line of lines) {
        const flowMatch = line.match(/"([^"]+)"\s*->\s*"([^"]+)"/)
        if (flowMatch) {
          const sourceName = flowMatch[1]
          const targetName = flowMatch[2]
          
          const sourceId = screens[sourceName]
          const targetId = screens[targetName]
          
          if (sourceId && targetId) {
            await addTransition(sourceId, targetId)
          }
        }
      }
      
      toast.dismiss()
      toast.success('Architecture committed to canvas')
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to commit script')
    }
  }
}))
