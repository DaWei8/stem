'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, MoreVertical, Lock, Eye, Edit3, Trash2, ArrowRight, ShieldCheck, Copy, Palette, User } from 'lucide-react'
import { useIdentity } from '@/hooks/useIdentity'
import { useDatabase } from '@/hooks/useDatabase'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { PillarHeader } from '@/components/layout/PillarHeader'
import { cn } from '@/lib/utils'
import { StandardModal } from '@/components/ui/StandardModal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function IdentityPermissions() {
  const { id: projectId } = useParams()
  const {
    userTypes,
    policies,
    fetchIdentityData,
    addUserType,
    deleteUserType,
    updateUserType,
    addPolicy,
    deletePolicy
  } = useIdentity()
  const { tables } = useDatabase()

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<any | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleDescription, setNewRoleDescription] = useState('')
  const [isNewRoleAdmin, setIsNewRoleAdmin] = useState(false)
  const [newRoleColor, setNewRoleColor] = useState('zinc')

  const [newPolicyData, setNewPolicyData] = useState({
    name: '',
    table_id: '',
    user_type_id: '',
    policy_type: 'select' as any,
    policy_logic: 'true'
  })

  useEffect(() => {
    if (projectId) {
      fetchIdentityData(projectId as string)
    }
  }, [projectId, fetchIdentityData])

  const handleAddRole = async () => {
    if (!newRoleName || !projectId) return

    const isDuplicate = userTypes.some(ut => ut.name.toLowerCase() === newRoleName.toLowerCase())
    if (isDuplicate) {
      toast.error(`A role with the identifier "${newRoleName}" already exists in this project.`)
      return
    }

    await addUserType(projectId as string, {
      name: newRoleName,
      description: newRoleDescription,
      is_admin: isNewRoleAdmin,
      color: newRoleColor
    })
    setNewRoleName('')
    setNewRoleDescription('')
    setIsNewRoleAdmin(false)
    setNewRoleColor('zinc')
    setIsRoleModalOpen(false)
  }

  const handleEditRole = async () => {
    if (!editingRole || !projectId) return
    await updateUserType(projectId as string, editingRole.id, {
      name: editingRole.name,
      description: editingRole.description,
      is_admin: editingRole.is_admin,
      color: editingRole.color
    })
    setEditingRole(null)
    setIsEditModalOpen(false)
  }

  const handleDuplicateRole = (role: any) => {
    setNewRoleName(`${role.name}_copy`)
    setNewRoleDescription(role.description || '')
    setIsNewRoleAdmin(role.is_admin || false)
    setNewRoleColor(role.color || 'zinc')
    setIsRoleModalOpen(true)
  }

  const handleAddPolicy = async () => {
    if (!newPolicyData.name || !newPolicyData.table_id || !projectId) return
    await addPolicy(projectId as string, newPolicyData)
    setNewPolicyData({
      name: '',
      table_id: '',
      user_type_id: '',
      policy_type: 'select',
      policy_logic: 'true'
    })
    setIsPolicyModalOpen(false)
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  }

  return (
    <div className="p-8 space-y-8 bg-black min-h-full text-white selection:bg-white/20">
      <PillarHeader
        title="Identity & Permissions"
        description="Architect your system's security model with granular Row Level Security and hierarchical user roles."
        stats={[
          { label: 'Active Roles', value: userTypes.length },
          { label: 'RLS Policies', value: policies.length }
        ]}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight">User Roles</h3>
            <Button
              onClick={() => setIsRoleModalOpen(true)}
              className="bg-white px-4 text-black hover:bg-zinc-200 h-11 text-xs font-semibold  transition-all rounded-none hover:gap-3 group"
            >
              <Plus className="size-4.5" />
              New Role
              <ArrowRight className="w-0 h-3 group-hover:w-3 transition-all" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <AnimatePresence>
              {userTypes.map((ut) => (
                <motion.div key={ut.id} variants={itemVariants} layout>
                  <Card className="bg-black/50 p-4 border-zinc-800 rounded-none shadow-none group hover:border-zinc-500 h-full min-h-44 hover:bg-black transition-all cursor-pointer relative overflow-hidden">
                    <div className="absolute top-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="size-4 text-zinc-500" />
                          </Button>
                        } />
                        <DropdownMenuContent align="end" className="bg-black border-zinc-800 text-white rounded-none">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingRole(ut)
                              setIsEditModalOpen(true)
                            }}
                            className="hover:bg-zinc-900 rounded-none text-xs font-bold py-2 flex items-center gap-2 cursor-pointer"
                          >
                            <Edit3 className="size-3" /> Edit Role
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDuplicateRole(ut)}
                            className="hover:bg-zinc-900 rounded-none text-xs font-bold py-2 flex items-center gap-2 cursor-pointer"
                          >
                            <Copy className="size-3" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteUserType(projectId as string, ut.id)} className="text-red-400 hover:bg-red-950 rounded-none text-xs font-bold py-2 flex items-center gap-2 cursor-pointer">
                            <Trash2 className="size-3" /> Purge Role
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardHeader className="p-0">
                      <div className={cn(
                        "size-10 bg-zinc-900/50 border-2 border-zinc-800 flex items-center justify-center transition-colors",
                        ut.color === 'red' && "border-red-500/50 text-red-400",
                        ut.color === 'orange' && "border-orange-500/50 text-orange-400",
                        ut.color === 'yellow' && "border-yellow-500/50 text-yellow-400",
                        ut.color === 'green' && "border-green-500/50 text-green-400",
                        ut.color === 'blue' && "border-blue-500/50 text-blue-400",
                        ut.color === 'indigo' && "border-indigo-500/50 text-indigo-400",
                        ut.color === 'violet' && "border-violet-500/50 text-violet-400"
                      )}>
                        <User className={cn(
                          "size-5 text-zinc-500 transition-colors",
                          ut.color === 'red' && "text-red-400",
                          ut.color === 'orange' && "text-orange-400",
                          ut.color === 'yellow' && "text-yellow-400",
                          ut.color === 'green' && "text-green-400",
                          ut.color === 'blue' && "text-blue-400",
                          ut.color === 'indigo' && "text-indigo-400",
                          ut.color === 'violet' && "text-violet-400"
                        )} />
                      </div>
                      <CardTitle className="text-lg font-black lowercase">{ut.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {ut.description && (
                        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{ut.description}</p>
                      )}
                      {ut.is_admin && (
                        <div className="inline-flex absolute top-2 right-2 items-center gap-1.5 px-2 py-0.5 bg-red-950/30 border border-red-900/50 rounded-full">
                          <div className="size-1 bg-red-500 rounded-full animate-pulse" />
                          <span className="text-[8px] font-black text-red-400 uppercase tracking-widest">System Admin</span>
                        </div>
                      )}

                      <div className="flex absolute bottom-0 right-0 gap-1">
                        <div className={cn("size-4 bg-zinc-800 transition-colors", ut.color === 'red' && "bg-red-500", ut.color === 'orange' && "bg-orange-500", ut.color === 'yellow' && "bg-yellow-500", ut.color === 'green' && "bg-green-500", ut.color === 'blue' && "bg-blue-500", ut.color === 'indigo' && "bg-indigo-500", ut.color === 'violet' && "bg-violet-500")} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight">RLS Policies</h3>
            <Button
              onClick={() => setIsPolicyModalOpen(true)}
              className="bg-black border border-zinc-800 px-4 text-white hover:bg-zinc-800 h-11 text-xs font-semibold  transition-all rounded-none gap-2"
            >
              <Plus className="size-4.5" />
              Define Policy
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
              {policies.map((pol) => {
                const table = tables.find(t => t.id === pol.table_id)
                const userType = userTypes.find(ut => ut.id === pol.user_type_id)
                return (
                  <motion.div key={pol.id} variants={itemVariants} layout>
                    <Card className="bg-black border-zinc-800 rounded-none shadow-none group hover:border-zinc-700 transition-all">
                      <div className="flex items-center p-6 gap-6">
                        <div className="bg-black size-12 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:border-zinc-600 transition-colors">
                          <Eye className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                        </div>

                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "text-xs font-black px-2 py-0.5 border uppercase tracking-tighter",
                              pol.policy_type === 'select' ? "border-blue-500/20 text-blue-400 bg-blue-500/5" :
                                pol.policy_type === 'insert' ? "border-green-500/20 text-green-400 bg-green-500/5" :
                                  "border-red-500/20 text-red-400 bg-red-500/5"
                            )}>
                              {pol.policy_type}
                            </span>
                            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                              <span>on</span>
                              <span className="text-white font-mono">{table?.name || 'entity'}</span>
                              <span>for</span>
                              <span className="text-zinc-300 bg-black px-2 py-0.5 border border-zinc-800 text-xs font-bold">
                                {userType?.name || 'all'}
                              </span>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-bold tracking-tight mb-1">{pol.name}</p>
                            <div className="flex items-center gap-2">
                              <div className="h-px w-4 bg-zinc-800" />
                              <code className="text-xs text-zinc-600 font-mono italic">USING ({pol.policy_logic})</code>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <Button
                            onClick={() => deletePolicy(projectId as string, pol.id)}
                            variant="outline" size="icon" className="size-9 border-zinc-800 rounded-none hover:bg-red-900/20 hover:text-red-400 transition-all"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {policies.length === 0 && (
              <div className="py-20 border border-dashed border-zinc-800 flex flex-col items-center justify-center gap-4 text-center">
                <ShieldCheck className="size-12 text-zinc-800" />
                <div>
                  <p className="text-xs font-black text-zinc-500">Security model unCreated.</p>
                  <p className="text-xs text-zinc-700 font-medium">Define RLS policies to secure your data entities.</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </motion.div>

      {/* Role Modal */}
      <StandardModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="User Role"
        description="Define a new user classification for permission scoping."
        confirmText="Create Role"
        onConfirm={handleAddRole}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-black text-zinc-500 ">Role Identifier</Label>
            <Input
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="e.g. system_auditor"
              className="bg-black border-zinc-800 rounded-none h-12 text-sm font-mono text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black text-zinc-500 ">Description</Label>
            <Textarea
              value={newRoleDescription}
              onChange={(e) => setNewRoleDescription(e.target.value)}
              placeholder="Briefly describe the scope of this user classification..."
              className="bg-black border-zinc-800 rounded-none min-h-20 text-xs text-white resize-none"
            />
          </div>

          <div className="flex items-center space-x-2 p-4 bg-zinc-900/30 border border-zinc-800">
            <Checkbox
              id="admin"
              checked={isNewRoleAdmin}
              onCheckedChange={(checked) => setIsNewRoleAdmin(!!checked)}
            />
            <label
              htmlFor="admin"
              className="text-xs font-bold text-zinc-400 cursor-pointer"
            >
              Grant Administrative Privileges
            </label>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black text-zinc-500 ">Classification Color</Label>
            <Select value={newRoleColor} onValueChange={(v) => setNewRoleColor(v || 'zinc')}>
              <SelectTrigger className="bg-black border-zinc-800 rounded-none h-12! w-full! text-xs text-white">
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent className="bg-black min-h-12! w-full! border-zinc-800 text-white rounded-none">
                <SelectItem value="zinc" className="bg-zinc-500" >Default (Zinc)</SelectItem>
                <SelectItem value="red" className="bg-red-500" >Red</SelectItem>
                <SelectItem value="orange" className="bg-orange-500" >Orange</SelectItem>
                <SelectItem value="yellow" className="bg-yellow-500" >Yellow</SelectItem>
                <SelectItem value="green" className="bg-green-500" >Green</SelectItem>
                <SelectItem value="blue" className="bg-blue-500" >Blue</SelectItem>
                <SelectItem value="indigo" className="bg-indigo-500" >Indigo</SelectItem>
                <SelectItem value="violet" className="bg-violet-500" >Violet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </StandardModal>

      {/* Edit Role Modal */}
      <StandardModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingRole(null)
        }}
        title="Edit User Role"
        description="Update the configuration for this user classification."
        confirmText="Save Changes"
        onConfirm={handleEditRole}
      >
        {editingRole && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-black text-zinc-500 ">Role Identifier</Label>
              <Input
                value={editingRole.name}
                onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                className="bg-black border-zinc-800 rounded-none h-12 text-sm font-mono text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black text-zinc-500 ">Description</Label>
              <Textarea
                value={editingRole.description || ''}
                onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                className="bg-black border-zinc-800 rounded-none min-h-[100px] text-xs text-white resize-none"
              />
            </div>

            <div className="flex items-center space-x-2 p-4 bg-zinc-900/30 border border-zinc-800">
              <Checkbox
                id="edit-admin"
                checked={editingRole.is_admin}
                onCheckedChange={(checked) => setEditingRole({ ...editingRole, is_admin: !!checked })}
              />
              <label
                htmlFor="edit-admin"
                className="text-xs font-bold text-zinc-400 cursor-pointer"
              >
                Grant Administrative Privileges
              </label>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black text-zinc-500 ">Classification Color</Label>
              <Select
                value={editingRole.color || 'zinc'}
                onValueChange={(v) => setEditingRole({ ...editingRole, color: v || 'zinc' })}
              >
                <SelectTrigger className="bg-black border-zinc-800 rounded-none h-12! w-full! text-xs text-white">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent className="bg-black w-full! min-h-12! border-zinc-800 text-white rounded-none">
                  <SelectItem value="zinc" className="bg-zinc-500" >Default (Zinc)</SelectItem>
                  <SelectItem value="red" className="bg-red-500" >Red</SelectItem>
                  <SelectItem value="orange" className="bg-orange-500" >Orange</SelectItem>
                  <SelectItem value="yellow" className="bg-yellow-500" >Yellow</SelectItem>
                  <SelectItem value="green" className="bg-green-500" >Green</SelectItem>
                  <SelectItem value="blue" className="bg-blue-500" >Blue</SelectItem>
                  <SelectItem value="indigo" className="bg-indigo-500" >Indigo</SelectItem>
                  <SelectItem value="violet" className="bg-violet-500" >Violet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </StandardModal>

      {/* Policy Modal */}
      <StandardModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        title="Define Security Policy"
        description="Create a granular Row Level Security rule for an entity."
        confirmText="Create Policy"
        onConfirm={handleAddPolicy}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-black text-zinc-500 ">Policy Description</Label>
            <Input
              value={newPolicyData.name}
              onChange={(e) => setNewPolicyData({ ...newPolicyData, name: e.target.value.replace(/\s+/g, '_') })}
              placeholder="e.g. users_can_view_own_profile"
              className="bg-black border-zinc-800 rounded-none h-12 text-sm font-mono text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label className="text-xs font-black text-zinc-500 ">Target Entity</Label>
              <Select value={newPolicyData.table_id} onValueChange={(v) => setNewPolicyData({ ...newPolicyData, table_id: v || '' })}>
                <SelectTrigger className="bg-black border-zinc-800 rounded-none h-12! w-full! text-xs text-white">
                  <SelectValue placeholder="Select table" />
                </SelectTrigger>
                <SelectContent className="bg-black lowercase border-zinc-800 text-white rounded-none h-12! w-full!">
                  {tables.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black text-zinc-500 ">User Type</Label>
              <Select value={newPolicyData.user_type_id} onValueChange={(v) => setNewPolicyData({ ...newPolicyData, user_type_id: v || '' })}>
                <SelectTrigger className="bg-black border-zinc-800 rounded-none h-12! w-full! text-xs text-white">
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent className="bg-black lowercase border-zinc-800 text-white rounded-none min-h-12! w-full!">
                  {userTypes.map(ut => <SelectItem key={ut.id} value={ut.id}>{ut.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black text-zinc-500 ">Action Type</Label>
              <Select value={newPolicyData.policy_type} onValueChange={(v) => setNewPolicyData({ ...newPolicyData, policy_type: (v as any) || 'select' })}>
                <SelectTrigger className="bg-black border-zinc-800 rounded-none h-12! w-full! text-xs text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-zinc-800 text-white rounded-none min-h-12! w-full!">
                  <SelectItem value="select">SELECT</SelectItem>
                  <SelectItem value="insert">INSERT</SelectItem>
                  <SelectItem value="update">UPDATE</SelectItem>
                  <SelectItem value="delete">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black text-zinc-500 ">Policy Expression (SQL)</Label>
              <Input
                value={newPolicyData.policy_logic}
                onChange={(e) => setNewPolicyData({ ...newPolicyData, policy_logic: e.target.value })}
                className="bg-black border-zinc-800 rounded-none h-full max-h-12! text-xs font-mono text-white resize-none"
              />
            </div>
          </div>

        </div>
      </StandardModal>
    </div>
  )
}
