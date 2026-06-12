"use client";

import { useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { useCollaborators } from "@/hooks/useCollaborators";
import { useDatabase } from "@/hooks/useDatabase";
import { useDesignSystem } from "@/hooks/useDesignSystem";
import { useIdentity } from "@/hooks/useIdentity";
import { useLogic } from "@/hooks/useLogic";
import { useObservability } from "@/hooks/useObservability";
import { usePages } from "@/hooks/usePages";
import { PillarView, useUI } from "@/hooks/useUI";
import { useVariables } from "@/hooks/useVariables";
import { cn } from "@/lib/utils";
import {
  Activity,
  ArrowRight,
  Brain,
  CheckCircle,
  ChevronRight,
  Database,
  Download,
  History,
  LayoutTemplate,
  Palette,
  Share2,
  Shield,
  Users,
} from "lucide-react";
import { Button } from "../ui/button";

export function OverviewView() {
  const { setActiveView } = useUI();
  const { currentProject, updateProject } = useProjects();
  const { pages, transitions } = usePages();
  const { variables } = useVariables();
  const { tables, columns } = useDatabase();
  const { userTypes, policies } = useIdentity();
  const { constants, functions } = useLogic();
  const { tokens, components } = useDesignSystem();
  const { collaborators, invites } = useCollaborators();
  const { latencyModels, bottlenecks } = useObservability();
  const { logs } = useActivityLogs();

  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editDescValue, setEditDescValue] = useState("");

  const handleSaveDescription = async () => {
    if (currentProject) {
      await updateProject(currentProject.id, { description: editDescValue });
      setIsEditingDesc(false);
    }
  };

  const activeInvitesCount = invites.filter(
    (i) => i.status === "pending",
  ).length;
  const rolesCount = userTypes.length;
  const personasCount = userTypes.reduce(
    (acc, ut) => acc + (ut.persona?.instances?.length || 0),
    0,
  );

  const stats = [
    {
      title: "UI Flows & Canvas",
      view: "flows" as PillarView,
      icon: <LayoutTemplate className="size-5 text-blue-500" />,
      color: "from-blue-500/10 to-transparent",
      borderColor: "group-hover:border-blue-500/50",
      metrics: [
        { label: "Screens", value: pages.length },
        { label: "Transitions", value: transitions.length },
      ],
    },
    {
      title: "System Engine & Logic",
      view: "dataengine" as PillarView,
      icon: <Brain className="size-5 text-indigo-500" />,
      color: "from-indigo-500/10 to-transparent",
      borderColor: "group-hover:border-indigo-500/50",
      metrics: [
        { label: "Variables", value: variables.length },
        { label: "Constants", value: constants.length },
        { label: "Logic Functions", value: functions.length },
      ],
    },
    {
      title: "Database Schema",
      view: "dataengine" as PillarView,
      icon: <Database className="size-5 text-emerald-500" />,
      color: "from-emerald-500/10 to-transparent",
      borderColor: "group-hover:border-emerald-500/50",
      metrics: [
        { label: "Tables", value: tables.length },
        { label: "Columns", value: columns.length },
      ],
    },
    {
      title: "Design System",
      view: "design" as PillarView,
      icon: <Palette className="size-5 text-pink-500" />,
      color: "from-pink-500/10 to-transparent",
      borderColor: "group-hover:border-pink-500/50",
      metrics: [
        { label: "Visual Tokens", value: tokens.length },
        { label: "Components", value: components.length },
      ],
    },
    {
      title: "User Types & Roles",
      view: "identity" as PillarView,
      icon: <Shield className="size-5 text-amber-500" />,
      color: "from-amber-500/10 to-transparent",
      borderColor: "group-hover:border-amber-500/50",
      metrics: [
        { label: "Roles", value: rolesCount },
        { label: "Personas", value: personasCount },
        { label: "RLS Policies", value: policies.length },
      ],
    },
    {
      title: "Collaborators",
      view: "collaborators" as PillarView,
      icon: <Users className="size-5 text-purple-500" />,
      color: "from-purple-500/10 to-transparent",
      borderColor: "group-hover:border-purple-500/50",
      metrics: [
        { label: "Team Members", value: collaborators.length + 1 }, // including owner
        { label: "Pending Invites", value: activeInvitesCount },
      ],
    },
  ];

  const recentLogs = logs.slice(0, 5);

  const getActionStyles = (action: string) => {
    switch (action.toUpperCase()) {
      case "INSERT":
      case "CREATE":
        return "text-emerald-500 border-emerald-500/20 bg-emerald-500/5";
      case "UPDATE":
        return "text-blue-500 border-blue-500/20 bg-blue-500/5";
      case "DELETE":
        return "text-red-500 border-red-500/20 bg-red-500/5";
      case "COMMIT":
        return "text-purple-500 border-purple-500/20 bg-purple-500/5";
      default:
        return "text-zinc-500 border-zinc-500/20 bg-zinc-500/5";
    }
  };

  return (
    <div className="h-full w-full bg-zinc-50 dark:bg-black p-8 overflow-y-auto custom-scrollbar transition-colors duration-300">
      <div className="space-y-10 pb-20">
        {/* Dashboard Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-900">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tighter text-black dark:text-white">
              Project Dashboard
            </h1>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
              Overview of the project{" "}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setActiveView("documentation")}
              className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors h-10 px-4 text-xs font-semibold"
            >
              <Download className="size-3.5" />
              Build Documentation
            </Button>
          </div>
        </header>

        {/* Observability Quick Alert Banner */}
        {bottlenecks.filter((b) => !b.is_resolved).length > 0 && (
          <div className="p-4 border border-red-500/20 bg-red-500/5 text-red-500 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="size-4 shrink-0 animate-pulse" />
              <span className="text-[11px] font-black ">
                {bottlenecks.filter((b) => !b.is_resolved).length} Unresolved
                Bottleneck(s) Detected in Flows
              </span>
            </div>
            <button
              onClick={() => setActiveView("flows")}
              className="text-[9px] font-black hover:underline  flex items-center gap-1"
            >
              Inspect canvas <ChevronRight className="size-3" />
            </button>
          </div>
        )}

        {/* Project summary: Project description & last edited date */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-150 dark:border-zinc-900">
            <h2 className="text-lg font-black text-zinc-400 dark:text-zinc-500 ">
              Project Summary
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {/* Description card */}
            <div className="flex col-span-2 flex-col gap-2 p-3 rounded-md bg-gray-500/5 group relative min-h-[80px] transition-colors hover:bg-gray-500/10">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 leading-none">
                  Description
                </span>
                {!isEditingDesc && (
                  <button
                    onClick={() => {
                      setEditDescValue(currentProject?.description || "");
                      setIsEditingDesc(true);
                    }}
                    className="text-[10px] text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity font-bold"
                  >
                    Edit
                  </button>
                )}
              </div>
              {isEditingDesc ? (
                <div className="flex flex-col gap-2 w-full mt-1">
                  <textarea
                    value={editDescValue}
                    onChange={(e) => setEditDescValue(e.target.value)}
                    className="w-full text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-50 resize-none h-16 font-semibold"
                    placeholder="Enter project description..."
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setIsEditingDesc(false)}
                      className="px-2 py-1 text-[9px] font-black border border-zinc-200 dark:border-zinc-800 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveDescription}
                      className="px-2 py-1 text-[9px] font-black bg-black dark:bg-white text-white dark:text-black rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <span className="text-xs leading-5 text-zinc-900 dark:text-zinc-50 font-medium break-words">
                  {currentProject?.description || "No description provided."}
                </span>
              )}
            </div>

            {/* Last Edited card */}
            <div className="flex col-span-1 flex-col gap-2 p-3 rounded-md bg-gray-500/5 min-h-[80px]">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 leading-none">
                Last Edited
              </span>
              <span className="text-xs text-zinc-900 dark:text-zinc-50 font-semibold">
                {currentProject?.updated_at
                  ? new Date(currentProject.updated_at).toLocaleString(
                      undefined,
                      {
                        dateStyle: "medium",
                        timeStyle: "short",
                      },
                    )
                  : "N/A"}
              </span>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-150 dark:border-zinc-900">
            <h2 className="text-lg font-black text-zinc-400 dark:text-zinc-500 ">
              System Modules
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((card, i) => (
              <div
                key={i}
                onClick={() => setActiveView(card.view)}
                className={cn(
                  "group relative p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 cursor-pointer overflow-hidden transition-all duration-300",
                  card.borderColor,
                )}
              >
                {/* Glow Background Gradient */}
                <div
                  className={cn(
                    "absolute inset-0 bg-linear-to-br opacity-50 z-0 from-gray-500/10 to-transparent",
                  )}
                />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2 border border-zinc-150 dark:border-zinc-900 bg-zinc-50 dark:bg-black/30">
                      {card.icon}
                    </div>
                    <ArrowRight className="size-4 text-zinc-300 group-hover:text-black dark:group-hover:text-white transition-all group-hover:translate-x-1" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-black dark:text-white tracking-tight">
                      {card.title}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                    {card.metrics.map((m, j) => (
                      <div
                        key={j}
                        className="flex flex-col gap-2 p-3 rounded-md bg-gray-500/5"
                      >
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 leading-none">
                          {m.label}
                        </span>
                        <span className="text-xl font-black text-black dark:text-white mt-1 leading-none font-mono">
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity Log & Performance Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Recent Activity Logs */}
          <section className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-150 dark:border-zinc-900">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-zinc-400 dark:text-zinc-500 ">
                  Recent Project Updates
                </h2>
              </div>
              <button
                onClick={() => setActiveView("history")}
                className="text-[10px] font-black text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1 tracking-tight"
              >
                Audit Log Trail <ChevronRight className="size-3.5" />
              </button>
            </div>

            <div className="border rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 divide-y divide-zinc-200 dark:divide-zinc-900 overflow-hidden">
              {recentLogs.length === 0 ? (
                <div className="p-10 text-center text-zinc-400 dark:text-zinc-600 italic text-xs">
                  No activity logs registered yet. Make updates to see updates
                  here.
                </div>
              ) : (
                recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span
                        className={cn(
                          "px-2 py-0.5 border text-[8px] font-black  shrink-0 mt-0.5",
                          getActionStyles(log.action),
                        )}
                      >
                        {log.action}
                      </span>
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-[11px] font-black text-black dark:text-white truncate">
                          {log.details}
                        </p>
                        <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium">
                          Pillar:{" "}
                          <strong className="text-zinc-600 dark:text-zinc-400">
                            {log.part_affected}
                          </strong>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right shrink-0 text-[10px]">
                      <span className="text-zinc-500 dark:text-zinc-400 font-mono">
                        {log.user_name || log.user_email || "System"}
                      </span>
                      <span className="text-[9px] text-zinc-400 font-bold font-mono">
                        {new Date(log.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Performance & Observing Pillar Card */}
          <section className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-150 dark:border-zinc-900">
              <h2 className="text-lg font-black text-zinc-400 dark:text-zinc-500 ">
                System Observability
              </h2>
            </div>

            <div className="p-6 border rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 ">
                  Estimated Monthly Cloud Cost
                </span>
                <div className="text-2xl font-black text-black dark:text-white font-mono mt-1">
                  $0.00
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500">
                    Latency Models
                  </span>
                  <div className="text-lg font-black text-black dark:text-white font-mono">
                    {latencyModels.length}
                  </div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500">
                    Bottlenecks
                  </span>
                  <div className="text-lg font-black text-black dark:text-white font-mono">
                    {bottlenecks.length}
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-normal">
                  Observability models and cost estimation metrics are computed
                  dynamically based on logic paths.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
