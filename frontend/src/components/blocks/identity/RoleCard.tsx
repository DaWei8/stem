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
  zinc: { border: 'border-zinc-400/50', text: 'text-zinc-400', bg: 'bg-zinc-400' },
  red: { border: 'border-red-500/50', text: 'text-red-500', bg: 'bg-red-500' },
  orange: { border: 'border-orange-500/50', text: 'text-orange-500', bg: 'bg-orange-500' },
  yellow: { border: 'border-yellow-500/50', text: 'text-yellow-500', bg: 'bg-yellow-500' },
  green: { border: 'border-emerald-500/50', text: 'text-emerald-500', bg: 'bg-emerald-500' },
  blue: { border: 'border-blue-500/50', text: 'text-blue-500', bg: 'bg-blue-500' },
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
  onManagePersonas: () => void
}

export function RoleCard({ role, policies, isImpersonating, onEdit, onDuplicate, onDelete, onImpersonate, onManagePersonas }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const colors = COLOR_MAP[role.color] ?? COLOR_MAP.zinc
  const rolePolicies = policies.filter(p => p.user_type_id === role.id)
  const instancesCount = role.persona?.instances?.length || 0

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={cn(
        'relative overflow-hidden rounded-none shadow-none border group transition-all cursor-pointer h-56 flex flex-col',
        isImpersonating
          ? 'border-amber-500/50 bg-amber-500/5 dark:bg-amber-900/10'
          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/50 hover:border-black dark:hover:border-zinc-500 hover:bg-white dark:hover:bg-black'
      )}>

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

        <CardHeader className="px-4">
          <div className={cn('size-9 mb-2 flex items-center justify-center border-2', colors.border)}>
            <User className={cn('size-4', colors.text)} />
          </div>
          <CardTitle className="text-base flex gap-2 font-black lowercase">
            {role.name}
            {/* Admin badge */}
            {role.is_admin && !isImpersonating && (
              <div className="flex items-center w-fit gap-1 px-2 py-0.5 bg-red-500/5 border border-red-500/20 rounded-full">
                <div className="size-1 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-black text-red-500 ">System Admin</span>
              </div>
            )}
            {/* Persona active badge */}
            {isImpersonating && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-full!">
                <span className="text-[8px] font-black text-amber-500 ">Active</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 pt-0 flex-1 flex flex-col justify-between gap-3">
          {role.description && (
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 line-clamp-2 leading-relaxed">{role.description}</p>
          )}

          <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-col text-[9px] font-mono text-zinc-400">
              <span>{rolePolicies.length} polic{rolePolicies.length === 1 ? 'y' : 'ies'}</span>
              <span>{instancesCount} instance{instancesCount === 1 ? '' : 's'}</span>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={(e) => { e.stopPropagation(); onManagePersonas(); }}
                className="text-[9px] font-black px-2 py-1 border border-zinc-250 dark:border-zinc-800 text-zinc-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white"
              >
                Personas
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onImpersonate(); }}
                className={cn(
                  'text-[9px] font-black px-2 py-1 border transition-all',
                  isImpersonating
                    ? 'border-amber-500/50 text-amber-500 bg-amber-500/10'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white'
                )}
              >
                {isImpersonating ? 'Exit' : 'Preview'}
              </button>
            </div>
          </div>

        </CardContent>
      </Card>
    </motion.div>
  )
}
