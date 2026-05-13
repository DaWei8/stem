import { Button } from '@/components/ui/button'
import { Plus, ShieldAlert, History as HistoryIcon, Cpu, Play, Eye } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useIdentity } from '@/hooks/useIdentity'
import { useUI } from '@/hooks/useUI'
import { Tooltip } from '@/components/ui/Tooltip'

export function CanvasToolbar({
  onAddScreen,
  onValidate,
  onCreateSnapshot,
  toggleSimulation,
  isSimulating,
  isLoaded
}: {
  onAddScreen: () => void
  onValidate: () => void
  onCreateSnapshot: () => void
  toggleSimulation: () => void
  isSimulating: boolean
  isLoaded: boolean
}) {
  const { userTypes } = useIdentity()
  const { viewAsUserTypeId, setViewAsUserTypeId } = useUI()

  return (
    <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
      <div className="flex items-center gap-1 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <Tooltip content="Permission Heatmap: View the system as a specific user role">
          <Select
            value={viewAsUserTypeId || 'none'}
            onValueChange={(v) => setViewAsUserTypeId(v === 'none' ? null : v)}
          >
            <SelectTrigger className="h-8 w-[140px] border-none bg-transparent rounded-none text-xs font-bold text-zinc-500 focus:ring-0">
              <Eye className="size-3 mr-2 text-zinc-400" />
              <SelectValue placeholder="View As Role" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-950 text-black dark:text-white rounded-none border-zinc-200 dark:border-zinc-800">
              <SelectItem value="none" className="text-xs font-bold text-zinc-500">All Roles</SelectItem>
              {userTypes.map((ut: any) => (
                <SelectItem key={ut.id} value={ut.id} className="text-xs font-bold">{ut.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Tooltip>
      </div>

      <div className="flex items-center gap-1">

        <Button
          onClick={onAddScreen}
          className="bg-white dark:bg-black text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-none transition-all h-8 px-4 text-xs font-bold border border-zinc-200 dark:border-zinc-800 shadow-sm"
        >
          <Plus className="w-3 h-3" /> Add Screen
        </Button>
        <Tooltip content="Architectural Linting: Check for orphaned screens or invalid data flows">
          <Button
            onClick={onValidate}
            className="h-8 rounded-none px-4 text-xs font-bold transition-all border bg-white dark:bg-black text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            <ShieldAlert className="w-3 h-3" /> Validate
          </Button>
        </Tooltip>
        <Tooltip content="Version Snapshot: Save a read-only checkpoint of the current system state">
          <Button
            onClick={onCreateSnapshot}
            className="h-8 rounded-none px-4 text-xs font-bold transition-all border bg-white dark:bg-black text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            <HistoryIcon className="w-3 h-3" /> Snapshot
          </Button>
        </Tooltip>

        <Tooltip content={isSimulating ? "Terminate Simulation" : "Run Flow Simulation: Deterministically test the path between two screens"}>
          <Button
            onClick={toggleSimulation}
            className={`h-8 rounded-none px-4 text-xs font-bold transition-all border ${isSimulating
              ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-lg'
              : 'bg-white dark:bg-black text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 shadow-sm'
              }`}
          >
            {isSimulating ? (
              <><Cpu className="w-3 h-3" /> Stop Sim</>
            ) : (
              <><Play className="w-3 h-3" />Test Flow</>
            )}
            <div className={`size-1.5 rounded-full ml-1 ${isLoaded ? 'bg-green-500' : 'bg-yellow-500'}`} />
          </Button>
        </Tooltip>
      </div>
    </div>
  )
}
