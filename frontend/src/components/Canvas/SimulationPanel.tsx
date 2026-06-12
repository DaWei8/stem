import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AlertCircle, AlertTriangle, RefreshCw, Square } from "lucide-react";

export function SimulationPanel({
  isChaosMode,
  toggleChaosMode,
  simulationParams,
  setSimulationParams,
  pages,
  userTypes,
  runFlowSimulation,
  stopSimulation,
  activePath,
  simulationStatus,
  simulationLogs,
}: {
  snapshot: any;
  setSnapshot: (val: any) => void;
  isChaosMode: boolean;
  toggleChaosMode: () => void;
  simulationParams: any;
  setSimulationParams: (val: any) => void;
  pages: any[];
  userTypes: any[];
  runFlowSimulation: () => void;
  stopSimulation: () => void;
  activePath: any[];
  simulationStatus: "idle" | "running" | "path_found" | "path_not_found";
  simulationLogs: string[];
  simulationStep: number;
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
                {simulationStatus === "running"
                  ? "Tracing Architecture..."
                  : simulationStatus === "path_found"
                    ? "Baseline Verified"
                    : "Path Analysis"}
              </p>
            </div>
          </div>
          <Tooltip
            content={
              isChaosMode
                ? "Disable Stress Test"
                : "Enable Chaos Mode: Inject failures"
            }
          >
            <Button
              onClick={toggleChaosMode}
              size="icon"
              className={cn(
                "size-8 rounded-md transition-all",
                isChaosMode
                  ? "bg-red-500 text-white"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400",
              )}
            >
              <AlertTriangle className="size-4" />
            </Button>
          </Tooltip>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-zinc-500">
                Origin
              </Label>
              <Select
                value={simulationParams.startPageId}
                onValueChange={(v) =>
                  setSimulationParams({
                    ...simulationParams,
                    startPageId: v || "",
                  })
                }
              >
                <SelectTrigger className="bg-zinc-50 dark:bg-zinc-950 h-10 w-full border-zinc-200 dark:border-zinc-800 rounded-md text-[10px] font-bold">
                  <SelectValue placeholder="Start">
                    {simulationParams.startPageId
                      ? pages.find(
                          (p: any) => p.id === simulationParams.startPageId,
                        )?.title ||
                        pages.find(
                          (p: any) => p.id === simulationParams.startPageId,
                        )?.name
                      : "Start"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-md">
                  {pages.map((p: any) => (
                    <SelectItem
                      key={p.id}
                      value={p.id}
                      className="text-[10px] font-bold"
                    >
                      {p.title || p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-zinc-500">
                Terminal
              </Label>
              <Select
                value={simulationParams.endPageId}
                onValueChange={(v) =>
                  setSimulationParams({
                    ...simulationParams,
                    endPageId: v || "",
                  })
                }
              >
                <SelectTrigger className="bg-zinc-50 dark:bg-zinc-950 h-10 w-full border-zinc-200 dark:border-zinc-800 rounded-md text-[10px] font-bold">
                  <SelectValue placeholder="End">
                    {simulationParams.endPageId
                      ? pages.find(
                          (p: any) => p.id === simulationParams.endPageId,
                        )?.title ||
                        pages.find(
                          (p: any) => p.id === simulationParams.endPageId,
                        )?.name
                      : "End"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-md">
                  {pages.map((p: any) => (
                    <SelectItem
                      key={p.id}
                      value={p.id}
                      className="text-[10px] font-bold"
                    >
                      {p.title || p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black text-zinc-500">
              Agent Identity / Persona
            </Label>
            <Select
              value={
                simulationParams.userTypeId
                  ? simulationParams.personaInstanceId &&
                    simulationParams.personaInstanceId !== "default"
                    ? `instance_${simulationParams.userTypeId}_${simulationParams.personaInstanceId}`
                    : `role_${simulationParams.userTypeId}`
                  : ""
              }
              onValueChange={(val) => {
                if (!val) {
                  setSimulationParams({
                    ...simulationParams,
                    userTypeId: "",
                    personaInstanceId: "default",
                  });
                  return;
                }
                if (val.startsWith("role_")) {
                  const uId = val.replace("role_", "");
                  setSimulationParams({
                    ...simulationParams,
                    userTypeId: uId,
                    personaInstanceId: "default",
                  });
                } else if (val.startsWith("instance_")) {
                  const parts = val.replace("instance_", "").split("_");
                  const uId = parts[0];
                  const instId = parts[1];
                  setSimulationParams({
                    ...simulationParams,
                    userTypeId: uId,
                    personaInstanceId: instId,
                  });
                }
              }}
            >
              <SelectTrigger className="bg-zinc-50 dark:bg-zinc-950 h-10 w-full border-zinc-200 dark:border-zinc-800 rounded-md text-[10px] font-bold">
                <SelectValue placeholder="Default Permission Set">
                  {(() => {
                    if (!simulationParams.userTypeId)
                      return "Default Permission Set";
                    const ut = userTypes.find(
                      (u: any) => u.id === simulationParams.userTypeId,
                    );
                    if (!ut) return "Default Permission Set";
                    if (
                      simulationParams.personaInstanceId &&
                      simulationParams.personaInstanceId !== "default"
                    ) {
                      const inst = ut.persona?.instances?.find(
                        (i: any) => i.id === simulationParams.personaInstanceId,
                      );
                      return inst
                        ? `${ut.name} (Instance: ${inst.name})`
                        : ut.name;
                    }
                    return `${ut.name} (Base Role)`;
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-md max-h-60 overflow-y-auto">
                {userTypes.map((ut: any) => {
                  const hasInstances =
                    ut.persona?.instances && ut.persona.instances.length > 0;
                  return (
                    <SelectGroup key={ut.id}>
                      <SelectLabel className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-500 bg-zinc-50/50 dark:bg-zinc-950 px-2 py-1 border-b border-zinc-150 dark:border-zinc-900 mt-1 first:mt-0">
                        {ut.name}
                      </SelectLabel>
                      <SelectItem
                        value={`role_${ut.id}`}
                        className="text-[10px] font-bold pl-4"
                      >
                        Default {ut.name} (Base Role)
                      </SelectItem>
                      {hasInstances &&
                        ut.persona.instances.map((inst: any) => (
                          <SelectItem
                            key={inst.id}
                            value={`instance_${ut.id}_${inst.id}`}
                            className="text-[10px] font-semibold pl-4"
                          >
                            ↳ {inst.name}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Combined Behavioral Storyboard & Architectural Trace */}
          <div className="bg-zinc-950 p-3.5 h-48 overflow-y-auto custom-scrollbar border border-zinc-850 rounded-md">
            <div className="flex items-center gap-2 mb-3 text-zinc-400 border-b border-zinc-900 pb-1.5 select-none">
              <RefreshCw
                className={cn(
                  "size-2.5",
                  simulationStatus === "running" && "animate-spin",
                )}
              />
              <span className="text-[9px] font-black tracking-widest uppercase">
                Combined Flow & Trace Log
              </span>
            </div>
            <div className="space-y-3">
              {simulationLogs.map((log, i) => {
                const isLatest = i === simulationLogs.length - 1;
                if (log.startsWith("STORY: ")) {
                  const content = log.replace("STORY: ", "");
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex items-start gap-2 text-[10px] leading-relaxed transition-all",
                        isLatest
                          ? "text-blue-400 dark:text-blue-300 font-bold"
                          : "text-zinc-300 dark:text-zinc-400",
                      )}
                    >
                      <span className="size-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0 animate-pulse" />
                      <div>{content}</div>
                    </div>
                  );
                } else if (log.startsWith("VIOLATION: ")) {
                  const content = log.replace("VIOLATION: ", "");
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-[9px] font-mono text-red-500 border border-red-500/10 bg-red-500/5 p-1.5 rounded leading-normal"
                    >
                      <AlertCircle className="size-3 mt-0.5 shrink-0" />
                      <div>{content}</div>
                    </div>
                  );
                } else {
                  // TRACE
                  const content = log.startsWith("TRACE: ")
                    ? log.replace("TRACE: ", "")
                    : log;
                  return (
                    <div
                      key={i}
                      className={cn(
                        "font-mono text-[8.5px] leading-normal pl-3 border-l border-zinc-850",
                        isLatest
                          ? "text-zinc-100 font-semibold"
                          : "text-zinc-550 dark:text-zinc-500",
                      )}
                    >
                      {content}
                    </div>
                  );
                }
              })}
              {simulationLogs.length === 0 && (
                <div className="text-zinc-700 italic text-[10px] select-none text-center py-6">
                  Select parameters and trigger simulation...
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={runFlowSimulation}
              disabled={simulationStatus === "running"}
              className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-md text-[10px] font-black  tracking-widest h-11 transition-all"
            >
              {simulationStatus === "running" ? "Tracing..." : "Run Simulation"}
            </Button>
            {(simulationStatus === "running" || activePath.length > 0) && (
              <Button
                onClick={stopSimulation}
                className="bg-red-600 hover:bg-red-700 text-white rounded-md text-[10px] font-black tracking-widest h-11 px-4 transition-all"
              >
                <Square className="size-3 fill-white" />
              </Button>
            )}
          </div>
        </div>

        {activePath.length > 0 && (
          <div className="pt-2 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-zinc-500  tracking-widest">
                Complexity Index
              </span>
              <span className="text-xs font-bold text-black dark:text-white">
                {activePath.length} Hops
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-zinc-500  tracking-widest">
                Estimated Latency
              </span>
              <span
                className={cn(
                  "text-xs font-bold",
                  activePath.length <= 3
                    ? "text-green-500"
                    : activePath.length <= 5
                      ? "text-amber-400"
                      : "text-red-400",
                )}
              >
                {(activePath.length * 35).toFixed(0)}ms
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
