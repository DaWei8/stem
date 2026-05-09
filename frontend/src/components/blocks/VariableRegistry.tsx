'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useVariables } from '@/hooks/useVariables'
import { VariableType, VariableScope } from '@/types'
import { Plus, Pencil, Trash2, Search, Filter, ArrowRight, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { motion, AnimatePresence } from 'framer-motion'
import { PillarHeader } from '@/components/layout/PillarHeader'
import { cn } from '@/lib/utils'
import { StandardModal } from '@/components/ui/StandardModal'
import { toast } from 'sonner'

export function VariableRegistry() {
  const params = useParams()
  const projectId = params?.id as string
  const { variables, addVariable, updateVariable, deleteVariable, isLoading } = useVariables()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVar, setEditingVar] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [formData, setFormData] = useState({
    label: '',
    type: 'string' as VariableType,
    scope: 'transient' as VariableScope,
    description: '',
  })

  const handleSave = async () => {
    if (!formData.label) return

    // Prevent duplicate labels within the same project
    const isDuplicate = variables.some(v =>
      v.label.toLowerCase() === formData.label.toLowerCase() &&
      (!editingVar || v.id !== editingVar.id)
    )

    if (isDuplicate) {
      toast.error(`A variable with the identifier "${formData.label}" already exists in this registry.`)
      return
    }

    if (editingVar) {
      await updateVariable(projectId, editingVar.id, formData)
    } else {
      await addVariable(projectId, formData)
    }
    setIsModalOpen(false)
    setEditingVar(null)
    setFormData({ label: '', type: 'string', scope: 'transient', description: '' })
  }

  const startEdit = (v: any) => {
    setEditingVar(v)
    setFormData({
      label: v.label,
      type: v.type,
      scope: v.scope,
      description: v.description || '',
    })
    setIsModalOpen(true)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  }

  const filteredVariables = variables.filter(v =>
    v.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8 space-y-12 bg-black min-h-full text-white selection:bg-white/20">
      {/* Header */}
      <PillarHeader
        title="Variable Registry"
        description="The global state management layer of your system. Define, scope, and track all deterministic data points."
        stats={[{ label: 'Active Variables', value: variables.length }]}
      >
        <Button
          onClick={() => {
            setEditingVar(null)
            setFormData({ label: '', type: 'string', scope: 'transient', description: '' })
            setIsModalOpen(true)
          }}
          className="bg-white text-black hover:bg-zinc-200 rounded-none px-4 text-[10px] font-black  h-10 transition-all group hover:gap-3"
        >
          <Plus className="w-3 h-3" />
          Add Variable
          <ArrowRight className="w-0 h-3 group-hover:w-3 transition-all" />
        </Button>
      </PillarHeader>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-sm relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-600 group-focus-within:text-white transition-colors" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search registry..."
            className="bg-black/50 border-zinc-800 rounded-none pl-10 h-10 text-[11px] font-mono focus:ring-1 focus:ring-zinc-700 transition-all text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-zinc-800 rounded-none h-10 px-4 text-[10px] font-black  text-zinc-500 hover:text-white transition-all">
            <Filter className="size-3 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Registry Table */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="border border-zinc-800 bg-black/50 overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent bg-black/50">
              <TableHead className="text-[10px] font-black  text-zinc-600 py-4 pl-6">Identifier</TableHead>
              <TableHead className="text-[10px] font-black  text-zinc-600 py-4">Registry UUID</TableHead>
              <TableHead className="text-[10px] font-black  text-zinc-600 py-4 text-center">Type</TableHead>
              <TableHead className="text-[10px] font-black  text-zinc-600 py-4 text-center">Scope</TableHead>
              <TableHead className="w-[80px] py-4"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {filteredVariables.map((v) => (
                <motion.tr
                  key={v.id}
                  variants={itemVariants}
                  layout
                  className="group border-zinc-800/50 hover:bg-black/40 transition-colors"
                >
                  <TableCell className="py-4 pl-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-black tracking-wider text-white group-hover:text-zinc-200 transition-colors">{v.label}</span>
                      <span className="text-[10px] text-zinc-600 font-medium truncate max-w-[200px] mt-0.5">{v.description || 'No description provided'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <code className="text-[10px] font-mono text-zinc-500 bg-black px-2 py-1 border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                      {v.registry_uuid}
                    </code>
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    <span className={cn(
                      "px-3 py-1 text-[9px] font-black tracking-tighter border",
                      v.type === 'string' ? "border-blue-500/20 text-blue-400 bg-blue-500/5" :
                        v.type === 'number' ? "border-amber-500/20 text-amber-400 bg-amber-500/5" :
                          "border-zinc-700 text-zinc-400 bg-black"
                    )}>
                      {v.type}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    <span className="text-[10px] font-bold text-zinc-500 ">
                      {v.scope}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 pr-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-zinc-800 rounded-none shadow-none transition-all group/btn">
                          <MoreVertical className="h-4 w-4 text-zinc-600 group-hover/btn:text-white" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end" className="bg-black border-zinc-800 text-white rounded-none min-w-[140px]">
                        <DropdownMenuItem onClick={() => startEdit(v)} className="hover:bg-black rounded-none text-xs font-bold py-2 flex items-center gap-2 cursor-pointer">
                          <Pencil className="size-3" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteVariable(projectId, v.id)} className="text-red-400 hover:bg-red-950 rounded-none text-xs font-bold py-2 flex items-center gap-2 cursor-pointer">
                          <Trash2 className="size-3" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
            {filteredVariables.length === 0 && !isLoading && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-20 text-center text-[10px] font-bold text-zinc-600 border-zinc-800/50">
                  No variables found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Reusable Modal for Add/Edit */}
      <StandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVar ? 'Modify Variable' : 'New Variable Entry'}
        description={editingVar ? "Update the variable's lifecycle scope or semantic metadata." : "Define a new deterministic data point for your system."}
        confirmText={editingVar ? "Update Variable" : "Create Variable"}
        onConfirm={handleSave}
      >
        <div className="grid gap-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-zinc-500 ">Identifier Label</Label>
            <Input
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="bg-black border-zinc-800 rounded-none h-12 text-sm font-mono text-white"
              placeholder="e.g. user_session_id"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-zinc-500 ">Data Type</Label>
              <Select
                value={formData.type}
                onValueChange={(v: any) => setFormData({ ...formData, type: v })}
              >
                <SelectTrigger className="bg-black border-zinc-800 rounded-none h-12 text-xs text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-zinc-800 text-white rounded-none">
                  <SelectItem value="string" className="text-xs">String</SelectItem>
                  <SelectItem value="number" className="text-xs">Number</SelectItem>
                  <SelectItem value="boolean" className="text-xs">Boolean</SelectItem>
                  <SelectItem value="date" className="text-xs">Date</SelectItem>
                  <SelectItem value="object" className="text-xs">Object</SelectItem>
                  <SelectItem value="array" className="text-xs">Array</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-zinc-500 ">Lifecycle Scope</Label>
              <Select
                value={formData.scope}
                onValueChange={(v: any) => setFormData({ ...formData, scope: v })}
              >
                <SelectTrigger className="bg-black border-zinc-800 rounded-none h-12 text-xs text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-zinc-800 text-white rounded-none">
                  <SelectItem value="persistent" className="text-xs">Persistent (DB)</SelectItem>
                  <SelectItem value="transient" className="text-xs">Transient (UI)</SelectItem>
                  <SelectItem value="contextual" className="text-xs">Contextual (Global)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-zinc-500 ">Semantic Description</Label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-black w-full min-h-[100px] p-4 border border-zinc-800 rounded-none text-sm font-mono focus:outline-none focus:border-zinc-600 transition-colors resize-none text-white"
              placeholder="Briefly describe the purpose of this variable..."
            />
          </div>
        </div>
      </StandardModal>
    </div>
  )
}
