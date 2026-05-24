'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TokenSectionProps {
  title: string
  icon: any
  tokens: any[]
  onAdd: () => void
  onEdit: (token: any) => void
  onDelete: (id: string) => void
  onPreset?: () => void
}

export function TokenSection({ title, icon, tokens, onAdd, onEdit, onDelete, onPreset }: TokenSectionProps) {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-black border border-zinc-800 flex items-center justify-center rounded-md">
            {icon}
          </div>
          <h3 className="text-xl font-bold tracking-tight">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {onPreset && (
            <Button
              onClick={onPreset}
              className="bg-black border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 h-8 px-3 rounded-md transition-all text-xs"
            >
              Presets
            </Button>
          )}
          <Button
            onClick={onAdd}
            className="bg-black border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 size-8 p-0 rounded-md transition-all"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tokens.map(token => (
            <div
              key={token.id}
              className="group relative flex items-center justify-between p-3 bg-black/40 border border-zinc-800 hover:border-zinc-500 rounded-lg transition-all cursor-pointer"
              onClick={() => onEdit(token)}
            >
              <div className="flex items-center gap-4 overflow-hidden">
                {title === 'Colors' ? (
                  <div className="size-7 border border-zinc-800 shadow-inner group-hover:scale-105 transition-transform shrink-0 rounded-md" style={{ backgroundColor: token.value }} />
                ) : title === 'Typography' ? (
                  <div className="size-10 bg-black border border-zinc-800 flex items-center justify-center font-bold text-lg shrink-0 rounded-md" style={{ fontFamily: token.value.split(' ')[1] || 'inherit' }}>Ag</div>
                ) : (
                  <div className="size-10 bg-black border border-zinc-800 flex items-center justify-center shrink-0 rounded-md">
                    {icon}
                  </div>
                )}
                <div className="space-y-0.5 overflow-hidden">
                  <p className="text-xs font-semibold text-white truncate">{token.name.includes('|') ? token.name.split('|')[1] : token.name}</p>
                  <p className="text-[10px] font-mono text-zinc-600 truncate">{token.value}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(token);
                  }}
                  variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-white transition-all rounded-md"
                >
                  <Edit2 className="size-4" />
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(token.id);
                  }}
                  variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all rounded-md"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        {tokens.length === 0 && (
          <div className="py-8 border border-dashed border-zinc-800 text-center text-[10px] font-bold text-zinc-700 rounded-lg">
            No {title.toLowerCase()} defined.
          </div>
        )}
      </div>
    </section>
  )
}
