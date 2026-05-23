import { motion } from 'framer-motion'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowRight, RefreshCw, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/ui/Tooltip'

export function SimulationPanel({
  snapshot,
  setSnapshot,
  isChaosMode,
  toggleChaosMode,
  simulationParams,
  setSimulationParams,
  pages,
  userTypes,
  narrative,
  setNarrative,
  handleTraceNarrative,
  runFlowSimulation,
  stopSimulation,
  activePath,
  simulationStatus,
  simulationLogs,
  simulationStep
}: {
  snapshot: any
  setSnapshot: (val: any) => void
  isChaosMode: boolean
  toggleChaosMode: () => void
  simulationParams: any
  setSimulationParams: (val: any) => void
  pages: any[]
  userTypes: any[]
  narrative: string
  setNarrative: (val: string) => void
  handleTraceNarrative: () => void
  runFlowSimulation: () => void
  stopSimulation: () => void
  activePath: any[]
  simulationStatus: 'idle' | 'running' | 'path_found' | 'path_not_found'
  simulationLogs: string[]
  simulationStep: number
}) {
  return (
    <div className="absolute bottom-6 left-6 z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xl w-[340px] space-y-6 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm font-semibold text-black dark:text-white">
                Simulation Engine
              </p>
              <p className="text-[10px] font-black  tracking-widest text-zinc-400 dark:text-zinc-600">
                {simulationStatus === 'running' ? 'Tracing Architecture...' :
                  (simulationStatus === 'path_found' ? 'Baseline Verified' : 'Path Analysis')}
              </p>
            </div>
          </div>
          <Tooltip content={isChaosMode ? "Disable Stress Test" : "Enable Chaos Mode: Inject failures"}>
            <Button
              onClick={toggleChaosMode}
              size="icon"
              className={cn(
                "size-8 rounded-none transition-all",
                isChaosMode ? "bg-red-500 text-white" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400"
              )}
            >
              <AlertTriangle className="size-4" />
            </Button>
          </Tooltip>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-zinc-500">Origin</Label>
              <Select
                value={simulationParams.startPageId}
                onValueChange={(v) => setSimulationParams({ ...simulationParams, startPageId: v || '' })}
              >
                <SelectTrigger className="bg-zinc-50 dark:bg-zinc-950 h-10 w-full border-zinc-200 dark:border-zinc-800 rounded-none text-[10px] font-bold">
                  <SelectValue placeholder="Start">
                    {simulationParams.startPageId ? (pages.find((p: any) => p.id === simulationParams.startPageId)?.title || pages.find((p: any) => p.id === simulationParams.startPageId)?.name) : "Start"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none">
                  {pages.map((p: any) => (
                    <SelectItem key={p.id} value={p.id} className="text-[10px] font-bold">{p.title || p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-zinc-500">Terminal</Label>
              <Select
                value={simulationParams.endPageId}
                onValueChange={(v) => setSimulationParams({ ...simulationParams, endPageId: v || '' })}
              >
                <SelectTrigger className="bg-zinc-50 dark:bg-zinc-950 h-10 w-full border-zinc-200 dark:border-zinc-800 rounded-none text-[10px] font-bold">
                  <SelectValue placeholder="End">
                    {simulationParams.endPageId ? (pages.find((p: any) => p.id === simulationParams.endPageId)?.title || pages.find((p: any) => p.id === simulationParams.endPageId)?.name) : "End"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none">
                  {pages.map((p: any) => (
                    <SelectItem key={p.id} value={p.id} className="text-[10px] font-bold">{p.title || p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black text-zinc-500">Agent Identity / Persona</Label>
            <Select
              value={
                simulationParams.userTypeId
                  ? (simulationParams.personaInstanceId && simulationParams.personaInstanceId !== 'default'
                    ? `instance_${simulationParams.userTypeId}_${simulationParams.personaInstanceId}`
                    : `role_${simulationParams.userTypeId}`)
                  : ''
              }
              onValueChange={(val) => {
                if (!val) {
                  setSimulationParams({ ...simulationParams, userTypeId: '', personaInstanceId: 'default' })
                  return
                }
                if (val.startsWith('role_')) {
                  const uId = val.replace('role_', '')
                  setSimulationParams({ ...simulationParams, userTypeId: uId, personaInstanceId: 'default' })
                } else if (val.startsWith('instance_')) {
                  const parts = val.replace('instance_', '').split('_')
                  const uId = parts[0]
                  const instId = parts[1]
                  setSimulationParams({ ...simulationParams, userTypeId: uId, personaInstanceId: instId })
                }
              }}
            >
              <SelectTrigger className="bg-zinc-50 dark:bg-zinc-950 h-10 w-full border-zinc-200 dark:border-zinc-800 rounded-none text-[10px] font-bold">
                <SelectValue placeholder="Default Permission Set">
                  {(() => {
                    if (!simulationParams.userTypeId) return "Default Permission Set"
                    const ut = userTypes.find((u: any) => u.id === simulationParams.userTypeId)
                    if (!ut) return "Default Permission Set"
                    if (simulationParams.personaInstanceId && simulationParams.personaInstanceId !== 'default') {
                      const inst = ut.persona?.instances?.find((i: any) => i.id === simulationParams.personaInstanceId)
                      return inst ? `${ut.name} (Instance: ${inst.name})` : ut.name
                    }
                    return `${ut.name} (Base Role)`
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none max-h-60 overflow-y-auto">
                {userTypes.map((ut: any) => {
                  const hasInstances = ut.persona?.instances && ut.persona.instances.length > 0
                  return (
                    <SelectGroup key={ut.id}>
                      <SelectLabel className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-500 bg-zinc-50/50 dark:bg-zinc-950 px-2 py-1 border-b border-zinc-150 dark:border-zinc-900 mt-1 first:mt-0">
                        {ut.name}
                      </SelectLabel>
                      <SelectItem value={`role_${ut.id}`} className="text-[10px] font-bold pl-4">
                        Default {ut.name} (Base Role)
                      </SelectItem>
                      {hasInstances && ut.persona.instances.map((inst: any) => (
                        <SelectItem key={inst.id} value={`instance_${ut.id}_${inst.id}`} className="text-[10px] font-semibold pl-4">
                          ↳ {inst.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 pt-2">
            <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-600">Behavioral Storyboard</p>
            <div className="relative group">
              <textarea
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                placeholder="e.g. User starts at Home, clicks Signup..."
                className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 text-[10px] font-mono min-h-[60px] focus:outline-none focus:border-black dark:focus:border-white transition-all resize-none"
              />
              <Button
                onClick={handleTraceNarrative}
                className="absolute bottom-2 right-2 size-6 rounded-none bg-black dark:bg-white text-white dark:text-black opacity-0 group-hover:opacity-100 transition-opacity"
                size="icon"
              >
                <ArrowRight className="size-3" />
              </Button>
            </div>
          </div>

          {/* Live Trace Log */}
          <div className="bg-zinc-950 p-3 font-mono text-[9px] h-32 overflow-y-auto custom-scrollbar border border-zinc-800">
            <div className="flex items-center gap-2 mb-2 text-zinc-500 border-b border-zinc-800 pb-1">
              <RefreshCw className={cn("size-2.5", simulationStatus === 'running' && "animate-spin")} />
              <span className=" tracking-widest">Architectural Trace</span>
            </div>
            {simulationLogs.map((log, i) => (
              <div key={i} className={cn(
                "py-0.5 transition-opacity",
                i === simulationLogs.length - 1 ? "text-white" : "text-zinc-600"
              )}>
                <span className="text-zinc-700 mr-2">{'>'}</span>
                {log}
              </div>
            ))}
            {simulationLogs.length === 0 && (
              <div className="text-zinc-800 italic">Waiting for simulation trigger...</div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={runFlowSimulation}
              disabled={simulationStatus === 'running'}
              className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-none text-[10px] font-black  tracking-widest h-11 transition-all"
            >
              {simulationStatus === 'running' ? 'Tracing...' : 'Run Simulation'}
            </Button>
            {(simulationStatus === 'running' || activePath.length > 0) && (
              <Button
                onClick={stopSimulation}
                className="bg-red-600 hover:bg-red-700 text-white rounded-none text-[10px] font-black tracking-widest h-11 px-4 transition-all"
              >
                <Square className="size-3 fill-white" />
              </Button>
            )}
          </div>
        </div>

        {activePath.length > 0 && (
          <div className="pt-2 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-zinc-500  tracking-widest">Complexity Index</span>
              <span className="text-xs font-bold text-black dark:text-white">{activePath.length} Hops</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-zinc-500  tracking-widest">Estimated Latency</span>
              <span className={cn("text-xs font-bold", activePath.length <= 3 ? "text-green-500" : activePath.length <= 5 ? "text-amber-400" : "text-red-400")}>{(activePath.length * 35).toFixed(0)}ms</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
