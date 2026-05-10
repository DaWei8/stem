'use client'

import { create } from 'zustand'
import { Screen, Transition } from '@/types'
import { usePages } from './usePages'
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
    
    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      let script = ''
      let content = ''
      const lPrompt = prompt.toLowerCase()

      if (lPrompt.includes('saas') || lPrompt.includes('login') || lPrompt.includes('auth')) {
        content = "I've architected a standard high-security authentication and dashboard flow. This includes a public landing page, a multi-stage authentication gate, and a protected dashboard with tier-based constraints."
        script = `
screen "Landing Page" {
    description: "Public system entry point"
}

screen "Auth Portal" {
    description: "Unified Login/Signup interface"
}

screen "Dashboard" {
    description: "Primary workspace"
    constraint: "user.auth == true" !! "Auth Portal"
}

screen "Pro Console" {
    description: "Advanced analytics and tools"
    constraint: "user.tier == 'pro'" !! "Dashboard"
}

# Flows
"Landing Page" -> "Auth Portal"
"Auth Portal" -> "Dashboard"
"Dashboard" -> "Pro Console"
        `
      } else if (lPrompt.includes('shop') || lPrompt.includes('ecommerce') || lPrompt.includes('delivery')) {
        content = "I've interpreted your intent as a transactional marketplace system. This blueprint includes a discovery catalog, cart management, and a gated checkout process with success/failure logic."
        script = `
screen "Catalog" {
    description: "Item discovery and filtering"
}

screen "Cart" {
    description: "Order staging and tax calculation"
}

screen "Checkout" {
    description: "Secure transaction gateway"
    constraint: "is_logged_in == true" !! "Login"
}

screen "Order Status" {
    description: "Real-time delivery/order tracking"
    constraint: "payment.status == 'success'" !! "Checkout"
}

screen "Login" {
    description: "System authentication"
}

# Flows
"Catalog" -> "Cart"
"Cart" -> "Checkout"
"Checkout" -> "Order Status" [label: "Success"]
"Checkout" -> "Cart" [label: "Payment Failure"]
        `
      } else if (lPrompt.includes('crm') || lPrompt.includes('admin') || lPrompt.includes('internal')) {
        content = "Generating a high-utility internal management system. This architecture focuses on data visibility, lead management, and administrative overrides."
        script = `
screen "Admin Dashboard" {
    description: "Operational overview"
    constraint: "user.role == 'admin'" !! "Unauthorized"
}

screen "Lead Registry" {
    description: "Customer data management"
}

screen "Settings" {
    description: "System-wide configuration"
}

screen "Unauthorized" {
    description: "Access denied error state"
}

# Flows
"Admin Dashboard" -> "Lead Registry"
"Admin Dashboard" -> "Settings"
        `
      } else {
        content = "I've interpreted your intent as a modular deterministic system. Here is the generated STEM-script blueprint optimized for the canvas."
        script = `
screen "Entry Point" {
    description: "System start state"
}

screen "Main Workspace" {
    description: "Primary application logic"
}

screen "Global Settings" {
    description: "System configuration"
}

# Flows
"Entry Point" -> "Main Workspace"
"Main Workspace" -> "Global Settings"
        `
      }

      get().addMessage({
        role: 'assistant',
        content,
        script
      })
    } catch (error) {
      toast.error('AI Architecting failed')
    } finally {
      set({ isArchitecting: false })
    }
  },

  commitScript: async (script, projectId) => {
    const { addPage, addTransition } = usePages.getState()
    
    toast.loading('Committing system architecture...')
    
    try {
      // Simple STEM-script parser
      const lines = script.split('\n')
      const screens: Record<string, string> = {} // name -> id
      
      // 1. Create Screens
      for (const line of lines) {
        const screenMatch = line.match(/screen\s+"([^"]+)"/)
        if (screenMatch) {
          const name = screenMatch[1]
          const page = await addPage(projectId, name)
          if (page) {
            screens[name] = page.id
          }
        }
      }
      
      // 2. Create Flows
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
