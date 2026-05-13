'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  MoreVertical, Edit3, Copy, Trash2, User, ShieldCheck, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const COLOR_MAP: Record<string, { border: string; text: string; bg: string }> = {
  zinc:   { border: 'border-zinc-400/50',   text: 'text-zinc-400',   bg: 'bg-zinc-400' },
  red:    { border: 'border-red-500/50',    text: 'text-red-500',    bg: 'bg-red-500' },
  orange: { border: 'border-orange-500/50', text: 'text-orange-500', bg: 'bg-orange-500' },
  yellow: { border: 'border-yellow-500/50', text: 'text-yellow-500', bg: 'bg-yellow-500' },
  green:  { border: 'border-emerald-500/50',text: 'text-emerald-500',bg: 'bg-emerald-500' },
  blue:   { border: 'border-blue-500/50',   text: 'text-blue-500',   bg: 'bg-blue-500' },
  indigo: { border: 'border-indigo-500/50', text: 'text-indigo-500', bg: 'bg-indigo-500' },
  violet: { border: 'border-violet-500/50', text: 'text-violet-500', bg: 'bg-violet-500' },
}

interface Props {
  role: any
  policies: any[]
  isImpersonating: boolean
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onImpersonate: () => void
}

export function RoleCard({ role, policies, isImpersonating, onEdit, onDuplicate, onDelete, onImpersonate }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const colors = COLOR_MAP[role.color] ?? COLOR_MAP.zinc
  const rolePolicies = policies.filter(p => p.user_type_id === role.id)

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={cn(
        'relative overflow-hidden rounded-none shadow-none border group transition-all cursor-pointer min-h-44 flex flex-col',
        isImpersonating
          ? 'border-amber-500/50 bg-amber-500/5 dark:bg-amber-900/10'
          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/50 hover:border-black dark:hover:border-zinc-500 hover:bg-white dark:hover:bg-black'
      )}>
        {/* Admin badge */}
        {role.is_admin && !isImpersonating && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-red-500/5 border border-red-500/20 rounded-full">
            <div className="size-1 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">System Admin</span>
          </div>
        )}

        {/* X-Ray active badge */}
        {isImpersonating && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-full">
            <Zap className="size-2.5 text-amber-500" />
            <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">X-Ray Active</span>
          </div>
        )}

        {/* Context menu */}
        <div className="absolute top-2 right-2">
          <DropdownMenu onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger render={
              <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-100 dark:hover:bg-zinc-900">
                <MoreVertical className="size-3.5 text-zinc-400" />
              </Button>
            } />
            <DropdownMenuContent align="end" className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none shadow-xl text-black dark:text-white">
              <DropdownMenuItem onClick={onEdit} className="text-xs font-bold py-2 gap-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-none">
                <Edit3 className="size-3" /> Edit Role
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate} className="text-xs font-bold py-2 gap-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-none">
                <Copy className="size-3" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-xs font-bold py-2 gap-2 cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-none">
                <Trash2 className="size-3" /> Purge Role
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CardHeader className="p-4 pb-2 mt-6">
          <div className={cn('size-9 flex items-center justify-center border-2', colors.border)}>
            <User className={cn('size-4', colors.text)} />
          </div>
          <CardTitle className="text-base font-black lowercase">{role.name}</CardTitle>
        </CardHeader>

        <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-between gap-3">
          {role.description && (
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 line-clamp-2 leading-relaxed">{role.description}</p>
          )}
          <div className="flex items-center justify-between mt-auto">
            <span className="text-[9px] font-mono text-zinc-400">{rolePolicies.length} polic{rolePolicies.length === 1 ? 'y' : 'ies'}</span>
            <button
              onClick={onImpersonate}
              className={cn(
                'text-[9px] font-black uppercase tracking-widest px-2 py-1 border transition-all',
                isImpersonating
                  ? 'border-amber-500/50 text-amber-500 bg-amber-500/10'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white'
              )}
            >
              {isImpersonating ? 'Exit X-Ray' : 'Test as Role'}
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
