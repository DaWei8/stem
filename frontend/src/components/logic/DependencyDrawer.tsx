'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Package, Save, RotateCcw, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'
import { useLogic } from '@/hooks/useLogic'
import { validateLogicInput } from '@/lib/security'

interface Props {
  dependency: any
  onClose: () => void
}

export function DependencyDrawer({ dependency, onClose }: Props) {
  const params = useParams()
  const projectId = params?.id as string
  const { updateDependency } = useLogic()

  // State
  const [name, setName] = useState(dependency.name || '')
  const [version, setVersion] = useState(dependency.version || '')
  const [type, setType] = useState(dependency.type || 'npm')

  useEffect(() => {
    setName(dependency.name || '')
    setVersion(dependency.version || '')
    setType(dependency.type || 'npm')
  }, [dependency])

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Dependency name is required')
      return
    }

    if (!version.trim()) {
      toast.error('Version is required')
      return
    }

    // Safety checks
    const fieldsToValidate = [
      { label: 'Dependency Name', value: name },
      { label: 'Version', value: version },
      { label: 'Registry Type', value: type }
    ]

    for (const field of fieldsToValidate) {
      const validation = validateLogicInput(field.value)
      if (!validation.isValid) {
        toast.error(`Security Block: Malicious code detected in ${field.label}. Reason: ${validation.reason}`)
        return
      }
    }

    try {
      await updateDependency(
        projectId,
        dependency.id,
        name.trim(),
        version.trim(),
        type
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
            <Package className="size-4 text-emerald-500" />
            <span className="text-sm font-black text-black dark:text-white">Dependency Details</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
            <X className="size-4" />
          </button>
        </div>

        {/* Safety Warning */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-md flex items-start gap-3">
          <ShieldAlert className="size-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-wide">Review & Safety Active</p>
            <p className="text-[9px] text-zinc-500 leading-normal mt-0.5">Please review details before saving. Duplicate dependencies are prohibited in the same project. Name and version fields are sanitized.</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4 flex-1">
          {/* Dependency Name */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 tracking-wider uppercase">Dependency Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs font-mono h-12 px-2.5 text-black dark:text-white rounded-md focus:outline-none focus:border-zinc-400"
              placeholder="e.g. jsonwebtoken"
            />
          </div>

          {/* Version */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 tracking-wider uppercase">Version Specifier</label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs font-mono h-12 px-2.5 text-black dark:text-white rounded-md focus:outline-none focus:border-zinc-400"
              placeholder="e.g. ^9.0.0 or latest"
            />
          </div>

          {/* Registry Type */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 tracking-wider uppercase">Registry Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white h-12 px-2 rounded-md focus:outline-none focus:border-zinc-400"
            >
              <option value="npm">npm (Node.js)</option>
              <option value="pip">pip (Python)</option>
              <option value="cargo">cargo (Rust)</option>
              <option value="maven">maven (Java)</option>
              <option value="nuget">nuget (.NET)</option>
              <option value="go_module">go_module (Go)</option>
              <option value="api">api (External API)</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-850">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-1.5 bg-black dark:bg-white text-white dark:text-black h-10 text-[10px] font-black uppercase tracking-widest transition-all rounded-md"
          >
            <Save className="size-3.5" /> Save Changes
          </button>
          <button
            onClick={onClose}
            className="px-4 flex items-center justify-center gap-1.5 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white h-10 text-[10px] font-black uppercase tracking-widest transition-all bg-white dark:bg-black rounded-md"
          >
            <RotateCcw className="size-3.5" /> Cancel
          </button>
        </div>
      </div>
    </motion.div>
  )
}
