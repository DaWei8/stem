'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Hash, MoreVertical, Trash2 } from 'lucide-react'

interface ConstantCardProps {
  constant: any
  onDelete: (id: string) => void
  onClick?: () => void
  isSelected?: boolean
}

export function ConstantCard({ constant, onDelete, onClick, isSelected }: ConstantCardProps) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card
        onClick={onClick}
        className={cn(
          "bg-black/50 border-zinc-800 rounded-none shadow-none group hover:border-zinc-500 transition-all overflow-hidden cursor-pointer",
          isSelected && "border-zinc-400"
        )}
      >
        <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0 border-b border-zinc-800/50 bg-black/20">
          <div className="flex items-center gap-2 overflow-hidden">
            <Hash className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <CardTitle className="text-[11px] lowercase font-bold tracking-tight text-zinc-300 truncate">{constant.name}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" size="icon" className="size-6 rounded-none hover:bg-zinc-800 p-0" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="size-3 text-zinc-600" />
              </Button>
            } />
            <DropdownMenuContent align="end" className="bg-black border-zinc-800 text-white rounded-none">
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(constant.id); }}
                className="text-red-400 hover:bg-red-950 rounded-none text-xs font-bold py-2 cursor-pointer"
              >
                <Trash2 className="size-3 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="p-4 bg-black/30">
          <code className="text-xs font-mono text-white truncate block">
            {constant.value}
          </code>
        </CardContent>
      </Card>
    </motion.div>
  )
}
