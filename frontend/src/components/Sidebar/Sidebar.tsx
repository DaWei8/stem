'use client'
import { useEffect } from 'react'

import {
  Users,
  Database,
  Code2,
  Palette,
  LayoutTemplate,
  HelpCircle,
  Brain,
  Download,
  FileText,
  Activity,
  GitBranch,
  LayoutGrid,
  History,
  ShieldAlert
} from 'lucide-react'
import { useUI, PillarView } from '@/hooks/useUI'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ModeSwitcher } from '../layout/ModeSwitcher'

const allPillars = [
  { id: 'overview', name: 'Dashboard', icon: LayoutGrid, description: 'Project overview', modes: ['architect', 'design', 'dev'] },
  { id: 'flows', name: 'UI Flows', icon: LayoutTemplate, description: 'User journeys', modes: ['architect', 'design'] },
  { id: 'design', name: 'Design System', icon: Palette, description: 'Visual tokens', modes: ['architect', 'design'] },
  { id: 'dataengine', name: 'System Engine', icon: Brain, description: 'Logic & Schema', modes: ['architect', 'dev', 'design'] },
  { id: 'identity', name: 'User Types', icon: Users, description: 'Permission model', modes: ['architect', 'dev'] }
]

const secondaryActions = [
  { id: 'documentation', name: 'Docs & Assets', icon: FileText, description: 'Specs & Blueprints' },
  { id: 'audit', name: 'Security Audit', icon: ShieldAlert, description: 'Threat model & flaws' },
  { id: 'collaborators', name: 'Collaborators', icon: Users, description: 'Manage collaborators' },
  { id: 'history', name: 'Activity Log', icon: History, description: 'Audit trail & logs' }
]

export function Sidebar() {
  const { activeView, setActiveView, sidebarVisible, activeMode } = useUI()

  const pillars = allPillars.filter(p => p.modes.includes(activeMode))

  useEffect(() => {
    const isPillarAvailable = pillars.some(p => p.id === activeView)
    const isSecondaryAction = secondaryActions.some(a => a.id === activeView)

    if (!isPillarAvailable && !isSecondaryAction && pillars.length > 0) {
      setActiveView(pillars[0].id as PillarView)
    }
  }, [activeMode, activeView, setActiveView])

  return (
    <div className="flex flex-col w-full h-full bg-zinc-100 dark:bg-black transition-colors duration-300">
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-6 custom-scrollbar">
        {
          sidebarVisible && <ModeSwitcher />
        }
        <div className="space-y-5">
          {/* Main Pillars */}
          <nav className="px-3 space-y-1">
            {pillars.map((item) => {
              const Icon = item.icon
              const isActive = activeView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as PillarView)}
                  className={cn(
                    "relative flex items-center w-full transition-all duration-200 group rounded-md",
                    sidebarVisible ? "px-4 py-3.5 gap-4" : "px-0 py-3 justify-center",
                    isActive
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
                  )}
                >
                  <Icon className={cn(
                    "size-4 shrink-0 transition-all duration-300",
                    isActive
                      ? "text-white dark:text-black scale-110"
                      : "text-zinc-500 group-hover:text-zinc-400 dark:group-hover:text-zinc-300"
                  )} />

                  {sidebarVisible && (
                    <div className="flex flex-col items-start overflow-hidden">
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs font-black whitespace-nowrap"
                      >
                        {item.name}
                      </motion.span>
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.9 }}
                        className={cn("text-[10px] whitespace-nowrap", isActive ? "text-white dark:text-black" : "text-zinc-700 dark:text-zinc-300")}
                      >
                        {item.description}
                      </motion.span>
                    </div>
                  )}

                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-glow"
                      className="absolute inset-0 bg-white shadow-[0_0_20px_rgba(255,255,255,0.15)] z-[-1] rounded-md"
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
              <span className="text-[10px] font-black text-zinc-700 tracking-widest ">System</span>
            </div>
            {secondaryActions.map((item) => {
              const Icon = item.icon
              const isActive = activeView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as PillarView)}
                  className={cn(
                    "flex items-center w-full transition-all duration-200 group rounded-md relative",
                    sidebarVisible ? "px-4 py-3 gap-4" : "px-0 py-4 justify-center",
                    isActive
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
                  )}
                >
                  <Icon className={cn(
                    "size-4 shrink-0 transition-colors duration-300",
                    isActive
                      ? (typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? "text-black" : "text-white")
                      : "text-zinc-600 group-hover:text-zinc-400 dark:group-hover:text-zinc-300"
                  )} />
                  {sidebarVisible && (
                    <span className="text-xs font-bold tracking-tight whitespace-nowrap">{item.name}</span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-glow"
                      className="absolute inset-0 bg-white z-[-1] rounded-md"
                    />
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
