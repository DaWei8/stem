'use client'

import { Screen, ScreenAction, ScreenInput, ScreenOutput, Variable } from '@/types'
import { motion } from 'framer-motion'
import {
  Battery, Database, ExternalLink, Fingerprint, Globe,
  Link2, Monitor, Signal, Wifi, Zap
} from 'lucide-react'
import { useMemo } from 'react'
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

/* ─── Mini Phone Frame (static, non-ReactFlow version) ─── */
function MiniPhoneFrame({
  children,
  liveUrl,
}: {
  children: React.ReactNode
  liveUrl?: string | null
}) {
  const displayUrl = liveUrl
    ? liveUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
    : null

  return (
    <div className="rounded-md! h-full max-h-[600px] p-1 bg-linear-to-b from-zinc-600/60 to-zinc-800/60 hover:from-zinc-500/70 hover:to-zinc-700/70 transition-all duration-300 group/phone">
      <div className="bg-zinc-950 rounded-[20px] overflow-hidden flex flex-col">
        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 pt-2 pb-0.5">
          <span className="text-[7px] font-semibold text-zinc-600 tabular-nums tracking-wide">9:41</span>
          <div className="flex items-center gap-1">
            <Signal className="size-2 text-zinc-700" />
            <Wifi className="size-2 text-zinc-700" />
            <Battery className="size-2 text-zinc-700" />
          </div>
        </div>

        {/* Dynamic Island */}
        <div className="flex justify-center pb-1">
          <div className="w-20 h-4 bg-black rounded-full border border-zinc-800/40" />
        </div>

        {/* Screen Content */}
        <div className="flex-1 h-full flex flex-col min-h-0">
          {children}
        </div>

        {/* URL Bar */}
        <div className="px-3 py-1.5 border-t border-zinc-800/40">
          <div className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-md',
            'bg-zinc-900/50 border',
            liveUrl ? 'border-zinc-700/40' : 'border-dashed border-zinc-800/50',
          )}>
            {liveUrl ? (
              <Globe className="size-2 text-emerald-500 shrink-0" />
            ) : (
              <Link2 className="size-2 text-zinc-700 shrink-0" />
            )}
            <span className={cn(
              'flex-1 text-[7px] font-mono truncate',
              liveUrl ? 'text-zinc-400' : 'text-zinc-700 italic',
            )}>
              {displayUrl || 'No live URL'}
            </span>
            {liveUrl && (
              <button
                onClick={() => {
                  const fullUrl = liveUrl.startsWith('http') ? liveUrl : `https://${liveUrl}`
                  window.open(fullUrl, '_blank', 'noopener,noreferrer')
                }}
                className="shrink-0 text-zinc-600 hover:text-white transition-colors"
              >
                <ExternalLink className="size-2" />
              </button>
            )}
          </div>
        </div>

        {/* Home Indicator */}
        <div className="flex justify-center py-1">
          <div className="w-16 h-[3px] bg-zinc-800 rounded-full" />
        </div>
      </div>
    </div>
  )
}

/* ─── Section Header (Inputs / Mutations / Triggers) ─── */
function SectionHeader({
  icon,
  label,
  count,
  accentClass,
  bgClass,
}: {
  icon: React.ReactNode
  label: string
  count: number
  accentClass: string
  bgClass: string
}) {
  return (
    <div className="flex items-center justify-between pb-1">
      <span className={cn('flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.15em]', accentClass)}>
        {icon} {label}
      </span>
      <span className={cn('font-mono text-[8px] px-1.5 py-px rounded-sm border', bgClass, accentClass)}>
        {count}
      </span>
    </div>
  )
}

