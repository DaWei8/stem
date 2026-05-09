'use client'

import { motion } from 'framer-motion'
import { Code2, MoreVertical, Edit3, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface FunctionCardProps {
  func: any
  onDelete: (id: string) => void
}

export function FunctionCard({ func, onDelete }: FunctionCardProps) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-black border border-zinc-800 rounded-none shadow-none group hover:border-zinc-500 transition-all relative overflow-hidden">
        <CardHeader className="p-5 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-black border border-zinc-800 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            </div>
            <div>
              <CardTitle className="text-sm font-black tracking-tight text-white flex items-center gap-2">
                {func.name}
              </CardTitle>
              <p className="text-[10px] font-mono text-zinc-500 mt-0.5">Returns: {func.return_type}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" size="icon" className="size-8 rounded-none hover:bg-black">
                <MoreVertical className="size-4 text-zinc-600" />
              </Button>
            } />
            <DropdownMenuContent align="end" className="bg-black border-zinc-800 text-white rounded-none min-w-[140px]">
              <DropdownMenuItem className="hover:bg-black rounded-none text-xs font-bold py-2 flex items-center gap-2 cursor-not-allowed opacity-50">
                <Edit3 className="size-3" /> Edit Logic (Soon)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(func.id)} className="text-red-400 hover:bg-red-950 rounded-none text-xs font-bold py-2 flex items-center gap-2 cursor-pointer">
                <Trash2 className="size-3" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        {func.description && (
          <CardContent className="px-5 pb-5 pt-0">
            <p className="text-[11px] text-zinc-500 leading-relaxed font-medium line-clamp-2">{func.description}</p>
          </CardContent>
        )}
      </Card>
    </motion.div>
  )
}
