'use client'

import { useProjectRole } from '@/hooks/useProjectRole'
import { PillarHeader } from '@/components/layout/PillarHeader'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDatabase } from '@/hooks/useDatabase'
import { useIdentity } from '@/hooks/useIdentity'
import { useIdentityArchitect } from '@/hooks/useIdentityArchitect'
import { usePages } from '@/hooks/usePages'
import { useUI } from '@/hooks/useUI'
import { useVariables } from '@/hooks/useVariables'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { Cpu, Filter, LayoutGrid, Plus, ShieldCheck, Table2, Users } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PermissionMatrix } from './identity/PermissionMatrix'
import { PolicyFormModal } from './identity/PolicyFormModal'
import { PolicyRow } from './identity/PolicyRow'
import { PolicySandbox } from './identity/PolicySandbox'
import { RoleCard } from './identity/RoleCard'
import { RoleFormModal } from './identity/RoleFormModal'
import { IdentityBot } from './IdentityBot'

export function IdentityPermissions() {
  const { id: projectId } = useParams()
  const { isViewer } = useProjectRole()
  const { userTypes, policies, fetchIdentityData, addUserType, deleteUserType, updateUserType, addPolicy, deletePolicy, updatePolicy } = useIdentity()
  const { tables, fetchProjectData } = useDatabase()
  const { pages } = usePages()
  const { variables, fetchVariables } = useVariables()
  const { setViewAsUserTypeId, viewAsUserTypeId } = useUI()
  const { isOpen, setIsOpen } = useIdentityArchitect()

  const [activeTab, setActiveTab] = useState<'roles' | 'policies'>('roles')
  const [viewMode, setViewMode] = useState<'cards' | 'matrix'>('cards')
  const [sandboxPolicy, setSandboxPolicy] = useState<any | null>(null)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<any | null>(null)
  const [editingPolicy, setEditingPolicy] = useState<any | null>(null)
  const [managingPersonaRole, setManagingPersonaRole] = useState<any | null>(null)
  const [policyFilterUserType, setPolicyFilterUserType] = useState<string>('all')
  const [policyFilterOperation, setPolicyFilterOperation] = useState<string>('all')

  useEffect(() => {
    if (projectId) {
      fetchIdentityData(projectId as string)
      fetchProjectData(projectId as string)
      fetchVariables(projectId as string)
    }
  }, [projectId, fetchIdentityData, fetchProjectData, fetchVariables])

  const handleImpersonate = (roleId: string) => {
    setViewAsUserTypeId(viewAsUserTypeId === roleId ? null : roleId)
  }

  const impersonatedRole = userTypes.find(ut => ut.id === viewAsUserTypeId)

  const filteredPolicies = policies.filter(pol =>
    (policyFilterUserType === 'all' || pol.user_type_id === policyFilterUserType) &&
    (policyFilterOperation === 'all' || pol.policy_type === policyFilterOperation)
  )

  const tabs = [
    { id: 'roles' as const, name: 'User Roles', icon: Users, count: userTypes.length },
    { id: 'policies' as const, name: 'RLS Policies', icon: ShieldCheck, count: policies.length },
  ]

  return (
    <div className="flex h-full bg-white dark:bg-black transition-colors duration-300 overflow-hidden">
      <div className={cn("flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar text-black dark:text-white", isOpen && "pr-4")}>
        <PillarHeader
          title="Identity & Permissions"
          description="Architect your system's security model with granular Row Level Security and hierarchical user roles."
          stats={[
            { label: 'Active Roles', value: userTypes.length },
            { label: 'RLS Policies', value: policies.length }
          ]}
        >
          <div className="flex gap-2">
            <Button
              onClick={() => setIsOpen(!isOpen)}
              className={cn("px-4 h-10 text-xs font-bold rounded-md gap-2", isOpen ? "bg-violet-500 text-white hover:bg-violet-600 border-none" : "bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800")}
            >
              <Cpu className="size-3.5" /> AI Architect
            </Button>
          </div>
        </PillarHeader>

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
                  Role simulation active — The canvas is currently filtering screens to only show what is accessible to: <span className="font-mono font-bold capitalize">{impersonatedRole.name}</span>
                </span>
              </div>
              <button
                onClick={() => setViewAsUserTypeId(null)}
                className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                Stop simulation
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Navigation Tab bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-850 pb-2">
          <div className="flex bg-zinc-50 dark:bg-zinc-900/50 p-1 border border-zinc-200 dark:border-zinc-800 gap-1 overflow-x-auto select-none rounded-md">
            {tabs.map((tab) => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest border transition-all rounded-md whitespace-nowrap",
                    active
                      ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-sm"
                      : "bg-transparent text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border-transparent"
                  )}
                >
                  <tab.icon className="size-3.5" />
                  <span>{tab.name}</span>
                  <span className={cn("font-mono text-[9px] px-1.5 py-0.5 rounded", active ? "bg-white/20 dark:bg-black/10 text-white dark:text-black" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400")}>
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content Tabs container */}
        <div className="mt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'roles' && (
                <section className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 tracking-widest px-1 uppercase">User Roles</h3>
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
                        disabled={isViewer}
                        className="bg-black dark:bg-white px-4 text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 h-10 text-xs font-bold rounded-md gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus className="size-3.5" /> New User Type
                      </Button>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {viewMode === 'cards' ? (
                      <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-col-4 gap-4">
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
                            onManagePersonas={() => setEditingRole(ut)}
                            isViewer={isViewer}
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
              )}

              {activeTab === 'policies' && (
                <section className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 tracking-widest px-1 uppercase">RLS Policies</h3>
                      {sandboxPolicy && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-violet-500/10 border border-violet-500/20">
                          <Cpu className="size-3 text-violet-500" />
                          <span className="text-[9px] font-black text-violet-500 ">Sandbox Active</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Filter className="size-3.5 text-zinc-400" />
                        <Select value={policyFilterUserType} onValueChange={(v) => { if (v) setPolicyFilterUserType(v) }}>
                          <SelectTrigger className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs font-mono rounded-md h-10 w-[200px] text-black dark:text-white">
                            <SelectValue placeholder="Filter by User Type">
                              {policyFilterUserType === 'all' ? 'All User Types' : userTypes.find(ut => ut.id === policyFilterUserType)?.name || 'Filter by User Type'}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-md text-black dark:text-white">
                            <SelectItem value="all" className="text-xs">All User Types</SelectItem>
                            {userTypes.map(ut => (
                              <SelectItem key={ut.id} value={ut.id} className="text-xs">{ut.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={policyFilterOperation} onValueChange={(v) => { if (v) setPolicyFilterOperation(v) }}>
                          <SelectTrigger className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs font-mono rounded-md h-10 w-[160px] text-black dark:text-white">
                            <SelectValue placeholder="Filter by Operation">
                              {policyFilterOperation === 'all' ? 'All Operations' : policyFilterOperation.charAt(0).toUpperCase() + policyFilterOperation.slice(1)}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-md text-black dark:text-white">
                            <SelectItem value="all" className="text-xs">All Operations</SelectItem>
                            <SelectItem value="select" className="text-xs">Select</SelectItem>
                            <SelectItem value="insert" className="text-xs">Insert</SelectItem>
                            <SelectItem value="update" className="text-xs">Update</SelectItem>
                            <SelectItem value="delete" className="text-xs">Delete</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={() => setIsPolicyModalOpen(true)}
                        disabled={isViewer}
                        className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 px-4 text-black dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 h-10 text-xs font-bold rounded-md gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus className="size-3.5" /> Define Policy
                      </Button>
                    </div>
                  </div>

                  <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/40 overflow-hidden divide-y divide-x divide-zinc-150 dark:divide-zinc-900">
                    {filteredPolicies.map(pol => (
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
                        onEdit={() => setEditingPolicy(pol)}
                        isViewer={isViewer}
                      />
                    ))}
                  </div>

                  {filteredPolicies.length === 0 && (
                    <div className="py-20 border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-4">
                      <ShieldCheck className="size-12 text-zinc-200 dark:text-zinc-800" />
                      <div className="text-center">
                        <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 ">No policies found for these filters.</p>
                        <p className="text-[10px] text-zinc-300 dark:text-zinc-700 font-medium italic mt-1">Define RLS policies to secure your data entities.</p>
                      </div>
                    </div>
                  )}
                </section>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <RoleFormModal
          isOpen={isRoleModalOpen || !!editingRole}
          editingRole={editingRole}
          availableVariables={variables}
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
          isOpen={isPolicyModalOpen || !!editingPolicy}
          editingPolicy={editingPolicy}
          tables={tables}
          userTypes={userTypes}
          onClose={() => { setIsPolicyModalOpen(false); setEditingPolicy(null) }}
          onSave={async (payload) => {
            if (editingPolicy) {
              await updatePolicy(projectId as string, editingPolicy.id, payload)
            } else {
              await addPolicy(projectId as string, payload)
            }
          }}
        />


      </div>

      {/* Sandbox Drawer */}
      <AnimatePresence>
        {sandboxPolicy && (
          <PolicySandbox
            policy={sandboxPolicy}
            variables={variables}
            onClose={() => setSandboxPolicy(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && <IdentityBot />}
      </AnimatePresence>
    </div>
  )
}
