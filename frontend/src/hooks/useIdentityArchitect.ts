'use client'

import { create } from 'zustand'
import { useIdentity } from './useIdentity'
import { useDatabase } from './useDatabase'
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
  is_committed?: boolean
  is_rejected?: boolean
}

interface IdentityArchitectState {
  messages: Message[]
  isArchitecting: boolean
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  addMessage: (message: Omit<Message, 'id' | 'timestamp'> & { id?: string, timestamp?: number }) => void
  fetchMessages: (projectId: string) => Promise<void>
  generateSystem: (prompt: string, projectId: string) => Promise<void>
  commitScript: (script: string, projectId: string, messageId?: string) => Promise<void>
  rejectScript: (messageId: string) => Promise<void>
  restoreScript: (messageId: string) => Promise<void>
  clearHistory: () => void
}

export const useIdentityArchitect = create<IdentityArchitectState>((set, get) => ({
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
      .eq('architect_type', 'identity')
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
          content: 'I am the STEM Identity Architect. Describe your user roles and permissions, and I will generate the deterministic RLS policies for your system.',
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
          is_rejected: m.is_rejected,
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
          architect_type: 'identity'
        })
      }

      const { userTypes, policies } = useIdentity.getState()
      const { tables } = useDatabase.getState()
      const { variables } = useVariables.getState()

      const projectData = {
        projectId,
        architecture: {
          roles: userTypes.map(r => ({ id: r.id, name: r.name, description: r.description, persona: r.persona })),
          tables: tables.map(t => ({ id: t.id, name: t.name })),
          policies: policies.map(p => ({ id: p.id, name: p.name, role_id: p.user_type_id, table_id: p.table_id, type: p.policy_type, logic: p.policy_logic }))
        },
        variables: variables.map(v => ({ id: v.id, label: v.label, type: v.type, scope: v.scope })),
        meta: { version: '0.2.0', engine: 'STEM-ID-V1' }
      }

      const selectedModel = typeof window !== 'undefined' ? localStorage.getItem('active_architect_model') || 'gemini-2.5-flash' : 'gemini-2.5-flash'

      let response;
      let retries = 0;
      const maxRetries = 3;

      while (retries < maxRetries) {
        response = await fetch('/api/architect/identity', {
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
          architect_type: 'identity',
          is_committed: false,
          is_rejected: false
        }).select().single()

        if (savedMsg) {
          get().addMessage({
            id: savedMsg.id,
            role: 'assistant',
            content: data.content,
            script: data.script,
            is_committed: false,
            is_rejected: false,
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
      toast.error('Identity Architecting failed')
    } finally {
      set({ isArchitecting: false })
    }
  },

  commitScript: async (script, projectId, messageId) => {
    const { addUserType, addPolicy, deleteUserType, deletePolicy, userTypes, policies } = useIdentity.getState()
    const { tables } = useDatabase.getState()

    toast.loading('Executing architecture transactions...')

    try {
      // 1. DEFINE ROLE
      const roleMatches = [...script.matchAll(/DEFINE ROLE\s+"([^"]+)"(?:\s*\{([^}]*)\})?/g)]
      for (const match of roleMatches) {
        const name = match[1]
        const description = match[2]?.match(/description:\s*"([^"]*)"/)?.[1] || ''
        
        const currentRoles = useIdentity.getState().userTypes
        const existingRole = currentRoles.find(u => u.name === name)
        if (existingRole) {
          if (existingRole.description !== description) {
            await useIdentity.getState().updateUserType(projectId, existingRole.id, { description })
          }
        } else {
          await addUserType(projectId, { name, description }, true)
        }
      }

      // 2. DEFINE POLICY
      const policyMatches = [...script.matchAll(/DEFINE POLICY\s+"([^"]+)"\s+ON\s+"([^"]+)"\s+FOR\s+"([^"]+)"\s*\{([^}]*)\}/g)]
      for (const match of policyMatches) {
        const name = match[1]
        const tableName = match[2]
        const roleName = match[3]
        
        const type = match[4]?.match(/type:\s*"([^"]+)"/)?.[1] || 'select'
        const logic = match[4]?.match(/logic:\s*"([^"]*)"/)?.[1] || 'true'

        const currentRoles = useIdentity.getState().userTypes
        const roleId = currentRoles.find(r => r.name === roleName)?.id
        const tableId = useDatabase.getState().tables.find(t => t.name === tableName)?.id
        
        if (roleId && tableId) {
          const existingPol = useIdentity.getState().policies.find(p => p.table_id === tableId && p.name === name)
          if (existingPol) {
            await deletePolicy(projectId, existingPol.id)
          }
          await addPolicy(projectId, {
            name,
            user_type_id: roleId,
            table_id: tableId,
            policy_type: type.toLowerCase() as any,
            policy_logic: logic
          }, true)
        }
      }

      // 3. DEFINE PERSONA
      const personaMatches = [...script.matchAll(/DEFINE PERSONA\s+"([^"]+)"\s+FOR ROLE\s+"([^"]+)"(?:\s*\{([\s\S]*?)\})?/g)]
      for (const match of personaMatches) {
        const personaName = match[1]
        const roleName = match[2]
        const body = match[3] || ''

        let values: Record<string, any> = {}
        const valuesMatch = body.match(/values:\s*\{([^}]*)\}/)
        if (valuesMatch) {
          const valuesStr = valuesMatch[1]
          const pairMatches = [...valuesStr.matchAll(/([a-zA-Z0-9_]+)\s*:\s*([^,\n}]+)/g)]
          pairMatches.forEach(pair => {
            const key = pair[1].trim()
            let valStr = pair[2].trim()
            if (valStr.startsWith('"') && valStr.endsWith('"')) {
              values[key] = valStr.slice(1, -1)
            } else if (valStr.startsWith("'") && valStr.endsWith("'")) {
              values[key] = valStr.slice(1, -1)
            } else if (valStr === 'true') {
              values[key] = true
            } else if (valStr === 'false') {
              values[key] = false
            } else if (!isNaN(Number(valStr))) {
              values[key] = Number(valStr)
            } else {
              try {
                values[key] = JSON.parse(valStr)
              } catch {
                values[key] = valStr
              }
            }
          })
        }

        const currentRoles = useIdentity.getState().userTypes
        const targetRole = currentRoles.find(r => r.name === roleName)
        if (targetRole) {
          const currentPersona = targetRole.persona || { instances: [] }
          const instances = currentPersona.instances || []
          const existingInst = instances.find((i: any) => i.name === personaName)
          let updatedInstances = []
          if (existingInst) {
            updatedInstances = instances.map((i: any) =>
              i.name === personaName ? { ...i, values: { ...i.values, ...values } } : i
            )
          } else {
            const newInst = {
              id: `inst_${Math.random().toString(36).substring(7)}`,
              name: personaName,
              values
            }
            updatedInstances = [...instances, newInst]
          }
          const updatedPersona = {
            ...currentPersona,
            instances: updatedInstances
          }
          await useIdentity.getState().updateUserType(projectId, targetRole.id, { persona: updatedPersona })
        }
      }

      if (messageId) {
        await supabase.from('chat_messages').update({ is_committed: true }).eq('id', messageId)
        set(state => ({
          messages: state.messages.map(m => m.id === messageId ? { ...m, is_committed: true } : m)
        }))
      }

      toast.dismiss()
      toast.success('Identity Architecture synchronized successfully')
    } catch (error) {
      toast.dismiss()
      toast.error('Transaction failed: Invalid STEM-script syntax')
    }
  },

  rejectScript: async (messageId) => {
    try {
      await supabase.from('chat_messages').update({ is_rejected: true }).eq('id', messageId)
      set(state => ({
        messages: state.messages.map(m => m.id === messageId ? { ...m, is_rejected: true } : m)
      }))
      toast.success('Identity Architecture proposal rejected')
    } catch (e) {
      toast.error('Failed to reject proposal')
    }
  },

  restoreScript: async (messageId) => {
    try {
      await supabase.from('chat_messages').update({ is_rejected: false }).eq('id', messageId)
      set(state => ({
        messages: state.messages.map(m => m.id === messageId ? { ...m, is_rejected: false } : m)
      }))
      toast.success('Identity Architecture proposal restored')
    } catch (e) {
      toast.error('Failed to restore proposal')
    }
  }
}))
