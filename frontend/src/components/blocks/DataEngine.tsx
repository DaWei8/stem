'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useVariables } from '@/hooks/useVariables'
import { useDatabase } from '@/hooks/useDatabase'
import { usePages } from '@/hooks/usePages'
import { useLogic } from '@/hooks/useLogic'
import { useIdentity } from '@/hooks/useIdentity'
import { PillarHeader } from '@/components/layout/PillarHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Database, Layers, ArrowRight, AlertTriangle
} from 'lucide-react'
import { DataEntityTable } from './dataengine/DataEntityTable'
import { DataStateTable } from './dataengine/DataStateTable'
import { DataLineagePanel } from './dataengine/DataLineagePanel'
import { StandardModal } from '@/components/ui/StandardModal'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { VariableType, VariableScope } from '@/types'
import { toast } from 'sonner'

type EngineMode = 'entities' | 'state'

export function DataEngine() {
  const { id: projectId } = useParams() as { id: string }
  const { variables, addVariable, updateVariable, deleteVariable } = useVariables()
  const { tables, columns, addTable, deleteTable, updateTable, addColumn } = useDatabase()
  const { pages, inputs, outputs, actions } = usePages()
  const { constants, functions } = useLogic()
  const { policies } = useIdentity()

  const [mode, setMode] = useState<EngineMode>('state')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVarId, setSelectedVarId] = useState<string | null>(null)

  // Variable form
  const [isVarModalOpen, setIsVarModalOpen] = useState(false)
  const [editingVar, setEditingVar] = useState<any>(null)
  const [varForm, setVarForm] = useState({
    label: '', type: 'string' as VariableType, scope: 'transient' as VariableScope, description: '', default_value: ''
  })

  // Table form
  const [isTableModalOpen, setIsTableModalOpen] = useState(false)
  const [newTableName, setNewTableName] = useState('')

  // Orphan detection: variables not referenced by any input, output, or column
  const orphanIds = useMemo(() => {
    const usedIds = new Set<string>()
    inputs.forEach(i => { if (i.variable_id) usedIds.add(i.variable_id) })
    outputs.forEach(o => { if (o.variable_id) usedIds.add(o.variable_id) })
    columns.forEach(c => { if (c.variable_id) usedIds.add(c.variable_id) })
    return new Set(variables.filter(v => !usedIds.has(v.id)).map(v => v.id))
  }, [variables, inputs, outputs, columns])

  // Source derivation: determine if variable is backed by a DB column
  const varSourceMap = useMemo(() => {
    const map: Record<string, { table: string; column: string }> = {}
    columns.forEach(col => {
      if (col.variable_id) {
        const table = tables.find(t => t.id === col.table_id)
        if (table) map[col.variable_id] = { table: table.name, column: col.name }
      }
    })
    return map
  }, [columns, tables])

  const orphanCount = orphanIds.size
  const persistentCount = variables.filter(v => v.scope === 'persistent').length
  const transientCount = variables.filter(v => v.scope === 'transient').length

  const handleSaveVar = async () => {
    if (!varForm.label) return
    const dup = variables.some(v => v.label.toLowerCase() === varForm.label.toLowerCase() && (!editingVar || v.id !== editingVar.id))
    if (dup) { toast.error(`"${varForm.label}" already exists.`); return }
    if (editingVar) { await updateVariable(projectId, editingVar.id, varForm) }
    else { await addVariable(projectId, varForm) }
    setIsVarModalOpen(false)
    setEditingVar(null)
    setVarForm({ label: '', type: 'string', scope: 'transient', description: '', default_value: '' })
  }

  const handleCreateTable = async () => {
    if (!newTableName) return
    const dup = tables.some(t => t.name.toLowerCase() === newTableName.toLowerCase())
    if (dup) { toast.error(`"${newTableName}" already exists.`); return }
    await addTable(projectId, newTableName)
    setNewTableName('')
    setIsTableModalOpen(false)
  }

  const startEditVar = (v: any) => {
    setEditingVar(v)
    setVarForm({ label: v.label, type: v.type, scope: v.scope, description: v.description || '', default_value: v.default_value || '' })
    setIsVarModalOpen(true)
  }

  const selectedVar = variables.find(v => v.id === selectedVarId)

  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className={cn('flex-1 overflow-y-auto p-8 space-y-8 bg-white dark:bg-black transition-colors', selectedVarId && 'pr-4')}>
        <PillarHeader
          title="Data Engine"
          description="Unified state registry and schema design. Every data point — persistent or transient — lives here."
          stats={[
            { label: 'Variables', value: variables.length },
            { label: 'Tables', value: tables.length },
            ...(orphanCount > 0 ? [{ label: 'Orphans', value: orphanCount }] : [])
          ]}
        >
          <div className="flex gap-2">
            <Button
              onClick={() => { setEditingVar(null); setVarForm({ label: '', type: 'string', scope: 'transient', description: '', default_value: '' }); setIsVarModalOpen(true) }}
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-none h-10 text-xs font-bold gap-2 group hover:gap-3"
            >
              <Plus className="size-3" /> Add Variable <ArrowRight className="size-0 group-hover:size-3 transition-all" />
            </Button>
            <Button
              onClick={() => setIsTableModalOpen(true)}
              className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-none h-10 text-xs font-bold gap-2"
            >
              <Database className="size-3" /> Add Table
            </Button>
          </div>
        </PillarHeader>

        {/* Mode toggle + search */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-sm relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={mode === 'state' ? 'Search variables...' : 'Search tables...'}
              className="bg-zinc-50 dark:bg-black/50 border-zinc-200 dark:border-zinc-800 rounded-none pl-10 h-10 text-[11px] font-mono text-black dark:text-white"
            />
          </div>
          <div className="flex items-center border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setMode('state')}
              className={cn('flex items-center gap-2 px-4 py-2 text-xs font-bold transition-colors', mode === 'state' ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-zinc-400 hover:text-black dark:hover:text-white')}
            >
              <Layers className="size-3" /> State View
            </button>
            <button
              onClick={() => setMode('entities')}
              className={cn('flex items-center gap-2 px-4 py-2 text-xs font-bold transition-colors', mode === 'entities' ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-zinc-400 hover:text-black dark:hover:text-white')}
            >
              <Database className="size-3" /> Entity View
            </button>
          </div>
        </div>

        {/* Orphan alert */}
        {orphanCount > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-500/5 border border-amber-500/20">
            <AlertTriangle className="size-3.5 text-amber-500 shrink-0" />
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
              {orphanCount} orphan variable{orphanCount > 1 ? 's' : ''} detected — defined but never referenced by any screen, column, or output.
            </span>
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {mode === 'state' ? (
            <motion.div key="state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DataStateTable
                variables={variables}
                searchQuery={searchQuery}
                orphanIds={orphanIds}
                varSourceMap={varSourceMap}
                selectedVarId={selectedVarId}
                onSelect={id => setSelectedVarId(selectedVarId === id ? null : id)}
                onEdit={startEditVar}
                onDelete={id => deleteVariable(projectId, id)}
              />
            </motion.div>
          ) : (
            <motion.div key="entities" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DataEntityTable
                tables={tables}
                columns={columns}
                variables={variables}
                searchQuery={searchQuery}
                projectId={projectId}
                onDeleteTable={id => deleteTable(projectId, id)}
                onUpdateTable={(id, name) => updateTable(projectId, id, name)}
                onAddColumn={(tableId, data) => addColumn(projectId, tableId, data)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lineage panel */}
      <AnimatePresence>
        {selectedVar && (
          <DataLineagePanel
            variable={selectedVar}
            inputs={inputs}
            outputs={outputs}
            actions={actions}
            pages={pages}
            columns={columns}
            tables={tables}
            policies={policies}
            functions={functions}
            onClose={() => setSelectedVarId(null)}
          />
        )}
      </AnimatePresence>

      {/* Variable Modal */}
      <StandardModal
        isOpen={isVarModalOpen}
        onClose={() => setIsVarModalOpen(false)}
        title={editingVar ? 'Modify Variable' : 'New Variable Entry'}
        description={editingVar ? "Update lifecycle scope or metadata." : "Define a new data point in the engine."}
        confirmText={editingVar ? 'Update' : 'Create'}
        onConfirm={handleSaveVar}
      >
        <div className="grid gap-5">
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Identifier</Label>
            <Input value={varForm.label} onChange={e => setVarForm({ ...varForm, label: e.target.value })}
              placeholder="e.g. user_session_id" className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none h-12 font-mono text-black dark:text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Data Type</Label>
              <Select value={varForm.type} onValueChange={v => setVarForm({ ...varForm, type: (v ?? 'string') as VariableType })}>
                <SelectTrigger className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none h-12 text-xs text-black dark:text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none text-black dark:text-white">
                  {['string','number','boolean','date','object','array'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Scope</Label>
              <Select value={varForm.scope} onValueChange={v => setVarForm({ ...varForm, scope: (v ?? 'transient') as VariableScope })}>
                <SelectTrigger className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none h-12 text-xs text-black dark:text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none text-black dark:text-white">
                  <SelectItem value="persistent">Persistent (DB)</SelectItem>
                  <SelectItem value="transient">Transient (RAM)</SelectItem>
                  <SelectItem value="contextual">Contextual (Flow)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Default Value / Logic Binding</Label>
            <div className="flex gap-2">
              <Input 
                value={varForm.default_value} 
                onChange={e => setVarForm({ ...varForm, default_value: e.target.value })}
                placeholder="Literal value or select constant..." 
                className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none h-12 font-mono text-xs text-black dark:text-white flex-1" 
              />
              <Select onValueChange={v => setVarForm({ ...varForm, default_value: (v ?? '') as string })}>
                <SelectTrigger className="w-[140px] bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none h-12 text-[10px] font-black uppercase">
                  <SelectValue placeholder="CONSTANTS" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none text-black dark:text-white">
                  {constants.map(c => (
                    <SelectItem key={c.id} value={c.name} className="text-[10px] font-mono">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-[9px] text-zinc-500 font-mono">Bind a global constant from the Logic Layer as the initial state.</p>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Description</Label>
            <textarea value={varForm.description} onChange={e => setVarForm({ ...varForm, description: e.target.value })}
              className="bg-zinc-50 dark:bg-black w-full min-h-[80px] p-3 border border-zinc-200 dark:border-zinc-800 rounded-none text-xs font-mono resize-none text-black dark:text-white"
              placeholder="What does this variable represent?" />
          </div>
        </div>
      </StandardModal>

      {/* Table Modal */}
      <StandardModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        title="New Database Entity"
        description="Create a persistent table in the schema."
        confirmText="Create Table"
        onConfirm={handleCreateTable}
      >
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Table Name</Label>
          <Input value={newTableName} onChange={e => setNewTableName(e.target.value.replace(/\s+/g, '_').toLowerCase())}
            placeholder="e.g. products" className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none h-12 font-mono text-black dark:text-white" />
        </div>
      </StandardModal>
    </div>
  )
}
