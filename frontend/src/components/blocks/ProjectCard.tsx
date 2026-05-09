'use client'

import Link from 'next/link'
import { Project } from '@/types'
import { MoreVertical, Pencil, Trash2, Calendar, Fingerprint, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useProjects } from '@/hooks/useProjects'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from 'framer-motion'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { deleteProject, updateProject } = useProjects()
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [newName, setNewName] = useState(project.name)
  const [newDesc, setNewDesc] = useState(project.description || '')

  const date = new Date(project.updated_at)
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm('Permanently delete this project and all associated data?')) {
      deleteProject(project.id)
    }
  }

  const handleRename = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsRenameOpen(true)
  }

  const saveRename = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateProject(project.id, { name: newName, description: newDesc })
    setIsRenameOpen(false)
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        className="group relative flex flex-col h-full bg-black/10 border border-zinc-800/50 hover:border-zinc-500/50 transition-all duration-300"
      >
        <div className="absolute inset-0 bg-linear-to-b from-white/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Card Header */}
        <div className="p-6 pb-0 flex items-start justify-between">
          <div className="size-10 bg-black border border-zinc-800 flex items-center justify-center group-hover:border-zinc-600 transition-colors">
            <Fingerprint className="size-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  onClick={(e) => e.stopPropagation()}
                  className="size-8 p-0 hover:bg-zinc-800 rounded-none text-zinc-500 hover:text-white transition-all"
                >
                  <MoreVertical className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="p-1 bg-black border-zinc-800 text-white rounded-none shadow-2xl min-w-[160px]">
              <DropdownMenuItem onClick={handleRename} className="flex items-center gap-2 px-3 py-2 text-xs font-bold cursor-pointer hover:bg-black focus:bg-black rounded-none transition-colors">
                <Pencil className="size-3.5 text-blue-400" />
                Rename Project
              </DropdownMenuItem>
              <div className="h-px bg-zinc-800 my-1" />
              <DropdownMenuItem onClick={handleDelete} className="flex items-center gap-2 px-3 py-2 text-xs font-bold cursor-pointer hover:bg-red-950/30 text-red-400 focus:bg-red-950/30 rounded-none transition-colors">
                <Trash2 className="size-3.5" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <Link href={`/projects/${project.id}`} className="p-6 flex-1 flex flex-col">
          <div className="mb-3">
            <h2 className="text-xl font-black tracking-tight text-zinc-200 group-hover:text-white transition-colors mb-1 line-clamp-1">
              {project.name}
            </h2>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-600">
              <span className="group-hover:text-zinc-400 transition-colors">ID: {project.id.slice(0, 8)}</span>
            </div>
          </div>

          <p className="text-xs text-zinc-500 font-medium leading-relaxed line-clamp-3 mb-6 group-hover:text-zinc-400 transition-colors">
            {project.description || "No specification provided for this system blueprint."}
          </p>

          <div className="mt-auto flex items-center justify-between pt-6 border-t border-zinc-800/30">
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 group-hover:text-zinc-500 transition-colors">
              <Calendar className="size-3" />
              {formattedDate}
            </div>
            <div className="size-6 flex items-center justify-center text-zinc-700 group-hover:text-white transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <ArrowUpRight className="size-4" />
            </div>
          </div>
        </Link>

        {/* Interactive Bottom Bar */}
        <div className="h-0.5 w-full bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </motion.div>

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="bg-black border-zinc-800 text-white rounded-none sm:max-w-[450px] p-0 overflow-hidden shadow-2xl">
          <div className="h-1 bg-white" />
          <form onSubmit={saveRename} className="p-8">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-2xl font-black tracking-tight text-white">Rename Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="newName" className="text-[10px] font-bold text-zinc-500 ">New Identifier</Label>
                <Input
                  id="newName"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-black border-zinc-800 rounded-none h-12 text-sm focus-visible:ring-1 focus-visible:ring-zinc-600 transition-all text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newDesc" className="text-[10px] font-bold text-zinc-500 ">Updated Specification</Label>
                <textarea
                  id="newDesc"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="bg-black w-full min-h-[120px] p-4 border border-zinc-800 rounded-none text-sm focus:outline-none focus:border-zinc-600 transition-colors resize-none text-white"
                />
              </div>
            </div>
            <DialogFooter className="mt-10 gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsRenameOpen(false)}
                className="rounded-none hover:bg-black text-zinc-500 hover:text-white transition-all text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-white text-black hover:bg-zinc-200 rounded-none px-8 h-11 text-xs font-black transition-all"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
