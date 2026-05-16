'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useLogicBot } from '@/hooks/useLogicBot'
import { cn } from '@/lib/utils'
import { Cpu, X, Play, RotateCcw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface MockVar {
  name: string
  value: string | boolean | number
  type: 'string' | 'boolean' | 'number'
}

interface Props {
  policy: any
  variables: any[]
  onClose: () => void
}

export function PolicySandbox({ policy, variables, onClose }: Props) {
  const { isLoaded, createEngine, evaluateExpression } = useLogicBot()

  // Build initial mock session vars from detected variables in the expression
  const buildInitialVars = useCallback((): MockVar[] => {
    const detected = variables.filter(v =>
      policy.policy_logic?.includes(v.name) ||
      policy.policy_logic?.includes(v.label)
    )
    return detected.map(v => ({
      name: v.name || v.label,
      value: v.default_value ?? (v.type === 'boolean' ? false : v.type === 'number' ? 0 : ''),
      type: (['boolean', 'number', 'string'].includes(v.type) ? v.type : 'string') as 'string' | 'boolean' | 'number'
    })).concat([
      { name: 'auth.uid()', value: 'user_abc123', type: 'string' },
      { name: 'is_verified', value: true, type: 'boolean' },
      { name: 'role', value: 'authenticated', type: 'string' },
    ])
  }, [policy.policy_logic, variables])

  const [mockVars, setMockVars] = useState<MockVar[]>(buildInitialVars)
  const [result, setResult] = useState<boolean | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const handleRun = async () => {
    if (!isLoaded) {
      toast.error('Logic Engine not loaded. Check WASM module.')
      return
    }
    setIsRunning(true)
    try {
      const initialState = Object.fromEntries(mockVars.map(v => [v.name, v.value]))
      const engine = createEngine(initialState)
      if (!engine) throw new Error('Engine creation failed')
      const evalResult = evaluateExpression(policy.policy_logic)
      setResult(Boolean(evalResult))
    } catch (err: any) {
      // Graceful fallback: run a basic JS eval for demo mode when WASM unavailable
      try {
        const ctx = Object.fromEntries(mockVars.map(v => [v.name.replace(/[().]/g, '_'), v.value]))
        const sanitized = policy.policy_logic
          .replace(/auth\.uid\(\)/g, 'auth_uid__')
          .replace(/true/g, 'true')
          .replace(/false/g, 'false')
        // eslint-disable-next-line no-new-func
        const fn = new Function(...Object.keys(ctx), `return ${sanitized}`)
        const r = fn(...Object.values(ctx))
        setResult(Boolean(r))
      } catch {
        setResult(false)
        toast.error(`Evaluation failed: ${err.message}`)
      }
    } finally {
      setIsRunning(false)
    }
  }

  const updateVar = (i: number, value: string | boolean | number) => {
    setMockVars(prev => prev.map((v, idx) => idx === i ? { ...v, value } : v))
    setResult(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden border border-violet-500/30 bg-zinc-950"
    >
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="size-4 text-violet-400" />
            <span className="text-xs font-black text-violet-400 ">Policy Sandbox</span>
            <span className="text-[10px] font-mono text-zinc-500 ml-2">{policy.name}</span>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors">
            <X className="size-4" />
          </button>
        </div>

        {/* Expression */}
        <div className="p-3 bg-black border border-zinc-800 font-mono text-sm text-emerald-400">
          <span className="text-zinc-600 text-xs mr-2">USING</span>
          {policy.policy_logic}
        </div>

        {/* Mock Variables */}
        <div className="space-y-2">
          <p className="text-[9px] font-black text-zinc-500 ">Mock Session Variables</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {mockVars.map((v, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-black border border-zinc-800">
                <span className="text-[10px] font-mono text-violet-400 flex-1 truncate">{v.name}</span>
                {v.type === 'boolean' ? (
                  <button
                    onClick={() => updateVar(i, !v.value)}
                    className={cn(
                      'text-[9px] font-black  px-2 py-0.5 border transition-all',
                      v.value
                        ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                        : 'border-red-500/40 text-red-400 bg-red-500/10'
                    )}
                  >
                    {String(v.value)}
                  </button>
                ) : (
                  <input
                    value={String(v.value)}
                    onChange={e => updateVar(i, v.type === 'number' ? Number(e.target.value) : e.target.value)}
                    className="w-24 bg-zinc-900 border border-zinc-700 text-[10px] font-mono text-white px-2 py-1 focus:outline-none focus:border-violet-500"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Result */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRun}
            disabled={isRunning}
            className="rounded-none bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold gap-2 h-9"
          >
            <Play className="size-3" />
            {isRunning ? 'Evaluating...' : 'Evaluate Policy'}
          </Button>
          {result !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                'flex items-center gap-2 px-4 py-2 border text-sm font-black',
                result
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : 'border-red-500/40 bg-red-500/10 text-red-400'
              )}
            >
              {result
                ? <><CheckCircle2 className="size-4" /> ALLOWED</>
                : <><XCircle className="size-4" /> DENIED</>
              }
            </motion.div>
          )}
          {!isLoaded && (
            <div className="flex items-center gap-1.5 text-amber-400">
              <AlertTriangle className="size-3.5" />
              <span className="text-[10px] font-bold">WASM not loaded — JS fallback active</span>
            </div>
          )}
          <button onClick={() => { setMockVars(buildInitialVars()); setResult(null) }} className="ml-auto text-zinc-500 hover:text-white transition-colors" title="Reset">
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
