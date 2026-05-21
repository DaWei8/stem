'use client'

import { create } from 'zustand'
import { getAIUsageLogsAction, clearAIUsageLogsAction } from '@/lib/actions/keys'

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
  isLoading: boolean
  fetchLogs: () => Promise<void>
  logUsage: (record: Omit<AIUsageRecord, 'id' | 'timestamp'>) => void
  clearLogs: () => Promise<void>
  getTotals: () => {
    totalQueries: number
    totalTokens: number
    totalCost: number
    byProvider: Record<string, { count: number; cost: number; tokens: number }>
  }
}

export const useAIUsage = create<AIUsageState>((set, get) => {
  return {
    logs: [],
    isLoading: false,

    fetchLogs: async () => {
      set({ isLoading: true })
      try {
        const dbLogs = await getAIUsageLogsAction()
        set({ logs: dbLogs as AIUsageRecord[] })
      } catch (err) {
        console.error('Failed to fetch AI usage logs from DB:', err)
      } finally {
        set({ isLoading: false })
      }
    },

    logUsage: (record) => {
      const newRecord: AIUsageRecord = {
        ...record,
        id: `usage-${Date.now()}-${Math.random().toString(36).substring(5)}`,
        timestamp: Date.now()
      }
      set((state) => ({ logs: [newRecord, ...state.logs].slice(0, 100) }))
    },

    clearLogs: async () => {
      set({ logs: [] })
      try {
        await clearAIUsageLogsAction()
      } catch (err) {
        console.error('Failed to clear AI usage logs in DB:', err)
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
