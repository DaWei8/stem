'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { Edit3, Key, MoreVertical, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

interface Props {
  tables: any[]
  columns: any[]
  variables: any[]
  searchQuery: string
  projectId: string
  onDeleteTable: (id: string) => void
  selectedTableId?: string | null
  onSelectTable?: (id: string | null) => void
  onEditTable?: (table: any) => void
  onAddTable?: (name: string) => Promise<void>
}

export function DataEntityTable({
  tables, columns, variables, searchQuery, projectId,
  onDeleteTable, selectedTableId = null, onSelectTable, onEditTable, onAddTable
}: Props) {
  const [isAddingTable, setIsAddingTable] = useState(false)
  const [newTableName, setNewTableName] = useState('')

  const filtered = useMemo(() =>
    tables.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [tables, searchQuery]
  )

  const handleAddTableSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTableName.trim()) return
    const cleanName = newTableName.trim().replace(/\s+/g, '_').toLowerCase()
    if (onAddTable) {
      try {
        await onAddTable(cleanName)
        setNewTableName('')
        setIsAddingTable(false)
      } catch (err) {
        console.error(err)
      }
    }
  }

  return (
    <div className="space-y-4">
      {onAddTable && (
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 tracking-widest uppercase">Schema Tables</h3>
          {!isAddingTable ? (
            <Button
              onClick={() => setIsAddingTable(true)}
              className="h-8 px-3 text-[10px] font-black rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white"
            >
              <Plus className="size-3 mr-1" /> Add Table
            </Button>
          ) : (
            <form onSubmit={handleAddTableSubmit} className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
              <Input
                value={newTableName}
                onChange={e => setNewTableName(e.target.value)}
                placeholder="table_name (e.g. users)"
                className="h-8 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-[10px] font-mono rounded-md w-48 focus-visible:ring-1 focus-visible:ring-zinc-400"
                autoFocus
                required
              />
              <Button type="submit" className="h-8 px-3 text-[10px] font-black rounded-md bg-black dark:bg-white text-white dark:text-black">
                Create
              </Button>
              <Button type="button" onClick={() => setIsAddingTable(false)} variant="outline" className="h-8 px-3 text-[10px] font-black rounded-md border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
                Cancel
              </Button>
            </form>
          )}
        </div>
      )}

      <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-200 dark:border-zinc-800 hover:bg-transparent bg-zinc-50 dark:bg-black/50">
              <TableHead className="text-[10px] font-black text-zinc-400 py-4 pl-6">Table</TableHead>
              <TableHead className="text-[10px] font-black text-zinc-400 py-4">Columns</TableHead>
              <TableHead className="text-[10px] font-black text-zinc-400 py-4 text-center">Primary Key</TableHead>
              <TableHead className="text-[10px] font-black text-zinc-400 py-4 text-center">Linked Vars</TableHead>
              <TableHead className="w-[80px] py-4"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {filtered.map(table => {
                const tableCols = columns.filter(c => c.table_id === table.id)
                const pk = tableCols.find(c => c.is_primary_key)
                const linkedVars = tableCols.filter(c => c.variable_id).length
                const isSelected = table.id === selectedTableId

                return (
                  <motion.tr
                    key={table.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => onSelectTable?.(isSelected ? null : table.id)}
                    className={cn(
                      "group border-zinc-200 dark:border-zinc-800/50 cursor-pointer transition-colors relative",
                      isSelected
                        ? "bg-zinc-100/50 hover:bg-gray-100 dark:bg-zinc-950/60 border-l-[3px] border-l-emerald-500"
                        : "hover:bg-zinc-50 dark:hover:bg-black/40 border-l-[3px] border-l-transparent"
                    )}
                  >
                    <TableCell className="py-3.5 pl-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-black tracking-wider text-black lowercase dark:text-white">{table.name}</span>
                        <span className="text-[10px] text-zinc-400 font-medium mt-0.5">Persistent Entity</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {tableCols.length > 0 ? (
                          tableCols.slice(0, 4).map(col => (
                            <span key={col.id} className="text-[9px] font-mono text-zinc-400 bg-zinc-50 dark:bg-black px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-800">
                              {col.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[9px] text-zinc-400 italic">No fields</span>
                        )}
                        {tableCols.length > 4 && <span className="text-[9px] text-zinc-400">+{tableCols.length - 4}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 text-center">
                      {pk ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <Key className="size-3 text-green-700" />
                          <span className="text-[10px] font-mono text-zinc-500">{pk.name}</span>
                        </div>
                      ) : (
                        <span className="text-[9px] font-bold text-red-500">Missing PK</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3.5 text-center">
                      <span className={cn('text-[10px] font-bold', linkedVars > 0 ? 'text-emerald-500' : 'text-zinc-400')}>
                        {linkedVars}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button
                            variant="ghost"
                            onClick={(e) => e.stopPropagation()}
                            className="size-7 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md shadow-none opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="size-3.5 text-zinc-400" />
                          </Button>
                        } />
                        <DropdownMenuContent align="end" className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-md shadow-xl text-black dark:text-white">
                          <DropdownMenuItem
                            onClick={() => onEditTable?.(table)}
                            className="text-xs font-bold py-2 gap-2 cursor-pointer rounded-md"
                          >
                            <Edit3 className="size-3" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDeleteTable(table.id)}
                            className="text-xs font-bold py-2 gap-2 cursor-pointer text-red-500 rounded-md"
                          >
                            <Trash2 className="size-3" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
            {filtered.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-20 text-center">
                  <p className="text-[10px] font-bold text-zinc-400 italic mb-3">
                    {searchQuery ? 'No tables match your search.' : 'No tables defined. Add your first entity to begin.'}
                  </p>
                  {onAddTable && !isAddingTable && (
                    <Button
                      onClick={() => setIsAddingTable(true)}
                      className="h-8 px-4 text-[10px] font-black rounded-md bg-black dark:bg-white text-white dark:text-black mx-auto"
                    >
                      <Plus className="size-3 mr-1.5" /> Create First Table
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// DataEntityTable component defines persistent database entity tables in the schema
