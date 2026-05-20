'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCollaborators } from '@/hooks/useCollaborators'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Check, Clock, Loader2, Mail, RefreshCw, ShieldAlert, ShieldCheck, Trash2, Undo2, Users, X } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

interface Invitation {
  email: string
  status: 'pending' | 'accepted' | 'rejected'
  role: 'editor' | 'viewer'
  timestamp: string
}

interface RevokedLog {
  id: string
  email: string
  name: string
  role: string
  timestamp: string
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
  const [roleSelection, setRoleSelection] = useState<'editor' | 'viewer'>('editor')
  const [isInviting, setIsInviting] = useState(false)
  const [owner, setOwner] = useState<{ id: string; user: { full_name: string | null; email: string }; role: 'owner' } | null>(null)

  // Local storage backed tracking lists for simulation logs
  const [invites, setInvites] = useState<Invitation[]>([])
  const [revokedLogs, setRevokedLogs] = useState<RevokedLog[]>([])

  useEffect(() => {
    if (projectId) {
      fetchCollaborators(projectId as string)
    }
  }, [projectId, fetchCollaborators])

  // Fetch the project owner directly from database projects and users tables
  useEffect(() => {
    async function fetchOwnerDetails() {
      if (!projectId) return
      try {
        const supabase = createClient()
        // 1. Get owner_id from project
        const { data: projectData, error: projError } = await supabase
          .from('projects')
          .select('owner_id')
          .eq('id', projectId)
          .single()

        if (projError || !projectData?.owner_id) return

        // 2. Fetch owner's user details
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, full_name, email')
          .eq('id', projectData.owner_id)
          .single()

        if (!userError && userData) {
          setOwner({
            id: userData.id,
            user: {
              full_name: userData.full_name,
              email: userData.email
            },
            role: 'owner'
          })
        }
      } catch (err) {
        console.error('Failed to load project owner details:', err)
      }
    }

    fetchOwnerDetails()
  }, [projectId])