/* ─── Item Pill ─── */
function ItemPill({
  name,
  meta,
  badge,
  accentClass,
  hoverBorderClass,
}: {
  name: string
  meta: React.ReactNode
  badge?: React.ReactNode
  accentClass: string
  hoverBorderClass: string
}) {
  return (
    <div className={cn(
      'p-2.5 bg-zinc-900/30 border border-zinc-800/50 transition-all duration-200 flex flex-col gap-1.5 rounded-md',
      hoverBorderClass,
    )}>
      <p className="font-mono font-bold text-white text-[9px] truncate leading-tight">{name}</p>
      <div className="flex flex-col gap-1">
        {meta}
        {badge}
      </div>
    </div>
  )
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
      transition: { staggerChildren: 0.06 }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: 'easeOut' as const } }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h3 className="text-md font-black text-zinc-400 dark:text-zinc-500">
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
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {filteredPages.map((page) => {
          const pageInputs = inputs.filter((i) => i.page_id === page.id)
          const pageOutputs = outputs.filter((o) => o.page_id === page.id)
          const pageActions = actions.filter((a) => a.page_id === page.id)

          return (
            <div key={page.id}>
              <MiniPhoneFrame liveUrl={page.live_url}>
                {/* Screen Header */}
                <div className="px-3 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-800">
                      <Monitor className="size-2.5 text-zinc-400" />
                      <span className="text-[7px] font-black tracking-[0.12em] text-zinc-400">SCREEN</span>
                    </div>
                    <span className="px-1.5 py-0.5 bg-zinc-800/60 text-zinc-500 text-[7px] font-black uppercase tracking-wider rounded-sm">
                      {page.folder || 'Global'}
                    </span>
                  </div>
                  <h4 className="text-[11px] font-bold text-white truncate">{page.title}</h4>
                  <span className="text-[7px] font-mono text-zinc-700 block mt-0.5">
                    {page.id.slice(0, 8)}...
                  </span>
                </div>

                {/* Inputs */}
                <div className="px-3 py-2 border-t border-zinc-800/40 space-y-1.5">
                  <SectionHeader
                    icon={<Fingerprint className="size-2.5" />}
                    label="Inputs"
                    count={pageInputs.length}
                    accentClass="text-blue-400"
                    bgClass="bg-blue-500/10 border-blue-500/15"
                  />
                  {pageInputs.length > 0 ? (
                    <div className="grid grid-cols-2 gap-1.5">
                      {pageInputs.map((i) => {
                        const variable = variables.find((v) => v.id === i.variable_id)
                        return (
                          <ItemPill
                            key={i.id}
                            name={i.name}
                            accentClass="text-blue-400"
                            hoverBorderClass="hover:border-blue-500/30"
                            meta={
                              <span className="text-[7px] text-zinc-500 font-mono">
                                Type: <strong className="text-zinc-300 uppercase font-sans font-bold">{i.input_type}</strong>
                              </span>
                            }
                            badge={
                              variable ? (
                                <span className="px-1.5 py-px bg-blue-500/5 text-blue-400 border border-blue-500/10 font-bold text-[7px] truncate block w-fit rounded-sm">
                                  🔗 {variable.label}
                                </span>
                              ) : (
                                <span className="px-1.5 py-px bg-zinc-800 text-zinc-500 border border-zinc-700/50 font-bold text-[7px] block w-fit rounded-sm">
                                  Transient
                                </span>
                              )
                            }
                          />
                        )
                      })}
                    </div>
                  ) : (
                    <div className="py-2.5 border border-dashed border-zinc-800/50 text-center text-[8px] text-zinc-600 italic rounded-md">
                      No inputs defined
                    </div>
                  )}
                </div>

                {/* Mutations */}
                <div className="px-3 py-2 border-t border-zinc-800/40 space-y-1.5">
                  <SectionHeader
                    icon={<Database className="size-2.5" />}
                    label="Mutations"
                    count={pageOutputs.length}
                    accentClass="text-emerald-400"
                    bgClass="bg-emerald-500/10 border-emerald-500/15"
                  />
                  {pageOutputs.length > 0 ? (
                    <div className="grid grid-cols-2 gap-1.5">
                      {pageOutputs.map((o) => {
                        const variable = variables.find((v) => v.id === o.variable_id)
                        return (
                          <ItemPill
                            key={o.id}
                            name={o.name}
                            accentClass="text-emerald-400"
                            hoverBorderClass="hover:border-emerald-500/30"
                            meta={
                              <span className="text-[7px] text-zinc-500 font-mono">
                                Type: <strong className="text-zinc-300 uppercase font-sans font-bold">{o.output_type}</strong>
                              </span>
                            }
                            badge={
                              variable ? (
                                <span className="px-1.5 py-px bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 font-bold text-[7px] truncate block w-fit rounded-sm">
                                  📝 Mutates: {variable.label}
                                </span>
                              ) : undefined
                            }
                          />
                        )
                      })}
                    </div>
                  ) : (
                    <div className="py-2.5 border border-dashed border-zinc-800/50 text-center text-[8px] text-zinc-600 italic rounded-md">
                      No mutations defined
                    </div>
                  )}
                </div>

                {/* Triggers */}
                <div className="px-3 py-2 border-t border-zinc-800/40 space-y-1.5">
                  <SectionHeader
                    icon={<Zap className="size-2.5" />}
                    label="Triggers"
                    count={pageActions.length}
                    accentClass="text-amber-400"
                    bgClass="bg-amber-500/10 border-amber-500/15"
                  />
                  {pageActions.length > 0 ? (
                    <div className="grid grid-cols-2 gap-1.5">
                      {pageActions.map((a) => {
                        const linkedFunc = functions.find((f) => f.id === a.function_id)
                        return (
                          <ItemPill
                            key={a.id}
                            name={a.name}
                            accentClass="text-amber-400"
                            hoverBorderClass="hover:border-amber-500/30"
                            meta={
                              <span className="text-[7px] text-zinc-500 font-mono">
                                Event: <strong className="text-zinc-300 uppercase font-sans font-bold">{a.action_type}</strong>
                              </span>
                            }
                            badge={
                              linkedFunc ? (
                                <span className="px-1.5 py-px bg-amber-500/5 text-amber-400 border border-amber-500/10 font-bold text-[7px] flex items-center gap-1 truncate w-fit rounded-sm">
                                  ⚙️ {linkedFunc.name}() <ExternalLink className="size-1.5 shrink-0 opacity-70" />
                                </span>
                              ) : (
                                <span className="px-1.5 py-px bg-zinc-800 text-zinc-500 border border-zinc-700/50 font-bold text-[7px] block w-fit rounded-sm">
                                  Client Logic
                                </span>
                              )
                            }
                          />
                        )
                      })}
                    </div>
                  ) : (
                    <div className="py-2.5 border border-dashed border-zinc-800/50 text-center text-[8px] text-zinc-600 italic rounded-md">
                      No triggers defined
                    </div>
                  )}
                </div>
              </MiniPhoneFrame>
            </div>
          )
        })}
        {filteredPages.length === 0 && (
          <div className="col-span-full py-20 border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-[10px] font-bold text-zinc-400 uppercase rounded-xl">
            No screen logic elements found matching your search.
          </div>
        )}
      </motion.div>
    </div>
  )
}
