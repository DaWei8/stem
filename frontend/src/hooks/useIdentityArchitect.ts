'use client'

import { create } from 'zustand'
import { useIdentity } from './useIdentity'
import { useDatabase } from './useDatabase'
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

interface IdentityArchitectState {
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

export const useIdentityArchitect = create<IdentityArchitectState>((set, get) => ({
  messages: [],
  isArchitecting: false,
  isOpen: false,

  setIsOpen: (open) => set({ isOpen: open }),

  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, { ...msg, id: Math.random().toString(36).substring(7), timestamp: Date.now() }]
  })),

  clearHistory: () => set({ messages: [] }),

  fetchMessages: async (projectId) => {
    // For now, let's use a simpler approach without full DB persistence to keep it isolated
    set({
      messages: [{
        id: 'welcome',
        role: 'assistant',
        content: 'I am the STEM Identity Architect. Describe your user roles and permissions, and I will generate the deterministic RLS policies for your system.',
        timestamp: Date.now()
      }]
    })
  },

  generateSystem: async (prompt, projectId) => {
    set({ isArchitecting: true })

    try {
      const { userTypes, policies } = useIdentity.getState()
      const { tables } = useDatabase.getState()

      const projectData = {
        projectId,
        architecture: {
          roles: userTypes.map(r => ({ id: r.id, name: r.name, description: r.description })),
          tables: tables.map(t => ({ id: t.id, name: t.name })),
          policies: policies.map(p => ({ id: p.id, name: p.name, role_id: p.user_type_id, table_id: p.table_id, type: p.policy_type, logic: p.policy_logic }))
        },
        meta: { version: '0.2.0', engine: 'STEM-ID-V1' }
      }

      let response;
      let retries = 0;
      const maxRetries = 3;

      while (retries < maxRetries) {
        response = await fetch('/api/architect/identity', {
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
      toast.error('Identity Architecting failed')
    } finally {
      set({ isArchitecting: false })
    }
  },

  commitScript: async (script, projectId) => {
    const { addUserType, addPolicy, deleteUserType, deletePolicy, userTypes, policies } = useIdentity.getState()
    const { tables } = useDatabase.getState()

    toast.loading('Executing architecture transactions...')

    try {
      const lines = script.split('\n')
      
      for (const line of lines) {
        const cleanLine = line.trim()
        if (!cleanLine || cleanLine.startsWith('#')) continue

        // 1. DEFINE ROLE "Name" { description: "..." }
        const roleMatch = cleanLine.match(/DEFINE ROLE\s+"([^"]+)"(?:\s+\{\s*description:\s*"([^"]*)"\s*\})?/)
        if (roleMatch) {
          const name = roleMatch[1]
          const description = roleMatch[2] || ''
          const exists = userTypes.some(u => u.name === name)
          if (!exists) {
            await addUserType(projectId, { name, description })
          }
          continue
        }

        // 2. DEFINE POLICY "Name" ON "Table" FOR "Role" { type: "...", logic: "..." }
        const policyMatch = cleanLine.match(/DEFINE POLICY\s+"([^"]+)"\s+ON\s+"([^"]+)"\s+FOR\s+"([^"]+)"\s+\{\s*type:\s*"([^"]+)",\s*logic:\s*"([^"]*)"\s*\}/)
        if (policyMatch) {
          const [_, name, tableName, roleName, type, logic] = policyMatch
          
          // Refetch to get latest roles if one was just added
          const currentRoles = useIdentity.getState().userTypes
          const roleId = currentRoles.find(r => r.name === roleName)?.id
          const tableId = tables.find(t => t.name === tableName)?.id
          
          if (roleId && tableId) {
            await addPolicy(projectId, {
              name,
              user_type_id: roleId,
              table_id: tableId,
              policy_type: type as any,
              policy_logic: logic
            })
          }
          continue
        }
      }

      toast.dismiss()
      toast.success('Identity Architecture synchronized successfully')
    } catch (error) {
      toast.dismiss()
      toast.error('Transaction failed: Invalid STEM-script syntax')
    }
  }
}))