  // Load and seed invitations & revoked history from localStorage
  useEffect(() => {
    if (projectId) {
      const invitesKey = `stem_invites_${projectId}`
      const revokedKey = `stem_revoked_${projectId}`

      const savedInvites = localStorage.getItem(invitesKey)
      if (savedInvites) {
        setInvites(JSON.parse(savedInvites))
      } else {
        const defaultInvites: Invitation[] = [
          { email: 'dev.lead@stem.design', status: 'pending', role: 'editor', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
          { email: 'product.manager@stem.design', status: 'accepted', role: 'editor', timestamp: new Date(Date.now() - 3600000 * 24).toISOString() },
          { email: 'freelancer@design.io', status: 'rejected', role: 'viewer', timestamp: new Date(Date.now() - 3600000 * 48).toISOString() }
        ]
        localStorage.setItem(invitesKey, JSON.stringify(defaultInvites))
        setInvites(defaultInvites)
      }

      const savedRevoked = localStorage.getItem(revokedKey)
      if (savedRevoked) {
        setRevokedLogs(JSON.parse(savedRevoked))
      } else {
        const defaultRevoked: RevokedLog[] = [
          { id: 'rev-1', email: 'ex.contractor@partner.com', name: 'Devon Carter', role: 'viewer', timestamp: new Date(Date.now() - 3600000 * 120).toISOString() }
        ]
        localStorage.setItem(revokedKey, JSON.stringify(defaultRevoked))
        setRevokedLogs(defaultRevoked)
      }
    }
  }, [projectId])

  const saveInvitesToStorage = (updated: Invitation[]) => {
    setInvites(updated)
    if (projectId) {
      localStorage.setItem(`stem_invites_${projectId}`, JSON.stringify(updated))
    }
  }

  const saveRevokedToStorage = (updated: RevokedLog[]) => {
    setRevokedLogs(updated)
    if (projectId) {
      localStorage.setItem(`stem_revoked_${projectId}`, JSON.stringify(updated))
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !projectId) return
    setIsInviting(true)

    const normalizedEmail = email.trim().toLowerCase()

    try {
      await inviteCollaborator(projectId as string, normalizedEmail)

      // Update local invite history as accepted
      const updated = [
        { email: normalizedEmail, status: 'accepted' as const, role: roleSelection, timestamp: new Date().toISOString() },
        ...invites.filter(i => i.email !== normalizedEmail)
      ]
      saveInvitesToStorage(updated)
      setEmail('')
    } catch (err: any) {
      // If user isn't registered in STEM yet, log as pending invitation
      if (err.message?.includes('User not found')) {
        const updated = [
          { email: normalizedEmail, status: 'pending' as const, role: roleSelection, timestamp: new Date().toISOString() },
          ...invites.filter(i => i.email !== normalizedEmail)
        ]
        saveInvitesToStorage(updated)
        setEmail('')
        toast.info(`Invitation sent to ${normalizedEmail} (Pending registration)`)
      } else {
        toast.error(`Invitation failed: ${err.message}`)
      }
    } finally {
      setIsInviting(false)
    }
  }

  const handleDelete = async (collaborator: any) => {
    if (!projectId) return
    try {
      await removeCollaborator(projectId as string, collaborator.id)

      // Add to revoked log
      const revokedItem: RevokedLog = {
        id: collaborator.id,
        email: collaborator.user?.email || 'unknown@company.com',
        name: collaborator.user?.full_name || 'Anonymous Member',
        role: collaborator.role,
        timestamp: new Date().toISOString()
      }
      saveRevokedToStorage([revokedItem, ...revokedLogs])
    } catch (err: any) {
      toast.error(`Revoke failed: ${err.message}`)
    }
  }

  const simulateInviteAction = (email: string, action: 'accepted' | 'rejected' | 'pending') => {
    const updated = invites.map(i => {
      if (i.email === email) {
        return { ...i, status: action, timestamp: new Date().toISOString() }
      }
      return i
    })
    saveInvitesToStorage(updated)
    toast.success(`Invitation status for ${email} updated to ${action}`)
  }

  const removeInviteFromList = (email: string) => {
    const updated = invites.filter(i => i.email !== email)
    saveInvitesToStorage(updated)
    toast.success(`Invitation cancelled`)
  }

  const restoreRevokedAccess = async (log: RevokedLog) => {
    setIsInviting(true)
    try {
      await inviteCollaborator(projectId as string, log.email)
      // Remove from revoked log and update invites
      saveRevokedToStorage(revokedLogs.filter(r => r.email !== log.email))
      const updatedInvites = [
        { email: log.email, status: 'accepted' as const, role: log.role as any || 'editor', timestamp: new Date().toISOString() },
        ...invites.filter(i => i.email !== log.email)
      ]
      saveInvitesToStorage(updatedInvites)
    } catch (err: any) {
      // If account isn't active, put it back to invites
      const updatedInvites = [
        { email: log.email, status: 'pending' as const, role: 'editor' as const, timestamp: new Date().toISOString() },
        ...invites.filter(i => i.email !== log.email)
      ]
      saveInvitesToStorage(updatedInvites)
      saveRevokedToStorage(revokedLogs.filter(r => r.email !== log.email))
      toast.info(`Restored invitation to pending for ${log.email}`)
    } finally {
      setIsInviting(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <span className="px-2 py-0.5 bg-black dark:bg-white text-white dark:text-black text-[9px] font-black uppercase tracking-wider">Owner</span>
      case 'editor':
        return <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[9px] font-black uppercase tracking-wider border border-zinc-200 dark:border-zinc-700">Editor</span>
      case 'viewer':
        return <span className="px-2 py-0.5 bg-zinc-50 dark:bg-black text-zinc-400 dark:text-zinc-600 text-[9px] font-black uppercase tracking-wider border border-zinc-100 dark:border-zinc-900">Viewer</span>
      default:
        return null
    }
  }

  // Combine fetched owner and fetched collaborators
  const activeMembersList = useMemo(() => {
    const list = []
    if (owner) {
      list.push(owner)
    }
    // Filter out collaborator records that match owner user_id to prevent duplicates
    const members = collaborators.filter(c => c.user_id !== owner?.id)
    list.push(...members)
    return list
  }, [owner, collaborators])

  return (
    <div className={cn(
      "bg-white dark:bg-black custom-scrollbar transition-colors duration-300 w-full",
      isModal ? "p-0 h-auto" : "h-full p-8 overflow-y-auto"
    )}>
      <div className={cn("mx-auto w-full", isModal ? "space-y-6 pb-2" : "space-y-10 pb-20 max-w-5xl")}>
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

        {/* 1. Active Team Members Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-900 transition-colors">
            <ShieldCheck className="size-4 text-zinc-400 dark:text-zinc-600" />
            <h2 className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest transition-colors">Active Team Members</h2>
          </div>

          <div className="border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-black/40 overflow-hidden w-full">
            {isLoading && activeMembersList.length === 0 && (
              <div className="p-12 flex flex-col items-center justify-center gap-3 text-zinc-400 dark:text-zinc-600">
                <Loader2 className="size-6 animate-spin" />
                <span className="text-xs font-bold font-mono">Fetching active access registers...</span>
              </div>
            )}

            {activeMembersList.length === 0 && !isLoading && (
              <div className="p-10 text-center flex flex-col items-center justify-center gap-2">
                <Users className="size-8 text-zinc-300 dark:text-zinc-700" />
                <p className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">No active team members registered.</p>
              </div>
            )}

            {activeMembersList.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 group hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-all w-full">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="size-10 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center justify-center font-black text-xs text-zinc-600 dark:text-zinc-400 transition-colors select-none shrink-0">
                    {(user.user?.full_name || 'A U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-black dark:text-white transition-colors truncate">{user.user?.full_name || 'Anonymous User'}</h4>
                      {user.role === 'owner' ? getRoleBadge(user.role) : null}
                    </div>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono transition-colors truncate">{user.user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {user.role !== 'owner' ? (
                    <>
                      <select
                        value={user.role}
                        onChange={(e) => updateRole(projectId as string, user.id, e.target.value)}
                        className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400 h-8 px-2 rounded-none focus:outline-none focus:border-zinc-400 cursor-pointer"
                      >
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>

                      <Button
                        onClick={() => handleDelete(user)}
                        size="icon"
                        variant="ghost"
                        className="size-8 rounded-none border border-zinc-200 dark:border-zinc-800 text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-950 transition-all opacity-0 group-hover:opacity-100"
                        title="Revoke collaborator access"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </>
                  ) : (
                    getRoleBadge(user.role)
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Sent Invitations Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-900 transition-colors">
            <Clock className="size-4 text-zinc-400 dark:text-zinc-600" />
            <h2 className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest transition-colors">Sent Invitations Registry</h2>
          </div>

          <div className="border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-black/40 overflow-hidden w-full">
            {invites.length === 0 && (
              <div className="p-10 text-center flex flex-col items-center justify-center gap-1">
                <p className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">No pending or archived invites.</p>
              </div>
            )}

            {invites.map((invite) => (
              <div key={invite.email} className="flex items-center justify-between p-4 group hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-all w-full">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="size-10 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 shrink-0">
                    <Mail className="size-4" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="text-xs font-mono text-zinc-600 dark:text-zinc-300 transition-colors truncate">{invite.email}</h4>
                    <div className="flex items-center gap-2 text-[9px] text-zinc-400">
                      <span>Role: <strong className="uppercase">{invite.role}</strong></span>
                      <span>•</span>
                      <span>Sent {new Date(invite.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Status Indicator */}
                  {invite.status === 'pending' && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 border border-amber-500/20 bg-amber-500/5 text-amber-500 text-[9px] font-black uppercase tracking-wider animate-pulse">
                      Pending Invite
                    </span>
                  )}
                  {invite.status === 'accepted' && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                      Accepted
                    </span>
                  )}
                  {invite.status === 'rejected' && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 border border-red-500/20 bg-red-500/5 text-red-400 text-[9px] font-black uppercase tracking-wider">
                      Rejected
                    </span>
                  )}

