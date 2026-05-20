'use client'

import { create } from 'zustand'
import { usePages } from './usePages'
import { useVariables } from './useVariables'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

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
  fetchMessages: (projectId: string) => Promise<void>
  generateSystem: (prompt: string, projectId: string) => Promise<void>
  commitScript: (script: string, projectId: string) => Promise<void>
  clearHistory: () => void
}

export const useSystemArchitect = create<SystemArchitectState>((set, get) => ({
  messages: [],
  isArchitecting: false,
  isOpen: false,

  setIsOpen: (open) => set({ isOpen: open }),

  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, { ...msg, id: Math.random().toString(36).substring(7), timestamp: Date.now() }]
  })),

  clearHistory: () => set({ messages: [] }),

  fetchMessages: async (projectId) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to fetch chat history:', error)
      return
    }

    if (data && data.length > 0) {
      set({
        messages: data.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          script: m.script,
          timestamp: new Date(m.created_at).getTime()
        }))
      })
    } else {
      set({
        messages: [{
          id: 'welcome',
          role: 'assistant',
          content: 'I am the STEM System Architect. Describe your behavioral intent, and I will generate the deterministic logic and visual flow for your system.',
          timestamp: Date.now()
        }]
      })
    }
  },

  generateSystem: async (prompt, projectId) => {
    set({ isArchitecting: true })

    try {
      const { pages, transitions, inputs, actions, outputs, selectedNodeId } = usePages.getState()
      const { variables } = useVariables.getState()

      const projectData = {
        projectId,
        selectedNodeId,
        architecture: {
          pages: pages.map(p => ({ id: p.id, title: p.title, type: p.page_type })),
          transitions: transitions.map(t => ({ from: t.from_page_id, to: t.to_page_id })),
          counts: {
            inputs: inputs.length,
            actions: actions.length,
            outputs: outputs.length
          }
        },
        variables: variables.map(v => ({ id: v.id, label: v.label, type: v.type, scope: v.scope })),
        meta: { version: '0.2.0', engine: 'STEM-TX-V2' }
      }

      // 1. Persist User Message
      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        await supabase.from('chat_messages').insert([{
          project_id: projectId,
          user_id: userData.user.id,
          role: 'user',
          content: prompt
        }])
      }

      const openai = typeof window !== 'undefined' ? localStorage.getItem('openai_key') || '' : ''
      const anthropic = typeof window !== 'undefined' ? localStorage.getItem('anthropic_key') || '' : ''
      const google = typeof window !== 'undefined' ? localStorage.getItem('google_key') || '' : ''
      const selectedModel = typeof window !== 'undefined' ? localStorage.getItem('active_architect_model') || 'gemini-2.5-flash' : 'gemini-2.5-flash'

      let response;
      let retries = 0;
      const maxRetries = 3;

      while (retries < maxRetries) {
        response = await fetch('/api/architect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            currentState: JSON.stringify(projectData, null, 2),
            userKeys: { openai, anthropic, google },
            selectedModel
          })
        })

        if (response.ok) break;

        const errorData = await response.json();
        if (response.status === 503 && retries < maxRetries - 1) {
          retries++;
          const delay = Math.pow(2, retries) * 1000;
          toast.loading(`Gemini is busy. Retrying in ${delay / 1000}s... (Attempt ${retries}/${maxRetries})`, { id: 'ai-retry' });
          await new Promise(r => setTimeout(r, delay));
          continue;
        }

        throw new Error(errorData.error || 'API Request failed');
      }

      toast.dismiss('ai-retry');
      const data = await response!.json()

      // Log AI token usage
      if (data.usage) {
        const { useAIUsage } = await import('./useAIUsage')
        useAIUsage.getState().logUsage({
          provider: data.usage.provider,
          model: data.usage.model,
          inputTokens: data.usage.inputTokens,
          outputTokens: data.usage.outputTokens,
          costUsd: data.usage.costUsd,
          promptSummary: prompt.substring(0, 60) + (prompt.length > 60 ? '...' : '')
        })
      }

      // 2. Persist Assistant Response
      if (userData.user) {
        await supabase.from('chat_messages').insert([{
          project_id: projectId,
          user_id: userData.user.id,
          role: 'assistant',
          content: data.content,
          script: data.script
        }])
      }

      get().addMessage({
        role: 'assistant',
        content: data.content,
        script: data.script
      })
    } catch (error) {
      console.error(error)
      toast.error('AI Architecting failed')
    } finally {
      set({ isArchitecting: false })
    }
  },

  commitScript: async (script, projectId) => {
    const { addPage, addTransition, addInput, addAction, addOutput, pages } = usePages.getState()
    const { variables } = useVariables.getState()

    toast.loading('Executing architecture transactions...')

    try {
      const lines = script.split('\n')
      const screenMap: Record<string, string> = {} // name -> id

      // Seed existing screens
      pages.forEach(p => { if (p.title) screenMap[p.title] = p.id })

      const { inputs: existingInputs, actions: existingActions, outputs: existingOutputs } = usePages.getState()
      
      // 1. DEFINE SCREEN
      const screenMatches = [...script.matchAll(/DEFINE SCREEN\s+"([^"]+)"/g)]
      for (const match of screenMatches) {
        const name = match[1]
        if (!screenMap[name]) {
          const page = await addPage(projectId, name)
          if (page) screenMap[name] = page.id
        }
      }

      // 2. ADD INPUT TO SCREEN
      const inputMatches = [...script.matchAll(/ADD INPUT TO\s+"([^"]+)"\s*\{([^}]*)\}/g)]
      for (const match of inputMatches) {
        const screenName = match[1]
        const name = match[2]?.match(/name:\s*"([^"]+)"/)?.[1]
        const type = match[2]?.match(/type:\s*"([^"]+)"/)?.[1]
        const varLabel = match[2]?.match(/var:\s*"([^"]+)"/)?.[1]
        
        if (name && type && varLabel) {
          const pageId = screenMap[screenName]
          const variableId = variables.find(v => v.label === varLabel)?.id
          if (pageId && variableId) {
            const exists = existingInputs.some(i => i.page_id === pageId && i.name === name)
            if (!exists) {
              await addInput(pageId, { name, input_type: type as any, variable_id: variableId })
            }
          }
        }
      }

      // 3. ADD TRIGGER TO SCREEN
      const actionMatches = [...script.matchAll(/ADD TRIGGER TO\s+"([^"]+)"\s*\{([^}]*)\}/g)]
      for (const match of actionMatches) {
        const screenName = match[1]
        const name = match[2]?.match(/name:\s*"([^"]+)"/)?.[1]
        const type = match[2]?.match(/type:\s*"([^"]+)"/)?.[1]
        
        if (name && type) {
          const pageId = screenMap[screenName]
          if (pageId) {
            const exists = existingActions.some(a => a.page_id === pageId && a.name === name)
            if (!exists) {
              await addAction(pageId, { name, action_type: type as any })
            }
          }
        }
      }

      // 4. ADD MUTATION TO SCREEN
      const outputMatches = [...script.matchAll(/ADD MUTATION TO\s+"([^"]+)"\s*\{([^}]*)\}/g)]
      for (const match of outputMatches) {
        const screenName = match[1]
        const name = match[2]?.match(/name:\s*"([^"]+)"/)?.[1]
        const type = match[2]?.match(/type:\s*"([^"]+)"/)?.[1]
        const varLabel = match[2]?.match(/var:\s*"([^"]+)"/)?.[1]
        
        if (name && type && varLabel) {
          const pageId = screenMap[screenName]
          const variableId = variables.find(v => v.label === varLabel)?.id
          if (pageId && variableId) {
            const exists = existingOutputs.some(o => o.page_id === pageId && o.name === name)
            if (!exists) {
              await addOutput(pageId, { name, output_type: type as any, variable_id: variableId })
            }
          }
        }
      }

      // 5. CONNECT A -> B [FAILURE]
      const connectMatches = [...script.matchAll(/CONNECT\s+"([^"]+)"\s*->\s*"([^"]+)"(?:\s+\[(FAILURE)\])?/g)]
      for (const match of connectMatches) {
        const sourceId = screenMap[match[1]]
        const targetId = screenMap[match[2]]
        const isFailure = match[3] === 'FAILURE'
        
        if (sourceId && targetId) {
          await addTransition(sourceId, targetId, undefined, isFailure)
        }
      }

      toast.dismiss()
      toast.success('Architecture synchronized successfully')
    } catch (error) {
      toast.dismiss()
      toast.error('Transaction failed: Invalid STEM-script syntax')
    }
  }
}))
