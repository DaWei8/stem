'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  MoreVertical, Edit3, Copy, Trash2, ShieldCheck, Zap, Users, Eye,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { COLOR_MAP, getRoleIcon } from './roleCardColors'

interface Props {
  role: {
    id: string
    name: string
    color?: string | null
    icon?: string | null
    description?: string | null
    is_admin?: boolean
    persona?: {
      instances?: any[]
    }
  }
  policies: any[]
  isImpersonating: boolean
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onImpersonate: () => void
  onManagePersonas: () => void
}

export function RoleCard({
  role,
  policies,
  isImpersonating,
  onEdit,
  onDuplicate,
  onDelete,
  onImpersonate,
  onManagePersonas
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const colors = COLOR_MAP[role.color || 'zinc'] ?? COLOR_MAP.zinc
  const rolePolicies = policies.filter(p => p.user_type_id === role.id)
  const instancesCount = role.persona?.instances?.length || 0

  const RoleIcon = getRoleIcon(role.icon, role.name)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        'relative overflow-hidden rounded-xl border group transition-all duration-300 cursor-pointer h-64 flex flex-col',
        isImpersonating
          ? 'border-amber-500/50 bg-linear-to-b from-amber-500/5 to-amber-500/2 dark:from-amber-950/20 dark:to-amber-950/5 shadow-[0_0_25px_rgba(245,158,11,0.15)]'
          : cn(
            'border-zinc-200/80 dark:border-zinc-900 bg-linear-to-b from-white via-zinc-50/20 to-zinc-50/40 dark:from-zinc-950 dark:via-zinc-950/60 dark:to-zinc-950/20',
            colors.hoverBorder,
            colors.glow
          )
      )}>
        {/* Modern Dynamic Ambient Glow Sphere */}
        <div className={cn(
          'absolute -top-16 -left-16 size-40 rounded-full blur-3xl opacity-0 group-hover:opacity-15 dark:group-hover:opacity-20 transition-opacity duration-500 pointer-events-none',
          colors.glowBg
        )} />

        {/* High-tech Dotted Architect Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_14px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_10%,#000_70%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Dynamic color top accent line */}
        <div className={cn('absolute top-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-1.5', colors.accentLine)} />

        {/* Action dropdown */}
        <div className="absolute top-4.5 right-3.5 z-10">
          <DropdownMenu onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger render={
              <Button variant="ghost" size="icon" className="size-8 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md">
                <MoreVertical className="size-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200" />
              </Button>
            } />
            <DropdownMenuContent align="end" className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-md shadow-xl text-black dark:text-white">
              <DropdownMenuItem onClick={onEdit} className="text-xs font-bold py-2 gap-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-md">
                <Edit3 className="size-3 text-zinc-400" /> Edit Role
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate} className="text-xs font-bold py-2 gap-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-md">
                <Copy className="size-3 text-zinc-400" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-xs font-bold py-2 gap-2 cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-md">
                <Trash2 className="size-3" /> Purge Role
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CardHeader className="px-5 pt-2">
          <div className={cn(
            'size-10 mb-1 flex items-center justify-center border rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:rotate-1 shadow-sm',
            colors.iconBorder,
            colors.iconBg
          )}>
            <User className={cn('size-5 transition-colors', colors.iconText)} />
          </div>
          <CardTitle className="text-sm flex items-center gap-2 font-bold tracking-tight text-zinc-900 dark:text-zinc-100 transition-colors">
            <span className="capitalize">{role.name}</span>
            {/* System Admin indicator */}
            {role.is_admin && !isImpersonating && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full">
                <span className="relative flex size-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-1.5 bg-red-500"></span>
                </span>
                <span className="text-[8px] font-black uppercase tracking-wider text-red-500 dark:text-red-400">System Admin</span>
              </div>
            )}

            {/* Impersonation active badge */}
            {isImpersonating && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-full">
                <span className="relative flex size-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-1.5 bg-amber-500"></span>
                </span>
                <span className="text-[8px] font-black uppercase tracking-wider text-amber-500">Active</span>
              </div>
            )}
          </CardTitle>
          <div className="flex mt-1 items-center gap-2 text-[10px] text-nowrap font-semibold">
            <div className="flex items-center gap-1 px-2 py-1 rounded-md w-fit bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/60 text-zinc-500 dark:text-zinc-400 font-mono">
              <ShieldCheck className="size-3 text-zinc-400 dark:text-zinc-500 shrink-0" />
              <span>{rolePolicies.length} policies</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-md w-fit bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/60 text-zinc-500 dark:text-zinc-400 font-mono">
              <Zap className="size-3 text-zinc-400 dark:text-zinc-500 shrink-0" />
              <span>{instancesCount} instances</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-5 pb-2 pt-0 flex-1 flex flex-col justify-between gap-4">
          {role.description ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-medium">
              {role.description}
            </p>
          ) : (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 italic leading-relaxed font-medium">
              No description provided for this user type.
            </p>
          )}

          {/* Stats indicators & quick action buttons */}
          <div className="grid grid-cols-2 gap-2 mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-900/60">
            <button
              onClick={(e) => { e.stopPropagation(); onManagePersonas(); }}
              className="text-[10px] font-bold px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-200 bg-white/50 dark:bg-zinc-950/50 flex items-center gap-1 shadow-sm"
            >
              <Users className="size-3 text-zinc-400 dark:text-zinc-500" />
              Add Personas
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onImpersonate(); }}
              className={cn(
                'text-[10px] font-bold px-2.5 py-1.5 rounded-md border transition-all duration-200 flex items-center gap-1 shadow-sm',
                isImpersonating
                  ? 'border-amber-500/50 text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-700 bg-white/50 dark:bg-zinc-950/50'
              )}
            >
              <Eye className={cn("size-3", isImpersonating ? "text-amber-500" : "text-zinc-400 dark:text-zinc-500")} />
              {isImpersonating ? 'Exit' : 'Preview'}
            </button>
          </div>

        </CardContent>
      </Card>
    </motion.div>
  )
}
