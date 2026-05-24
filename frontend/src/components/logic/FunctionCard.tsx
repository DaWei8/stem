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
import { Code2, Edit3, MoreVertical, Trash2 } from 'lucide-react'

interface FunctionCardProps {
  func: any
  onDelete: (id: string) => void
  onClick?: () => void
  isSelected?: boolean
}

export function FunctionCard({ func, onDelete, onClick, isSelected }: FunctionCardProps) {
  return (
    <div className='h-full flex w-full'>
      <Card
        onClick={onClick}
        className={cn(
          "bg-black border border-zinc-800 shadow-none group h-full w-full hover:border-zinc-500 transition-all relative overflow-hidden cursor-pointer",
          isSelected && "border-zinc-400"
        )}
      >
        <CardHeader className="p-5 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-black border border-zinc-800 flex items-center justify-center rounded-md">
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
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-md hover:bg-black"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="size-4 text-zinc-600" />
              </Button>
            } />
            <DropdownMenuContent align="end" className="bg-black border-zinc-800 text-white rounded-lg min-w-[140px]">
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onClick?.(); }}
                className="hover:bg-zinc-900 rounded-md text-xs font-bold py-2 flex items-center gap-2 cursor-pointer"
              >
                <Edit3 className="size-3 text-purple-400" /> Edit Logic
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(func.id); }}
                className="text-red-400 hover:bg-red-950 rounded-md text-xs font-bold py-2 flex items-center gap-2 cursor-pointer"
              >
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
    </div>
  )
}

