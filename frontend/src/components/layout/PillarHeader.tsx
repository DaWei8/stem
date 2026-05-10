'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface PillarHeaderProps {
  title: string
  description: string
  stats?: Array<{ label: string; value: string | number }>
  children?: ReactNode
}

export function PillarHeader({
  title,
  description,
  stats,
  children
}: PillarHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      <div className="absolute -inset-1 bg-linear-to-r from-zinc-800 to-zinc-900 opacity-20 blur-xl group-hover:opacity-30 transition duration-1000" />
      <div className="relative flex items-end justify-between border-b border-zinc-800/50 pb-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tighter bg-linear-to-br from-white to-zinc-500 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-xs text-zinc-400 max-w-md font-medium leading-relaxed">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-6">
          {stats?.map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-6">
              {i > 0 && <div className="h-10 w-px bg-zinc-800" />}
              <div className="text-right">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black font-mono">{stat.value}</p>
              </div>
            </div>
          ))}
          {children && (
            <div className="flex items-center gap-4">
              {stats && stats.length > 0 && <div className="h-10 w-px bg-zinc-800" />}
              {children}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
