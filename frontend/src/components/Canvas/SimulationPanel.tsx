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
  activePath
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
}) {
  return (
    <div className="absolute bottom-6 left-6 z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xl w-[320px] space-y-6 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "size-2 rounded-full",
              snapshot ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : (isChaosMode ? "bg-red-500 animate-pulse" : "bg-green-500")
            )} />
            <div>
              <p className="text-sm font-semibold text-black dark:text-white">
                {snapshot ? 'Benchmarking Mode' : 'Simulation Engine'}
              </p>
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                {snapshot ? 'Comparing vs. Baseline' : (isChaosMode ? 'Failure Mode: CHAOS ACTIVE' : 'Deterministic Path Analysis')}
              </p>
            </div>
          </div>
          {snapshot ? (
            <Button
              onClick={() => setSnapshot(null)}
              variant="ghost"
              size="sm"
              className="h-7 text-[9px] uppercase font-bold tracking-widest text-zinc-400 hover:text-black dark:hover:text-white"
            >
              <RefreshCw className="size-4" />
            </Button>
          ) : (
            <Tooltip content={isChaosMode ? "Disable Stress Test" : "Enable Chaos Mode: Deterministically inject architectural failures to test fallback UI"}>
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
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-zinc-500">Entry Point</Label>
            <Select
              value={simulationParams.startPageId}
              onValueChange={(v) => setSimulationParams({ ...simulationParams, startPageId: v || '' })}
            >
              <SelectTrigger className="bg-zinc-50 dark:bg-zinc-950 h-12! w-full! border-zinc-200 dark:border-zinc-800 rounded-none text-xs font-bold text-black dark:text-white">
                <SelectValue placeholder="Select Start Screen">
                  {pages.find(p => p.id === simulationParams.startPageId)?.title ||
                    pages.find(p => p.id === simulationParams.startPageId)?.name ||
                    "Select Start Screen"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-950 min-h-12! w-full! border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-none">
                {pages.map((p: any) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs font-bold">{p.title || p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-zinc-500">Terminal Point</Label>
            <Select
              value={simulationParams.endPageId}
              onValueChange={(v) => setSimulationParams({ ...simulationParams, endPageId: v || '' })}
            >
              <SelectTrigger className="bg-zinc-50 dark:bg-zinc-950 h-12! w-full! border-zinc-200 dark:border-zinc-800 rounded-none text-xs font-bold text-black dark:text-white">
                <SelectValue placeholder="Select End Screen">
                  {pages.find(p => p.id === simulationParams.endPageId)?.title ||
                    pages.find(p => p.id === simulationParams.endPageId)?.name ||
                    "Select End Screen"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-950 min-h-12! w-full! border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-none">
                {pages.map((p: any) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs font-bold">{p.title || p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-zinc-500">User Type</Label>
            <Select
              value={simulationParams.userTypeId}
              onValueChange={(v) => setSimulationParams({ ...simulationParams, userTypeId: v || '' })}
            >
              <SelectTrigger className="bg-zinc-50 dark:bg-zinc-950 h-12! w-full! border-zinc-200 dark:border-zinc-800 rounded-none text-xs font-bold text-black dark:text-white">
                <SelectValue placeholder="All Users">
                  {userTypes.find((ut: any) => ut.id === simulationParams.userTypeId)?.name || "All Users"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-950 min-h-12! w-full! border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-none">
                {userTypes.map((ut: any) => (
                  <SelectItem key={ut.id} value={ut.id} className="text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <div
                        className="size-1.5 rounded-full"
                        style={{ backgroundColor: ut.color || '#3f3f46' }}
                      />
                      {ut.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-600">Behavioral Storyboard</p>
              <div className="relative group">
                <Tooltip content="Natural Language Trace: Describe a user journey to visualize the logical path">
                  <textarea
                    value={narrative}
                    onChange={(e) => setNarrative(e.target.value)}
                    placeholder="e.g. User starts at Home, clicks Signup, and lands on Welcome page..."
                    className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3 text-[10px] font-medium min-h-[80px] focus:outline-none focus:border-black dark:focus:border-white transition-all resize-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                  />
                </Tooltip>
                <Button
                  onClick={handleTraceNarrative}
                  className="absolute bottom-2 right-2 size-6 rounded-none bg-black dark:bg-white text-white dark:text-black opacity-0 group-hover:opacity-100 transition-opacity"
                  size="icon"
                >
                  <ArrowRight className="size-3" />
                </Button>
              </div>
            </div>
          </div>

          <Button
            onClick={runFlowSimulation}
            className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-none text-xs font-bold transition-all"
          >
            Run Flow
          </Button>
        </div>

        {activePath.length > 0 && (
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-400 dark:text-zinc-500">
              <span>Page length</span>
              <span className="text-black dark:text-white">{activePath.length} steps</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