                  {/* Simulator buttons for presentation */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {invite.status === 'pending' && (
                      <>
                        <button
                          onClick={() => simulateInviteAction(invite.email, 'accepted')}
                          className="p-1 border border-zinc-200 dark:border-zinc-800 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all size-7 flex items-center justify-center"
                          title="Simulate Accept"
                        >
                          <Check className="size-3.5" />
                        </button>
                        <button
                          onClick={() => simulateInviteAction(invite.email, 'rejected')}
                          className="p-1 border border-zinc-200 dark:border-zinc-800 text-red-500 hover:bg-red-500 hover:text-white transition-all size-7 flex items-center justify-center"
                          title="Simulate Reject"
                        >
                          <X className="size-3.5" />
                        </button>
                      </>
                    )}

                    {invite.status === 'rejected' && (
                      <button
                        onClick={() => simulateInviteAction(invite.email, 'pending')}
                        className="p-1 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-300 dark:hover:bg-zinc-800 transition-all size-7 flex items-center justify-center"
                        title="Re-send Invitation"
                      >
                        <RefreshCw className="size-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => removeInviteFromList(invite.email)}
                      className="p-1 border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:bg-red-950/20 hover:text-red-500 transition-all size-7 flex items-center justify-center"
                      title="Delete Invitation log"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Revoked Access History Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-900 transition-colors">
            <ShieldAlert className="size-4 text-zinc-400 dark:text-zinc-600" />
            <h2 className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest transition-colors">Revoked Access Registry</h2>
          </div>

          <div className="border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-black/40 overflow-hidden w-full">
            {revokedLogs.length === 0 && (
              <div className="p-10 text-center flex flex-col items-center justify-center gap-1">
                <p className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">No revoked access history logs.</p>
              </div>
            )}

            {revokedLogs.map((log) => (
              <div key={log.email} className="flex items-center justify-between p-4 group hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-all w-full">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="size-10 bg-zinc-100/50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 shrink-0">
                    <Trash2 className="size-4 text-red-500/70" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-zinc-500 dark:text-zinc-400 transition-colors truncate">{log.name}</h4>
                      <span className="px-1.5 py-0.2 border border-red-500/20 text-red-500 text-[8px] font-black uppercase bg-red-500/5">
                        Access Revoked
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono transition-colors truncate">{log.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-600">
                    Revoked {new Date(log.timestamp).toLocaleDateString()}
                  </span>

                  <Button
                    onClick={() => restoreRevokedAccess(log)}
                    size="sm"
                    className="h-8 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-[10px] font-black uppercase text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white rounded-none hover:bg-zinc-100 dark:hover:bg-zinc-900 gap-1"
                  >
                    <Undo2 className="size-3" />
                    Restore Access
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
