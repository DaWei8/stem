'use client'

import { Button } from '@/components/ui/button'
import { useLogicBot } from '@/hooks/useLogicBot'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { CheckCircle2, Cpu, Database, Play, RotateCcw, X, XCircle } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

interface MockVar {
  name: string
  value: string | boolean | number
  type: 'string' | 'boolean' | 'number'
  category: 'system' | 'field' | 'subquery' | 'function'
}

interface Props {
  policy: any
  variables: any[]
  onClose: () => void
}

export function PolicySandbox({ policy, variables, onClose }: Props) {
  const { isLoaded, createEngine, evaluateExpression } = useLogicBot()

  // Build initial mock session vars from detected variables, fields, subqueries, and functions in the expression
  const buildInitialVars = useCallback((): MockVar[] => {
    const detected: MockVar[] = []
    const logic = policy.policy_logic || ''

    // 1. Detect standard variables from the logic
    variables.forEach(v => {
      const name = v.name || v.label
      if (logic.includes(name)) {
        detected.push({
          name,
          value: v.default_value ?? (v.type === 'boolean' ? false : v.type === 'number' ? 0 : ''),
          type: (['boolean', 'number', 'string'].includes(v.type) ? v.type : 'string') as 'string' | 'boolean' | 'number',
          category: 'field'
        })
      }
    })

    // 2. Detect common fields comparing in the policy (e.g. user_id, retailer_id)
    const fieldRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:=|!=|<|>|<=|>=|IN\b)/g
    let match
    const seenFields = new Set<string>()
    while ((match = fieldRegex.exec(logic)) !== null) {
      const fieldName = match[1]
      const lower = fieldName.toLowerCase()
      if (
        !seenFields.has(fieldName) &&
        !['select', 'insert', 'update', 'delete', 'where', 'and', 'or', 'in', 'not', 'null', 'true', 'false', 'auth', 'current_user_id'].includes(lower)
      ) {
        seenFields.add(fieldName)
        if (!detected.some(d => d.name === fieldName)) {
          detected.push({
            name: fieldName,
            value: fieldName.endsWith('_id') ? 'user_abc123' : 'value_123',
            type: 'string',
            category: 'field'
          })
        }
      }
    }

    // 3. Extract SQL subqueries starting with (SELECT ...)
    const subqueryRegex = /\(\s*SELECT\s+.*?\)/gi
    const subqueries = logic.match(subqueryRegex) || []
    subqueries.forEach((sq: string) => {
      const trimmed = sq.trim()
      if (!detected.some(d => d.name === trimmed)) {
        detected.push({
          name: trimmed,
          value: 'user_abc123',
          type: 'string',
          category: 'subquery'
        })
      }
    })

    // 4. Extract common postgres functions
    const funcRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*\(\))/g
    while ((match = funcRegex.exec(logic)) !== null) {
      const funcName = match[1]
      const lower = funcName.toLowerCase()
      if (lower !== 'auth.uid()' && lower !== 'uid()' && !detected.some(d => d.name === funcName)) {
        detected.push({
          name: funcName,
          value: 'user_abc123',
          type: 'string',
          category: 'function'
        })
      }
    }

    // 5. Add standard system context variables
    const defaults: Omit<MockVar, 'category'>[] = [
      { name: 'auth.uid()', value: 'user_abc123', type: 'string' },
      { name: 'current_user_id()', value: 'user_abc123', type: 'string' },
      { name: 'is_verified', value: true, type: 'boolean' },
      { name: 'role', value: 'authenticated', type: 'string' },
    ]

    defaults.forEach(def => {
      if (!detected.some(d => d.name === def.name)) {
        detected.push({
          ...def,
          category: 'system'
        })
      }
    })

    return detected
  }, [policy.policy_logic, variables])

  const [mockVars, setMockVars] = useState<MockVar[]>(buildInitialVars)
  const [result, setResult] = useState<boolean | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [evaluatedExpressionText, setEvaluatedExpressionText] = useState<string | null>(null)

  // Group variables for a much cleaner layout
  const groupedVars = useMemo(() => {
    return {
      system: mockVars.filter(v => v.category === 'system'),
      field: mockVars.filter(v => v.category === 'field'),
      subquery: mockVars.filter(v => v.category === 'subquery'),
      function: mockVars.filter(v => v.category === 'function'),
    }
  }, [mockVars])

  const handleRun = async () => {
    setIsRunning(true)
    let evaluatedExpr = policy.policy_logic || 'true'

    // Sort mockVars by name length descending to prevent partial replacements
    const sortedVars = [...mockVars].sort((a, b) => b.name.length - a.name.length)

    // Substitute subqueries and functions with mock values
    const context: Record<string, any> = {}
    sortedVars.forEach(v => {
      const isSubquery = v.category === 'subquery'
      const isFunction = v.category === 'function' || v.name.endsWith('()')

      if (isSubquery || isFunction) {
        const escapedName = v.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
        const regex = new RegExp(escapedName, 'gi')
        const formattedValue = typeof v.value === 'string' ? `'${v.value}'` : String(v.value)
        evaluatedExpr = evaluatedExpr.replace(regex, formattedValue)
      } else {
        context[v.name] = v.value
      }
    })

    setEvaluatedExpressionText(evaluatedExpr)

    try {
      // 1. Try evaluating using the WASM logic engine if loaded
      if (isLoaded) {
        const engine = createEngine(context)
        if (engine) {
          const evalResult = engine.evaluate(evaluatedExpr)
          setResult(Boolean(evalResult))
          setIsRunning(false)
          return
        }
      }
      throw new Error('Fallback to JS evaluator')
    } catch {
      // 2. Perform intelligent SQL-to-JS translation fallback
      try {
        let jsExpr = evaluatedExpr
          .replace(/<>/g, '!=')
          .replace(/(?<![<>!=])=(?!=)/g, '==')
          .replace(/\band\b/gi, '&&')
          .replace(/\bor\b/gi, '||')
          .replace(/\bis\s+null\b/gi, '== null')
          .replace(/\bis\s+not\s+null\b/gi, '!= null')
          .replace(/\bnull\b/gi, 'null')

        const finalContext: Record<string, any> = {}
        Object.entries(context).forEach(([k, v]) => {
          const safeKey = k.replace(/[().]/g, '_')
          finalContext[safeKey] = v
          const escapedKey = k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
          const regex = new RegExp(`\\b${escapedKey}\\b`, 'g')
          jsExpr = jsExpr.replace(regex, safeKey)
        })

        // eslint-disable-next-line no-new-func
        const fn = new Function(...Object.keys(finalContext), `return (${jsExpr})`)
        const r = fn(...Object.values(finalContext))
        setResult(Boolean(r))
      } catch (err: any) {
        setResult(false)
        toast.error(`Evaluation failed: ${err.message}`)
      } finally {
        setIsRunning(false)
      }
    }
  }

  const updateVar = (name: string, value: string | boolean | number) => {
    setMockVars(prev => prev.map(v => v.name === name ? { ...v, value } : v))
    setResult(null)
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
            <Cpu className="size-4 text-violet-500" />
            <span className="text-sm font-black text-black dark:text-white">Policy Sandbox</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-4 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-2 rounded-lg">
          <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 tracking-wider">Rule Context</span>
          <p className="text-xs font-mono font-bold text-black dark:text-white break-all">{policy.name}</p>
        </div>

        {/* SQL Logic Display */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">SQL Rule Expression</span>
          <div className="p-3 bg-black border border-zinc-900 font-mono text-xs text-emerald-400 select-all overflow-x-auto custom-scrollbar whitespace-pre-wrap leading-relaxed">
            <span className="text-zinc-650 font-bold select-none mr-2">USING</span>
            {policy.policy_logic}
          </div>
        </div>

        {/* Mocking Panel */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Mock Sandbox Environment</span>
            {groupedVars.subquery.length > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-md text-[9px] font-bold">
                <Database className="size-3 shrink-0" />
                <span>SQL subqueries detected. Mock values below.</span>
              </span>
            )}
          </div>

          <div className="flex flex-col gap-6">
            {/* Context & Fields */}
            {groupedVars.system.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">System Context</h4>
                <div className="grid grid-cols-1 gap-2">
                  {groupedVars.system.map(v => (
                    <div key={v.name} className="flex items-center justify-between p-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs rounded-md">
                      <span className="font-mono text-[10px] text-zinc-550 dark:text-zinc-400">{v.name}</span>
                      {v.type === 'boolean' ? (
                        <button
                          onClick={() => updateVar(v.name, !v.value)}
                          className={cn(
                            'text-[9px] font-black px-2.5 py-1 border transition-all uppercase tracking-wider rounded-md',
                            v.value
                              ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'
                              : 'border-red-500/30 text-red-400 bg-red-500/5'
                          )}
                        >
                          {String(v.value)}
                        </button>
                      ) : (
                        <input
                          value={String(v.value)}
                          onChange={e => updateVar(v.name, e.target.value)}
                          className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-black dark:text-white px-2 py-1 focus:outline-none focus:border-zinc-400 rounded-md w-32"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {groupedVars.field.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Entity Fields</h4>
                <div className="grid grid-cols-1 gap-2">
                  {groupedVars.field.map(v => (
                    <div key={v.name} className="flex items-center justify-between p-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs rounded-md">
                      <span className="font-mono text-[10px] text-violet-500 dark:text-violet-400">{v.name}</span>
                      <input
                        value={String(v.value)}
                        onChange={e => updateVar(v.name, e.target.value)}
                        className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-black dark:text-white px-2 py-1 focus:outline-none focus:border-zinc-400 rounded-md w-32"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SQL Subqueries */}
            {groupedVars.subquery.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">SQL Subqueries Mock Results</h4>
                <div className="grid grid-cols-1 gap-2">
                  {groupedVars.subquery.map((v, i) => (
                    <div key={i} className="flex flex-col p-2.5 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 gap-2 rounded-md">
                      <span className="font-mono text-[9px] text-amber-500/80 truncate" title={v.name}>{v.name}</span>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[9px] text-zinc-500">Evaluates To:</span>
                        <input
                          value={String(v.value)}
                          onChange={e => updateVar(v.name, e.target.value)}
                          className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-black dark:text-white px-2 py-1 focus:outline-none focus:border-zinc-400 rounded-md flex-1 max-w-[180px]"
                          placeholder="e.g. user_abc123"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {groupedVars.function.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Database Functions</h4>
                <div className="grid grid-cols-1 gap-2">
                  {groupedVars.function.map(v => (
                    <div key={v.name} className="flex items-center justify-between p-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs rounded-md">
                      <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400">{v.name}</span>
                      <input
                        value={String(v.value)}
                        onChange={e => updateVar(v.name, e.target.value)}
                        className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-black dark:text-white px-2 py-1 focus:outline-none focus:border-zinc-400 rounded-md w-32"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Evaluated Substitute Expression preview */}
        {evaluatedExpressionText && evaluatedExpressionText !== policy.policy_logic && (
          <div className="space-y-1.5 bg-zinc-900/40 p-3 border border-zinc-200 dark:border-zinc-900 rounded-md">
            <span className="text-[9px] font-black text-zinc-550 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <span>Rule Sandbox Preview</span>
            </span>
            <p className="font-mono text-[10px] text-zinc-650 dark:text-zinc-400 break-all leading-relaxed">
              {evaluatedExpressionText}
            </p>
          </div>
        )}

        {/* Run & Results Panel */}
        <div className="flex flex-col gap-3 border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-auto">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleRun}
              disabled={isRunning}
              className="rounded-md bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold gap-2 h-9 px-5 transition-all cursor-pointer"
            >
              <Play className="size-3" />
              {isRunning ? 'Evaluating...' : 'Evaluate Policy'}
            </Button>

            <button
              onClick={() => { setMockVars(buildInitialVars()); setResult(null); setEvaluatedExpressionText(null) }}
              className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
              title="Reset mockup settings"
            >
              <RotateCcw className="size-3.5" />
            </button>
          </div>

          {result !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                'flex items-center justify-center gap-2 px-4 h-9 border text-[10px] font-black uppercase tracking-wider rounded-md',
                result
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border-red-500/30 bg-red-500/10 text-red-400'
              )}
            >
              {result
                ? <><CheckCircle2 className="size-3.5" /> Rule Allowed (Access Granted)</>
                : <><XCircle className="size-3.5" /> Rule Denied (Access Blocked)</>
              }
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
