'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { MoreVertical, Pencil, Trash2, AlertTriangle, Database, Link2 } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const TYPE_STYLE: Record<string, string> = {
  string: 'border-blue-500/20 text-blue-600 dark:text-blue-400 bg-blue-500/5',
  number: 'border-amber-500/20 text-amber-600 dark:text-amber-400 bg-amber-500/5',
  boolean: 'border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5',
  date: 'border-purple-500/20 text-purple-600 dark:text-purple-400 bg-purple-500/5',
  object: 'border-orange-500/20 text-orange-600 dark:text-orange-400 bg-orange-500/5',
  array: 'border-pink-500/20 text-pink-600 dark:text-pink-400 bg-pink-500/5',
}

const SCOPE_STYLE: Record<string, { label: string; color: string }> = {
  persistent: { label: 'DB', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  transient: { label: 'RAM', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  contextual: { label: 'Flow', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
}

interface Props {
  variables: any[]
  searchQuery: string
  orphanIds: Set<string>
  varSourceMap: Record<string, { table: string; column: string }>
  selectedVarId: string | null
  onSelect: (id: string) => void
  onEdit: (v: any) => void
  onDelete: (id: string) => void
  isViewer?: boolean
}

export function DataStateTable({ variables, searchQuery, orphanIds, varSourceMap, selectedVarId, onSelect, onEdit, onDelete, isViewer = false }: Props) {
  const filtered = useMemo(() =>
    variables.filter(v =>
      v.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [variables, searchQuery]
  )

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-200 dark:border-zinc-800 hover:bg-transparent bg-zinc-50 dark:bg-black/50">
            <TableHead className="text-[10px] font-black text-zinc-400 py-4 pl-6 ">Identifier</TableHead>
            <TableHead className="text-[10px] font-black text-zinc-400 py-4 ">Source</TableHead>
            <TableHead className="text-[10px] font-black text-zinc-400 py-4 ">Registry UUID</TableHead>
            <TableHead className="text-[10px] font-black text-zinc-400 py-4 text-center ">Type</TableHead>
            <TableHead className="text-[10px] font-black text-zinc-400 py-4 text-center ">Scope</TableHead>
            <TableHead className="text-[10px] font-black text-zinc-400 py-4 text-center ">Health</TableHead>
            <TableHead className="w-[80px] py-4"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence mode="popLayout">
            {filtered.map(v => {
              const isOrphan = orphanIds.has(v.id)
              const source = varSourceMap[v.id]
              const isSelected = selectedVarId === v.id
              const scope = SCOPE_STYLE[v.scope] ?? SCOPE_STYLE.transient

              return (
                <motion.tr
                  key={v.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    'group border-zinc-200 dark:border-zinc-800/50 transition-colors cursor-pointer',
                    isSelected ? 'bg-blue-500/5 dark:bg-blue-950/20' : 'hover:bg-zinc-50/80 dark:hover:bg-black/40',
                    isOrphan && 'border-l-2 border-l-amber-500'
                  )}
                  onClick={() => onSelect(v.id)}
                >
                  <TableCell className="py-3.5 pl-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-black tracking-wider text-black dark:text-white">{v.label}</span>
                      <span className="text-[10px] text-zinc-400 font-medium truncate max-w-[180px] mt-0.5">{v.description || 'No description'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    {source ? (
                      <div className="flex items-center gap-1.5">
                        <Database className="size-3 text-emerald-500" />
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">{source.table}.{source.column}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-zinc-400 italic">Not linked</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3.5">
                    <code className="text-[10px] font-mono text-zinc-500 bg-zinc-50 dark:bg-black px-2 py-0.5 border border-zinc-200 dark:border-zinc-800">
                      {v.registry_uuid}
                    </code>
                  </TableCell>
                  <TableCell className="py-3.5 text-center">
                    <span className={cn('px-2 py-0.5 text-[9px] font-black tracking-tight border', TYPE_STYLE[v.type] || TYPE_STYLE.string)}>
                      {v.type}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 text-center">
                    <span className={cn('px-2 py-0.5 text-[9px] font-black border', scope.color)}>
                      {scope.label}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 text-center">
                    {isOrphan ? (
                      <div className="flex items-center justify-center gap-1">
                        <AlertTriangle className="size-3 text-amber-500" />
                        <span className="text-[9px] font-bold text-amber-500">Orphan</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <Link2 className="size-3 text-emerald-500" />
                        <span className="text-[9px] font-bold text-emerald-500">Active</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-3.5 pr-6 text-right" onClick={e => e.stopPropagation()}>
                    {!isViewer && (
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" className="size-7 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md shadow-none opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="size-3.5 text-zinc-400" />
                          </Button>
                        } />
                        <DropdownMenuContent align="end" className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-md shadow-xl text-black dark:text-white">
                          <DropdownMenuItem onClick={() => onEdit(v)} className="text-xs font-bold py-2 gap-2 cursor-pointer rounded-md">
                            <Pencil className="size-3" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(v.id)} className="text-xs font-bold py-2 gap-2 cursor-pointer text-red-500 rounded-md">
                            <Trash2 className="size-3" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </motion.tr>
              )
            })}
          </AnimatePresence>
          {filtered.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={7} className="py-20 text-center text-[10px] font-bold text-zinc-400 italic">
                {searchQuery ? 'No variables match your search.' : 'No variables defined. Add your first data point to begin.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
