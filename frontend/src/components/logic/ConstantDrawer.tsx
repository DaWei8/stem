'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { X, Hash, Copy, Check, Table, Eye, Terminal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Props {
  constant: any
  onClose: () => void
}

export function ConstantDrawer({ constant, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'explorer' | 'raw' | 'table'>('explorer')
  const [copied, setCopied] = useState(false)

  // Robust parser for database-stored values which might have trailing semicolons or double-encoding
  const parsedValue = useMemo(() => {
    const rawVal = constant.value
    if (typeof rawVal !== 'string') return rawVal

    let clean = rawVal.trim()
    if (clean.endsWith(';')) {
      clean = clean.slice(0, -1).trim()
    }

    // Try parsing double stringified JSON
    if (clean.startsWith('"') && clean.endsWith('"')) {
      try {
        const parsed = JSON.parse(clean)
        if (typeof parsed === 'string') {
          return JSON.parse(parsed)
        }
        return parsed
      } catch (e) {}
    }

    try {
      return JSON.parse(clean)
    } catch (e) {}

    // Fallback: try converting single quotes to double quotes for basic JS object strings
    try {
      const formatted = clean.replace(/'/g, '"')
      return JSON.parse(formatted)
    } catch (e) {}

    return rawVal
  }, [constant.value])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(typeof parsedValue === 'object' ? JSON.stringify(parsedValue, null, 2) : String(parsedValue))
    setCopied(true)
    toast.success('Constant value copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const renderValue = (val: any, depth = 0): React.ReactNode => {
    if (val === null) return <span className="text-zinc-500 font-mono">null</span>
    if (val === undefined) return <span className="text-zinc-500 font-mono">undefined</span>

    if (typeof val === 'boolean') {
      return <span className="text-emerald-400 font-mono">{val ? 'true' : 'false'}</span>
    }

    if (typeof val === 'number') {
      return <span className="text-sky-400 font-mono">{val}</span>
    }

    if (typeof val === 'string') {
      return <span className="text-amber-400 font-mono break-all">"{val}"</span>
    }

    if (Array.isArray(val)) {
      if (val.length === 0) return <span className="text-zinc-400 font-mono">[]</span>
      return (
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500 font-bold">[</span>
          <div className="pl-4 border-l border-zinc-800 my-1 space-y-1">
            {val.map((item, index) => (
              <div key={index} className="flex items-start gap-1">
                <span className="text-zinc-600 select-none">{index}:</span>
                <div className="flex-1">{renderValue(item, depth + 1)}</div>
              </div>
            ))}
          </div>
          <span className="text-zinc-500 font-bold">]</span>
        </div>
      )
    }

    if (typeof val === 'object') {
      const keys = Object.keys(val)
      if (keys.length === 0) return <span className="text-zinc-400 font-mono">{'{ }'}</span>
      return (
        <div className="font-mono text-[11px]">
          <span className="text-zinc-500 font-bold">{'{'}</span>
          <div className="pl-4 border-l border-zinc-800 my-1 space-y-1">
            {keys.map((key) => (
              <div key={key} className="flex items-start gap-1">
                <span className="text-violet-400 whitespace-nowrap">"{key}":</span>
                <div className="flex-1">{renderValue(val[key], depth + 1)}</div>
              </div>
            ))}
          </div>
          <span className="text-zinc-500 font-bold">{'}'}</span>
        </div>
      )
    }

    return <span className="text-zinc-300 font-mono">{String(val)}</span>
  }

  // Check if we can display it as a table
  const isTabular = useMemo(() => {
    if (Array.isArray(parsedValue) && parsedValue.length > 0 && typeof parsedValue[0] === 'object' && parsedValue[0] !== null) {
      return true
    }
    if (typeof parsedValue === 'object' && parsedValue !== null && !Array.isArray(parsedValue)) {
      return true
    }
    return false
  }, [parsedValue])

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 440, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="h-full border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 overflow-y-auto overflow-x-hidden shrink-0 flex flex-col"
    >
      <div className="p-6 space-y-6 w-[440px] flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="size-4 text-emerald-500" />
            <span className="text-xs font-black text-black dark:text-white uppercase tracking-wider">Constant Details</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
            <X className="size-4" />
          </button>
        </div>

        {/* Identity block */}
        <div className="p-4 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-black dark:text-white font-mono break-all">{constant.name}</p>
            <span className="text-[9px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-2 py-0.5 uppercase">{constant.type}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('explorer')}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-[10px] font-black uppercase tracking-wider border-b-2 transition-all",
              activeTab === 'explorer'
                ? "border-black dark:border-white text-black dark:text-white"
                : "border-transparent text-zinc-400 hover:text-black dark:hover:text-white"
            )}
          >
            <Eye className="size-3" /> Explorer
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-[10px] font-black uppercase tracking-wider border-b-2 transition-all",
              activeTab === 'raw'
                ? "border-black dark:border-white text-black dark:text-white"
                : "border-transparent text-zinc-400 hover:text-black dark:hover:text-white"
            )}
          >
            <Terminal className="size-3" /> Raw JSON
          </button>
          {isTabular && (
            <button
              onClick={() => setActiveTab('table')}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-[10px] font-black uppercase tracking-wider border-b-2 transition-all",
                activeTab === 'table'
                  ? "border-black dark:border-white text-black dark:text-white"
                  : "border-transparent text-zinc-400 hover:text-black dark:hover:text-white"
              )}
            >
              <Table className="size-3" /> Table View
            </button>
          )}
        </div>

        {/* Dynamic content */}
        <div className="flex-1 flex flex-col min-h-0">
          {activeTab === 'explorer' && (
            <div className="space-y-3 flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Value Explorer</h3>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 hover:text-black dark:hover:text-white border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 bg-white dark:bg-black transition-all"
                >
                  {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="flex-1 p-4 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-auto">
                {renderValue(parsedValue)}
              </div>
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="space-y-3 flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Formatted JSON</h3>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 hover:text-black dark:hover:text-white border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 bg-white dark:bg-black transition-all"
                >
                  {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="flex-1 p-4 bg-black border border-zinc-800 font-mono text-[11px] text-zinc-300 overflow-auto select-all whitespace-pre-wrap leading-relaxed">
                {typeof parsedValue === 'object' ? JSON.stringify(parsedValue, null, 2) : String(parsedValue)}
              </pre>
            </div>
          )}

          {activeTab === 'table' && isTabular && (
            <div className="space-y-3 flex-1 flex flex-col min-h-0">
              <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Tabular View</h3>
              <div className="flex-1 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black overflow-auto">
                {Array.isArray(parsedValue) ? (
                  <table className="w-full text-left border-collapse text-[10px] font-mono">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                        <th className="p-2 border-r border-zinc-200 dark:border-zinc-800 font-bold">Index</th>
                        {Object.keys(parsedValue[0] || {}).map(k => (
                          <th key={k} className="p-2 border-r border-zinc-200 dark:border-zinc-800 font-bold">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedValue.map((row, idx) => (
                        <tr key={idx} className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                          <td className="p-2 border-r border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold">{idx}</td>
                          {Object.keys(parsedValue[0] || {}).map(k => {
                            const val = row[k]
                            return (
                              <td key={k} className="p-2 border-r border-zinc-200 dark:border-zinc-800 max-w-[150px] truncate">
                                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-left border-collapse text-[10px] font-mono">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                        <th className="p-2 border-r border-zinc-200 dark:border-zinc-800 font-bold">Key</th>
                        <th className="p-2 font-bold">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(parsedValue || {}).map(([key, val]) => (
                        <tr key={key} className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                          <td className="p-2 border-r border-zinc-200 dark:border-zinc-800 font-bold text-violet-400">"{key}"</td>
                          <td className="p-2 max-w-[200px] truncate">
                            {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
