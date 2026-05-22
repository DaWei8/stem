'use client'

import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Hash, Copy, Check, Table, Eye, Terminal, Edit3, Save, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'
import { useLogic } from '@/hooks/useLogic'

interface Props {
  constant: any
  onClose: () => void
}

export function ConstantDrawer({ constant, onClose }: Props) {
  const params = useParams()
  const projectId = params?.id as string
  const { updateConstant } = useLogic()

  const [activeTab, setActiveTab] = useState<'explorer' | 'raw' | 'table'>('explorer')
  const [copied, setCopied] = useState(false)

  // Editing State
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(constant.name)
  const [editValue, setEditValue] = useState(constant.value)
  const [editType, setEditType] = useState(constant.type)

  // Reset editing values when constant changes
  useEffect(() => {
    setEditName(constant.name)
    setEditValue(constant.value)
    setEditType(constant.type)
    setIsEditing(false)
  }, [constant])

  // Robust parser for database-stored values which might have trailing semicolons, double-encoding, or JS object/array literal notation
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
          clean = parsed.trim()
        } else {
          return parsed
        }
      } catch (e) { }
    }

    // 1. Try standard JSON parse
    try {
      return JSON.parse(clean)
    } catch (e) { }

    // 2. Try parsing as JavaScript Object/Array Literal (e.g. unquoted keys, trailing commas)
    try {
      if ((clean.startsWith('{') && clean.endsWith('}')) || (clean.startsWith('[') && clean.endsWith(']'))) {
        const parsed = new Function(`return (${clean})`)()
        if (parsed && typeof parsed === 'object') {
          return parsed
        }
      }
    } catch (e) { }

    // 3. Fallback: try converting single quotes to double quotes for basic JSON format conversion
    try {
      const formatted = clean.replace(/'/g, '"')
      return JSON.parse(formatted)
    } catch (e) { }

    return rawVal
  }, [constant.value])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(typeof parsedValue === 'object' ? JSON.stringify(parsedValue, null, 2) : String(parsedValue))
    setCopied(true)
    toast.success('Constant value copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = async () => {
    if (!editName.trim()) {
      toast.error('Constant name is required')
      return
    }

    if (editType === 'json') {
      try {
        JSON.parse(editValue)
      } catch (e) {
        toast.error('Value is not a valid JSON string. Check brackets and quotes.')
        return
      }
    }

    try {
      await updateConstant(projectId, constant.id, editName.trim(), editValue, editType)
      setIsEditing(false)
    } catch (e) {
      console.error(e)
    }
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
            <span className="text-sm font-black text-black dark:text-white">Constant Details</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
            <X className="size-4" />
          </button>
        </div>

        {/* Identity block */}
        <div className="p-4 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3">
          {isEditing ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black  text-zinc-400 dark:text-zinc-500 tracking-wider">Constant Identifier</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono h-9 px-2 text-black dark:text-white rounded-none focus:outline-none focus:border-zinc-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black  text-zinc-400 dark:text-zinc-500 tracking-wider">Type Specifier</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white h-9 px-2 rounded-none focus:outline-none focus:border-zinc-400"
                >
                  <option value="string">String (Text)</option>
                  <option value="number">Number (Float/Int)</option>
                  <option value="boolean">Boolean (True/False)</option>
                  <option value="json">JSON (Array/Object/Map)</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm font-black text-black dark:text-white font-mono break-all">{constant.name}</p>
              <span className="text-[9px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-2 py-0.5 ">{constant.type}</span>
            </div>
          )}
        </div>

        {/* Toolbar & Tabs */}
        {!isEditing && (
          <div className="flex border-b border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab('explorer')}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-[10px] font-black  border-b-2 transition-all",
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
                "flex items-center gap-1.5 px-4 py-2 text-[10px] font-black  border-b-2 transition-all",
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
                  "flex items-center gap-1.5 px-4 py-2 text-[10px] font-black  border-b-2 transition-all",
                  activeTab === 'table'
                    ? "border-black dark:border-white text-black dark:text-white"
                    : "border-transparent text-zinc-400 hover:text-black dark:hover:text-white"
                )}
              >
                <Table className="size-3" /> Table View
              </button>
            )}
          </div>
        )}

        {/* Dynamic content */}
        <div className="flex-1 flex flex-col min-h-0">
          {isEditing ? (
            <div className="space-y-3 flex-1 flex flex-col min-h-0">
              <label className="text-[9px] font-black  text-zinc-400 dark:text-zinc-500 tracking-wider">Payload Editor</label>
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={15}
                className="flex-1 p-4 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 font-mono text-[11px] text-black dark:text-zinc-300 rounded-none focus:outline-none focus:border-zinc-400 resize-none overflow-auto whitespace-pre leading-relaxed shadow-inner"
                placeholder={editType === 'json' ? 'e.g. { "name": "Stem" }' : 'Enter constant value...'}
              />
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-black dark:bg-white text-white dark:text-black h-10 text-[10px] font-black  transition-all"
                >
                  <Save className="size-3.5" /> Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 flex items-center justify-center gap-1.5 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white h-10 text-[10px] font-black  transition-all bg-white dark:bg-black"
                >
                  <RotateCcw className="size-3.5" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'explorer' && (
                <div className="space-y-3 flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500  tracking-widest">Value Explorer</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 hover:text-black dark:hover:text-white border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 bg-white dark:bg-black transition-all"
                      >
                        <Edit3 className="size-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 hover:text-black dark:hover:text-white border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 bg-white dark:bg-black transition-all"
                      >
                        {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 p-4 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-auto">
                    {renderValue(parsedValue)}
                  </div>
                </div>
              )}

              {activeTab === 'raw' && (
                <div className="space-y-3 flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500  tracking-widest">Formatted JSON</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 hover:text-black dark:hover:text-white border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 bg-white dark:bg-black transition-all"
                      >
                        <Edit3 className="size-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 hover:text-black dark:hover:text-white border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 bg-white dark:bg-black transition-all"
                      >
                        {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                  <pre className="flex-1 p-4 bg-black border border-zinc-800 font-mono text-[11px] text-zinc-300 overflow-auto select-all whitespace-pre-wrap leading-relaxed">
                    {typeof parsedValue === 'object' ? JSON.stringify(parsedValue, null, 2) : String(parsedValue)}
                  </pre>
                </div>
              )}

              {activeTab === 'table' && isTabular && (
                <div className="space-y-3 flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500  tracking-widest">Tabular View</h3>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 hover:text-black dark:hover:text-white border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 bg-white dark:bg-black transition-all"
                    >
                      <Edit3 className="size-3" />
                      <span>Edit</span>
                    </button>
                  </div>
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
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
