'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Code2, Save, RotateCcw, ShieldAlert, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'
import { useLogic } from '@/hooks/useLogic'
import { validateLogicInput } from '@/lib/security'

interface Props {
  func: any
  onClose: () => void
}

export function FunctionDrawer({ func, onClose }: Props) {
  const params = useParams()
  const projectId = params?.id as string
  const { updateFunction } = useLogic()

  // State
  const [name, setName] = useState(func.name || '')
  const [description, setDescription] = useState(func.description || '')
  const [returnType, setReturnType] = useState(func.return_type || 'void')
  const [parameters, setParameters] = useState<any[]>(func.parameters || [])
  const [implementationCode, setImplementationCode] = useState(func.implementation_code || '')

  useEffect(() => {
    setName(func.name || '')
    setDescription(func.description || '')
    setReturnType(func.return_type || 'void')
    setParameters(func.parameters || [])
    setImplementationCode(func.implementation_code || '')
  }, [func])

  // Parameter Add/Remove
  const handleAddParam = () => {
    setParameters([...parameters, { name: '', type: 'string' }])
  }

  const handleRemoveParam = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index))
  }

  const handleParamChange = (index: number, field: 'name' | 'type', val: string) => {
    const updated = [...parameters]
    updated[index] = { ...updated[index], [field]: val }
    setParameters(updated)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Function name is required')
      return
    }

    // Safety checks
    const fieldsToValidate = [
      { label: 'Function Name', value: name },
      { label: 'Description', value: description },
      { label: 'Expected Return Type', value: returnType },
      { label: 'Pseudo-code', value: implementationCode },
      ...parameters.map((p, idx) => ({ label: `Parameter ${idx + 1} Name`, value: p.name })),
    ]

    for (const field of fieldsToValidate) {
      const validation = validateLogicInput(field.value)
      if (!validation.isValid) {
        toast.error(`Security Block: Malicious code detected in ${field.label}. Reason: ${validation.reason}`)
        return
      }
    }

    try {
      await updateFunction(
        projectId,
        func.id,
        name.trim(),
        description.trim() || null,
        parameters,
        returnType,
        implementationCode.trim() || null,
        'pseudo-code'
      )
      onClose()
    } catch (e: any) {
      console.error(e)
    }
  }

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
            <Code2 className="size-4 text-purple-500" />
            <span className="text-sm font-black text-black dark:text-white">Cloud Function Details</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
            <X className="size-4" />
          </button>
        </div>

        {/* Safety Shield Header */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-none flex items-start gap-3">
          <ShieldAlert className="size-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-wide">Injection Shield Active</p>
            <p className="text-[9px] text-zinc-500 leading-normal mt-0.5">Input containing HTML script tags, direct eval constructs, process/child_process, or suspicious system execution statements will be blocked automatically.</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="space-y-4 flex-1">
          {/* Function Name */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 tracking-wider uppercase">Function Identifier</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs font-mono h-9 px-2.5 text-black dark:text-white rounded-none focus:outline-none focus:border-zinc-400"
              placeholder="e.g. calculateOrderTotal"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 tracking-wider uppercase">Description (Function Purpose)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs p-2.5 text-black dark:text-white rounded-none focus:outline-none focus:border-zinc-400 resize-none"
              placeholder="Describe what the function does, its logic goals, etc."
            />
          </div>

          {/* Return Type */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 tracking-wider uppercase">Expected Output (Return Type)</label>
            <select
              value={returnType}
              onChange={(e) => setReturnType(e.target.value)}
              className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white h-9 px-2 rounded-none focus:outline-none focus:border-zinc-400"
            >
              <option value="void">void (no output)</option>
              <option value="string">string (text)</option>
              <option value="number">number</option>
              <option value="boolean">boolean</option>
              <option value="object">object</option>
              <option value="array">array</option>
            </select>
          </div>

          {/* Parameters */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 tracking-wider uppercase">Inputs Required (Parameters)</label>
              <button
                type="button"
                onClick={handleAddParam}
                className="flex items-center gap-1 text-[8px] font-bold text-zinc-500 hover:text-black dark:hover:text-white border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 bg-white dark:bg-black uppercase tracking-wider transition-all"
              >
                <Plus className="size-2.5" /> Add Input
              </button>
            </div>
            {parameters.length === 0 ? (
              <div className="p-3 border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-[9px] text-zinc-400 uppercase font-mono">
                No parameters defined.
              </div>
            ) : (
              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {parameters.map((param, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={param.name}
                      onChange={(e) => handleParamChange(index, 'name', e.target.value)}
                      placeholder="Param name (e.g. userId)"
                      className="flex-1 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs font-mono h-8 px-2 text-black dark:text-white rounded-none focus:outline-none focus:border-zinc-400"
                    />
                    <select
                      value={param.type}
                      onChange={(e) => handleParamChange(index, 'type', e.target.value)}
                      className="w-24 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs h-8 px-1 text-black dark:text-white rounded-none focus:outline-none"
                    >
                      <option value="string">string</option>
                      <option value="number">number</option>
                      <option value="boolean">boolean</option>
                      <option value="object">object</option>
                      <option value="array">array</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveParam(index)}
                      className="size-8 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 hover:border-red-500/50 hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pseudo-code block */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 tracking-wider uppercase">Pseudo-code Logic Block</label>
            <textarea
              value={implementationCode}
              onChange={(e) => setImplementationCode(e.target.value)}
              rows={6}
              className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 font-mono text-[11px] p-3 text-black dark:text-zinc-300 rounded-none focus:outline-none focus:border-zinc-400 resize-none"
              placeholder={`// Write pseudo-code logic\nif (order.total > 100) {\n  applyDiscount(order, 10);\n}`}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-850">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-1.5 bg-black dark:bg-white text-white dark:text-black h-10 text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <Save className="size-3.5" /> Save Changes
          </button>
          <button
            onClick={onClose}
            className="px-4 flex items-center justify-center gap-1.5 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white h-10 text-[10px] font-black uppercase tracking-widest transition-all bg-white dark:bg-black"
          >
            <RotateCcw className="size-3.5" /> Cancel
          </button>
        </div>
      </div>
    </motion.div>
  )
}
