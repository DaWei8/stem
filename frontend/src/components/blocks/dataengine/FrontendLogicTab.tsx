'use client'

import { useMemo } from 'react'
import { Screen, ScreenInput, ScreenAction, ScreenOutput, Variable } from '@/types'
import { Monitor, Fingerprint, Database, Zap, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  pages: Screen[]
  inputs: ScreenInput[]
  outputs: ScreenOutput[]
  actions: ScreenAction[]
  variables: Variable[]
  functions: any[]
  searchQuery: string
}

export function FrontendLogicTab({
  pages,
  inputs,
  outputs,
  actions,
  variables,
  functions,
  searchQuery,
}: Props) {
  const filteredPages = useMemo(() => {
    return pages.filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase())
      if (matchesSearch) return true

      const pageInputs = inputs.filter((i) => i.page_id === p.id)
      const pageOutputs = outputs.filter((o) => o.page_id === p.id)
      const pageActions = actions.filter((a) => a.page_id === p.id)

      return (
        pageInputs.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        pageOutputs.some((o) => o.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        pageActions.some((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    })
  }, [pages, inputs, outputs, actions, searchQuery])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h3 className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            Screen-Bound Logic Registry
          </h3>
          <p className="text-[10px] text-zinc-400 mt-1">
            Visualizing client-side events, local mutations, and form fields mapped to backend data structures.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredPages.map((page) => {
          const pageInputs = inputs.filter((i) => i.page_id === page.id)
          const pageOutputs = outputs.filter((o) => o.page_id === page.id)
          const pageActions = actions.filter((a) => a.page_id === page.id)

          return (
            <div
              key={page.id}
              className="bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-850 p-6 space-y-6 transition-all hover:border-zinc-300 dark:hover:border-zinc-800"
            >
              {/* Screen Header */}
              <div className="flex items-center gap-3">
                <div className="size-8 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                  <Monitor className="size-4 text-zinc-500" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-black dark:text-white uppercase tracking-wider">
                    {page.title}
                  </h4>
                  <span className="text-[9px] font-mono text-zinc-400">
                    {page.folder ? `Flow: ${page.folder}` : 'Global Flow'}
                  </span>
                </div>
              </div>

              {/* Grid of Screen Context Elements */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Inputs */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-wider">
                    <Fingerprint className="size-3.5" /> Inputs ({pageInputs.length})
                  </div>
                  <div className="space-y-1.5">
                    {pageInputs.map((i) => {
                      const variable = variables.find((v) => v.id === i.variable_id)
                      return (
                        <div
                          key={i.id}
                          className="p-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 text-[10px]"
                        >
                          <p className="font-mono font-bold text-black dark:text-zinc-200 truncate">{i.name}</p>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border border-zinc-250 dark:border-zinc-800 font-medium text-[8px]">
                              {i.input_type}
                            </span>
                            <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold text-[8px] truncate max-w-full">
                              {variable ? `Registry: ${variable.label}` : 'Transient'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                    {pageInputs.length === 0 && (
                      <p className="text-[9px] text-zinc-400 italic">No page inputs defined</p>
                    )}
                  </div>
                </div>

                {/* Outputs */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-wider">
                    <Database className="size-3.5" /> Mutations ({pageOutputs.length})
                  </div>
                  <div className="space-y-1.5">
                    {pageOutputs.map((o) => {
                      const variable = variables.find((v) => v.id === o.variable_id)
                      return (
                        <div
                          key={o.id}
                          className="p-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 text-[10px]"
                        >
                          <p className="font-mono font-bold text-black dark:text-zinc-200 truncate">{o.name}</p>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border border-zinc-250 dark:border-zinc-800 font-medium text-[8px]">
                              {o.output_type}
                            </span>
                            {variable && (
                              <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold text-[8px] truncate max-w-full">
                                Mutates: {variable.label}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    {pageOutputs.length === 0 && (
                      <p className="text-[9px] text-zinc-400 italic">No state mutations defined</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-500 dark:text-amber-400 uppercase tracking-wider">
                    <Zap className="size-3.5" /> Triggers ({pageActions.length})
                  </div>
                  <div className="space-y-1.5">
                    {pageActions.map((a) => {
                      const linkedFunc = functions.find((f) => f.id === a.function_id)
                      return (
                        <div
                          key={a.id}
                          className="p-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 text-[10px]"
                        >
                          <p className="font-mono font-bold text-black dark:text-zinc-200 truncate">{a.name}</p>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border border-zinc-250 dark:border-zinc-800 font-medium text-[8px]">
                              {a.action_type}
                            </span>
                            {linkedFunc ? (
                              <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold text-[8px] flex items-center gap-1 truncate max-w-full">
                                Call: {linkedFunc.name}() <ExternalLink className="size-2 shrink-0" />
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border border-zinc-200 dark:border-zinc-850 font-bold text-[8px]">
                                Client Logic
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    {pageActions.length === 0 && (
                      <p className="text-[9px] text-zinc-400 italic">No active triggers defined</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {filteredPages.length === 0 && (
          <div className="col-span-full py-20 border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-[10px] font-bold text-zinc-400 uppercase">
            No screen logic elements found matching your search.
          </div>
        )}
      </div>
    </div>
  )
}
