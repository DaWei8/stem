'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { X, Hash } from 'lucide-react'

interface Props {
  constant: any
  onClose: () => void
}

export function ConstantDrawer({ constant, onClose }: Props) {
  const parsedValue = useMemo(() => {
    try {
      // Try to parse if it's a JSON string
      if (typeof constant.value === 'string') {
        const parsed = JSON.parse(constant.value)
        return parsed
      }
      return constant.value
    } catch (e) {
      return constant.value
    }
  }, [constant.value])

  const renderValue = (val: any, depth = 0): React.ReactNode => {
    if (val === null) return <span className="text-zinc-500 font-mono">null</span>
    if (val === undefined) return <span className="text-zinc-500 font-mono">undefined</span>

    if (typeof val === 'boolean') {
      return <span className="text-emerald-400 font-mono">{val ? 'true' : 'false'}</span>
    }

    if (typeof val === 'number') {
      return <span className="text-blue-400 font-mono">{val}</span>
    }

    if (typeof val === 'string') {
      return <span className="text-amber-400 font-mono break-all">"{val}"</span>
    }

    if (Array.isArray(val)) {
      if (val.length === 0) return <span className="text-zinc-400 font-mono">[]</span>
      return (
        <div className="font-mono text-xs">
          <span className="text-zinc-400">[</span>
          <div className="pl-4 border-l border-zinc-200/20 dark:border-zinc-800 my-1 space-y-1">
            {val.map((item, index) => (
              <div key={index} className="flex">
                <span className="text-zinc-500 mr-2 select-none">{index}:</span>
                <div className="flex-1">{renderValue(item, depth + 1)}</div>
              </div>
            ))}
          </div>
          <span className="text-zinc-400">]</span>
        </div>
      )
    }

    if (typeof val === 'object') {
      const keys = Object.keys(val)
      if (keys.length === 0) return <span className="text-zinc-400 font-mono">{'{ }'}</span>
      return (
        <div className="font-mono text-xs">
          <span className="text-zinc-400">{'{'}</span>
          <div className="pl-4 border-l border-zinc-200/20 dark:border-zinc-800 my-1 space-y-1">
            {keys.map((key) => (
              <div key={key} className="flex">
                <span className="text-violet-400 mr-2 whitespace-nowrap">"{key}":</span>
                <div className="flex-1">{renderValue(val[key], depth + 1)}</div>
              </div>
            ))}
          </div>
          <span className="text-zinc-400">{'}'}</span>
        </div>
      )
    }

    return <span className="text-zinc-300 font-mono">{String(val)}</span>
  }

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 400, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="h-full border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 overflow-y-auto overflow-x-hidden shrink-0"
    >
      <div className="p-5 space-y-6 w-[400px]">
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

        {/* Identity */}
        <div className="p-4 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800">
          <p className="text-sm font-black text-black dark:text-white font-mono lowercase">{constant.name}</p>
        </div>

        {/* Parsed Value */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Value Explorer</h3>
          <div className="p-4 bg-black border border-zinc-800 rounded-none overflow-x-auto text-white">
            {renderValue(parsedValue)}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
