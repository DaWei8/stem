import React from 'react'
import {
  User,
  ShieldAlert,
  Shield,
  Globe,
  Key,
  Lock,
  Settings,
  Store,
  Factory,
  Users,
  Eye,
  UserCheck,
  Cpu,
  Laptop,
  Database,
  HelpCircle
} from 'lucide-react'

export interface RoleTheme {
  border: string
  text: string
  bg: string
  hoverBorder: string
  glow: string
  badge: string
  iconBg: string
  iconBorder: string
  iconText: string
  accentLine: string
  glowBg: string
}

export const COLOR_MAP: Record<string, RoleTheme> = {
  zinc: { 
    border: 'border-zinc-200 dark:border-zinc-900', 
    text: 'text-zinc-500 dark:text-zinc-400', 
    bg: 'bg-zinc-100 dark:bg-zinc-900/50', 
    hoverBorder: 'group-hover:border-zinc-300 dark:group-hover:border-zinc-700', 
    glow: 'hover:shadow-[0_0_30px_-5px_rgba(113,113,122,0.15)]',
    badge: 'bg-zinc-500/10 border-zinc-500/20 text-zinc-500',
    iconBg: 'bg-zinc-50 dark:bg-zinc-900/80',
    iconBorder: 'border-zinc-200 dark:border-zinc-800',
    iconText: 'text-zinc-650 dark:text-zinc-300',
    accentLine: 'bg-zinc-400/20 dark:bg-zinc-700/30',
    glowBg: 'bg-zinc-500'
  },
  red: { 
    border: 'border-red-500/10 dark:border-red-500/10', 
    text: 'text-red-500 dark:text-red-400', 
    bg: 'bg-red-500/5 dark:bg-red-500/10', 
    hoverBorder: 'group-hover:border-red-500/30 dark:group-hover:border-red-500/40', 
    glow: 'hover:shadow-[0_0_30px_-5px_rgba(239,68,68,0.25)]',
    badge: 'bg-red-500/10 border-red-500/20 text-red-500 dark:text-red-400',
    iconBg: 'bg-red-500/5 dark:bg-red-500/10',
    iconBorder: 'border-red-500/20 dark:border-red-500/30',
    iconText: 'text-red-500 dark:text-red-400',
    accentLine: 'bg-red-500/30',
    glowBg: 'bg-red-500'
  },
  orange: { 
    border: 'border-orange-500/10 dark:border-orange-500/10', 
    text: 'text-orange-500 dark:text-orange-400', 
    bg: 'bg-orange-500/5 dark:bg-orange-500/10', 
    hoverBorder: 'group-hover:border-orange-500/30 dark:group-hover:border-orange-500/40', 
    glow: 'hover:shadow-[0_0_30px_-5px_rgba(249,115,22,0.25)]',
    badge: 'bg-orange-500/10 border-orange-500/20 text-orange-500 dark:text-orange-400',
    iconBg: 'bg-orange-500/5 dark:bg-orange-500/10',
    iconBorder: 'border-orange-500/20 dark:border-orange-500/30',
    iconText: 'text-orange-500 dark:text-orange-400',
    accentLine: 'bg-orange-500/30',
    glowBg: 'bg-orange-500'
  },
  yellow: { 
    border: 'border-yellow-500/10 dark:border-yellow-500/10', 
    text: 'text-yellow-500 dark:text-yellow-400', 
    bg: 'bg-yellow-500/5 dark:bg-yellow-500/10', 
    hoverBorder: 'group-hover:border-yellow-500/30 dark:group-hover:border-yellow-500/40', 
    glow: 'hover:shadow-[0_0_30px_-5px_rgba(234,179,8,0.25)]',
    badge: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500 dark:text-yellow-400',
    iconBg: 'bg-yellow-500/5 dark:bg-yellow-500/10',
    iconBorder: 'border-yellow-500/20 dark:border-yellow-500/30',
    iconText: 'text-yellow-500 dark:text-yellow-400',
    accentLine: 'bg-yellow-500/30',
    glowBg: 'bg-yellow-500'
  },
  green: { 
    border: 'border-emerald-500/10 dark:border-emerald-500/10', 
    text: 'text-emerald-500 dark:text-emerald-400', 
    bg: 'bg-emerald-500/5 dark:bg-emerald-500/10', 
    hoverBorder: 'group-hover:border-emerald-500/30 dark:group-hover:border-emerald-500/40', 
    glow: 'hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.25)]',
    badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400',
    iconBg: 'bg-emerald-500/5 dark:bg-emerald-500/10',
    iconBorder: 'border-emerald-500/20 dark:border-emerald-500/30',
    iconText: 'text-emerald-500 dark:text-emerald-400',
    accentLine: 'bg-emerald-500/30',
    glowBg: 'bg-emerald-500'
  },
  blue: { 
    border: 'border-blue-500/10 dark:border-blue-500/10', 
    text: 'text-blue-500 dark:text-blue-400', 
    bg: 'bg-blue-500/5 dark:bg-blue-500/10', 
    hoverBorder: 'group-hover:border-blue-500/30 dark:group-hover:border-blue-500/40', 
    glow: 'hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.25)]',
    badge: 'bg-blue-500/10 border-blue-500/20 text-blue-500 dark:text-blue-400',
    iconBg: 'bg-blue-500/5 dark:bg-blue-500/10',
    iconBorder: 'border-blue-500/20 dark:border-blue-500/30',
    iconText: 'text-blue-500 dark:text-blue-400',
    accentLine: 'bg-blue-500/30',
    glowBg: 'bg-blue-500'
  },
  indigo: { 
    border: 'border-indigo-500/10 dark:border-indigo-500/10', 
    text: 'text-indigo-500 dark:text-indigo-400', 
    bg: 'bg-indigo-500/5 dark:bg-indigo-500/10', 
    hoverBorder: 'group-hover:border-indigo-500/30 dark:group-hover:border-indigo-500/40', 
    glow: 'hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.25)]',
    badge: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500 dark:text-indigo-400',
    iconBg: 'bg-indigo-500/5 dark:bg-indigo-500/10',
    iconBorder: 'border-indigo-500/20 dark:border-indigo-500/30',
    iconText: 'text-indigo-500 dark:text-indigo-400',
    accentLine: 'bg-indigo-500/30',
    glowBg: 'bg-indigo-500'
  },
  violet: { 
    border: 'border-violet-500/10 dark:border-violet-500/10', 
    text: 'text-violet-500 dark:text-violet-400', 
    bg: 'bg-violet-500/5 dark:bg-violet-500/10', 
    hoverBorder: 'group-hover:border-violet-500/30 dark:group-hover:border-violet-500/40', 
    glow: 'hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.25)]',
    badge: 'bg-violet-500/10 border-violet-500/20 text-violet-500 dark:text-violet-400',
    iconBg: 'bg-violet-500/5 dark:bg-violet-500/10',
    iconBorder: 'border-violet-500/20 dark:border-violet-500/30',
    iconText: 'text-violet-500 dark:text-violet-400',
    accentLine: 'bg-violet-500/30',
    glowBg: 'bg-violet-500'
  },
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  user: User,
  admin: ShieldAlert,
  shield: Shield,
  globe: Globe,
  key: Key,
  lock: Lock,
  settings: Settings,
  store: Store,
  retailer: Store,
  producer: Factory,
  factory: Factory,
  users: Users,
  eye: Eye,
  visitor: Globe,
  cpu: Cpu,
  laptop: Laptop,
  database: Database,
  registered: UserCheck
}

export function getRoleIcon(iconName: string | null | undefined, roleName: string): React.ComponentType<{ className?: string }> {
  const normalizedIcon = iconName?.toLowerCase() || ''
  if (ICON_MAP[normalizedIcon]) {
    return ICON_MAP[normalizedIcon]
  }

  // Fallback to name match
  const normalizedName = roleName.toLowerCase()
  if (normalizedName.includes('admin')) return ShieldAlert
  if (normalizedName.includes('retailer')) {
    return normalizedName.includes('team') || normalizedName.includes('member') ? Users : Store
  }
  if (normalizedName.includes('producer')) {
    return normalizedName.includes('team') || normalizedName.includes('member') ? Users : Factory
  }
  if (normalizedName.includes('visitor')) return Globe
  if (normalizedName.includes('registered')) return UserCheck

  return User
}
