'use client'

import { useState } from 'react'
import { Users, UserPlus, Shield, ShieldCheck, ShieldAlert, MoreVertical, Trash2, Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useCollaborators } from '@/hooks/useCollaborators'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'

interface Collaborator {
  id: string
  name: string
  email: string
  role: 'owner' | 'editor' | 'viewer'
  status: 'active' | 'pending'
}

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
    await inviteCollaborator(projectId as string, email)
    setEmail('')
    setIsInviting(false)
  }

  const handleDelete = async (id: string) => {
    if (!projectId) return
    await removeCollaborator(projectId as string, id)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner': return <span className="px-2 py-0.5 bg-black dark:bg-white text-white dark:text-black text-[9px] font-black  transition-colors">Owner</span>
      case 'editor': return <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[9px] font-black  border border-zinc-200 dark:border-zinc-700 transition-colors">Editor</span>
      case 'viewer': return <span className="px-2 py-0.5 bg-zinc-50 dark:bg-black text-zinc-400 dark:text-zinc-600 text-[9px] font-black  border border-zinc-100 dark:border-zinc-900 transition-colors">Viewer</span>
      default: return null
    }
  }

  return (
    <div className={cn(
      "bg-white dark:bg-black custom-scrollbar transition-colors duration-300",
      isModal ? "p-0 h-auto" : "h-full p-4 overflow-y-auto"
    )}>
      <div className={cn("mx-auto", isModal ? "space-y-8 pb-4" : "space-y-12 pb-20")}>
        {!isModal ? (
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tighter text-black dark:text-white transition-colors">Collaborators</h1>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium transition-colors">Orchestrate team permissions and manage system access control.</p>
            </div>
            <form onSubmit={handleInvite} className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400 dark:text-zinc-600 transition-colors" />
                <Input
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-50 dark:bg-black/50 border-zinc-200 dark:border-zinc-800 rounded-none h-11 pl-10 text-xs focus:ring-1 focus:ring-black/10 dark:focus:ring-white/10 transition-colors text-black dark:text-white"
                />
              </div>
              <Button
                type="submit"
                disabled={isInviting}
                className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-none h-11 px-6 text-xs font-black transition-colors"
              >
                {isInviting ? 'Granting...' : 'Invite'}
              </Button>
            </form>
          </header>
        ) : (
          <form onSubmit={handleInvite} className="flex gap-2 w-full">
            <div className="relative w-full flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400 dark:text-zinc-600 transition-colors" />
              <Input
                placeholder="Enter collaborator email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-50 dark:bg-black/50 border-zinc-200 dark:border-zinc-800 rounded-none h-11 pl-6 text-xs focus:ring-1 focus:ring-black/10 dark:focus:ring-white/10 transition-colors text-black dark:text-white"
              />
            </div>
            <Button
              type="submit"
              disabled={isInviting}
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-none h-11 px-6 text-sm transition-colors"
            >
              {isInviting ? 'Granting...' : 'Invite'}
            </Button>
          </form>
        )}

        {/* Access List */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-900 transition-colors">
            <ShieldCheck className="size-4 text-zinc-400 dark:text-zinc-600" />
            <h2 className="text-xs font-medium text-zinc-400 dark:text-zinc-500 transition-colors">Active Permissions</h2>
          </div>

          <div className="border border-zinc-100 dark:border-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-900 bg-zinc-50/30 dark:bg-black/20 transition-colors">
            {collaborators.length === 0 && !isLoading && (
              <div className="p-12 text-center text-zinc-600 text-xs italic">
                No external collaborators yet.
              </div>
            )}
            {collaborators.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 group hover:bg-zinc-50 dark:hover:bg-white/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className="size-10 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center justify-center font-black text-xs text-zinc-400 dark:text-zinc-500  transition-colors">
                    {(user.user.full_name || 'Anonymous').split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-black dark:text-white transition-colors">{user.user.full_name || 'Anonymous User'}</h4>
                      {getRoleBadge(user.role)}
                    </div>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium transition-colors">{user.user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {user.role !== 'owner' && (
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-zinc-700 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
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
