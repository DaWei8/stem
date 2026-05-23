'use client'

import { useMemo } from 'react'
import { Screen, ScreenInput, ScreenAction, ScreenOutput, Variable } from '@/types'
import { Monitor, Fingerprint, Database, Zap, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
  }

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

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 xl:grid-cols-2 gap-6"
      >
        {filteredPages.map((page) => {
          const pageInputs = inputs.filter((i) => i.page_id === page.id)
          const pageOutputs = outputs.filter((o) => o.page_id === page.id)
          const pageActions = actions.filter((a) => a.page_id === page.id)

          return (
            <motion.div
              key={page.id}
              variants={cardVariants}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-6 space-y-6 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] relative overflow-hidden group rounded-none"
            >
              {/* Top accent gradient border */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500 opacity-20 group-hover:opacity-60 transition-opacity duration-300" />

              {/* Screen Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-9 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center rounded-none group-hover:scale-105 transition-transform duration-300 shadow-inner">
                    <Monitor className="size-4 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-black dark:text-white uppercase tracking-wider">
                      {page.title}
                    </h4>
                    <span className="text-[9px] font-mono text-zinc-400 mt-0.5 block">
                      ID: {page.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border border-zinc-250 dark:border-zinc-800 text-[8px] font-black uppercase tracking-wider">
                  {page.folder ? page.folder : 'Global'}
                </span>
              </div>

              {/* Grid of Screen Context Elements */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Inputs Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest pb-1 border-b border-zinc-100 dark:border-zinc-900">
                    <span className="flex items-center gap-1.5"><Fingerprint className="size-3.5" /> Inputs</span>
                    <span className="font-mono text-[9px] bg-blue-500/10 px-1.5 py-0.2 rounded-none border border-blue-500/10">{pageInputs.length}</span>
                  </div>
                  
                  <div className="space-y-2">
                    {pageInputs.map((i) => {
                      const variable = variables.find((v) => v.id === i.variable_id)
                      return (
                        <div
                          key={i.id}
                          className="p-3 bg-zinc-50/50 dark:bg-zinc-900/10 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-850 hover:border-blue-500/30 transition-all duration-300 group/item flex flex-col gap-2"
                        >
                          <p className="font-mono font-bold text-black dark:text-zinc-200 text-[10px] truncate leading-tight">{i.name}</p>
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[8px] text-zinc-400 dark:text-zinc-500 font-mono flex items-center gap-1">
                              Type: <strong className="text-zinc-600 dark:text-zinc-300 uppercase font-sans font-bold">{i.input_type}</strong>
                            </span>
                            {variable ? (
                              <span className="px-1.5 py-0.5 bg-blue-500/5 text-blue-500 border border-blue-500/10 font-black text-[8px] truncate block w-fit">
                                🔗 {variable.label}
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-400 border border-zinc-200 dark:border-zinc-850 font-black text-[8px] block w-fit">
                                Transient
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    {pageInputs.length === 0 && (
                      <div className="py-4 border border-dashed border-zinc-200 dark:border-zinc-850 text-center text-[9px] text-zinc-400 italic">
                        No inputs defined
                      </div>
                    )}
                  </div>
                </div>

                {/* Outputs Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-widest pb-1 border-b border-zinc-100 dark:border-zinc-900">
                    <span className="flex items-center gap-1.5"><Database className="size-3.5" /> Mutations</span>
                    <span className="font-mono text-[9px] bg-emerald-500/10 px-1.5 py-0.2 rounded-none border border-emerald-500/10">{pageOutputs.length}</span>
                  </div>
                  
                  <div className="space-y-2">
                    {pageOutputs.map((o) => {
                      const variable = variables.find((v) => v.id === o.variable_id)
                      return (
                        <div
                          key={o.id}
                          className="p-3 bg-zinc-50/50 dark:bg-zinc-900/10 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-850 hover:border-emerald-500/30 transition-all duration-300 group/item flex flex-col gap-2"
                        >
                          <p className="font-mono font-bold text-black dark:text-zinc-200 text-[10px] truncate leading-tight">{o.name}</p>
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[8px] text-zinc-400 dark:text-zinc-500 font-mono flex items-center gap-1">
                              Type: <strong className="text-zinc-600 dark:text-zinc-300 uppercase font-sans font-bold">{o.output_type}</strong>
                            </span>
                            {variable && (
                              <span className="px-1.5 py-0.5 bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 font-black text-[8px] truncate block w-fit">
                                📝 Mutates: {variable.label}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    {pageOutputs.length === 0 && (
                      <div className="py-4 border border-dashed border-zinc-200 dark:border-zinc-850 text-center text-[9px] text-zinc-400 italic">
                        No mutations defined
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-black text-amber-500 dark:text-amber-400 uppercase tracking-widest pb-1 border-b border-zinc-100 dark:border-zinc-900">
                    <span className="flex items-center gap-1.5"><Zap className="size-3.5" /> Triggers</span>
                    <span className="font-mono text-[9px] bg-amber-500/10 px-1.5 py-0.2 rounded-none border border-amber-500/10">{pageActions.length}</span>
                  </div>
                  
                  <div className="space-y-2">
                    {pageActions.map((a) => {
                      const linkedFunc = functions.find((f) => f.id === a.function_id)
                      return (
                        <div
                          key={a.id}
                          className="p-3 bg-zinc-50/50 dark:bg-zinc-900/10 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-850 hover:border-amber-500/30 transition-all duration-300 group/item flex flex-col gap-2"
                        >
                          <p className="font-mono font-bold text-black dark:text-zinc-200 text-[10px] truncate leading-tight">{a.name}</p>
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[8px] text-zinc-400 dark:text-zinc-500 font-mono flex items-center gap-1">
                              Event: <strong className="text-zinc-600 dark:text-zinc-300 uppercase font-sans font-bold">{a.action_type}</strong>
                            </span>
                            {linkedFunc ? (
                              <span className="px-1.5 py-0.5 bg-amber-500/5 text-amber-600 dark:text-amber-400 border border-amber-500/10 font-black text-[8px] flex items-center gap-1 truncate w-fit">
                                ⚙️ {linkedFunc.name}() <ExternalLink className="size-2 shrink-0 opacity-70" />
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-400 border border-zinc-200 dark:border-zinc-850 font-black text-[8px] block w-fit">
                                Client Logic
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    {pageActions.length === 0 && (
                      <div className="py-4 border border-dashed border-zinc-200 dark:border-zinc-850 text-center text-[9px] text-zinc-400 italic">
                        No triggers defined
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )
        })}
        {filteredPages.length === 0 && (
          <div className="col-span-full py-20 border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-[10px] font-bold text-zinc-400 uppercase">
            No screen logic elements found matching your search.
          </div>
        )}
      </motion.div>
    </div>
  )
}
