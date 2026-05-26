'use client'

import { useActivityLogs } from '@/hooks/useActivityLogs'
import { cn } from '@/lib/utils'
import { History, Search, Filter, RotateCcw, User } from 'lucide-react'
import { useMemo, useState } from 'react'

export function HistoryView() {
  const { logs, isLoading } = useActivityLogs()
  const [search, setSearch] = useState('')
  const [selectedPart, setSelectedPart] = useState<string>('all')

  const uniqueParts = useMemo(() => {
    const parts = new Set(logs.map(log => log.part_affected))
    return ['all', ...Array.from(parts)]
  }, [logs])

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch =
        (log.details || '').toLowerCase().includes(search.toLowerCase()) ||
        (log.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (log.user_email || '').toLowerCase().includes(search.toLowerCase())

      const matchesPart = selectedPart === 'all' || log.part_affected === selectedPart

      return matchesSearch && matchesPart
    })
  }, [logs, search, selectedPart])

  const getActionStyles = (action: string) => {
    switch (action.toUpperCase()) {
      case 'INSERT':
      case 'CREATE':
        return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'
      case 'UPDATE':
        return 'text-blue-500 border-blue-500/20 bg-blue-500/5'
      case 'DELETE':
        return 'text-red-500 border-red-500/20 bg-red-500/5'
      case 'COMMIT':
        return 'text-purple-500 border-purple-500/20 bg-purple-500/5'
      default:
        return 'text-zinc-500 border-zinc-500/20 bg-zinc-500/5'
    }
  }

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleReset = () => {
    setSearch('')
    setSelectedPart('all')
  }

  return (
    <div className="h-full w-full bg-zinc-50 dark:bg-black p-8 overflow-y-auto custom-scrollbar transition-colors duration-300">
      <div className="space-y-8 pb-20">

        {/* Header */}
        <header className="pb-6 border-b border-zinc-200 dark:border-zinc-900 space-y-1">
          <div className="flex items-center gap-3">
            <History className="size-6 text-zinc-500" />
            <h1 className="text-3xl font-black tracking-tighter text-black dark:text-white">Activity Log</h1>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Chronological system audit trail and collaborator logs</p>
        </header>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1">

            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search updates, actions, users..."
                className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 h-10 w-full pl-9 pr-4 text-xs font-bold rounded-md focus:outline-none focus:border-zinc-400 text-black dark:text-white"
              />
            </div>

            {/* Filter select */}
            <div className="flex items-center gap-2 border border-zinc-200 dark:border-zinc-850 h-10 px-3 bg-zinc-50 dark:bg-zinc-900">
              <Filter className="size-3.5 text-zinc-400" />
              <select
                value={selectedPart}
                onChange={e => setSelectedPart(e.target.value)}
                className="bg-transparent text-xs font-black uppercase text-zinc-500 dark:text-zinc-400 focus:outline-none cursor-pointer"
              >
                {uniqueParts.map((part, i) => (
                  <option key={i} value={part}>
                    {part === 'all' ? 'All Pillars' : part}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {(search.trim() || selectedPart !== 'all') && (
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-1.5 h-10 px-4 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-colors text-xs font-black uppercase text-zinc-500 hover:text-black dark:hover:text-white bg-white dark:bg-zinc-950/40 shrink-0"
            >
              <RotateCcw className="size-3" />
              Reset Filters
            </button>
          )}
        </div>

        {/* Activity Logs Feed */}
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 divide-y divide-zinc-250 dark:divide-zinc-900 overflow-hidden">
          {isLoading ? (
            <div className="p-20 text-center flex flex-col items-center justify-center gap-3 text-zinc-400 dark:text-zinc-600">
              <div className="size-8 rounded-full border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-600 animate-spin" />
              <span className="text-sm font-mono font-bold">Syncing project audit...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center justify-center gap-2">
              <History className="size-10 text-zinc-300 dark:text-zinc-800" />
              <h3 className="text-sm font-black text-zinc-400 dark:text-zinc-650 mt-2">No logs matched</h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-600">Try adjusting your filters or search criteria.</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/5 transition-colors"
              >
                {/* Log Info */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="flex flex-col gap-2 shrink-0 items-start">
                    <span className={cn(
                      "px-2.5 py-0.5 border text-[9px] font-black uppercase tracking-widest text-center",
                      getActionStyles(log.action)
                    )}>
                      {log.action}
                    </span>
                    <span className="px-2 py-0.5 border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-black/50 text-[9px] font-black uppercase tracking-tight text-zinc-500 truncate max-w-[100px]">
                      {log.part_affected}
                    </span>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-bold text-black dark:text-white leading-relaxed">{log.details}</p>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 dark:text-zinc-550 font-mono">
                      <span>ID: {log.id.slice(0, 8)}...</span>
                      <span>•</span>
                      <span>{formatTimestamp(log.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Initiator User */}
                <div className="flex items-center gap-3 shrink-0 lg:text-right self-end lg:self-center">
                  <div className="flex flex-col items-start lg:items-end">
                    <span className="text-[11px] font-black text-black dark:text-white">
                      {log.user_name || 'System Agent'}
                    </span>
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono">
                      {log.user_email || 'system@stem.dev'}
                    </span>
                  </div>
                  <div className="size-8 bg-zinc-50 dark:bg-black border border-zinc-250 dark:border-zinc-850 flex items-center justify-center font-black text-[10px] text-zinc-500 dark:text-zinc-400 shrink-0 select-none">
                    {log.user_name ? (
                      log.user_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                    ) : (
                      <User className="size-3 text-zinc-400" />
                    )}
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}
