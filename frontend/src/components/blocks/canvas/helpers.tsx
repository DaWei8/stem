'use client'

import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SidebarSection({ title, icon, onAdd, items, renderItem }: { 
  title: string; icon: React.ReactNode; onAdd: () => void; items: any[]; renderItem: (item: any) => React.ReactNode 
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{title}</span>
        </div>
        <button onClick={onAdd} className="size-5 rounded-md border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/20 transition-all">
          <Plus className="size-3" />
        </button>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="py-8 border border-dashed border-zinc-200 dark:border-zinc-900 rounded-xl flex items-center justify-center">
            <span className="text-[10px] text-zinc-300 dark:text-zinc-700 font-medium italic">Empty</span>
          </div>
        ) : (
          items.map(renderItem)
        )}
      </div>
    </div>
  )
}

export function OverviewSection({ title, count, items, renderItem }: { 
  title: string; count: number; items: any[]; renderItem: (item: any) => React.ReactNode 
}) {
  const [showAll, setShowAll] = useState(false)
  if (items.length === 0) return null

  const displayItems = showAll ? items : items.slice(0, 5)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-600">{title}</h3>
        <span className="text-[10px] font-mono text-zinc-300 dark:text-zinc-200">({count})</span>
      </div>
      <div className="space-y-2">
        {displayItems.map(renderItem)}
        {items.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full py-2 text-[10px] font-bold text-zinc-400 dark:text-zinc-600 hover:text-black dark:hover:text-white transition-colors"
          >
            {showAll ? 'Show less' : `View all ${items.length}...`}
          </button>
        )}
      </div>
    </div>
  )
}

export function StatMini({ 
  label, value, icon, status, onClick, active 
}: { 
  label: string; value: any; icon: React.ReactNode; status?: 'active'; onClick?: () => void; active?: boolean 
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-3 bg-zinc-50 dark:bg-black border rounded-xl space-y-2 relative overflow-hidden group hover:border-black dark:hover:border-zinc-700 transition-all cursor-pointer",
        active ? "border-black dark:border-white ring-1 ring-black/5 dark:ring-white/10" : "border-zinc-200 dark:border-zinc-900"
      )}
    >
      {status === 'active' && <div className="absolute top-2 right-2 size-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />}
      <div className={cn(
        "transition-colors",
        active ? "text-black dark:text-white" : "text-zinc-400 dark:text-zinc-600 group-hover:text-black dark:group-hover:text-zinc-400"
      )}>{icon}</div>
      <div>
        <p className={cn(
          "text-xs font-black transition-colors",
          active ? "text-black dark:text-white" : "text-black dark:text-white"
        )}>{value}</p>
        <p className={cn(
          "text-[9px] font-bold uppercase tracking-tighter transition-colors",
          active ? "text-black/60 dark:text-white/60" : "text-zinc-400 dark:text-zinc-600"
        )}>{label}</p>
      </div>
    </div>
  )
}
