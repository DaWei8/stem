'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Palette, Type, Move, Layers, BoxSelect, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TokenSectionProps {
  title: string
  icon: any
  tokens: any[]
  onAdd: () => void
  onDelete: (id: string) => void
}

export function TokenSection({ title, icon, tokens, onAdd, onDelete }: TokenSectionProps) {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-black border border-zinc-800 flex items-center justify-center">
            {icon}
          </div>
          <h3 className="text-xl font-bold tracking-tight">{title}</h3>
        </div>
        <Button
          onClick={onAdd}
          className="bg-black border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 size-8 p-0 rounded-none transition-all"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {tokens.map(token => (
            <motion.div
              key={token.id}
              variants={itemVariants}
              layout
              className="group relative flex items-center justify-between p-4 bg-black/40 border border-zinc-800 hover:border-zinc-500 transition-all"
            >
              <div className="flex items-center gap-4 overflow-hidden">
                {title === 'Colors' ? (
                  <div className="size-10 border border-zinc-800 shadow-inner group-hover:scale-105 transition-transform shrink-0" style={{ backgroundColor: token.value }} />
                ) : title === 'Typography' ? (
                  <div className="size-10 bg-black border border-zinc-800 flex items-center justify-center font-bold text-lg shrink-0" style={{ fontFamily: token.value }}>Ag</div>
                ) : (
                  <div className="size-10 bg-black border border-zinc-800 flex items-center justify-center shrink-0">
                    {icon}
                  </div>
                )}
                <div className="space-y-0.5 overflow-hidden">
                  <p className="text-xs font-black tracking-wider text-white truncate">{token.name}</p>
                  <p className="text-[10px] font-mono text-zinc-600 truncate">{token.value}</p>
                </div>
              </div>
              <Button
                onClick={() => onDelete(token.id)}
                variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all rounded-none"
              >
                <Trash2 className="size-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
        {tokens.length === 0 && (
          <div className="py-8 border border-dashed border-zinc-800 text-center text-[10px] font-bold text-zinc-700">
            No {title.toLowerCase()} defined.
          </div>
        )}
      </div>
    </section>
  )
}
