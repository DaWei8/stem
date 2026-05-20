'use client'

import { useState } from 'react'
import { Users, UserPlus, Shield, ShieldCheck, Trash2, Mail, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useCollaborators } from '@/hooks/useCollaborators'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'

export function CollaboratorsView({ isModal = false }: { isModal?: boolean }) {
  const { id: projectId } = useParams()
  const {
    collaborators,
    isLoading,
    fetchCollaborators,
    inviteCollaborator,
    removeCollaborator,
    updateRole
  } = useCollaborators()

  const [email, setEmail] = useState('')
  const [roleSelection, setRoleSelection] = useState<'editor' | 'viewer'>('editor')
  const [isInviting, setIsInviting] = useState(false)

  useEffect(() => {
    if (projectId) {
      fetchCollaborators(projectId as string)
    }
  }, [projectId, fetchCollaborators])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !projectId) return
    setIsInviting(true)
    try {
      await inviteCollaborator(projectId as string, email)
      setEmail('')
      toast.success(`Invitation sent to ${email}`)
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsInviting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!projectId) return
    try {
      await removeCollaborator(projectId as string, id)
    } catch (err) {
      console.error(err)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <span className="px-2 py-0.5 bg-black dark:bg-white text-white dark:text-black text-[9px] font-black uppercase tracking-wider transition-colors">Owner</span>
      case 'editor':
        return <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[9px] font-black uppercase tracking-wider border border-zinc-200 dark:border-zinc-700 transition-colors">Editor</span>
      case 'viewer':
        return <span className="px-2 py-0.5 bg-zinc-50 dark:bg-black text-zinc-400 dark:text-zinc-600 text-[9px] font-black uppercase tracking-wider border border-zinc-100 dark:border-zinc-900 transition-colors">Viewer</span>
      default:
        return null
    }
  }

  return (
    <div className={cn(
      "bg-white dark:bg-black custom-scrollbar transition-colors duration-300",
      isModal ? "p-0 h-auto" : "h-full p-8 overflow-y-auto"
    )}>
      <div className={cn("mx-auto", isModal ? "space-y-6 pb-2" : "space-y-10 pb-20 max-w-5xl")}>
        {!isModal && (
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-900">
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tighter text-black dark:text-white transition-colors">Collaborators</h1>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium transition-colors">Orchestrate team permissions and manage system access control.</p>
            </div>
            
            <form onSubmit={handleInvite} className="flex gap-2 w-full md:w-auto items-center">
              <div className="relative flex-1 md:w-64">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400 dark:text-zinc-600 transition-colors" />
                <Input
                  type="email"
                  required
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-none h-11 pl-10 text-xs focus:ring-1 focus:ring-black/10 dark:focus:ring-white/10 transition-colors text-black dark:text-white"
                />
              </div>
              <select
                value={roleSelection}
                onChange={(e: any) => setRoleSelection(e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-black uppercase text-zinc-500 dark:text-zinc-400 h-11 px-3 rounded-none focus:outline-none focus:border-zinc-400"
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <Button
                type="submit"
                disabled={isInviting}
                className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-none h-11 px-6 text-xs font-black transition-colors"
              >
                {isInviting ? <Loader2 className="size-3.5 animate-spin" /> : 'Invite'}
              </Button>
            </form>
          </header>
        )}

        {isModal && (
          <form onSubmit={handleInvite} className="flex gap-2 w-full items-center mb-6">
            <div className="relative w-full flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400 dark:text-zinc-600 transition-colors" />
              <Input
                type="email"
                required
                placeholder="Enter collaborator email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-none h-11 pl-10 text-xs focus:ring-1 focus:ring-black/10 dark:focus:ring-white/10 transition-colors text-black dark:text-white"
              />
            </div>
            <select
              value={roleSelection}
              onChange={(e: any) => setRoleSelection(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-black uppercase text-zinc-500 dark:text-zinc-400 h-11 px-3 rounded-none focus:outline-none focus:border-zinc-400"
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
            <Button
              type="submit"
              disabled={isInviting}
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-none h-11 px-6 text-xs font-black transition-colors"
            >
              {isInviting ? <Loader2 className="size-3.5 animate-spin" /> : 'Invite'}
            </Button>
          </form>
        )}

        {/* Access List */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-900 transition-colors">
            <ShieldCheck className="size-4 text-zinc-400 dark:text-zinc-600" />
            <h2 className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest transition-colors">Active Permissions</h2>
          </div>

          <div className="border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-black/40 overflow-hidden">
            {isLoading && collaborators.length === 0 && (
              <div className="p-12 flex flex-col items-center justify-center gap-3 text-zinc-400 dark:text-zinc-600">
                <Loader2 className="size-6 animate-spin" />
                <span className="text-xs font-bold font-mono">Fetching active access registers...</span>
              </div>
            )}
            
            {collaborators.length === 0 && !isLoading && (
              <div className="p-16 text-center border-dashed border border-zinc-200 dark:border-zinc-800 m-4 flex flex-col items-center justify-center gap-2">
                <Users className="size-8 text-zinc-300 dark:text-zinc-700" />
                <p className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">No external collaborators yet.</p>
                <p className="text-[10px] text-zinc-300 dark:text-zinc-700 font-medium italic">Invite colleagues via email to design together.</p>
              </div>
            )}
            
            {collaborators.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 group hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-all">
                <div className="flex items-center gap-4">
                  <div className="size-10 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center justify-center font-black text-xs text-zinc-600 dark:text-zinc-400 transition-colors select-none">
                    {(user.user?.full_name || 'A U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-black dark:text-white transition-colors">{user.user?.full_name || 'Anonymous User'}</h4>
                      {user.role === 'owner' && getRoleBadge(user.role)}
                    </div>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono transition-colors">{user.user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Role Modifier Dropdown for non-owners */}
                  {user.role !== 'owner' ? (
                    <select
                      value={user.role}
                      onChange={(e) => updateRole(projectId as string, user.id, e.target.value)}
                      className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400 h-8 px-2 rounded-none focus:outline-none focus:border-zinc-400 cursor-pointer"
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  ) : null}

                  {user.role !== 'owner' && (
                    <Button
                      onClick={() => handleDelete(user.id)}
                      size="icon"
                      variant="ghost"
                      className="size-8 rounded-none border border-zinc-200 dark:border-zinc-800 text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-950 transition-all opacity-0 group-hover:opacity-100"
                      title="Revoke collaborator access"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
