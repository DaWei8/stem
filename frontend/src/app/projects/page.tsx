'use client'

import { ProjectCard } from '@/components/blocks/ProjectCard'
import { NewProjectModal } from '@/components/blocks/NewProjectModal'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { useProjects } from '@/hooks/useProjects'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, ListFilter, Search, Settings } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function ProjectsPage() {
  const { projects, isLoading, fetchProjects, createProject } = useProjects()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const filteredProjects = projects
    .filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-white/20">
      <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-[1600px] mx-auto px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tighter bg-linear-to-br from-white to-zinc-500 bg-clip-text text-transparent">
                Projects Dashboard
              </h1>
              <p className="text-xs text-zinc-500 font-medium max-w-md leading-relaxed">
                Manage your deterministic system blueprints and architectural simulations from a centralized node.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500 group-focus-within:text-white transition-colors" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/50 border border-zinc-800 rounded-none h-11 pl-10 pr-4 text-xs focus:outline-none focus:border-zinc-600 focus:bg-black transition-all w-64 text-white"
                />
              </div>
              <Link href="/projects/settings">
                <Button variant="outline" className="bg-black border-zinc-800 hover:bg-zinc-800 rounded-none h-11 px-4">
                  <Settings className="size-4" />
                </Button>
              </Link>
              <NewProjectModal onCreate={createProject} />
            </div>
          </div>

          <div className="flex items-center gap-8 mt-10">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-600 mb-1">Projects</span>
                <div className="flex items-baseline gap-1 text-white">
                  <span className="text-2xl font-black tabular-nums leading-none">{projects.length}</span>
                  <span className="text-[10px] font-medium text-zinc-700">total</span>
                </div>
              </div>
              <div className="h-8 w-px bg-zinc-800/50" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-600 mb-1">Last Synced</span>
                <div className="flex items-center gap-2 leading-none text-white">
                  <span className="text-xl font-black">Online</span>
                  <div className="size-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                </div>
              </div>
            </div>

            <div className="h-10 w-px bg-zinc-800 ml-auto" />

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setViewMode('grid')}
                className={cn("size-9 rounded-none border transition-colors", viewMode === 'grid' ? "bg-black border-zinc-800 text-white" : "border-transparent text-zinc-600 hover:text-white hover:bg-black")}
              >
                <LayoutGrid className="size-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setViewMode('list')}
                className={cn("size-9 rounded-none border transition-colors", viewMode === 'list' ? "bg-black border-zinc-800 text-white" : "border-transparent text-zinc-600 hover:text-white hover:bg-black")}
              >
                <ListFilter className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto w-full p-8 flex-1">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(viewMode === 'grid' ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "flex flex-col gap-4")}
            >
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-[280px] bg-black/10 border border-zinc-800/50 animate-pulse" />
              ))}
            </motion.div>
          ) : filteredProjects.length > 0 ? (
            <motion.div
              layout
              className={cn(viewMode === 'grid' ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch" : "flex flex-col gap-4")}
            >
              {filteredProjects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                >
                  <ProjectCard project={project} viewMode={viewMode} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-40 border border-dashed border-zinc-800/50 bg-black/5 group hover:border-zinc-700/50 transition-all duration-700"
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full group-hover:bg-white/10 transition-all" />
                <div className="relative size-20 bg-black border border-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-700 ease-out shadow-2xl">
                  <Search className="size-8 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                </div>
              </div>
              <h3 className="text-2xl font-black tracking-tight mb-2 text-white">No projects found</h3>
              <p className="text-xs text-zinc-500 font-medium max-w-xs text-center leading-relaxed mb-10 px-6">
                {searchQuery
                  ? `No system identifiers matching "${searchQuery}" were found in the registry.`
                  : "The system registry is currently empty. Create your first project to begin architectural modeling."}
              </p>
              {searchQuery && (
                <Button
                  onClick={() => setSearchQuery('')}
                  variant="outline"
                  className="rounded-none border-zinc-800 text-[10px] font-bold h-10 px-8 hover:bg-white hover:text-black transition-all"
                >
                  Clear filter
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
