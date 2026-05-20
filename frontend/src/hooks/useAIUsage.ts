'use client'

import { create } from 'zustand'

export interface AIUsageRecord {
  id: string
  provider: 'openai' | 'anthropic' | 'google' | 'system-fallback'
  model: string
  inputTokens: number
  outputTokens: number
  costUsd: number
  timestamp: number
  promptSummary?: string
}

interface AIUsageState {
  logs: AIUsageRecord[]
  logUsage: (record: Omit<AIUsageRecord, 'id' | 'timestamp'>) => void
  clearLogs: () => void
  getTotals: () => {
    totalQueries: number
    totalTokens: number
    totalCost: number
    byProvider: Record<string, { count: number; cost: number; tokens: number }>
  }
}

export const useAIUsage = create<AIUsageState>((set, get) => {
  // Initialize from localStorage if client side
  let initialLogs: AIUsageRecord[] = []
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('stem_ai_usage_logs')
    if (saved) {
      try {
        initialLogs = JSON.parse(saved)
      } catch {
        // Ignored
      }
    }
  }

  return {
    logs: initialLogs,

    logUsage: (record) => {
      const newRecord: AIUsageRecord = {
        ...record,
        id: `usage-${Date.now()}-${Math.random().toString(36).substring(5)}`,
        timestamp: Date.now()
      }

      set((state) => {
        const updated = [newRecord, ...state.logs].slice(0, 100) // Keep last 100 logs
        if (typeof window !== 'undefined') {
          localStorage.setItem('stem_ai_usage_logs', JSON.stringify(updated))
        }
        return { logs: updated }
      })
    },

    clearLogs: () => {
      set({ logs: [] })
      if (typeof window !== 'undefined') {
        localStorage.removeItem('stem_ai_usage_logs')
      }
    },

    getTotals: () => {
      const logs = get().logs
      const byProvider: Record<string, { count: number; cost: number; tokens: number }> = {
        openai: { count: 0, cost: 0, tokens: 0 },
        anthropic: { count: 0, cost: 0, tokens: 0 },
        google: { count: 0, cost: 0, tokens: 0 },
        'system-fallback': { count: 0, cost: 0, tokens: 0 }
      }

      let totalCost = 0
      let totalTokens = 0

      logs.forEach((log) => {
        const provider = log.provider || 'system-fallback'
        const cost = log.costUsd || 0
        const tokens = (log.inputTokens || 0) + (log.outputTokens || 0)

        totalCost += cost
        totalTokens += tokens

        if (!byProvider[provider]) {
          byProvider[provider] = { count: 0, cost: 0, tokens: 0 }
        }

        byProvider[provider].count += 1
        byProvider[provider].cost += cost
        byProvider[provider].tokens += tokens
      })

      return {
        totalQueries: logs.length,
        totalTokens,
        totalCost,
        byProvider
      }
    }
  }
})
