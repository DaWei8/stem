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
import { SlideInModal } from '@/components/ui/SlideInModal'
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
  const { tables, fetchProjectData } = useDatabase()

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<any | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleDescription, setNewRoleDescription] = useState('')
  const [isNewRoleAdmin, setIsNewRoleAdmin] = useState(false)
  const [newRoleColor, setNewRoleColor] = useState('zinc')

  interface PolicyData {
    name: string;
    table_id: string;
    user_type_id: string;
    policy_type: 'select' | 'insert' | 'update' | 'delete';
    policy_logic: string;
  }

  const [newPolicyData, setNewPolicyData] = useState<PolicyData>({
    name: '',
    table_id: '',
    user_type_id: 'all',
    policy_type: 'select',
    policy_logic: 'true'
  })

  useEffect(() => {
    if (projectId) {
      fetchIdentityData(projectId as string)
      fetchProjectData(projectId as string)
    }
  }, [projectId, fetchIdentityData, fetchProjectData])

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
    if (!newPolicyData.name || !newPolicyData.table_id || !projectId) {
      toast.error('Policy identifier and target entity are required.')
      return
    }

    // Normalize payload: handle 'all' as null for global policies
    const payload = {
      ...newPolicyData,
      user_type_id: newPolicyData.user_type_id === 'all' ? null : newPolicyData.user_type_id
    }

    await addPolicy(projectId as string, payload)
    setNewPolicyData({
      name: '',
      table_id: '',
      user_type_id: 'all',
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
              New User Type
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
                      <CardTitle className="text-lg font-black text-white lowercase">{ut.name}</CardTitle>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {policies.map((pol) => {
                const table = tables.find(t => t.id === pol.table_id)
                const userType = userTypes.find(ut => ut.id === pol.user_type_id)
                return (
                  <div key={pol.id}>
                    <Card className="bg-zinc-700/50 border-zinc-800 rounded-none shadow-none group hover:border-zinc-700 transition-all">
                      <div className="flex items-start px-4 p-2 gap-6">
                        <div className="bg-black size-10 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:border-zinc-600 transition-colors">
                          <Eye className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                        </div>

                        <div className="flex-1 space-y-3">
                          <p className="text-xs text-white font-bold tracking-tight mb-1">{pol.name} <span className="text-zinc-500 font-mono text-xs">({pol.policy_logic})</span></p>
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "text-[10px] font-black px-2 py-0.5 border uppercase tracking-tighter",
                              pol.policy_type === 'select' ? "border-blue-500/20 text-blue-400 bg-blue-500/5" :
                                pol.policy_type === 'insert' ? "border-green-500/20 text-green-400 bg-green-500/5" :
                                  "border-red-500/20 text-red-400 bg-red-500/5"
                            )}>
                              {pol.policy_type}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-500">
                              <span>on</span>
                              <span className="text-white text-[10px] font-mono">{table?.name || 'entity'}</span>
                              <span>for</span>
                              <span className="text-zinc-300 bg-black px-2 py-0.5 border border-zinc-800 text-[10px] font-bold">
                                {userType?.name || 'all'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => deletePolicy(projectId as string, pol.id)}
                            size="icon" className="size-9 border-zinc-800 rounded-none bg-red-900/10 text-red-400"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                )
              })}
            </div>

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

      {/* Role Management Drawer */}
      <SlideInModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Define Identity Role"
        description="Establish a new user archetype and their global permissions."
        footer={
          <Button onClick={handleAddRole} className="w-full bg-white text-black hover:bg-zinc-200 rounded-none h-12 text-xs font-black uppercase tracking-widest transition-all">
            Establish Role
          </Button>
        }
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-black text-zinc-500 ">Role Identifier</Label>
            <Input
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value.replace(/\s+/g, '_').toLowerCase())}
              placeholder="e.g. branch_manager"
              className="bg-black border-zinc-800 rounded-none h-12 font-mono text-white focus:border-white transition-colors"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-black text-zinc-500 ">Description</Label>
            <Textarea
              value={newRoleDescription}
              onChange={(e) => setNewRoleDescription(e.target.value)}
              placeholder="What can this user do in the system?"
              className="bg-black border-zinc-800 rounded-none min-h-[100px] text-sm text-white focus:border-white transition-colors resize-none"
            />
          </div>
          <div className="flex items-center gap-3 p-4 bg-black/30 border border-zinc-800">
            <Checkbox
              id="is_admin_new"
              checked={isNewRoleAdmin}
              onCheckedChange={(checked) => setIsNewRoleAdmin(!!checked)}
              className="border-zinc-700 data-[state=checked]:bg-white data-[state=checked]:text-black"
            />
            <Label htmlFor="is_admin_new" className="text-xs font-bold text-zinc-400 cursor-pointer">Grant Super-Admin Privileges</Label>
          </div>
          <div className="space-y-3">
            <Label className="text-xs font-black text-zinc-500 ">Theme Marker</Label>
            <div className="flex flex-wrap gap-2">
              {['zinc', 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'].map(color => (
                <button
                  key={color}
                  onClick={() => setNewRoleColor(color)}
                  className={cn(
                    "size-8 rounded-full border-2 transition-all",
                    newRoleColor === color ? "border-white scale-110" : "border-transparent",
                    color === 'zinc' && "bg-zinc-500",
                    color === 'red' && "bg-red-500",
                    color === 'orange' && "bg-orange-500",
                    color === 'yellow' && "bg-yellow-500",
                    color === 'green' && "bg-green-500",
                    color === 'blue' && "bg-blue-500",
                    color === 'indigo' && "bg-indigo-500",
                    color === 'violet' && "bg-violet-500"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </SlideInModal>

      {/* Edit Role Drawer */}
      <SlideInModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modify Identity Role"
        description="Update archetype parameters and permissions."
        footer={
          <Button onClick={handleEditRole} className="w-full bg-white text-black hover:bg-zinc-200 rounded-none h-12 text-xs font-black transition-all">
            Save Changes
          </Button>
        }
      >
        {editingRole && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-black text-zinc-500 ">Role Identifier</Label>
              <Input
                value={editingRole.name}
                onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value.replace(/\s+/g, '_').toLowerCase() })}
                className="bg-black border-zinc-800 rounded-none h-12 font-mono text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black text-zinc-500 ">Description</Label>
              <Textarea
                value={editingRole.description}
                onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                className="bg-black border-zinc-800 rounded-none min-h-[100px] text-sm text-white"
              />
            </div>
            <div className="flex items-center gap-3 p-4 bg-black/30 border border-zinc-800">
              <Checkbox
                id="is_admin_edit"
                checked={editingRole.is_admin}
                onCheckedChange={(checked) => setEditingRole({ ...editingRole, is_admin: !!checked })}
                className="border-zinc-700 data-[state=checked]:bg-white data-[state=checked]:text-black"
              />
              <Label htmlFor="is_admin_edit" className="text-xs font-bold text-zinc-400 cursor-pointer">Super-Admin Privileges</Label>
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-black text-zinc-500 ">Theme Marker</Label>
              <div className="flex flex-wrap gap-2">
                {['zinc', 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'].map(color => (
                  <button
                    key={color}
                    onClick={() => setEditingRole({ ...editingRole, color })}
                    className={cn(
                      "size-8 rounded-full border-2 transition-all",
                      editingRole.color === color ? "border-white scale-110" : "border-transparent",
                      color === 'zinc' && "bg-zinc-500",
                      color === 'red' && "bg-red-500",
                      color === 'orange' && "bg-orange-500",
                      color === 'yellow' && "bg-yellow-500",
                      color === 'green' && "bg-green-500",
                      color === 'blue' && "bg-blue-500",
                      color === 'indigo' && "bg-indigo-500",
                      color === 'violet' && "bg-violet-500"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </SlideInModal>

      {/* Policy Management Drawer */}
      <SlideInModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        title="Define Security Policy"
        description="Establish a Row-Level Security (RLS) rule for an entity."
        footer={
          <Button onClick={handleAddPolicy} className="w-full bg-white text-black hover:bg-zinc-200 rounded-none h-12 text-xs font-black transition-all">
            Deploy Policy
          </Button>
        }
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-black text-zinc-500 ">Policy Identifier</Label>
            <Input
              value={newPolicyData.name}
              onChange={(e) => setNewPolicyData({ ...newPolicyData, name: e.target.value.replace(/\s+/g, '_').toLowerCase() })}
              placeholder="e.g. view_private_profiles"
              className="bg-black border-zinc-800 rounded-none h-12 font-mono text-white focus:border-white transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-black text-zinc-500 ">Target Entity</Label>
              <Select value={newPolicyData.table_id} onValueChange={(v: any) => setNewPolicyData({ ...newPolicyData, table_id: v })}>
                <SelectTrigger className="bg-black border-zinc-800 rounded-none h-12! w-full! text-xs text-white focus:border-white transition-colors">
                  <SelectValue placeholder="Select Table" />
                </SelectTrigger>
                <SelectContent className="bg-black border-zinc-800 text-white rounded-none">
                  {tables.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black text-zinc-500 ">User Archetype</Label>
              <Select value={newPolicyData.user_type_id} onValueChange={(v: any) => setNewPolicyData({ ...newPolicyData, user_type_id: v })}>
                <SelectTrigger className="bg-black border-zinc-800 rounded-none h-12! w-full! text-xs text-white focus:border-white transition-colors">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent className="bg-black border-zinc-800 text-white rounded-none">
                  <SelectItem value="all">All Identities (Global)</SelectItem>
                  {userTypes.map(ut => (
                    <SelectItem key={ut.id} value={ut.id}>{ut.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black text-zinc-500 ">Action Type</Label>
            <Select value={newPolicyData.policy_type} onValueChange={(v: any) => setNewPolicyData({ ...newPolicyData, policy_type: v })}>
              <SelectTrigger className="bg-black border-zinc-800 rounded-none h-12! w-full! text-xs text-white focus:border-white transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-zinc-800 text-white rounded-none">
                <SelectItem value="select">SELECT</SelectItem>
                <SelectItem value="insert">INSERT</SelectItem>
                <SelectItem value="update">UPDATE</SelectItem>
                <SelectItem value="delete">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black text-zinc-500 ">Policy Expression (SQL)</Label>
            <div className="relative group">
              <textarea
                value={newPolicyData.policy_logic}
                onChange={(e) => setNewPolicyData({ ...newPolicyData, policy_logic: e.target.value })}
                placeholder="e.g. auth.uid() = user_id"
                className="bg-black w-full min-h-[120px] p-4 border border-zinc-800 rounded-none text-sm font-mono focus:outline-none focus:border-white transition-colors resize-none text-white selection:bg-white/20"
              />
              <div className="absolute bottom-2 right-2 opacity-30 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-mono text-zinc-600">SQL Expression</span>
              </div>
            </div>
          </div>
        </div>
      </SlideInModal>
    </div>
  )
}
