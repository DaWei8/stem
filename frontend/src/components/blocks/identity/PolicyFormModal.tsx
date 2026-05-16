'use client'

import { useState } from 'react'
import { SlideInModal } from '@/components/ui/SlideInModal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface PolicyData {
  name: string
  table_id: string
  user_type_id: string
  policy_type: 'select' | 'insert' | 'update' | 'delete'
  policy_logic: string
}

interface Props {
  isOpen: boolean
  tables: any[]
  userTypes: any[]
  onClose: () => void
  onSave: (payload: PolicyData) => Promise<void>
}

const EMPTY: PolicyData = {
  name: '',
  table_id: '',
  user_type_id: 'all',
  policy_type: 'select',
  policy_logic: 'true'
}

export function PolicyFormModal({ isOpen, tables, userTypes, onClose, onSave }: Props) {
  const [data, setData] = useState<PolicyData>(EMPTY)

  const handleSave = async () => {
    if (!data.name || !data.table_id) {
      toast.error('Policy identifier and target entity are required.')
      return
    }
    // Normalize 'all' → null for global policies (cast away for the server action)
    const payload: PolicyData = {
      ...data,
      user_type_id: data.user_type_id === 'all' ? '' : data.user_type_id
    }
    await onSave(payload)
    setData(EMPTY)
    onClose()
  }

  const patchData = (update: Partial<PolicyData>) =>
    setData(prev => ({ ...prev, ...update }))

  return (
    <SlideInModal
      isOpen={isOpen}
      onClose={onClose}
      title="Define Security Policy"
      description="Establish a Row-Level Security (RLS) rule for an entity."
      footer={
        <Button
          onClick={handleSave}
          className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-none h-12 text-[10px] font-black "
        >
          Deploy Policy
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-zinc-400 ">Policy Identifier</Label>
          <Input
            value={data.name}
            onChange={e => patchData({ name: e.target.value.replace(/\s+/g, '_').toUpperCase() })}
            placeholder="e.g. CAN_VIEW_PRIVATE_PROFILES"
            className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none h-12 font-mono text-black dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-zinc-400 ">Target Entity</Label>
            <Select value={data.table_id} onValueChange={v => patchData({ table_id: v ?? '' })}>
              <SelectTrigger className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none h-12 text-xs text-black dark:text-white w-full">
                <SelectValue placeholder="Select Table" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-none">
                {tables.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black text-zinc-400 ">User Archetype</Label>
            <Select value={data.user_type_id} onValueChange={v => patchData({ user_type_id: v ?? 'all' })}>
              <SelectTrigger className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none h-12 text-xs text-black dark:text-white w-full">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-none">
                <SelectItem value="all">All Identities (Global)</SelectItem>
                {userTypes.map(ut => <SelectItem key={ut.id} value={ut.id}>{ut.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black text-zinc-400 ">Action Type</Label>
          <Select
            value={data.policy_type}
            onValueChange={v => patchData({ policy_type: (v ?? 'select') as PolicyData['policy_type'] })}
          >
            <SelectTrigger className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none h-12 text-xs text-black dark:text-white w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-none">
              {['select', 'insert', 'update', 'delete'].map(op => (
                <SelectItem key={op} value={op}>{op.toUpperCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black text-zinc-400 ">Policy Expression (SQL / Logic)</Label>
          <textarea
            value={data.policy_logic}
            onChange={e => patchData({ policy_logic: e.target.value })}
            placeholder="e.g. auth.uid() = user_id AND is_verified = true"
            className="bg-zinc-950 w-full min-h-[120px] p-4 border border-zinc-800 rounded-none text-sm font-mono focus:outline-none focus:border-violet-500 transition-colors resize-none text-emerald-400"
          />
          <p className="text-[9px] text-zinc-500 font-mono">
            Reference variables by name (e.g.{' '}
            <span className="text-violet-400">var_auth_status</span>) to enable Constraint Lineage tracing.
          </p>
        </div>
      </div>
    </SlideInModal>
  )
}
