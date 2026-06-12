"use client";

import { Sidebar } from "@/components/Sidebar/Sidebar";
import { useUI } from "@/hooks/useUI";
import { cn } from "@/lib/utils";
import { PanelLeftClose, PanelRightClose, Terminal } from "lucide-react";
import { motion } from "framer-motion";

export default function ProjectEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarVisible, toggleSidebar } = useUI();

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50 dark:bg-black text-white selection:bg-white/20">
      {/* Sidebar Container */}
      <motion.div
        initial={false}
        animate={{ width: sidebarVisible ? 240 : 64 }}
        className="flex flex-col relative z-30"
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-4 bg-white dark:bg-zinc-950 overflow-hidden">
          <div className="flex items-center gap-3 w-full overflow-hidden">
            <div className="size-8 bg-white flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <Terminal className="size-4 text-black" />
            </div>
            {sidebarVisible && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <h1 className="text-xl font-heading font-black text-black dark:text-white tracking-tighter leading-none">
                  Stem
                </h1>
              </motion.div>
            )}
          </div>

          <button
            onClick={toggleSidebar}
            className={cn(
              "absolute right-2 flex items-center justify-center size-8 text-zinc-600 hover:text-white hover:bg-black transition-all duration-300 group rounded-md border border-transparent hover:border-zinc-800",
              !sidebarVisible && "right-1/2 translate-x-1/2",
            )}
            title={sidebarVisible ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {sidebarVisible ? (
              <PanelLeftClose className="size-3.5" />
            ) : (
              <PanelRightClose className="size-3.5" />
            )}
          </button>
        </div>
        <Sidebar />
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-200 dark:bg-zinc-100">
        <div className="flex-1 overflow-auto custom-scrollbar relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0,transparent_100%)] pointer-events-none" />
          {children}
        </div>
      </div>
    </div>
  );
}
