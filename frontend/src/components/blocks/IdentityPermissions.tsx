'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useIdentity } from '@/hooks/useIdentity'
import { useDatabase } from '@/hooks/useDatabase'
import { usePages } from '@/hooks/usePages'
import { useVariables } from '@/hooks/useVariables'
import { useUI } from '@/hooks/useUI'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { LayoutGrid, Table2, ShieldCheck, Plus, Cpu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PillarHeader } from '@/components/layout/PillarHeader'
import { RoleCard } from './identity/RoleCard'
import { PermissionMatrix } from './identity/PermissionMatrix'
import { PolicyRow } from './identity/PolicyRow'
import { PolicySandbox } from './identity/PolicySandbox'
import { RoleFormModal } from './identity/RoleFormModal'
import { PolicyFormModal } from './identity/PolicyFormModal'

export function IdentityPermissions() {
  const { id: projectId } = useParams()
  const { userTypes, policies, fetchIdentityData, addUserType, deleteUserType, updateUserType, addPolicy, deletePolicy } = useIdentity()
  const { tables, fetchProjectData } = useDatabase()
  const { pages } = usePages()
  const { variables } = useVariables()
  const { setViewAsUserTypeId, viewAsUserTypeId } = useUI()

  const [viewMode, setViewMode] = useState<'cards' | 'matrix'>('cards')
  const [sandboxPolicy, setSandboxPolicy] = useState<any | null>(null)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<any | null>(null)

  useEffect(() => {
    if (projectId) {
      fetchIdentityData(projectId as string)
      fetchProjectData(projectId as string)
    }
  }, [projectId, fetchIdentityData, fetchProjectData])

  const handleImpersonate = (roleId: string) => {
    setViewAsUserTypeId(viewAsUserTypeId === roleId ? null : roleId)
  }

  const impersonatedRole = userTypes.find(ut => ut.id === viewAsUserTypeId)

  return (
    <div className="p-8 space-y-8 bg-white dark:bg-black min-h-full text-black dark:text-white transition-colors duration-300">
      <PillarHeader
        title="Identity & Permissions"
        description="Architect your system's security model with granular Row Level Security and hierarchical user roles."
        stats={[
          { label: 'Active Roles', value: userTypes.length },
          { label: 'RLS Policies', value: policies.length }
        ]}
      />

      {/* Impersonation Banner */}
      <AnimatePresence>
        {impersonatedRole && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between px-3 py-3 bg-amber-500/10 border border-amber-500/30"
          >
            <div className="flex items-center gap-3">
              <div className="size-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                Persona Mode Active — Viewing canvas as <span className="font-mono">{impersonatedRole.name}</span>
              </span>
            </div>
            <button
              onClick={() => setViewAsUserTypeId(null)}
              className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
            >
              Exit Persona Mode
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Roles Section */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight">User Roles</h3>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center border border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setViewMode('cards')}
                className={cn('px-3 py-2 transition-colors', viewMode === 'cards' ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-zinc-400 hover:text-black dark:hover:text-white')}
                title="Card View"
              >
                <LayoutGrid className="size-3.5" />
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                className={cn('px-3 py-2 transition-colors', viewMode === 'matrix' ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-zinc-400 hover:text-black dark:hover:text-white')}
                title="Permission Matrix"
              >
                <Table2 className="size-3.5" />
              </button>
            </div>
            <Button
              onClick={() => setIsRoleModalOpen(true)}
              className="bg-black dark:bg-white px-4 text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 h-10 text-xs font-bold rounded-none gap-2"
            >
              <Plus className="size-3.5" /> New User Type
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {viewMode === 'cards' ? (
            <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {userTypes.map(ut => (
                <RoleCard
                  key={ut.id}
                  role={ut}
                  policies={policies}
                  isImpersonating={viewAsUserTypeId === ut.id}
                  onEdit={() => { setEditingRole(ut) }}
                  onDuplicate={() => { setEditingRole(null); setIsRoleModalOpen(true) }}
                  onDelete={() => deleteUserType(projectId as string, ut.id)}
                  onImpersonate={() => handleImpersonate(ut.id)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div key="matrix" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PermissionMatrix
                userTypes={userTypes}
                policies={policies}
                tables={tables}
                pages={pages}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* RLS Policies Section */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold tracking-tight">RLS Policies</h3>
            {sandboxPolicy && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-violet-500/10 border border-violet-500/20">
                <Cpu className="size-3 text-violet-500" />
                <span className="text-[9px] font-black text-violet-500 uppercase tracking-widest">Sandbox Active</span>
              </div>
            )}
          </div>
          <Button
            onClick={() => setIsPolicyModalOpen(true)}
            className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 px-4 text-black dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 h-10 text-xs font-bold rounded-none gap-2"
          >
            <Plus className="size-3.5" /> Define Policy
          </Button>
        </div>

        {/* Sandbox */}
        <AnimatePresence>
          {sandboxPolicy && (
            <PolicySandbox
              policy={sandboxPolicy}
              variables={variables}
              onClose={() => setSandboxPolicy(null)}
            />
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {policies.map(pol => (
            <PolicyRow
              key={pol.id}
              policy={pol}
              tables={tables}
              userTypes={userTypes}
              variables={variables}
              pages={pages}
              isActive={sandboxPolicy?.id === pol.id}
              onOpenSandbox={() => setSandboxPolicy(sandboxPolicy?.id === pol.id ? null : pol)}
              onDelete={() => deletePolicy(projectId as string, pol.id)}
            />
          ))}
        </div>

        {policies.length === 0 && (
          <div className="py-20 border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-4">
            <ShieldCheck className="size-12 text-zinc-200 dark:text-zinc-800" />
            <div className="text-center">
              <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Security model uninitialized.</p>
              <p className="text-[10px] text-zinc-300 dark:text-zinc-700 font-medium italic mt-1">Define RLS policies to secure your data entities.</p>
            </div>
          </div>
        )}
      </section>

      <RoleFormModal
        isOpen={isRoleModalOpen || !!editingRole}
        editingRole={editingRole}
        onClose={() => { setIsRoleModalOpen(false); setEditingRole(null) }}
        onSave={async (payload) => {
          if (editingRole) {
            await updateUserType(projectId as string, editingRole.id, payload)
          } else {
            await addUserType(projectId as string, payload)
          }
        }}
      />

      <PolicyFormModal
        isOpen={isPolicyModalOpen}
        tables={tables}
        userTypes={userTypes}
        onClose={() => setIsPolicyModalOpen(false)}
        onSave={async (payload) => addPolicy(projectId as string, payload)}
      />
    </div>
  )
}
