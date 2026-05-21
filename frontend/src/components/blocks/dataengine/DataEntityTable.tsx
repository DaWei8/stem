'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SlideInModal } from '@/components/ui/SlideInModal'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Database,
  Edit3,
  Key,
  MoreVertical,
  Plus,
  Trash2
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

interface Props {
  tables: any[]
  columns: any[]
  variables: any[]
  searchQuery: string
  projectId: string
  onDeleteTable: (id: string) => void
  onUpdateTable: (id: string, name: string) => void
  onAddColumn: (tableId: string, data: any) => void
  selectedTableId?: string | null
  onSelectTable?: (id: string | null) => void
  onAddTable?: (name: string) => Promise<void>
}

export function DataEntityTable({
  tables, columns, variables, searchQuery, projectId,
  onDeleteTable, onUpdateTable, onAddColumn,
  selectedTableId = null, onSelectTable, onAddTable
}: Props) {
  const [editingTable, setEditingTable] = useState<any>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDefiningColumn, setIsDefiningColumn] = useState(false)
  const [pendingColumns, setPendingColumns] = useState<any[]>([
    { id: 'initial', name: '', type: 'uuid', is_primary_key: true, variable_id: '' }
  ])
  const [isAddingTable, setIsAddingTable] = useState(false)
  const [newTableName, setNewTableName] = useState('')

  const filtered = useMemo(() =>
    tables.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [tables, searchQuery]
  )

  const handleSaveColumns = async () => {
    if (!editingTable) return
    const validCols = pendingColumns.filter(c => c.name.trim() !== '')
    if (validCols.length === 0) return

    const existingNames = new Set(columns.filter(c => c.table_id === editingTable.id).map(c => c.name.toLowerCase()))

    for (const col of validCols) {
      if (existingNames.has(col.name.toLowerCase())) {
        toast.error(`Column "${col.name}" already exists. Skipping.`)
        continue
      }
      await onAddColumn(editingTable.id, col)
    }

    setPendingColumns([{ id: Math.random().toString(), name: '', type: 'uuid', is_primary_key: false, variable_id: '' }])
    setIsDefiningColumn(false)
  }

  const addPendingRow = () => {
    setPendingColumns([...pendingColumns, { id: Math.random().toString(), name: '', type: 'varchar', is_primary_key: false, variable_id: '' }])
  }

  const removePendingRow = (id: string) => {
    if (pendingColumns.length === 1) return
    setPendingColumns(pendingColumns.filter(c => c.id !== id))
  }

  const updatePendingRow = (id: string, updates: any) => {
    setPendingColumns(pendingColumns.map(c => c.id === id ? { ...c, ...updates } : c))
  }

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
              className="h-8 px-3 text-[10px] font-black uppercase tracking-wider rounded-none bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white"
            >
              <Plus className="size-3 mr-1" /> Add Table
            </Button>
          ) : (
            <form onSubmit={handleAddTableSubmit} className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
              <Input
                value={newTableName}
                onChange={e => setNewTableName(e.target.value)}
                placeholder="table_name (e.g. users)"
                className="h-8 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-[10px] font-mono rounded-none w-48 focus-visible:ring-1 focus-visible:ring-zinc-400"
                autoFocus
                required
              />
              <Button type="submit" className="h-8 px-3 text-[10px] font-black uppercase tracking-wider rounded-none bg-black dark:bg-white text-white dark:text-black">
                Create
              </Button>
              <Button type="button" onClick={() => setIsAddingTable(false)} variant="outline" className="h-8 px-3 text-[10px] font-black uppercase tracking-wider rounded-none border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
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
              <TableHead className="text-[10px] font-black text-zinc-400 py-4 pl-6 ">Table</TableHead>
              <TableHead className="text-[10px] font-black text-zinc-400 py-4 ">Columns</TableHead>
              <TableHead className="text-[10px] font-black text-zinc-400 py-4 text-center ">Primary Key</TableHead>
              <TableHead className="text-[10px] font-black text-zinc-400 py-4 text-center ">Linked Vars</TableHead>
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
                        ? "bg-zinc-100/50 dark:bg-zinc-950/60 border-l-[3px] border-l-emerald-500"
                        : "hover:bg-zinc-50/80 dark:hover:bg-black/40 border-l-[3px] border-l-transparent"
                    )}
                  >
                    <TableCell className="py-3.5 pl-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-black tracking-wider text-black lowercase dark:text-white ">{table.name}</span>
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
                          <Key className="size-3 text-zinc-400" />
                          <span className="text-[10px] font-mono text-zinc-500">{pk.name}</span>
                        </div>
                      ) : (
                        <span className="text-[9px] font-bold text-red-500 ">Missing PK</span>
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
                            className="size-7 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-none shadow-none opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="size-3.5 text-zinc-400" />
                          </Button>
                        } />
                        <DropdownMenuContent align="end" className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none shadow-xl text-black dark:text-white">
                          <DropdownMenuItem onClick={() => { setEditingTable(table); setIsEditModalOpen(true) }}
                            className="text-xs font-bold py-2 gap-2 cursor-pointer rounded-none">
                            <Edit3 className="size-3" /> Configure
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDeleteTable(table.id)}
                            className="text-xs font-bold py-2 gap-2 cursor-pointer text-red-500 rounded-none">
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
                      className="h-8 px-4 text-[10px] font-black uppercase tracking-wider rounded-none bg-black dark:bg-white text-white dark:text-black mx-auto"
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

      {/* Table Edit Drawer */}
      <SlideInModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingTable(null); setIsDefiningColumn(false) }}
        title="Table Configuration"
        description={`Architecting ${editingTable?.name || 'entity'}`}
        footer={
          isDefiningColumn ? (
            <div className="flex gap-2 w-full">
              <Button onClick={() => setIsDefiningColumn(false)} variant="outline" className="flex-1 border-zinc-200 dark:border-zinc-800 rounded-none h-12 text-xs text-black dark:text-white">Cancel</Button>
              <Button onClick={handleSaveColumns} className="flex-2 bg-black dark:bg-white text-white dark:text-black rounded-none h-12 text-xs">Deploy Fields</Button>
            </div>
          ) : (
            <Button onClick={() => { if (editingTable) onUpdateTable(editingTable.id, editingTable.name); setIsEditModalOpen(false) }}
              className="w-full bg-black dark:bg-white text-white dark:text-black rounded-none h-12 text-xs">Save Changes</Button>
          )
        }
      >
        {editingTable && (
          <div className="space-y-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-zinc-400 ">Table Identity</Label>
              <Input value={editingTable.name}
                onChange={e => setEditingTable({ ...editingTable, name: e.target.value.replace(/\s+/g, '_').toLowerCase() })}
                className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none h-12 font-mono text-black dark:text-white" />
            </div>
            {isDefiningColumn ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black text-zinc-400 ">Define Schema Fields</Label>
                    <Button onClick={addPendingRow} variant="outline" className="h-7 px-3 text-[10px] border-zinc-200 dark:border-zinc-800 rounded-none font-black text-black dark:text-white ">
                      <Plus className="size-3 mr-1" /> Add Row
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {pendingColumns.map((col, idx) => (
                      <div key={col.id} className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4 relative group/row">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-[9px] font-bold text-zinc-400 ">Name</Label>
                            <Input
                              value={col.name}
                              onChange={e => updatePendingRow(col.id, { name: e.target.value.replace(/\s+/g, '_').toLowerCase() })}
                              placeholder="column_name"
                              className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none h-9 text-xs font-mono"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[9px] font-bold text-zinc-400 ">Type</Label>
                            <Select value={col.type} onValueChange={v => updatePendingRow(col.id, { type: v })}>
                              <SelectTrigger className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none h-9 text-xs w-full"><SelectValue /></SelectTrigger>
                              <SelectContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none text-black dark:text-white">
                                {['uuid', 'varchar', 'int4', 'timestamp', 'jsonb', 'boolean', 'text'].map(t => <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex-1 space-y-1.5">
                            <Label className="text-[9px] font-bold text-zinc-400 ">Registry Binding</Label>
                            <Select value={col.variable_id} onValueChange={v => updatePendingRow(col.id, { variable_id: v })}>
                              <SelectTrigger className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none h-9 text-xs w-full"><SelectValue placeholder="Map to variable..." /></SelectTrigger>
                              <SelectContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none text-black dark:text-white">
                                {variables.map(v => <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-2 pt-4">
                            <Checkbox
                              id={`pk-${col.id}`}
                              checked={col.is_primary_key}
                              onCheckedChange={c => updatePendingRow(col.id, { is_primary_key: !!c })}
                              className="border-zinc-300 dark:border-zinc-700 data-[state=checked]:bg-black dark:data-[state=checked]:bg-white"
                            />
                            <Label htmlFor={`pk-${col.id}`} className="text-[10px] font-bold text-zinc-500  cursor-pointer">PK</Label>
                          </div>
                        </div>

                        {pendingColumns.length > 1 && (
                          <button
                            onClick={() => removePendingRow(col.id)}
                            className="absolute -top-2 -right-2 size-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity shadow-lg"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <Label className="text-[10px] font-black text-zinc-400 ">Fields & Schema</Label>
                  <Button onClick={() => setIsDefiningColumn(true)} variant="outline"
                    className="h-7 px-3 text-xs border-zinc-200 dark:border-zinc-800 rounded-none font-bold text-black dark:text-white">
                    <Plus className="size-3 mr-1" /> Add Field
                  </Button>
                </div>
                <div className="border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800">
                  {columns.filter(c => c.table_id === editingTable.id).map(col => (
                    <div key={col.id} className="p-3 flex items-center justify-between group/field hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="size-6 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                          {col.is_primary_key ? <Key className="size-3 text-zinc-400" /> : <Database className="size-3 text-zinc-500" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold font-mono text-black dark:text-white">{col.name}</span>
                          <span className="text-[10px] font-mono text-zinc-400 ">{col.type}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {columns.filter(c => c.table_id === editingTable.id).length === 0 && (
                    <div className="p-8 text-center"><p className="text-xs text-zinc-400 italic">No fields defined</p></div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </SlideInModal>
    </div>
  )
}
