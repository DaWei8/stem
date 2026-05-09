'use client'

import {
  Users,
  Database,
  Code2,
  Palette,
  LayoutTemplate,
  Settings,
  HelpCircle,
  Brain,
  Activity,
  Box,
  Download
} from 'lucide-react'
import { useUI, PillarView } from '@/hooks/useUI'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ModeSwitcher } from '../layout/ModeSwitcher'

export function Sidebar() {
  const { activeView, setActiveView, sidebarVisible } = useUI()

  const pillars = [
    { id: 'flows', name: 'UI Flows', icon: LayoutTemplate, description: 'User journeys' },
    { id: 'design', name: 'Design System', icon: Palette, description: 'Visual tokens' },
    { id: 'schema', name: 'Schema Design', icon: Database, description: 'Data structures' },
    { id: 'logic', name: 'Logic Layer', icon: Code2, description: 'Cloud functions' },
    { id: 'identity', name: 'User Types', icon: Users, description: 'Permission model' },
    { id: 'registry', name: 'Variable Registry', icon: Brain, description: 'Global state' },
  ]

  // export .stem files and manage coolaborators
  const secondaryActions = [
    { id: 'export', name: 'Export', icon: Download, description: 'Export your stem file' },
    { id: 'collaborators', name: 'Collaborators', icon: Users, description: 'Manage collaborators' },
  ]

  return (
    <div className="flex flex-col w-full h-full bg-black">
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-6 custom-scrollbar">
        {
          sidebarVisible && <ModeSwitcher />
        }
        <div className="space-y-8">
          {/* Main Pillars */}
          <nav className="px-3">
            {pillars.map((item) => {
              const Icon = item.icon
              const isActive = activeView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as PillarView)}
                  className={cn(
                    "relative flex items-center w-full transition-all duration-200 group rounded-none",
                    sidebarVisible ? "px-4 py-3.5 gap-4" : "px-0 py-4 justify-center",
                    isActive
                      ? "bg-white text-black"
                      : "text-zinc-500 hover:text-white hover:bg-black/50"
                  )}
                >
                  <Icon className={cn(
                    "size-4 shrink-0 transition-all duration-300",
                    isActive ? "text-black scale-110" : "text-zinc-500 group-hover:text-zinc-300"
                  )} />

                  {sidebarVisible && (
                    <div className="flex flex-col items-start overflow-hidden">
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs font-black tracking-tight whitespace-nowrap"
                      >
                        {item.name}
                      </motion.span>
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.9 }}
                        className={cn("text-[10px] font-medium  whitespace-nowrap", isActive ? "text-black" : "text-zinc-500")}
                      >
                        {item.description}
                      </motion.span>
                    </div>
                  )}

                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-glow"
                      className="absolute inset-0 bg-white shadow-[0_0_20px_rgba(255,255,255,0.15)] z-[-1]"
                    />
                  )}
                </button>
              )
            })}
          </nav>

          {/* Secondary Actions */}
          <nav className="px-3 space-y-1">
            <div className={cn(
              "mb-4 px-4 transition-opacity",
              !sidebarVisible && "opacity-0"
            )}>
              <span className="text-[10px] font-black text-zinc-700 tracking-widest uppercase">System</span>
            </div>
            {secondaryActions.map((item) => {
              const Icon = item.icon
              const isActive = activeView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as PillarView)}
                  className={cn(
                    "flex items-center w-full transition-all duration-200 group rounded-none relative",
                    sidebarVisible ? "px-4 py-3 gap-4" : "px-0 py-4 justify-center",
                    isActive
                      ? "bg-white text-black"
                      : "text-zinc-500 hover:text-white hover:bg-black/50"
                  )}
                >
                  <Icon className={cn(
                    "size-4 shrink-0 transition-colors duration-300",
                    isActive ? "text-black" : "text-zinc-600 group-hover:text-zinc-300"
                  )} />
                  {sidebarVisible && (
                    <span className="text-xs font-bold tracking-tight whitespace-nowrap">{item.name}</span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-glow"
                      className="absolute inset-0 bg-white z-[-1]"
                    />
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      <div className={cn(
        "p-4 border-t border-zinc-800/50 space-y-1 bg-black/40 backdrop-blur-md",
        !sidebarVisible && "flex flex-col items-center"
      )}>
        <Link
          href="/projects/help"
          className={cn(
            "flex items-center w-full transition-all duration-300 group",
            sidebarVisible ? "px-4 py-2 gap-4" : "p-2 justify-center"
          )}
          title="Help & Documentation"
        >
          <HelpCircle className="size-4 text-zinc-600 group-hover:text-white transition-colors" />
          {sidebarVisible && <span className="text-[11px] font-bold text-zinc-500 group-hover:text-white transition-colors">Support Registry</span>}
        </Link>
      </div>
    </div>
  )
}
