'use client'

import { useState } from 'react'
import { Users, UserPlus, Shield, ShieldCheck, ShieldAlert, MoreVertical, Trash2, Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Collaborator {
  id: string
  name: string
  email: string
  role: 'owner' | 'editor' | 'viewer'
  status: 'active' | 'pending'
}

export function CollaboratorsView() {
  const [email, setEmail] = useState('')
  const [isInviting, setIsInviting] = useState(false)

  // Mock collaborators for now
  const [collaborators] = useState<Collaborator[]>([
    { id: '1', name: 'Elite Engineer', email: 'lead@stem.ai', role: 'owner', status: 'active' },
    { id: '2', name: 'System Architect', email: 'architect@stem.ai', role: 'editor', status: 'active' },
    { id: '3', name: 'Logic Auditor', email: 'auditor@stem.ai', role: 'viewer', status: 'pending' },
  ])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsInviting(true)
    // Simulate API call
    setTimeout(() => {
      toast.success(`Access request dispatched to ${email}`)
      setEmail('')
      setIsInviting(false)
    }, 1000)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner': return <span className="px-2 py-0.5 bg-white text-black text-[9px] font-black uppercase">Owner</span>
      case 'editor': return <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-[9px] font-black uppercase border border-zinc-700">Editor</span>
      case 'viewer': return <span className="px-2 py-0.5 bg-black text-zinc-600 text-[9px] font-black uppercase border border-zinc-900">Viewer</span>
      default: return null
    }
  }

  return (
    <div className="h-full bg-black p-8 overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tighter">Collaborators</h1>
            <p className="text-xs text-zinc-500 font-medium">Orchestrate team permissions and manage system access control.</p>
          </div>
          <form onSubmit={handleInvite} className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-600" />
              <Input
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/50 border-zinc-800 rounded-none h-11 pl-10 text-xs focus:border-zinc-600"
              />
            </div>
            <Button
              type="submit"
              disabled={isInviting}
              className="bg-white text-black hover:bg-zinc-200 rounded-none h-11 px-6 text-xs font-black uppercase tracking-widest"
            >
              <UserPlus className="size-4 mr-2" />
              {isInviting ? 'Granting...' : 'Invite'}
            </Button>
          </form>
        </header>

        {/* Access List */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-zinc-900">
            <ShieldCheck className="size-4 text-zinc-600" />
            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active Permissions</h2>
          </div>

          <div className="border border-zinc-900 divide-y divide-zinc-900 bg-black/20">
            {collaborators.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 group hover:bg-white/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className="size-10 bg-black border border-zinc-800 flex items-center justify-center font-black text-xs text-zinc-500 uppercase">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-white">{user.name}</h4>
                      {getRoleBadge(user.role)}
                    </div>
                    <p className="text-[10px] text-zinc-500 font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {user.status === 'pending' && (
                    <span className="text-[9px] font-bold text-yellow-500/80 uppercase italic">Pending confirmation</span>
                  )}
                  {user.role !== 'owner' && (
                    <button className="text-zinc-700 hover:text-red-500 transition-colors">
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Advanced Policy */}
        <section className="p-8 border border-zinc-800 bg-black/10 space-y-6">
          <div className="flex items-center gap-3">
            <Lock className="size-5 text-white" />
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Advanced Policy (RLS)</h3>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed font-medium max-w-2xl">
            Row Level Security (RLS) is automatically applied based on the collaborator's role. Owners can purge the entire registry, while Editors are limited to model mutation. Viewers can only perform deterministic simulations without state modification.
          </p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-green-500" />
              <span className="text-[10px] font-bold text-zinc-600 uppercase">Inherited Security</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-blue-500" />
              <span className="text-[10px] font-bold text-zinc-600 uppercase">Audit Logging Active</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
