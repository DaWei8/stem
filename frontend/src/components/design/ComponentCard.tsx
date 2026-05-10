'use client'

import { motion } from 'framer-motion'
import { MoreVertical, Trash2, MousePointer2, Type as TypeIcon, Layout, Square, Component, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SystemComponent } from '@/hooks/useDesignSystem'

interface ComponentCardProps {
  component: SystemComponent
  onEdit: (component: SystemComponent) => void
  onDelete: (id: string) => void
}

export function ComponentCard({ component, onEdit, onDelete }: ComponentCardProps) {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } }
  }

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      layout
      className="group relative bg-black/40 border border-zinc-800 hover:border-zinc-500 p-6 rounded-none transition-all cursor-pointer"
      onClick={() => onEdit(component)}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="size-10 bg-black border border-zinc-800 flex items-center justify-center group-hover:border-zinc-600 transition-colors">
          {component.type === 'button' && <MousePointer2 className="size-4 text-zinc-400 group-hover:text-white" />}
          {component.type === 'input' && <TypeIcon className="size-4 text-zinc-400 group-hover:text-white" />}
          {component.type === 'form' && <Layout className="size-4 text-zinc-400 group-hover:text-white" />}
          {component.type === 'container' && <Square className="size-4 text-zinc-400 group-hover:text-white" />}
          {component.type === 'custom' && <Component className="size-4 text-zinc-400 group-hover:text-white" />}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" size="icon" className="size-8 rounded-none hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="size-4 text-zinc-600" />
            </Button>
          } />
          <DropdownMenuContent align="end" className="bg-black border-zinc-800 text-white rounded-none">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(component); }} className="hover:bg-zinc-900 rounded-none text-xs font-bold py-2 flex items-center gap-2 cursor-pointer">
              <Edit2 className="size-3" /> Edit Blueprint
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(component.id); }} className="text-red-400 hover:bg-red-950 rounded-none text-xs font-bold py-2 flex items-center gap-2 cursor-pointer">
              <Trash2 className="size-3" /> Purge Component
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div>
        <h4 className="text-sm font-black tracking-tight text-white mb-1">{component.name}</h4>
        <p className="text-[10px] text-zinc-500 font-medium lowercase font-mono">
          {component.type} spec
        </p>
      </div>
    </motion.div>
  )
}
