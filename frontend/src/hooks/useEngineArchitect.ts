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
}

interface EngineArchitectState {
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

export const useEngineArchitect = create<EngineArchitectState>((set, get) => ({
  messages: [],
  isArchitecting: false,
  isOpen: false,

  setIsOpen: (open) => set({ isOpen: open }),

  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, { ...msg, id: Math.random().toString(36).substring(7), timestamp: Date.now() }]
  })),

  clearHistory: () => set({ messages: [] }),

  fetchMessages: async (projectId) => {
    set({
      messages: [{
        id: 'welcome',
        role: 'assistant',
        content: 'I am the STEM Engine Architect. Describe your variables, schemas, logic functions, or dependencies, and I will orchestrate them deterministically.',
        timestamp: Date.now()
      }]
    })
  },

  generateSystem: async (prompt, projectId) => {
    set({ isArchitecting: true })

    try {
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

      let response;
      let retries = 0;
      const maxRetries = 3;

      while (retries < maxRetries) {
        response = await fetch('/api/architect/engine', {
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

      get().addMessage({
        role: 'assistant',
        content: data.content,
        script: data.script
      })
    } catch (error) {
      console.error(error)
      toast.error('Engine Architecting failed')
    } finally {
      set({ isArchitecting: false })
    }
  },

  commitScript: async (script, projectId) => {
    const { addVariable, variables } = useVariables.getState()
    const { addTable, addColumn, tables } = useDatabase.getState()
    const { addConstant, addFunction, addDependency, constants, functions, dependencies } = useLogic.getState()

    toast.loading('Executing engine transactions...')

    try {
      const lines = script.split('\n')
      
      for (const line of lines) {
        const cleanLine = line.trim()
        if (!cleanLine || cleanLine.startsWith('#')) continue

        // 1. DEFINE VARIABLE
        const varMatch = cleanLine.match(/DEFINE VARIABLE\s+"([^"]+)"\s+\{\s*type:\s*"([^"]+)",\s*scope:\s*"([^"]+)"\s*\}/)
        if (varMatch) {
          const [_, label, type, scope] = varMatch
          if (!variables.some(v => v.label === label)) {
            await addVariable(projectId, { label, type: type as any, scope: scope as any, source: 'Not linked' })
          }
          continue
        }

        // 2. DEFINE CONSTANT
        const constMatch = cleanLine.match(/DEFINE CONSTANT\s+"([^"]+)"\s+\{\s*type:\s*"([^"]+)",\s*value:\s*"([^"]*)"\s*\}/)
        if (constMatch) {
          const [_, name, type, value] = constMatch
          if (!constants.some(c => c.name === name)) {
            await addConstant(projectId, name, value, type)
          }
          continue
        }

        // 3. DEFINE TABLE
        const tableMatch = cleanLine.match(/DEFINE TABLE\s+"([^"]+)"/)
        if (tableMatch) {
          const name = tableMatch[1]
          if (!tables.some(t => t.name === name)) {
            await addTable(projectId, name)
          }
          continue
        }

        // 4. ADD COLUMN TO TABLE
        const colMatch = cleanLine.match(/ADD COLUMN TO\s+"([^"]+)"\s+\{\s*name:\s*"([^"]+)",\s*type:\s*"([^"]+)",\s*pk:\s*(true|false)\s*\}/)
        if (colMatch) {
          const [_, tableName, name, type, pkStr] = colMatch
          // Need latest tables because one might have just been added
          const currentTables = useDatabase.getState().tables
          const tableId = currentTables.find(t => t.name === tableName)?.id
          if (tableId) {
            await addColumn(projectId, tableId, { name, type, is_primary_key: pkStr === 'true' })
          }
          continue
        }

        // 5. DEFINE FUNCTION
        const funcMatch = cleanLine.match(/DEFINE FUNCTION\s+"([^"]+)"(?:\s+\{\s*description:\s*"([^"]*)"\s*\})?/)
        if (funcMatch) {
          const name = funcMatch[1]
          const description = funcMatch[2] || ''
          if (!functions.some(f => f.name === name)) {
            await addFunction(projectId, name, description)
          }
          continue
        }

        // 6. ADD DEPENDENCY
        const depMatch = cleanLine.match(/ADD DEPENDENCY\s+"([^"]+)"\s+\{\s*version:\s*"([^"]+)",\s*type:\s*"([^"]+)"\s*\}/)
        if (depMatch) {
          const [_, name, version, type] = depMatch
          if (!dependencies.some(d => d.name === name)) {
            await addDependency(projectId, name, version, type)
          }
          continue
        }
      }

      toast.dismiss()
      toast.success('Engine Architecture synchronized successfully')
    } catch (error) {
      toast.dismiss()
      toast.error('Transaction failed: Invalid STEM-script syntax')
    }
  }
}))
