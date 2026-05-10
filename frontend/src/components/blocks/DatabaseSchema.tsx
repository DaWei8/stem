'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Key, MoreVertical, Table as TableIcon, ArrowRight, Edit3, Trash2, Database } from 'lucide-react'
import { useDatabase } from '@/hooks/useDatabase'
import { useVariables } from '@/hooks/useVariables'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Filter } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { PillarHeader } from '@/components/layout/PillarHeader'
import { cn } from '@/lib/utils'
import { SlideInModal } from '@/components/ui/SlideInModal'
import { toast } from 'sonner'

export function DatabaseSchema() {
  const { id: projectId } = useParams()
  const { tables, columns, deleteTable, updateTable, fetchProjectData, addTable, addColumn } = useDatabase()
  const { variables } = useVariables()

  const [isTableModalOpen, setIsTableModalOpen] = useState(false)
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false)
  const [isEditTableModalOpen, setIsEditTableModalOpen] = useState(false)

  const [newTableName, setNewTableName] = useState('')
  const [activeTableId, setActiveTableId] = useState<string | null>(null)
  const [editingTable, setEditingTable] = useState<any | null>(null)

  const [newColData, setNewColData] = useState({
    name: '',
    type: 'uuid',
    is_primary_key: false,
    variable_id: ''
  })
  const [isDefiningColumn, setIsDefiningColumn] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (projectId) {
      fetchProjectData(projectId as string)
    }
  }, [projectId, fetchProjectData])

  const handleCreateTable = async () => {
    if (!newTableName || !projectId) return

    const isDuplicate = tables.some(t => t.name.toLowerCase() === newTableName.toLowerCase())
    if (isDuplicate) {
      toast.error(`A table with the name "${newTableName}" already exists in this project.`)
      return
    }

    await addTable(projectId as string, newTableName)
    setNewTableName('')
    setIsTableModalOpen(false)
  }

  const handleUpdateTable = async () => {
    if (!editingTable || !editingTable.name || !projectId) return
    await updateTable(projectId as string, editingTable.id, editingTable.name)
    setEditingTable(null)
    setIsEditTableModalOpen(false)
  }

  const handleCreateColumn = async () => {
    if (!newColData.name || !activeTableId || !projectId) return

    const tableColumns = columns.filter(c => c.table_id === activeTableId)
    const isDuplicate = tableColumns.some(c => c.name.toLowerCase() === newColData.name.toLowerCase())
    if (isDuplicate) {
      toast.error(`A column with the name "${newColData.name}" already exists in this table.`)
      return
    }

    await addColumn(projectId as string, activeTableId, newColData)
    setNewColData({ name: '', type: 'uuid', is_primary_key: false, variable_id: '' })
    setIsColumnModalOpen(false)
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants: Variants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } }
  }

  return (
    <div className="p-8 space-y-12 bg-white dark:bg-black min-h-full text-black dark:text-white selection:bg-black/10 dark:selection:bg-white/20 transition-colors duration-300">
      <PillarHeader
        title="Database Schema"
        description="Architect your relational data structures, define constraints, and map system variables to persistent storage."
        stats={[{ label: 'tables', value: tables.length }]}
      >
        <div className="flex gap-2">
          <Button variant="outline" className="border-zinc-200 dark:border-zinc-800 px-4 text-xs font-black opacity-50 cursor-not-allowed h-10 transition-all text-zinc-400 dark:text-zinc-600">
            Import SQL (Soon)
          </Button>
          <Button
            onClick={() => setIsTableModalOpen(true)}
            className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 px-4 text-xs font-black h-10 transition-all group hover:gap-3"
          >
            <Plus className="w-3 h-3" />
            Add Table
            <ArrowRight className="w-0 h-3 group-hover:w-3 transition-all" />
          </Button>
        </div>
      </PillarHeader>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-sm relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400 dark:text-zinc-600 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search schema..."
            className="bg-zinc-50 dark:bg-black/50 border-zinc-200 dark:border-zinc-800 rounded-none pl-10 h-10 text-[11px] font-mono focus:ring-1 focus:ring-black/10 dark:focus:ring-white/10 transition-all text-black dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-zinc-200 dark:border-zinc-800 rounded-none h-10 px-4 text-[10px] font-black text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-all">
            <Filter className="size-3 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Schema Table */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 overflow-hidden transition-colors"
      >
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-200 dark:border-zinc-800 hover:bg-transparent bg-zinc-50 dark:bg-black/50 transition-colors">
              <TableHead className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 py-4 pl-6 uppercase tracking-widest">Identifier</TableHead>
              <TableHead className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 py-4 uppercase tracking-widest">Columns</TableHead>
              <TableHead className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 py-4 text-center uppercase tracking-widest">Primary Key</TableHead>
              <TableHead className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 py-4 text-center uppercase tracking-widest">Status</TableHead>
              <TableHead className="w-[80px] py-4"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {tables
                .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((table) => {
                  const tableColumns = columns.filter((c) => c.table_id === table.id)
                  const pkColumn = tableColumns.find(c => c.is_primary_key)
                  
                  return (
                    <motion.tr
                      key={table.id}
                      variants={itemVariants}
                      layout
                      className="group border-zinc-200 dark:border-zinc-800/50 hover:bg-zinc-50/80 dark:hover:bg-black/40 transition-colors"
                    >
                      <TableCell className="py-4 pl-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-black tracking-wider text-black dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-colors uppercase">{table.name}</span>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-medium mt-0.5 uppercase tracking-tighter">Persistent Entity</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-wrap gap-1">
                          {tableColumns.length > 0 ? (
                            tableColumns.slice(0, 3).map(col => (
                              <span key={col.id} className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-black px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-800">
                                {col.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-[9px] font-bold text-zinc-300 dark:text-zinc-700 italic">No fields</span>
                          )}
                          {tableColumns.length > 3 && (
                            <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-600">+{tableColumns.length - 3}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        {pkColumn ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <Key className="size-3 text-zinc-400 dark:text-zinc-500" />
                            <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">{pkColumn.name}</span>
                          </div>
                        ) : (
                          <span className="text-[9px] font-black text-red-500 dark:text-red-900 uppercase">Missing PK</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <span className="px-3 py-1 text-[9px] font-black tracking-tighter border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-black uppercase">
                          Synced
                        </span>
                      </TableCell>
                      <TableCell className="py-4 pr-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-none shadow-none transition-all group/btn">
                              <MoreVertical className="h-4 w-4 text-zinc-400 dark:text-zinc-600 group-hover/btn:text-black dark:group-hover/btn:text-white" />
                            </Button>
                          } />
                          <DropdownMenuContent align="end" className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-none min-w-[140px]">
                            <DropdownMenuItem 
                              onClick={() => {
                                setEditingTable(table)
                                setIsEditTableModalOpen(true)
                              }} 
                              className="hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-none text-xs font-bold py-2 flex items-center gap-2 cursor-pointer"
                            >
                              <Edit3 className="size-3" /> Configure
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setActiveTableId(table.id)
                                setIsColumnModalOpen(true)
                              }} 
                              className="hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-none text-xs font-bold py-2 flex items-center gap-2 cursor-pointer"
                            >
                              <Plus className="size-3" /> Add Field
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteTable(projectId as string, table.id)} 
                              className="text-red-400 hover:bg-red-950 rounded-none text-xs font-bold py-2 flex items-center gap-2 cursor-pointer"
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
            {tables.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest italic">No tables defined in this project.</p>
                    <Button
                      onClick={() => setIsTableModalOpen(true)}
                      className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-none px-6 h-10 text-[10px] font-black uppercase tracking-widest"
                    >
                      Construct First Table
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Table Creation Modal */}
      <SlideInModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        title="New Database Table"
        description="Create a new persistent entity in your system schema."
        footer={
          <Button
            onClick={handleCreateTable}
            className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-none h-12 text-xs font-black uppercase tracking-widest transition-all"
          >
            Create Table
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-black text-zinc-400 dark:text-zinc-500">Table Identifier</Label>
            <Input
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value.replace(/\s+/g, '_').toLowerCase())}
              placeholder="e.g. products"
              className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none h-12 text-sm font-mono text-black dark:text-white focus:border-black dark:focus:border-white transition-colors"
            />
          </div>
        </div>
      </SlideInModal>

      {/* Table Edit Modal */}
      <SlideInModal
        isOpen={isEditTableModalOpen}
        onClose={() => {
          setIsEditTableModalOpen(false)
          setEditingTable(null)
          setIsDefiningColumn(false)
        }}
        title="Table Configuration"
        description={`Architecting ${editingTable?.name || 'entity'}`}
        footer={
          <div className="flex flex-col gap-2 text-nowrap w-full">
            {isDefiningColumn ? (
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsDefiningColumn(false)}
                  variant="outline"
                  className="flex-1 border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-none h-12 text-xs transition-all"
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    await handleCreateColumn()
                    setIsDefiningColumn(false)
                  }}
                  className="flex-2 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-none h-12 text-xs transition-all"
                >
                  Save Field
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleUpdateTable}
                className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-none h-12 text-xs transition-all"
              >
                Save Changes
              </Button>
            )}
          </div>
        }
      >
        {editingTable && (
          <div className="space-y-10">
            {/* Identity Section - Always Visible */}
            <div className="space-y-2">
              <Label className="text-xs font-black text-zinc-400 dark:text-zinc-500">Table Identity</Label>
              <Input
                value={editingTable.name}
                onChange={(e) => setEditingTable({ ...editingTable, name: e.target.value.replace(/\s+/g, '_').toLowerCase() })}
                className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none h-12 text-sm font-mono text-black dark:text-white focus:border-black dark:focus:border-white transition-colors"
              />
            </div>

            {/* Dynamic Content Section */}
            <div className="space-y-4">
              {isDefiningColumn ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-2">
                    <Label className="text-xs text-black dark:text-white">Define New Column</Label>
                    <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600">Step 2: Attributes</span>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black text-zinc-400 dark:text-zinc-500">Column Name</Label>
                    <Input
                      value={newColData.name}
                      onChange={(e) => setNewColData({ ...newColData, name: e.target.value })}
                      placeholder="e.g. price_cents"
                      className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none h-12 text-sm font-mono text-black dark:text-white focus:border-black dark:focus:border-white transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-zinc-400 dark:text-zinc-500">Data Type</Label>
                    <Select
                      value={newColData.type}
                      onValueChange={(v) => setNewColData({ ...newColData, type: v as any })}
                    >
                      <SelectTrigger className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none h-12! w-full! text-xs text-black dark:text-white focus:border-black dark:focus:border-white transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-none">
                        <SelectItem value="uuid">UUID</SelectItem>
                        <SelectItem value="varchar">Varchar</SelectItem>
                        <SelectItem value="int4">Integer</SelectItem>
                        <SelectItem value="timestamp">Timestamp</SelectItem>
                        <SelectItem value="jsonb">JSONB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-zinc-400 dark:text-zinc-500">Map to Variable</Label>
                    <Select
                      value={newColData.variable_id}
                      onValueChange={(v) => setNewColData({ ...newColData, variable_id: v as any })}
                    >
                      <SelectTrigger className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none h-12! w-full! text-xs text-black dark:text-white focus:border-black dark:focus:border-white transition-colors">
                        <SelectValue placeholder="Select Variable" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-none">
                        {variables.map(v => (
                          <SelectItem key={v.id} value={v.label}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-zinc-800 transition-colors">
                    <Checkbox
                      id="pk_inline"
                      checked={newColData.is_primary_key}
                      onCheckedChange={(checked) => setNewColData({ ...newColData, is_primary_key: !!checked })}
                      className="border-zinc-300 dark:border-zinc-700 data-[state=checked]:bg-black dark:data-[state=checked]:bg-white data-[state=checked]:text-white dark:data-[state=checked]:text-black"
                    />
                    <Label htmlFor="pk_inline" className="text-xs font-bold text-zinc-400 dark:text-zinc-500 cursor-pointer">
                      Set as Primary Key
                    </Label>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-900 pb-2">
                    <Label className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Fields & Schema</Label>
                    <Button
                      onClick={() => {
                        setActiveTableId(editingTable.id)
                        setIsDefiningColumn(true)
                      }}
                      variant="outline"
                      className="h-7 px-3 text-xs border-zinc-200 dark:border-zinc-800 text-black dark:text-white hover:text-white dark:hover:text-black hover:bg-black dark:hover:bg-white rounded-none font-bold transition-all"
                    >
                      <Plus className="size-3 mr-1.5" /> Add Field
                    </Button>
                  </div>

                  <div className="border border-zinc-200 dark:border-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-900">
                    {columns.filter(c => c.table_id === editingTable.id).map(col => (
                      <div key={col.id} className="p-3 flex items-center justify-between group/field hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="size-6 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                            {col.is_primary_key ? <Key className="size-3 text-zinc-400" /> : <Database className="size-3 text-zinc-400 dark:text-zinc-600" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold font-mono text-black dark:text-white">{col.name}</span>
                            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 uppercase">{col.type}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover/field:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="size-7 text-zinc-400 dark:text-zinc-600 hover:text-black dark:hover:text-white"><Edit3 className="size-3" /></Button>
                          <Button variant="ghost" size="icon" className="size-7 text-red-500 dark:text-red-900 hover:text-red-600"><Trash2 className="size-3" /></Button>
                        </div>
                      </div>
                    ))}
                    {columns.filter(c => c.table_id === editingTable.id).length === 0 && (
                      <div className="p-8 text-center border-t border-zinc-200 dark:border-zinc-900">
                        <p className="text-xs font-bold text-zinc-300 dark:text-zinc-700">No fields defined</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </SlideInModal>

    </div>
  )
}
