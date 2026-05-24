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
import { useUser } from '@/hooks/useUser'
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

import { cn } from '@/lib/utils'

interface ProjectCardProps {
  project: Project
  viewMode?: 'grid' | 'list'
}

export function ProjectCard({ project, viewMode = 'grid' }: ProjectCardProps) {
  const { deleteProject, updateProject } = useProjects()
  const { profile } = useUser()
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [newName, setNewName] = useState(project.name)
  const [newDesc, setNewDesc] = useState(project.description || '')

  const isOwner = profile ? profile.id === project.owner_id : true
  const otherCollaborators = (project.collaborators || []).filter(c => c.user_id !== project.owner_id)

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
        className={cn(
          "group relative flex bg-black/10 border border-zinc-800/50 hover:border-zinc-500/50 rounded-xl overflow-hidden transition-all duration-300",
          viewMode === 'grid' ? "flex-col h-full" : "flex-row items-center w-full"
        )}
      >
        <div className="absolute inset-0 bg-linear-to-b from-white/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Header / Icon */}
        <div className={cn("p-6 flex items-start justify-between shrink-0", viewMode === 'grid' ? "pb-0" : "pr-4")}>
          <div className="size-10 bg-black border border-zinc-800 flex items-center justify-center rounded-md group-hover:border-zinc-600 transition-colors shrink-0">
            <Fingerprint className="size-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
          </div>

          {viewMode === 'grid' && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    onClick={(e) => e.stopPropagation()}
                    className="size-8 p-0 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-white transition-all"
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="p-1 bg-black border-zinc-800 text-white rounded-lg shadow-2xl min-w-[160px]">
                <DropdownMenuItem onClick={handleRename} className="flex items-center gap-2 px-3 py-2 text-xs font-bold cursor-pointer hover:bg-black focus:bg-black rounded-md transition-colors">
                  <Pencil className="size-3.5 text-blue-400" />
                  Rename Project
                </DropdownMenuItem>
                {isOwner && (
                  <>
                    <div className="h-px bg-zinc-800 my-1" />
                    <DropdownMenuItem onClick={handleDelete} className="flex items-center gap-2 px-3 py-2 text-xs font-bold cursor-pointer hover:bg-red-950/30 text-red-400 focus:bg-red-950/30 rounded-md transition-colors">
                      <Trash2 className="size-3.5" />
                      Delete Project
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        <Link href={`/projects/${project.id}`} className={cn("p-6 flex-1 flex", viewMode === 'grid' ? "flex-col" : "flex-row items-center gap-8 py-4")}>
          <div className={cn(viewMode === 'grid' ? "mb-3" : "w-[200px] shrink-0")}>
            <h2 className="text-xl font-black tracking-tight text-zinc-200 group-hover:text-white transition-colors mb-1 line-clamp-1">
              {project.name}
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600">
              <span className="group-hover:text-zinc-400 transition-colors">ID: {project.id.slice(0, 8)}</span>
              {profile && (
                <span className={cn(
                  "px-1.5 py-0.5 border text-[8px] font-black uppercase tracking-wider rounded-xs",
                  isOwner
                    ? "border-zinc-800 text-zinc-500 bg-zinc-950/30"
                    : "border-blue-900/40 text-blue-400 bg-blue-950/20"
                )}>
                  {isOwner ? 'Owner' : 'Collaborator'}
                </span>
              )}
            </div>
          </div>

          <p className={cn("text-xs text-zinc-500 font-medium leading-relaxed group-hover:text-zinc-400 transition-colors", viewMode === 'grid' ? "mb-6 line-clamp-3" : "flex-1 line-clamp-2")}>
            {project.description || "No specification provided for this system blueprint."}
          </p>

          <div className={cn("flex items-center", viewMode === 'grid' ? "mt-auto justify-between pt-6 border-t border-zinc-800/30" : "gap-8 shrink-0")}>
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 group-hover:text-zinc-500 transition-colors w-[100px]">
              <Calendar className="size-3 shrink-0" />
              {formattedDate}
            </div>

            {otherCollaborators.length > 0 && (
              <div className="flex -space-x-1.5 overflow-hidden">
                {otherCollaborators.slice(0, 3).map((collab) => {
                  const name = collab.user?.full_name || collab.user?.email || 'Anonymous'
                  const initials = name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                  return (
                    <div
                      key={collab.id}
                      className="size-5 rounded-full ring-2 ring-black bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[8px] font-black text-zinc-400"
                      title={`${name} (${collab.role})`}
                    >
                      {initials}
                    </div>
                  )
                })}
                {otherCollaborators.length > 3 && (
                  <div
                    className="size-5 rounded-full ring-2 ring-black bg-zinc-950 border border-zinc-800 flex items-center justify-center text-[7px] font-black text-zinc-500"
                    title={`${otherCollaborators.length - 3} more collaborators`}
                  >
                    +{otherCollaborators.length - 3}
                  </div>
                )}
              </div>
            )}

            {viewMode === 'grid' && (
              <div className="size-6 flex items-center justify-center text-zinc-700 group-hover:text-white transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight className="size-4" />
              </div>
            )}
          </div>
        </Link>

        {viewMode === 'list' && (
          <div className="pr-6 shrink-0 flex items-center gap-4">
            <div className="size-6 flex items-center justify-center text-zinc-700 group-hover:text-white transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <ArrowUpRight className="size-4" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    onClick={(e) => e.stopPropagation()}
                    className="size-8 p-0 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-white transition-all"
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="p-1 bg-black border-zinc-800 text-white rounded-lg shadow-2xl min-w-[160px]">
                <DropdownMenuItem onClick={handleRename} className="flex items-center gap-2 px-3 py-2 text-xs font-bold cursor-pointer hover:bg-black focus:bg-black rounded-md transition-colors">
                  <Pencil className="size-3.5 text-blue-400" />
                  Rename Project
                </DropdownMenuItem>
                {isOwner && (
                  <>
                    <div className="h-px bg-zinc-800 my-1" />
                    <DropdownMenuItem onClick={handleDelete} className="flex items-center gap-2 px-3 py-2 text-xs font-bold cursor-pointer hover:bg-red-950/30 text-red-400 focus:bg-red-950/30 rounded-md transition-colors">
                      <Trash2 className="size-3.5" />
                      Delete Project
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Interactive Bottom Bar */}
        <div className={cn("bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left", viewMode === 'grid' ? "h-0.5 w-full" : "h-full w-0.5 absolute left-0 scale-y-0 group-hover:scale-y-100 origin-top")} />
      </motion.div>

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="bg-black border-zinc-800 text-white rounded-xl sm:max-w-[450px] p-0 overflow-hidden shadow-2xl">
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
                  className="bg-black border-zinc-800 rounded-md h-12 text-sm focus-visible:ring-1 focus-visible:ring-zinc-600 transition-all text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newDesc" className="text-[10px] font-bold text-zinc-500 ">Updated Specification</Label>
                <textarea
                  id="newDesc"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="bg-black w-full min-h-[120px] p-4 border border-zinc-800 rounded-md text-sm focus:outline-none focus:border-zinc-600 transition-colors resize-none text-white"
                />
              </div>
            </div>
            <DialogFooter className="mt-10 gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsRenameOpen(false)}
                className="rounded-md hover:bg-black text-zinc-500 hover:text-white transition-all text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-white text-black hover:bg-zinc-200 rounded-md px-8 h-11 text-xs font-black transition-all"
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
