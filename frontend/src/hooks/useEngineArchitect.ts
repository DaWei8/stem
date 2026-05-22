'use client'

import { create } from 'zustand'
import { useVariables } from './useVariables'
import { useDatabase } from './useDatabase'
import { useLogic } from './useLogic'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  script?: string
  timestamp: number
  is_committed?: boolean
}

interface EngineArchitectState {
  messages: Message[]
  isArchitecting: boolean
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  addMessage: (message: Omit<Message, 'id' | 'timestamp'> & { id?: string, timestamp?: number }) => void
  fetchMessages: (projectId: string) => Promise<void>
  generateSystem: (prompt: string, projectId: string) => Promise<void>
  commitScript: (script: string, projectId: string, messageId?: string) => Promise<void>
  clearHistory: () => void
}

export const useEngineArchitect = create<EngineArchitectState>((set, get) => ({
  messages: [],
  isArchitecting: false,
  isOpen: false,

  setIsOpen: (open) => set({ isOpen: open }),

  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, { ...msg, id: msg.id || Math.random().toString(36).substring(7), timestamp: msg.timestamp || Date.now() }]
  })),

  clearHistory: () => set({ messages: [] }),

  fetchMessages: async (projectId) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('project_id', projectId)
      .eq('architect_type', 'engine')
      .order('created_at', { ascending: true })

    if (error) {
      console.error(error)
      return
    }

    if (!data || data.length === 0) {
      set({
        messages: [{
          id: 'welcome',
          role: 'assistant',
          content: 'I am the STEM Engine Architect. Describe your variables, schemas, logic functions, or dependencies, and I will orchestrate them deterministically.',
          timestamp: Date.now()
        }]
      })
    } else {
      set({
        messages: data.map(m => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          script: m.script,
          is_committed: m.is_committed,
          timestamp: new Date(m.created_at).getTime()
        }))
      })
    }
  },

  generateSystem: async (prompt, projectId) => {
    set({ isArchitecting: true })

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await supabase.from('chat_messages').insert({
          project_id: projectId,
          user_id: session.user.id,
          role: 'user',
          content: prompt,
          architect_type: 'engine'
        })
      }

      const { variables } = useVariables.getState()
      const { tables, columns } = useDatabase.getState()
      const { constants, functions, dependencies } = useLogic.getState()

      const projectData = {
        projectId,
        architecture: {
          variables: variables.map(v => ({ id: v.id, label: v.label, type: v.type, scope: v.scope })),
          constants: constants.map(c => ({ name: c.name, type: c.type })),
          tables: tables.map(t => ({ id: t.id, name: t.name, columns: columns.filter(c => c.table_id === t.id).map(c => c.name) })),
          functions: functions.map(f => ({ name: f.name })),
          dependencies: dependencies.map(d => ({ name: d.name }))
        },
        meta: { version: '0.2.0', engine: 'STEM-ENGINE-V1' }
      }

      const selectedModel = typeof window !== 'undefined' ? localStorage.getItem('active_architect_model') || 'gemini-2.5-flash' : 'gemini-2.5-flash'

      let response;
      let retries = 0;
      const maxRetries = 3;

      while (retries < maxRetries) {
        response = await fetch('/api/architect/engine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            currentState: JSON.stringify(projectData, null, 2),
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

      if (session?.user) {
        const { data: savedMsg } = await supabase.from('chat_messages').insert({
          project_id: projectId,
          user_id: session.user.id,
          role: 'assistant',
          content: data.content,
          script: data.script,
          architect_type: 'engine',
          is_committed: false
        }).select().single()

        if (savedMsg) {
          get().addMessage({
            id: savedMsg.id,
            role: 'assistant',
            content: data.content,
            script: data.script,
            is_committed: false,
            timestamp: new Date(savedMsg.created_at).getTime()
          })
          return
        }
      }

      get().addMessage({
        role: 'assistant',
        content: data.content,
        script: data.script,
        is_committed: false
      })
    } catch (error) {
      console.error(error)
      toast.error('Engine Architecting failed')
    } finally {
      set({ isArchitecting: false })
    }
  },

  commitScript: async (script, projectId, messageId) => {
    const { addVariable, variables } = useVariables.getState()
    const { addTable, addColumn, tables, columns } = useDatabase.getState()
    const { addConstant, addFunction, addDependency, constants, functions, dependencies } = useLogic.getState()

    toast.loading('Executing engine transactions...')

    try {
      // 1. DEFINE VARIABLE
      const varMatches = [...script.matchAll(/DEFINE VARIABLE\s+"([^"]+)"\s*\{([^}]*)\}/g)]
      for (const match of varMatches) {
        const label = match[1]
        const type = match[2]?.match(/type:\s*"([^"]+)"/)?.[1] || 'string'
        const scope = match[2]?.match(/scope:\s*"([^"]+)"/)?.[1] || 'persistent'
        
        const existingVar = useVariables.getState().variables.find(v => v.label === label)
        if (existingVar) {
          if (existingVar.type !== type || existingVar.scope !== scope) {
            await useVariables.getState().updateVariable(projectId, existingVar.id, { type: type as any, scope: scope as any })
          }
        } else {
          await addVariable(projectId, { label, type: type as any, scope: scope as any }, true)
        }
      }

      // 2. DEFINE CONSTANT
      const constMatches = [...script.matchAll(/DEFINE CONSTANT\s+"([^"]+)"\s*\{([^}]*)\}/g)]
      for (const match of constMatches) {
        const name = match[1]
        const type = (match[2]?.match(/type:\s*"([^"]+)"/)?.[1] || 'string') as 'string'|'number'|'boolean'|'json'
        
        // Correctly match strings with escaped nested quotes
        const valueMatch = match[2]?.match(/value:\s*"((?:\\.|[^"\\])*)"/)
        let value = valueMatch ? valueMatch[1] : ''
        value = value.replace(/\\"/g, '"').replace(/\\\\/g, '\\')

        const existingConst = useLogic.getState().constants.find(c => c.name === name)
        if (existingConst) {
          if (existingConst.value !== value || existingConst.type !== type) {
            await useLogic.getState().updateConstant(projectId, existingConst.id, name, value, type)
          }
        } else {
          await addConstant(projectId, name, value, type, true)
        }
      }

      // 3. DEFINE TABLE
      const tableMatches = [...script.matchAll(/DEFINE TABLE\s+"([^"]+)"/g)]
      for (const match of tableMatches) {
        const name = match[1]
        if (!useDatabase.getState().tables.some(t => t.name === name)) {
          await addTable(projectId, name, true)
        }
      }

      // 4. ADD COLUMN TO TABLE
      const colMatches = [...script.matchAll(/ADD COLUMN TO\s+"([^"]+)"\s*\{([^}]*)\}/g)]
      for (const match of colMatches) {
        const tableName = match[1]
        const name = match[2]?.match(/name:\s*"([^"]+)"/)?.[1]
        const type = match[2]?.match(/type:\s*"([^"]+)"/)?.[1] || 'text'
        const pkStr = match[2]?.match(/pk:\s*(true|false)/)?.[1]
        
        if (name) {
          const currentTables = useDatabase.getState().tables
          const tableId = currentTables.find(t => t.name === tableName)?.id
          if (tableId) {
            const columnExists = useDatabase.getState().columns.some(c => c.table_id === tableId && c.name === name)
            if (!columnExists) {
              await addColumn(projectId, tableId, { name, type, is_primary_key: pkStr === 'true' }, true)
            }
          }
        }
      }

      // 5. DEFINE FUNCTION
      const funcMatches = [...script.matchAll(/DEFINE FUNCTION\s+"([^"]+)"(?:\s*\{([^}]*)\})?/g)]
      for (const match of funcMatches) {
        const name = match[1]
        const description = match[2]?.match(/description:\s*"([^"]*)"/)?.[1] || ''
        if (!useLogic.getState().functions.some(f => f.name === name)) {
          await addFunction(projectId, name, description, true)
        }
      }

      // 6. ADD DEPENDENCY
      const depMatches = [...script.matchAll(/ADD DEPENDENCY\s+"([^"]+)"\s*\{([^}]*)\}/g)]
      for (const match of depMatches) {
        const name = match[1]
        const version = match[2]?.match(/version:\s*"([^"]+)"/)?.[1] || 'latest'
        const type = (match[2]?.match(/type:\s*"([^"]+)"/)?.[1] || 'npm') as 'npm'|'api'|'service'
        
        const existingDep = useLogic.getState().dependencies.find(d => d.name === name)
        if (existingDep) {
          if (existingDep.version !== version || existingDep.type !== type) {
            await useLogic.getState().deleteDependency(projectId, existingDep.id)
            await addDependency(projectId, name, version, type, true)
          }
        } else {
          await addDependency(projectId, name, version, type, true)
        }
      }

      if (messageId) {
        await supabase.from('chat_messages').update({ is_committed: true }).eq('id', messageId)
        set(state => ({
          messages: state.messages.map(m => m.id === messageId ? { ...m, is_committed: true } : m)
        }))
      }

      toast.dismiss()
      toast.success('Engine Architecture synchronized successfully')
    } catch (error) {
      toast.dismiss()
      toast.error('Transaction failed: Invalid STEM-script syntax')
    }
  }
}))
