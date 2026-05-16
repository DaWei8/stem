'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useLifecycle } from '@/hooks/useLifecycle'
import { usePages } from '@/hooks/usePages'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GitBranch,
  Plus,
  Trash2,
  Flag,
  ToggleLeft,
  ToggleRight,
  ArrowRight,
  Shield,
  FileCode2,
  ChevronDown
} from 'lucide-react'

export function LifecycleView() {
  const { id: projectId } = useParams() as { id: string }
  const {
    featureFlags,
    flagGates,
    migrations,
    transforms,
    addFeatureFlag,
    toggleFlag,
    deleteFeatureFlag,
    addFlagGate,
    deleteFlagGate,
    addMigration,
    updateMigration,
    deleteMigration,
    getActiveFlags
  } = useLifecycle()
  const { pages } = usePages()

  const [showAddFlag, setShowAddFlag] = useState(false)
  const [showAddMigration, setShowAddMigration] = useState(false)
  const [expandedFlag, setExpandedFlag] = useState<string | null>(null)
  const [gatePageId, setGatePageId] = useState('')

  // Flag form
  const [flagKey, setFlagKey] = useState('')
  const [flagLabel, setFlagLabel] = useState('')
  const [flagDesc, setFlagDesc] = useState('')

  // Migration form
  const [migFromVer, setMigFromVer] = useState('')
  const [migToVer, setMigToVer] = useState('')
  const [migName, setMigName] = useState('')

  const activeFlags = getActiveFlags()

  const handleAddFlag = async () => {
    if (!flagKey || !flagLabel) return
    await addFeatureFlag(projectId, { flag_key: flagKey, label: flagLabel, description: flagDesc })
    setShowAddFlag(false)
    setFlagKey('')
    setFlagLabel('')
    setFlagDesc('')
  }

  const handleAddMigration = async () => {
    if (!migFromVer || !migToVer || !migName) return
    await addMigration(projectId, { from_version: migFromVer, to_version: migToVer, migration_name: migName })
    setShowAddMigration(false)
    setMigFromVer('')
    setMigToVer('')
    setMigName('')
  }

  const handleGatePage = async (flagId: string) => {
    if (!gatePageId) return
    await addFlagGate(projectId, flagId, gatePageId, 'visibility')
    setGatePageId('')
  }

  const stageColor: Record<string, string> = {
    development: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    staging: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    canary: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    production: 'bg-green-500/10 text-green-500 border-green-500/20',
    deprecated: 'bg-red-500/10 text-red-500 border-red-500/20'
  }

  const statusColor: Record<string, string> = {
    draft: 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500',
    reviewed: 'bg-blue-500/10 text-blue-500',
    approved: 'bg-green-500/10 text-green-500',
    applied: 'bg-emerald-500/10 text-emerald-500',
    rolled_back: 'bg-red-500/10 text-red-500'
  }

  return (
    <div className="h-full overflow-y-auto bg-zinc-50 dark:bg-black transition-colors">
      <div className="mx-auto px-8 py-10 space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tighter text-black dark:text-white">Lifecycle</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Feature flags, schema migrations, and version-to-version data evolution.
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
            <Flag className="size-4 text-zinc-400" />
            <div>
              <p className="text-2xl font-black tracking-tighter text-black dark:text-white">{featureFlags.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Feature Flags</p>
            </div>
          </div>
          <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
            <ToggleRight className="size-4 text-green-500" />
            <div>
              <p className="text-2xl font-black tracking-tighter text-green-500">{activeFlags.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Active Flags</p>
            </div>
          </div>
          <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
            <FileCode2 className="size-4 text-zinc-400" />
            <div>
              <p className="text-2xl font-black tracking-tighter text-black dark:text-white">{migrations.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Schema Migrations</p>
            </div>
          </div>
        </div>

        {/* Feature Flags */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-black dark:text-white">Feature Flags</h2>
            <Button
              onClick={() => setShowAddFlag(!showAddFlag)}
              className="h-8 rounded-none px-3 text-xs font-bold bg-black dark:bg-white text-white dark:text-black"
            >
              <Plus className="size-3 mr-1" /> New Flag
            </Button>
          </div>

          {showAddFlag && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border border-zinc-200 dark:border-zinc-800 p-4 space-y-3 bg-white dark:bg-zinc-950"
            >
              <div className="grid grid-cols-2 gap-3">
                <Input value={flagKey} onChange={(e) => setFlagKey(e.target.value)} placeholder="flag_key (e.g. v2_onboarding)" className="h-10 rounded-none text-xs font-mono" />
                <Input value={flagLabel} onChange={(e) => setFlagLabel(e.target.value)} placeholder="Human Label" className="h-10 rounded-none text-xs" />
              </div>
              <Input value={flagDesc} onChange={(e) => setFlagDesc(e.target.value)} placeholder="Description (optional)" className="h-10 rounded-none text-xs" />
              <Button onClick={handleAddFlag} className="w-full h-9 rounded-none bg-black dark:bg-white text-white dark:text-black text-xs font-bold">
                Create Flag
              </Button>
            </motion.div>
          )}

          <div className="space-y-2">
            {featureFlags.length === 0 ? (
              <EmptyState message="No feature flags defined. Create flags to gate screens and simulate alternate system configurations." />
            ) : (
              featureFlags.map(flag => {
                const isExpanded = expandedFlag === flag.id
                const gates = flagGates.filter(g => g.feature_flag_id === flag.id)

                return (
                  <div key={flag.id} className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
                    <div className="flex items-center justify-between p-3 group">
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleFlag(projectId, flag.id)}>
                          {flag.is_enabled
                            ? <ToggleRight className="size-5 text-green-500" />
                            : <ToggleLeft className="size-5 text-zinc-400" />
                          }
                        </button>
                        <div>
                          <span className="text-xs font-bold text-black dark:text-white">{flag.label}</span>
                          <span className="text-[10px] font-mono text-zinc-400 ml-2">{flag.flag_key}</span>
                        </div>
                        <span className={cn("text-[9px] font-bold uppercase px-2 py-0.5 border", stageColor[flag.lifecycle_stage] || '')}>
                          {flag.lifecycle_stage}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setExpandedFlag(isExpanded ? null : flag.id)}>
                          <ChevronDown className={cn("size-3 text-zinc-400 transition-transform", isExpanded && "rotate-180")} />
                        </button>
                        <button
                          onClick={() => deleteFeatureFlag(projectId, flag.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-red-500"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden border-t border-zinc-200 dark:border-zinc-800"
                        >
                          <div className="p-4 space-y-3 bg-zinc-50 dark:bg-black">
                            {flag.description && (
                              <p className="text-[11px] text-zinc-500">{flag.description}</p>
                            )}

                            <div className="flex items-center gap-2">
                              <Shield className="size-3 text-zinc-400" />
                              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Gated Screens ({gates.length})</span>
                            </div>

                            {gates.map(gate => {
                              const page = pages.find(p => p.id === gate.page_id)
                              return (
                                <div key={gate.id} className="flex items-center justify-between py-1.5 px-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                                  <div className="flex items-center gap-2">
                                    <ArrowRight className="size-3 text-zinc-400" />
                                    <span className="text-[11px] font-medium text-black dark:text-white">{page?.title || 'Unknown'}</span>
                                  </div>
                                  <button onClick={() => deleteFlagGate(projectId, gate.id)} className="text-zinc-400 hover:text-red-500">
                                    <Trash2 className="size-3" />
                                  </button>
                                </div>
                              )
                            })}

                            <div className="flex gap-2">
                              <select
                                value={gatePageId}
                                onChange={(e) => setGatePageId(e.target.value)}
                                className="flex-1 h-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-2 text-[11px] font-medium text-black dark:text-white"
                              >
                                <option value="">Select screen to gate...</option>
                                {pages.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                              </select>
                              <Button onClick={() => handleGatePage(flag.id)} className="h-8 rounded-none px-3 text-[10px] font-bold bg-black dark:bg-white text-white dark:text-black">
                                Gate
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })
            )}
          </div>
        </section>

        {/* Schema Migrations */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-black dark:text-white">Schema Migrations</h2>
            <Button
              onClick={() => setShowAddMigration(!showAddMigration)}
              className="h-8 rounded-none px-3 text-xs font-bold bg-black dark:bg-white text-white dark:text-black"
            >
              <Plus className="size-3 mr-1" /> New Migration
            </Button>
          </div>

          {showAddMigration && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border border-zinc-200 dark:border-zinc-800 p-4 space-y-3 bg-white dark:bg-zinc-950"
            >
              <Input value={migName} onChange={(e) => setMigName(e.target.value)} placeholder="Migration Name (e.g. add_user_preferences)" className="h-10 rounded-none text-xs" />
              <div className="grid grid-cols-2 gap-3">
                <Input value={migFromVer} onChange={(e) => setMigFromVer(e.target.value)} placeholder="From Version (e.g. 1.0.0)" className="h-10 rounded-none text-xs font-mono" />
                <Input value={migToVer} onChange={(e) => setMigToVer(e.target.value)} placeholder="To Version (e.g. 1.1.0)" className="h-10 rounded-none text-xs font-mono" />
              </div>
              <Button onClick={handleAddMigration} className="w-full h-9 rounded-none bg-black dark:bg-white text-white dark:text-black text-xs font-bold">
                Create Migration Blueprint
              </Button>
            </motion.div>
          )}

          <div className="space-y-2">
            {migrations.length === 0 ? (
              <EmptyState message="No schema migrations registered. Track how your data model evolves across versions." />
            ) : (
              migrations.map(mig => (
                <div key={mig.id} className="flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 group">
                  <div className="flex items-center gap-3">
                    <FileCode2 className="size-3 text-zinc-400" />
                    <span className="text-xs font-bold text-black dark:text-white">{mig.migration_name}</span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {mig.from_version} → {mig.to_version}
                    </span>
                    <span className={cn("text-[9px] font-bold uppercase px-2 py-0.5 rounded-sm", statusColor[mig.status] || '')}>
                      {mig.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {mig.status === 'draft' && (
                      <button
                        onClick={() => updateMigration(projectId, mig.id, { status: 'reviewed' })}
                        className="text-[9px] font-bold text-blue-500 hover:underline"
                      >
                        Mark Reviewed
                      </button>
                    )}
                    {mig.status === 'reviewed' && (
                      <button
                        onClick={() => updateMigration(projectId, mig.id, { status: 'approved' })}
                        className="text-[9px] font-bold text-green-500 hover:underline"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => deleteMigration(projectId, mig.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-red-500"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-12 border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
      <p className="text-[11px] text-zinc-400 dark:text-zinc-600 italic max-w-xs text-center">{message}</p>
    </div>
  )
}
