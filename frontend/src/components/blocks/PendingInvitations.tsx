'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Check, X, Briefcase, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  getPendingUserInvitationsAction,
  updateProjectInvitationStatusAction
} from '@/lib/actions/collaborators'

interface PendingInvitation {
  id: string
  project_id: string
  email: string
  role: 'editor' | 'viewer' | 'comment_only'
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  project?: {
    id: string
    name: string
    description: string | null
    owner_id: string
    collaborators?: {
      id: string
      project_id: string
      user_id: string
      role: string
      user?: {
        id: string
        email: string
        full_name: string | null
        avatar_url: string | null
      } | null
    }[]
  }
}

interface PendingInvitationsProps {
  onActionComplete?: () => void
  hideIfEmpty?: boolean
}

export function PendingInvitations({ onActionComplete, hideIfEmpty = true }: PendingInvitationsProps) {
  const [invitations, setInvitations] = useState<PendingInvitation[]>([])
  const [loadingIds, setLoadingIds] = useState<Record<string, 'accept' | 'decline' | null>>({})
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  const fetchInvitations = async () => {
    try {
      const data = await getPendingUserInvitationsAction()
      setInvitations(data as PendingInvitation[])
    } catch (err: any) {
      console.error('Failed to fetch user invitations:', err)
    } finally {
      setIsInitialLoading(false)
    }
  }

  useEffect(() => {
    fetchInvitations()
  }, [])

  const handleAction = async (inv: PendingInvitation, action: 'accepted' | 'rejected') => {
    const actionKey = `${inv.project_id}-${inv.email}`
    setLoadingIds(prev => ({ ...prev, [actionKey]: action === 'accepted' ? 'accept' : 'decline' }))

    try {
      await updateProjectInvitationStatusAction(inv.project_id, inv.email, action)

      toast.success(
        action === 'accepted'
          ? `You have joined the project "${inv.project?.name || 'Collaborator Project'}"`
          : `Invitation declined`
      )

      // Refresh invitations list
      await fetchInvitations()

      // Notify parent to refresh project list
      if (onActionComplete) {
        onActionComplete()
      }
    } catch (err: any) {
      toast.error(`Action failed: ${err.message}`)
    } finally {
      setLoadingIds(prev => ({ ...prev, [actionKey]: null }))
    }
  };

  if (isInitialLoading) {
    return null // Silence during initial loading
  }

  if (invitations.length === 0) {
    if (hideIfEmpty) return null
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 bg-zinc-950/10 text-center select-none">
        <Mail className="size-6 text-zinc-700 mb-3" />
        <h3 className="text-[10px] font-black tracking-wider text-zinc-400 uppercase mb-1">No Pending Invitations</h3>
        <p className="text-[10px] text-zinc-600 max-w-xs leading-relaxed">
          You don't have any active invites to join other projects at the moment.
        </p>
      </div>
    )
  }

  return (
    <div className="mb-10 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/50">
        <Mail className="size-4 text-zinc-400" />
        <h2 className="text-xs font-black text-zinc-400 uppercase tracking-wider">
          Pending Invitations ({invitations.length})
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {invitations.map((inv) => {
            const actionKey = `${inv.project_id}-${inv.email}`
            const currentLoading = loadingIds[actionKey]

            return (
              <motion.div
                key={inv.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-zinc-950/40 border border-zinc-800 p-5 flex flex-col justify-between group overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute inset-0 bg-linear-to-b from-white/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="bg-white absolute top-0 left-0 w-full h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                <div className="space-y-3 mb-5">
                  <div className="flex items-start justify-between">
                    <div className="size-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <Briefcase className="size-4 text-zinc-400" />
                    </div>
                    <span className="px-2 py-0.5 border border-zinc-800 text-zinc-400 text-[8px] font-black uppercase tracking-wider">
                      {inv.role}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black tracking-tight text-white line-clamp-1">
                      {inv.project?.name || 'Project System'}
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      Invited on {new Date(inv.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {inv.project?.description && (
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {inv.project.description}
                    </p>
                  )}

                  {inv.project?.collaborators && inv.project.collaborators.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider mb-1.5">
                        Other Collaborators
                      </p>
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {inv.project.collaborators.map((collab: any) => {
                          const name = collab.user?.full_name || collab.user?.email || 'Anonymous'
                          const initials = name
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)
                          return (
                            <div
                              key={collab.id}
                              className="inline-block size-5 rounded-full ring-2 ring-black bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[8px] font-black text-zinc-400"
                              title={`${name} (${collab.role})`}
                            >
                              {initials}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-zinc-900/60 mt-auto">
                  <Button
                    variant="white"
                    size="sm"
                    fullWidth
                    disabled={!!currentLoading}
                    isLoading={currentLoading === 'accept'}
                    onClick={() => handleAction(inv, 'accepted')}
                    className="h-9 px-3 text-[10px] uppercase font-black"
                  >
                    Accept
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    disabled={!!currentLoading}
                    isLoading={currentLoading === 'decline'}
                    onClick={() => handleAction(inv, 'rejected')}
                    className="h-9 px-3 text-[10px] uppercase font-black border border-zinc-800 hover:border-zinc-700 hover:text-white"
                  >
                    Decline
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
