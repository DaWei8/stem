'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Key, MoreVertical, Table as TableIcon, ArrowRight, Edit3, Trash2, Database } from 'lucide-react'
import { useDatabase } from '@/hooks/useDatabase'
import { useVariables } from '@/hooks/useVariables'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    <div className="p-8 space-y-12 bg-black min-h-full text-white selection:bg-white/20">
      <PillarHeader
        title="Database Schema"
        description="Architect your relational data structures, define constraints, and map system variables to persistent storage."
        stats={[{ label: 'tables', value: tables.length }]}
      >
        <div className="flex gap-2">
          <Button variant="outline" className="border-zinc-800  px-4 text-xs font-black opacity-50 cursor-not-allowed h-10 transition-all">
            Import SQL (Soon)
          </Button>
          <Button
            onClick={() => setIsTableModalOpen(true)}
            className="bg-white text-black hover:bg-zinc-200  px-4 text-xs font-black  h-10 transition-all group hover:gap-3"
          >
            <Plus className="w-3 h-3" />
            Add Table
            <ArrowRight className="w-0 h-3 group-hover:w-3 transition-all" />
          </Button>
        </div>
      </PillarHeader>

      <div

        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start"
      >
        <div>
          {tables.map((table) => {
            const tableColumns = columns.filter((c) => c.table_id === table.id)

            return (
              <div key={table.id}>
                <Card className="bg-black/40 border-zinc-800  overflow-hidden group shadow-none hover:border-zinc-500 transition-all">
                  <CardHeader className="p-4 border-b border-zinc-800 bg-black/40 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-3">
                      <div className="size-8 bg-black border border-zinc-800 flex items-center justify-center">
                        <TableIcon className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                      </div>
                      <CardTitle className="text-xs font-bold font-mono text-white">{table.name}</CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-zinc-800 shadow-none transition-none">
                          <MoreVertical className="w-4 h-4 text-zinc-500" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end" className="bg-black border-zinc-800 text-white  min-w-[160px]">
                        <DropdownMenuItem
                          className="hover:bg-black text-xs font-bold py-2 flex items-center gap-2 cursor-pointer"
                          onClick={() => {
                            setEditingTable(table)
                            setIsEditTableModalOpen(true)
                          }}
                        >
                          <Edit3 className="size-3" /> Edit Table
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="hover:bg-black  text-xs font-bold py-2 flex items-center gap-2 cursor-pointer"
                          onClick={() => {
                            setActiveTableId(table.id)
                            setIsColumnModalOpen(true)
                          }}
                        >
                          <Plus className="size-3" /> Add Column
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-400 hover:bg-red-950  text-xs font-bold py-2 flex items-center gap-2 cursor-pointer"
                          onClick={() => deleteTable(projectId as string, table.id)}
                        >
                          <Trash2 className="size-3" /> Delete Table
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-zinc-800/50">
                      {tableColumns.map((col) => {
                        const variable = variables.find(v => v.id === col.variable_id || v.registry_uuid === col.variable_id)
                        return (
                          <div key={col.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-all group/row">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="flex flex-col items-center justify-center min-w-[20px]">
                                {col.is_primary_key && <Key className="w-3.5 h-3.5 text-zinc-400" />}
                              </div>
                              <div className="flex flex-col">
                                <span className={cn(
                                  "text-[11px] font-bold tracking-tight",
                                  col.is_primary_key ? "text-white" : "text-zinc-300 group-hover/row:text-white"
                                )}>
                                  {col.name}
                                </span>
                                {variable && (
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="size-1 rounded-full bg-zinc-700" />
                                    <span className="text-[8px] font-mono text-zinc-500 truncate group-hover/row:text-zinc-300 uppercase tracking-tighter">
                                      Registry: {variable.label}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[9px] font-black text-zinc-400 bg-black/40 px-2 py-0.5 border border-zinc-800 group-hover/row:border-zinc-700 group-hover/row:text-zinc-200 transition-all">
                                {col.type || 'varchar'}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

        <motion.button
          variants={itemVariants}
          onClick={() => setIsTableModalOpen(true)}
          className="border-2 w-full border-dashed border-zinc-800 bg-black/10 hover:bg-black/30 h-[180px] flex flex-col items-center justify-center gap-4 text-zinc-500 hover:text-white transition-all group"
        >
          <div className="size-12 rounded-full border border-dashed border-zinc-700 flex items-center justify-center group-hover:border-zinc-400 transition-colors">
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          </div>
          <div className="text-center">
            <p className="text-xs font-black">Construct Table</p>
            <p className="text-xs text-zinc-500 font-medium">Create a new persistent entity</p>
          </div>
        </motion.button>
      </div>

      {/* Table Creation Modal */}
      <SlideInModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        title="New Database Table"
        description="Create a new persistent entity in your system schema."
        footer={
          <Button
            onClick={handleCreateTable}
            className="w-full bg-white text-black hover:bg-zinc-200 rounded-none h-12 text-xs font-black uppercase tracking-widest transition-all"
          >
            Create Table
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-black text-zinc-500 ">Table Identifier</Label>
            <Input
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value.replace(/\s+/g, '_').toLowerCase())}
              placeholder="e.g. products"
              className="bg-black border-zinc-800 rounded-none h-12 text-sm font-mono text-white focus:border-white transition-colors"
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
                  className="flex-1 border-zinc-800 text-white rounded-none h-12 text-xs transition-all"
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    await handleCreateColumn()
                    setIsDefiningColumn(false)
                  }}
                  className="flex-2 bg-white text-black hover:bg-zinc-200 rounded-none h-12 text-xs transition-all"
                >
                  Save Field
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleUpdateTable}
                className="w-full bg-white text-black hover:bg-zinc-200 rounded-none h-12 text-xs transition-all"
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
              <Label className="text-xs font-black text-zinc-500">Table Identity</Label>
              <Input
                value={editingTable.name}
                onChange={(e) => setEditingTable({ ...editingTable, name: e.target.value.replace(/\s+/g, '_').toLowerCase() })}
                className="bg-black border-zinc-800 rounded-none h-12 text-sm font-mono text-white focus:border-white transition-colors"
              />
            </div>

            {/* Dynamic Content Section */}
            <div className="space-y-4">
              {isDefiningColumn ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <Label className="text-xs text-white">Define New Column</Label>
                    <span className="text-[10px] font-mono text-zinc-600">Step 2: Attributes</span>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black text-zinc-500 ">Column Name</Label>
                    <Input
                      value={newColData.name}
                      onChange={(e) => setNewColData({ ...newColData, name: e.target.value })}
                      placeholder="e.g. price_cents"
                      className="bg-black border-zinc-800 rounded-none h-12 text-sm font-mono text-white focus:border-white transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-zinc-500 ">Data Type</Label>
                    <Select
                      value={newColData.type}
                      onValueChange={(v) => setNewColData({ ...newColData, type: v as any })}
                    >
                      <SelectTrigger className="bg-black border-zinc-800 rounded-none h-12! w-full! text-xs text-white focus:border-white transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-zinc-800 text-white rounded-none">
                        <SelectItem value="uuid">UUID</SelectItem>
                        <SelectItem value="varchar">Varchar</SelectItem>
                        <SelectItem value="int4">Integer</SelectItem>
                        <SelectItem value="timestamp">Timestamp</SelectItem>
                        <SelectItem value="jsonb">JSONB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-zinc-500 ">Map to Variable</Label>
                    <Select
                      value={newColData.variable_id}
                      onValueChange={(v) => setNewColData({ ...newColData, variable_id: v as any })}
                    >
                      <SelectTrigger className="bg-black border-zinc-800 rounded-none h-12! w-full! text-xs text-white focus:border-white transition-colors">
                        <SelectValue placeholder="Select Variable" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-zinc-800 text-white rounded-none">
                        {variables.map(v => (
                          <SelectItem key={v.id} value={v.label}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-black/30 border border-zinc-800">
                    <Checkbox
                      id="pk_inline"
                      checked={newColData.is_primary_key}
                      onCheckedChange={(checked) => setNewColData({ ...newColData, is_primary_key: !!checked })}
                      className=" border-zinc-700 data-[state=checked]:bg-white data-[state=checked]:text-black"
                    />
                    <Label htmlFor="pk_inline" className="text-xs font-bold text-zinc-400 cursor-pointer">
                      Set as Primary Key
                    </Label>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <Label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Fields & Schema</Label>
                    <Button
                      onClick={() => {
                        setActiveTableId(editingTable.id)
                        setIsDefiningColumn(true)
                      }}
                      variant="outline"
                      className="h-7 px-3 text-xs border-zinc-800 text-white hover:text-black hover:bg-white rounded-none font-bold transition-all"
                    >
                      <Plus className="size-3 mr-1.5" /> Add Field
                    </Button>
                  </div>

                  <div className="border border-zinc-900 divide-y divide-zinc-900">
                    {columns.filter(c => c.table_id === editingTable.id).map(col => (
                      <div key={col.id} className="p-3 flex items-center justify-between group/field hover:bg-zinc-950 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="size-6 bg-zinc-900 flex items-center justify-center">
                            {col.is_primary_key ? <Key className="size-3 text-zinc-400" /> : <Database className="size-3 text-zinc-600" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold font-mono text-white">{col.name}</span>
                            <span className="text-[10px] font-mono text-zinc-600 uppercase">{col.type}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover/field:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="size-7 text-zinc-600 hover:text-white"><Edit3 className="size-3" /></Button>
                          <Button variant="ghost" size="icon" className="size-7 text-red-900 hover:text-red-400"><Trash2 className="size-3" /></Button>
                        </div>
                      </div>
                    ))}
                    {columns.filter(c => c.table_id === editingTable.id).length === 0 && (
                      <div className="p-8 text-center border-t border-zinc-900">
                        <p className="text-xs font-bold text-zinc-700">No fields defined</p>
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
