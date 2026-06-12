"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Trash2,
  Play,
  Loader2,
  Bug,
  Info,
  CheckCircle2,
  Shield,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Lock,
} from "lucide-react";
import { useProjectRole } from "@/hooks/useProjectRole";
import { cn } from "@/lib/utils";
import { useUI } from "@/hooks/useUI";
import { useProjects } from "@/hooks/useProjects";
import { usePages } from "@/hooks/usePages";
import { useDatabase } from "@/hooks/useDatabase";
import { useIdentity } from "@/hooks/useIdentity";
import { useVariables } from "@/hooks/useVariables";
import { useSecurityAudit, DeterministicFlaw } from "@/hooks/useSecurityAudit";
import { DocMarkdownRenderer } from "./documentation/DocMarkdownRenderer";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function SecurityAuditView() {
  const { currentProject } = useProjects();
  const { isViewer } = useProjectRole();
  const { pages, transitions, inputs, actions, outputs } = usePages();
  const { tables, columns } = useDatabase();
  const { userTypes, policies } = useIdentity();
  const { variables } = useVariables();

  const {
    audits,
    activeAuditId,
    localFlaws,
    isLoading,
    isGenerating,
    fetchAudits,
    runLocalScan,
    runAIAudit,
    deleteAudit,
    setActiveAuditId,
  } = useSecurityAudit();

  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [filterSeverity, setFilterSeverity] = useState<
    "all" | "critical" | "warning" | "optimization"
  >("all");
  const [expandedFlawId, setExpandedFlawId] = useState<string | null>(null);

  // 1. Load database logs on mount/project change
  useEffect(() => {
    if (currentProject?.id) {
      fetchAudits(currentProject.id);
    }
  }, [currentProject?.id, fetchAudits]);

  // 2. Build local snapshot and scan for structural flaws
  const projectSnapshot = useMemo(() => {
    return {
      pages,
      transitions,
      inputs,
      actions,
      outputs,
      tables,
      columns,
      userTypes,
      policies,
      variables,
    };
  }, [
    pages,
    transitions,
    inputs,
    actions,
    outputs,
    tables,
    columns,
    userTypes,
    policies,
    variables,
  ]);

  useEffect(() => {
    if (currentProject?.id) {
      runLocalScan(projectSnapshot);
    }
  }, [projectSnapshot, currentProject?.id, runLocalScan]);

  const activeAudit = useMemo(() => {
    return audits.find((a) => a.id === activeAuditId) || audits[0] || null;
  }, [audits, activeAuditId]);

  // 3. Filter flaws by severity
  const filteredFlaws = useMemo(() => {
    if (filterSeverity === "all") return localFlaws;
    return localFlaws.filter((f) => f.severity === filterSeverity);
  }, [localFlaws, filterSeverity]);

  const flawsStats = useMemo(() => {
    return {
      total: localFlaws.length,
      critical: localFlaws.filter((f) => f.severity === "critical").length,
      warning: localFlaws.filter((f) => f.severity === "warning").length,
      optimization: localFlaws.filter((f) => f.severity === "optimization")
        .length,
    };
  }, [localFlaws]);

  const handleRunAIAudit = () => {
    runAIAudit(projectSnapshot, selectedModel);
  };

  const toggleFlawExpand = (id: string) => {
    setExpandedFlawId((prev) => (prev === id ? null : id));
  };

  const getSeverityBadgeClass = (
    severity: "critical" | "warning" | "optimization",
  ) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "warning":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "optimization":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    return "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800";
  };

  return (
    <div className="h-full bg-white dark:bg-black p-8 overflow-y-auto custom-scrollbar transition-colors duration-300">
      <div className="w-full mx-auto space-y-8 pb-20">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 dark:border-zinc-900 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="size-8 bg-black dark:bg-white flex items-center justify-center">
                <Shield className="size-4 text-white dark:text-black" />
              </div>
              <h1 className="text-3xl font-black tracking-tighter text-black dark:text-white">
                Security & Vulnerability Audit
              </h1>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
              Validate system logic gates, row-level database security policies,
              and run deep AI threat-vector scans for{" "}
              <span className="text-black dark:text-white font-bold">
                {currentProject?.name || "System"}
              </span>
              .
            </p>
          </div>
        </header>

        {/* Audit Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel: Local Scanner Flaws Repository */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-900/60 p-4 rounded-xl">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-black dark:text-white flex items-center gap-2">
                  <Bug className="size-4 text-red-500" /> Flaw Registry & Local
                  Scanner
                </h2>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                  Deterministic check results computed directly from active
                  components.
                </p>
              </div>

              {/* Severity Metrics Quick Badges */}
              <div className="flex gap-2 text-[10px] font-black uppercase">
                <button
                  onClick={() => setFilterSeverity("all")}
                  className={cn(
                    "px-2.5 py-1 rounded border transition-all",
                    filterSeverity === "all"
                      ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500",
                  )}
                >
                  All ({flawsStats.total})
                </button>
                <button
                  onClick={() => setFilterSeverity("critical")}
                  className={cn(
                    "px-2.5 py-1 rounded border transition-all",
                    filterSeverity === "critical"
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-red-500/5 border-red-500/10 text-red-500",
                  )}
                >
                  Critical ({flawsStats.critical})
                </button>
                <button
                  onClick={() => setFilterSeverity("warning")}
                  className={cn(
                    "px-2.5 py-1 rounded border transition-all",
                    filterSeverity === "warning"
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-amber-500/5 border-amber-500/10 text-amber-500",
                  )}
                >
                  Warning ({flawsStats.warning})
                </button>
                <button
                  onClick={() => setFilterSeverity("optimization")}
                  className={cn(
                    "px-2.5 py-1 rounded border transition-all",
                    filterSeverity === "optimization"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-blue-500/5 border-blue-500/10 text-blue-500",
                  )}
                >
                  Optimization ({flawsStats.optimization})
                </button>
              </div>
            </div>

            {/* List of deterministic flaws */}
            <div className="space-y-4">
              {filteredFlaws.length > 0 ? (
                filteredFlaws.map((flaw) => {
                  const isExpanded = expandedFlawId === flaw.id;
                  return (
                    <div
                      key={flaw.id}
                      className={cn(
                        "border rounded-xl transition-all overflow-hidden",
                        flaw.severity === "critical"
                          ? "border-red-500/10 dark:border-red-500/5 bg-red-500/[0.01] hover:border-red-500/20"
                          : flaw.severity === "warning"
                            ? "border-amber-500/10 dark:border-amber-500/5 bg-amber-500/[0.01] hover:border-amber-500/20"
                            : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/20 hover:border-zinc-300 dark:hover:border-zinc-700",
                      )}
                    >
                      {/* Header block of flaw item */}
                      <div
                        onClick={() => toggleFlawExpand(flaw.id)}
                        className="p-4 flex items-start justify-between gap-4 cursor-pointer select-none"
                      >
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border font-mono",
                                getSeverityBadgeClass(flaw.severity),
                              )}
                            >
                              {flaw.severity}
                            </span>
                            <span
                              className={cn(
                                "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border font-mono",
                                getCategoryBadgeClass(flaw.category),
                              )}
                            >
                              {flaw.category}
                            </span>
                            {flaw.setupsAffected.map((setup, idx) => (
                              <span
                                key={idx}
                                className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1 font-mono"
                              >
                                • {setup}
                              </span>
                            ))}
                          </div>
                          <h3 className="text-xs font-black text-black dark:text-white tracking-tight leading-snug">
                            {flaw.title}
                          </h3>
                        </div>

                        <div className="text-zinc-400 dark:text-zinc-600 mt-1">
                          {isExpanded ? (
                            <ChevronUp className="size-4" />
                          ) : (
                            <ChevronDown className="size-4" />
                          )}
                        </div>
                      </div>

                      {/* Expandable Flaw Details */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/[0.3] dark:bg-zinc-950/10"
                          >
                            <div className="p-4 space-y-4 text-[11px] leading-relaxed">
                              <div className="space-y-1">
                                <h4 className="font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-[9px]">
                                  Vulnerability Details
                                </h4>
                                <p className="text-zinc-600 dark:text-zinc-400 font-medium">
                                  {flaw.description}
                                </p>
                              </div>
                              <div className="p-3.5 bg-zinc-100/50 dark:bg-zinc-950/60 border border-zinc-150 dark:border-zinc-850 rounded-lg space-y-2">
                                <h4 className="font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-[9px] flex items-center gap-1.5">
                                  <CheckCircle2 className="size-3 text-green-500" />{" "}
                                  Suggested Remedy
                                </h4>
                                <p className="text-zinc-600 dark:text-zinc-400 font-medium font-mono text-[10px]">
                                  {flaw.remedy}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              ) : (
                <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-3 bg-zinc-50/10 dark:bg-zinc-950/5 select-none">
                  <ShieldCheck className="size-8 text-green-500 animate-pulse" />
                  <div>
                    <h3 className="text-lg font-black text-black dark:text-white">
                      System Architecture Validated
                    </h3>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium mt-1">
                      No deterministic security gaps detected at this level of
                      testing.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: AI Security Auditor Panel */}
          <div className="space-y-6 lg:border-l lg:border-zinc-100 lg:dark:border-zinc-900 lg:pl-8">
            {/* Run Audit Controls Card */}
            <div className="p-6 rounded-xl border border-purple-500/20 dark:border-purple-500/10 bg-purple-50/5 dark:bg-purple-950/5 shadow-lg shadow-purple-500/5 relative overflow-hidden space-y-4 select-none">
              <div className="absolute -top-10 -right-10 size-28 bg-purple-500/10 dark:bg-purple-500/5 blur-2xl rounded-full" />

              <div className="flex items-center gap-2 relative z-10">
                <h3 className="text-lg font-black text-purple-600 dark:text-purple-400">
                  AI Threat Audit
                </h3>
              </div>

              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium leading-relaxed">
                Compile and export your full deterministic blueprint to evaluate
                access bypass vectors, logic flaws, and database leakage risks.
              </p>

              {/* Model selection */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-black text-zinc-400 dark:text-zinc-500">
                  Select AI Model
                </label>
                <select
                  value={selectedModel}
                  disabled={isViewer}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-white dark:bg-black border h-12 border-zinc-200 dark:border-zinc-800 rounded-md p-2 text-xs font-bold text-black dark:text-white focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                  <option value="gpt-4o">GPT-4o (Premium)</option>
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                </select>
              </div>

              <Button
                disabled={isGenerating || isViewer}
                onClick={handleRunAIAudit}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm h-12 px-4 rounded-md gap-2 transition-colors relative z-10"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" /> Analyzing
                    blueprints...
                  </>
                ) : isViewer ? (
                  <>
                    <Lock className="size-3.5" /> View Only Mode
                  </>
                ) : (
                  <>
                    <Play className="size-3.5" /> Run AI Security Audit
                  </>
                )}
              </Button>
            </div>

            {/* Historical Reports Dropdown */}
            {audits.length > 0 && (
              <div className="space-y-2 select-none">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
                    Reports Log ({audits.length})
                  </label>
                  {activeAuditId && !isViewer && (
                    <button
                      onClick={() => deleteAudit(activeAuditId)}
                      className="text-[9px] font-black text-red-500 hover:text-red-600 uppercase tracking-wider flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="size-3" /> Delete Active
                    </button>
                  )}
                </div>
                <select
                  value={activeAuditId}
                  onChange={(e) => setActiveAuditId(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-2.5 text-[10.5px] font-bold text-zinc-600 dark:text-zinc-300 focus:outline-none transition-colors"
                >
                  {audits.map((report) => (
                    <option key={report.id} value={report.id}>
                      {new Date(report.created_at).toLocaleString()} (Flaws:{" "}
                      {report.flaws_count})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Render selected AI Report */}
            {activeAudit ? (
              <div className="space-y-4">
                <div className="border border-zinc-100 dark:border-zinc-900/60 p-6 bg-zinc-50/20 dark:bg-zinc-950/5 rounded-xl min-h-[400px]">
                  <DocMarkdownRenderer content={activeAudit.report_content} />
                </div>
              </div>
            ) : (
              !isGenerating && (
                <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-3 bg-zinc-50/10 dark:bg-zinc-950/5 select-none">
                  <Info className="size-6 text-zinc-400 dark:text-zinc-600" />
                  <div>
                    <h3 className="text-sm font-black text-zinc-400 dark:text-zinc-300">
                      No AI reports generated
                    </h3>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium mt-1 leading-relaxed">
                      Click the purple button above to initiate a deep security
                      audit report.
                    </p>
                  </div>
                </div>
              )
            )}

            {isGenerating && (
              <div className="border border-dashed border-purple-500/20 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-3 bg-purple-50/[0.02] dark:bg-purple-950/[0.02] animate-pulse select-none">
                <Loader2 className="size-6 text-purple-500 animate-spin" />
                <div>
                  <h3 className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    Generative Audit Active
                  </h3>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium mt-1 leading-relaxed">
                    AI is inspecting access policies, transitions, variables,
                    and Tauri bindings. This may take up to a minute...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
