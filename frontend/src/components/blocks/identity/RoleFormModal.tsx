'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { SlideInModal } from '@/components/ui/SlideInModal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const COLORS = ['zinc', 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'] as const
const COLOR_BG: Record<string, string> = {
  zinc: 'bg-zinc-500', red: 'bg-red-500', orange: 'bg-orange-500', yellow: 'bg-yellow-500',
  green: 'bg-emerald-500', blue: 'bg-blue-500', indigo: 'bg-indigo-500', violet: 'bg-violet-500'
}

interface Props {
  isOpen: boolean
  editingRole: any | null
  onClose: () => void
  onSave: (payload: any) => Promise<void>
}

export function RoleFormModal({ isOpen, editingRole, onClose, onSave }: Props) {
  const [name, setName] = useState(editingRole?.name ?? '')
  const [description, setDescription] = useState(editingRole?.description ?? '')
  const [isAdmin, setIsAdmin] = useState(editingRole?.is_admin ?? false)
  const [color, setColor] = useState(editingRole?.color ?? 'zinc')

  // Sync with editing role when it changes
  const syncedName = editingRole?.name ?? name
  const syncedDesc = editingRole?.description ?? description

  const handleSave = async () => {
    const finalName = editingRole ? editingRole.name : name
    if (!finalName) { toast.error('Role identifier is required.'); return }
    await onSave({ name: finalName, description: editingRole ? editingRole.description : description, is_admin: isAdmin, color })
    onClose()
  }

  return (
    <SlideInModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingRole ? 'Modify User Role' : 'Define User Role'}
      description={editingRole ? 'Update archetype parameters and permissions.' : 'Establish a new user archetype and their global permissions.'}
      footer={
        <Button onClick={handleSave} className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-md h-12 text-[10px] font-black ">
          {editingRole ? 'Save Changes' : 'Establish Role'}
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-zinc-400 ">Role Identifier</Label>
          <Input
            value={editingRole ? editingRole.name : name}
            onChange={e => editingRole ? null : setName(e.target.value.replace(/\s+/g, '_').toLowerCase())}
            placeholder="e.g. branch_manager"
            className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-md h-12 font-mono text-black dark:text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-zinc-400 ">Description</Label>
          <Textarea
            value={editingRole ? editingRole.description : description}
            onChange={e => editingRole ? null : setDescription(e.target.value)}
            placeholder="What can this user do in the system?"
            className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-md min-h-[100px] text-xs resize-none text-black dark:text-white"
          />
        </div>
        <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-zinc-800">
          <Checkbox
            id="is_admin"
            checked={isAdmin}
            onCheckedChange={v => setIsAdmin(!!v)}
            className="border-zinc-300 dark:border-zinc-700 data-[state=checked]:bg-black dark:data-[state=checked]:bg-white"
          />
          <Label htmlFor="is_admin" className="text-[10px] font-black text-zinc-400  cursor-pointer">
            Grant Super-Admin Privileges
          </Label>
        </div>
        <div className="space-y-3">
          <Label className="text-[10px] font-black text-zinc-400 ">Theme Marker</Label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  'size-8 rounded-full border-2 transition-all',
                  color === c ? 'border-black dark:border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100',
                  COLOR_BG[c]
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </SlideInModal>
  )
}
