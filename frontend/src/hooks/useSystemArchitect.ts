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

      let response;
      let retries = 0;
      const maxRetries = 3;

      while (retries < maxRetries) {
        response = await fetch('/api/architect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            currentState: JSON.stringify(projectData, null, 2)
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
      
      for (const line of lines) {
        const cleanLine = line.trim()
        if (!cleanLine || cleanLine.startsWith('#')) continue

        // 1. DEFINE SCREEN "Name"
        const defineMatch = cleanLine.match(/DEFINE SCREEN\s+"([^"]+)"/)
        if (defineMatch) {
          const name = defineMatch[1]
          if (!screenMap[name]) {
            const page = await addPage(projectId, name)
            if (page) screenMap[name] = page.id
          }
          continue
        }

        // 2. ADD INPUT TO "Screen" { name: "...", type: "...", var: "..." }
        const inputMatch = cleanLine.match(/ADD INPUT TO\s+"([^"]+)"\s+\{\s*name:\s*"([^"]+)",\s*type:\s*"([^"]+)",\s*var:\s*"([^"]+)"\s*\}/)
        if (inputMatch) {
          const [_, screenName, name, type, varLabel] = inputMatch
          const pageId = screenMap[screenName]
          const variableId = variables.find(v => v.label === varLabel)?.id
          if (pageId && variableId) {
            const exists = existingInputs.some(i => i.page_id === pageId && i.name === name)
            if (!exists) {
              await addInput(pageId, { name, input_type: type as any, variable_id: variableId })
            }
          }
          continue
        }

        // 3. ADD TRIGGER TO "Screen" { name: "...", type: "..." }
        const actionMatch = cleanLine.match(/ADD TRIGGER TO\s+"([^"]+)"\s+\{\s*name:\s*"([^"]+)",\s*type:\s*"([^"]+)"\s*\}/)
        if (actionMatch) {
          const [_, screenName, name, type] = actionMatch
          const pageId = screenMap[screenName]
          if (pageId) {
            const exists = existingActions.some(a => a.page_id === pageId && a.name === name)
            if (!exists) {
              await addAction(pageId, { name, action_type: type as any })
            }
          }
          continue
        }

        // 4. ADD MUTATION TO "Screen" { name: "...", type: "...", var: "..." }
        const outputMatch = cleanLine.match(/ADD MUTATION TO\s+"([^"]+)"\s+\{\s*name:\s*"([^"]+)",\s*type:\s*"([^"]+)",\s*var:\s*"([^"]+)"\s*\}/)
        if (outputMatch) {
          const [_, screenName, name, type, varLabel] = outputMatch
          const pageId = screenMap[screenName]
          const variableId = variables.find(v => v.label === varLabel)?.id
          if (pageId && variableId) {
            const exists = existingOutputs.some(o => o.page_id === pageId && o.name === name)
            if (!exists) {
              await addOutput(pageId, { name, output_type: type as any, variable_id: variableId })
            }
          }
          continue
        }

        // 5. CONNECT "A" -> "B" [FAILURE]
        const connectMatch = cleanLine.match(/CONNECT\s+"([^"]+)"\s*->\s*"([^"]+)"(?:\s+\[(FAILURE)\])?/)
        if (connectMatch) {
          const sourceId = screenMap[connectMatch[1]]
          const targetId = screenMap[connectMatch[2]]
          const isFailure = connectMatch[3] === 'FAILURE'
          if (sourceId && targetId) {
            await addTransition(sourceId, targetId, undefined, isFailure)
          }
          continue
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
