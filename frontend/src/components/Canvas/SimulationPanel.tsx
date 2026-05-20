import { motion } from 'framer-motion'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react'
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
            <Label className="text-[10px] font-black text-zinc-500">Agent Identity</Label>
            <Select
              value={simulationParams.userTypeId}
              onValueChange={(v) => setSimulationParams({ ...simulationParams, userTypeId: v || '' })}
            >
              <SelectTrigger className="bg-zinc-50 dark:bg-zinc-950 h-10 w-full border-zinc-200 dark:border-zinc-800 rounded-none text-[10px] font-bold">
                <SelectValue placeholder="Default Permission Set">
                  {simulationParams.userTypeId ? userTypes.find((ut: any) => ut.id === simulationParams.userTypeId)?.name : "Default Permission Set"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none">
                {userTypes.map((ut: any) => (
                  <SelectItem key={ut.id} value={ut.id} className="text-[10px] font-bold">
                    {ut.name}
                  </SelectItem>
                ))}
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

          <Button
            onClick={runFlowSimulation}
            disabled={simulationStatus === 'running'}
            className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-none text-[10px] font-black  tracking-widest h-11 transition-all"
          >
            {simulationStatus === 'running' ? 'Tracing...' : 'Run Simulation'}
          </Button>
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
