'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Database, Code2, Layers, Search, Plus, ArrowRight, Package, Terminal, Cpu, Hash, HelpCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Hooks
import { useVariables } from '@/hooks/useVariables'
import { useDatabase } from '@/hooks/useDatabase'
import { usePages } from '@/hooks/usePages'
import { useLogic } from '@/hooks/useLogic'
import { useIdentity } from '@/hooks/useIdentity'
import { useEngineArchitect } from '@/hooks/useEngineArchitect'

// UI Components
import { PillarHeader } from '@/components/layout/PillarHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StandardModal } from '@/components/ui/StandardModal'

// Sub-components (Data Engine)
import { DataEntityTable } from './dataengine/DataEntityTable'
import { DataStateTable } from './dataengine/DataStateTable'

// Sub-components (Logic Layer)
import { FunctionCard } from '@/components/logic/FunctionCard'
import { ConstantCard } from '@/components/logic/ConstantCard'
import { ConstantDrawer } from '@/components/logic/ConstantDrawer'
import { DataLineagePanel } from './dataengine/DataLineagePanel'
import { EngineBot } from './EngineBot'

export function SystemEngine() {
  const params = useParams()
  const projectId = params?.id as string
  const [activeTab, setActiveTab] = useState('state')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVarId, setSelectedVarId] = useState<string | null>(null)
  const [selectedConstantId, setSelectedConstantId] = useState<string | null>(null)

  // Modals & Forms State
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false)
  const [entryType, setEntryType] = useState<'variable' | 'constant' | 'table' | 'function' | 'dependency'>('variable')

  // Variable Form
  const [varLabel, setVarLabel] = useState('')
  const [varType, setVarType] = useState<'string' | 'number' | 'boolean' | 'date' | 'object' | 'array' | 'dictionary'>('string')
  const [varScope, setVarScope] = useState<'persistent' | 'transient' | 'contextual'>('persistent')
  const [varDesc, setVarDesc] = useState('')

  // Constant Form
  const [constName, setConstName] = useState('')
  const [constType, setConstType] = useState<'string' | 'number' | 'boolean' | 'array' | 'object' | 'dictionary'>('string')
  const [constValue, setConstValue] = useState('')

  // Table Form
  const [tableName, setTableName] = useState('')

  // Function Form
  const [funcName, setFuncName] = useState('')
  const [funcDesc, setFuncDesc] = useState('')

  // Dependency Form
  const [depName, setDepName] = useState('')
  const [depVersion, setDepVersion] = useState('latest')
  const [depType, setDepType] = useState<'npm' | 'api' | 'service'>('npm')

  // Data Engine Hooks
  const { variables, deleteVariable, addVariable } = useVariables()
  const { tables, columns, deleteTable, updateTable, addColumn, addTable } = useDatabase()
  const { pages, inputs, outputs, actions } = usePages()

  // Logic Layer Hooks
  const { constants, functions, dependencies, deleteConstant, deleteFunction, deleteDependency, addConstant, addFunction, addDependency } = useLogic()
  const { policies } = useIdentity()
  const { isOpen, setIsOpen } = useEngineArchitect()

  const selectedVar = variables.find(v => v.id === selectedVarId)
  const selectedConstant = constants.find(c => c.id === selectedConstantId)

  const tabs = [
    { id: 'state', name: 'Variables', icon: Layers, count: variables.length + constants.length },
    { id: 'schema', name: 'Data Schema', icon: Database, count: tables.length },
    { id: 'logic', name: 'Cloud Logic', icon: Code2, count: functions.length },
    { id: 'deps', name: 'Dependencies', icon: Package, count: dependencies.length },
  ]

  const handleSubmitEntry = async () => {
    if (!projectId) return

    try {
      if (entryType === 'variable') {
        if (!varLabel.trim()) {
          toast.error('Variable label is required')
          return
        }
        const mappedType = varType === 'dictionary' ? 'object' : varType
        await addVariable(projectId, {
          label: varLabel.trim(),
          type: mappedType as any,
          scope: varScope,
          description: varDesc.trim() || null
        })
      } else if (entryType === 'constant') {
        if (!constName.trim()) {
          toast.error('Constant name is required')
          return
        }
        let mappedType: 'string' | 'number' | 'boolean' | 'json' = 'string'
        let finalVal = constValue.trim()
        
        if (constType === 'array') {
          mappedType = 'json'
          if (!finalVal) finalVal = '[]'
        } else if (constType === 'object' || constType === 'dictionary') {
          mappedType = 'json'
          if (!finalVal) finalVal = '{}'
        } else {
          mappedType = constType as any
        }

        if (mappedType === 'json') {
          try {
            JSON.parse(finalVal)
          } catch (e) {
            toast.error('Invalid JSON format. Check array/object format.')
            return
          }
        }

        await addConstant(projectId, constName.trim(), finalVal, mappedType)
      } else if (entryType === 'table') {
        if (!tableName.trim()) {
          toast.error('Table name is required')
          return
        }
        await addTable(projectId, tableName.trim())
      } else if (entryType === 'function') {
        if (!funcName.trim()) {
          toast.error('Function name is required')
          return
        }
        await addFunction(projectId, funcName.trim(), funcDesc.trim())
      } else if (entryType === 'dependency') {
        if (!depName.trim()) {
          toast.error('Dependency name is required')
          return
        }
        await addDependency(projectId, depName.trim(), depVersion.trim(), depType)
      }

      setIsNewEntryOpen(false)
      // Reset states
      setVarLabel('')
      setVarDesc('')
      setConstName('')
      setConstValue('')
      setTableName('')
      setFuncName('')
      setFuncDesc('')
      setDepName('')
      setDepVersion('latest')
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex h-full w-full bg-white dark:bg-black transition-colors duration-300 overflow-hidden">
      <div className={cn("flex-1 w-full overflow-y-auto p-8 space-y-8 custom-scrollbar", (selectedVarId || selectedConstantId || isOpen) && "pr-4")}>
        <PillarHeader
          title="System Engine"
          description="The unified backend of your system. Orchestrate persistent schemas, transient state, and deterministic cloud logic."
          stats={[
            { label: 'Total State', value: variables.length + constants.length },
            { label: 'Logic Blocks', value: functions.length },
            { label: 'Entities', value: tables.length },
          ]}
        >
          <div className="flex gap-2">
            <Button
              onClick={() => setIsOpen(!isOpen)}
              className={cn("px-4 h-10 text-xs font-bold rounded-none gap-2", isOpen ? "bg-emerald-500 text-white hover:bg-emerald-600 border-none" : "bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-850")}
            >
              <Cpu className="size-3.5" /> AI Architect
            </Button>
            <Button 
              onClick={() => setIsNewEntryOpen(true)}
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-none h-10 text-xs font-bold gap-2 group"
            >
              <Plus className="size-3" /> New Entry <ArrowRight className="size-0 group-hover:size-3 transition-all" />
            </Button>
          </div>
        </PillarHeader>

        {/* Custom Navigation Tab bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-850 pb-2">
          <div className="flex bg-zinc-50 dark:bg-zinc-900/50 p-1 border border-zinc-200 dark:border-zinc-800 gap-1 overflow-x-auto select-none rounded-none">
            {tabs.map((tab) => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest border transition-all rounded-none whitespace-nowrap",
                    active
                      ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-sm"
                      : "bg-transparent text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border-transparent"
                  )}
                >
                  <tab.icon className="size-3.5" />
                  <span>{tab.name}</span>
                  <span className={cn("font-mono text-[9px] px-1.5 py-0.5 rounded", active ? "bg-white/20 dark:bg-black/10 text-white dark:text-black" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400")}>
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex-1 max-w-md relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search engine components..."
              className="bg-zinc-50 dark:bg-black/50 border-zinc-200 dark:border-zinc-800 rounded-none pl-10 h-11 text-[11px] font-mono text-black dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-400"
            />
          </div>
        </div>

        {/* Content Tabs container */}
        <div className="mt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'state' && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 tracking-widest px-1 uppercase">Global Constants</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {constants.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
                        <ConstantCard
                          key={c.id}
                          constant={c}
                          onDelete={id => deleteConstant(projectId, id)}
                          onClick={() => { setSelectedConstantId(selectedConstantId === c.id ? null : c.id); setSelectedVarId(null); }}
                          isSelected={selectedConstantId === c.id}
                        />
                      ))}
                      {constants.length === 0 && (
                        <div className="col-span-full py-8 border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-[10px] text-zinc-400 font-bold uppercase">
                          No constants configured. Click "New Entry" to add.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 tracking-widest px-1 uppercase">Registry (Variables)</h3>
                    <DataStateTable
                      variables={variables}
                      searchQuery={searchQuery}
                      orphanIds={new Set()}
                      varSourceMap={{}}
                      selectedVarId={selectedVarId}
                      onSelect={id => { setSelectedVarId(selectedVarId === id ? null : id); setSelectedConstantId(null); }}
                      onEdit={() => { }}
                      onDelete={id => deleteVariable(projectId, id)}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'schema' && (
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
              )}

              {activeTab === 'logic' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {functions.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map(f => (
                    <FunctionCard key={f.id} func={f} onDelete={id => deleteFunction(projectId, id)} />
                  ))}
                  {functions.length === 0 && (
                    <div className="col-span-full py-8 border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-[10px] text-zinc-400 font-bold uppercase">
                      No cloud functions configured. Click "New Entry" to add.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'deps' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {dependencies.map(d => (
                    <div key={d.id} className="p-4 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 flex items-center gap-4 group hover:border-black dark:hover:border-white transition-all">
                      <div className="size-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                        <Package className="size-5 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-black dark:text-white">{d.name}</p>
                        <p className="text-[10px] font-mono text-zinc-400">{d.type} v{d.version}</p>
                      </div>
                    </div>
                  ))}
                  {dependencies.length === 0 && (
                    <div className="col-span-full py-8 border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-[10px] text-zinc-400 font-bold uppercase">
                      No external dependencies. Click "New Entry" to add.
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

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
        {selectedConstant && (
          <ConstantDrawer
            constant={selectedConstant}
            onClose={() => setSelectedConstantId(null)}
          />
        )}
        {isOpen && <EngineBot />}
      </AnimatePresence>

      {/* New Entry Modal */}
      <StandardModal
        isOpen={isNewEntryOpen}
        onClose={() => setIsNewEntryOpen(false)}
        title="Add New Engine Element"
        confirmText="Add Element"
        onConfirm={handleSubmitEntry}
        className="max-w-xl"
      >
        <div className="space-y-6 pb-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Select Entry Type</label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { id: 'variable', name: 'Variable', icon: Layers },
                { id: 'constant', name: 'Constant', icon: Hash },
                { id: 'table', name: 'Table', icon: Database },
                { id: 'function', name: 'Function', icon: Code2 },
                { id: 'dependency', name: 'Dependency', icon: Package }
              ].map(t => {
                const Icon = t.icon
                const active = entryType === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setEntryType(t.id as any)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 border text-center transition-all gap-1.5 rounded-none",
                      active
                        ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm"
                        : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white"
                    )}
                  >
                    <Icon className="size-4" />
                    <span className="text-[9px] font-black uppercase tracking-wider">{t.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Dynamic fields based on selected entry type */}
          <div className="space-y-4 pt-2 border-t border-zinc-150 dark:border-zinc-850">
            {entryType === 'variable' && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Variable Identifier</label>
                  <Input
                    value={varLabel}
                    onChange={e => setVarLabel(e.target.value)}
                    placeholder="e.g. cart_items"
                    className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs font-mono h-10 rounded-none focus-visible:ring-1 focus-visible:ring-zinc-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Value Type</label>
                    <select
                      value={varType}
                      onChange={e => setVarType(e.target.value as any)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white h-10 px-3 rounded-none focus:outline-none focus:border-zinc-400"
                    >
                      <option value="string">String (Text)</option>
                      <option value="number">Number (Float/Int)</option>
                      <option value="boolean">Boolean (True/False)</option>
                      <option value="date">Date Time</option>
                      <option value="array">Array (List)</option>
                      <option value="object">Object (Structure)</option>
                      <option value="dictionary">Dictionary (Map)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Variable Scope</label>
                    <select
                      value={varScope}
                      onChange={e => setVarScope(e.target.value as any)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white h-10 px-3 rounded-none focus:outline-none focus:border-zinc-400"
                    >
                      <option value="persistent">Persistent (DB Column)</option>
                      <option value="transient">Transient (RAM)</option>
                      <option value="contextual">Contextual (Session)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Description</label>
                  <textarea
                    value={varDesc}
                    onChange={e => setVarDesc(e.target.value)}
                    placeholder="Describe this variable's function in the store..."
                    rows={2}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white rounded-none focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </>
            )}

            {entryType === 'constant' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Constant Name</label>
                    <Input
                      value={constName}
                      onChange={e => setConstName(e.target.value)}
                      placeholder="e.g. TAX_RATE"
                      className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs font-mono h-10 rounded-none focus-visible:ring-1 focus-visible:ring-zinc-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Value Type</label>
                    <select
                      value={constType}
                      onChange={e => setConstType(e.target.value as any)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white h-10 px-3 rounded-none focus:outline-none focus:border-zinc-400"
                    >
                      <option value="string">String (Text)</option>
                      <option value="number">Number (Float/Int)</option>
                      <option value="boolean">Boolean (True/False)</option>
                      <option value="array">Array (List)</option>
                      <option value="object">Object (Structure)</option>
                      <option value="dictionary">Dictionary (Map)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Constant Value</label>
                  <textarea
                    value={constValue}
                    onChange={e => setConstValue(e.target.value)}
                    placeholder={
                      constType === 'array' ? 'e.g. ["item1", "item2"]' :
                      constType === 'object' || constType === 'dictionary' ? 'e.g. { "key": "value" }' :
                      constType === 'boolean' ? 'true or false' : 'e.g. 0.15'
                    }
                    rows={3}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-black dark:text-white rounded-none focus:outline-none focus:border-zinc-400"
                  />
                  <p className="text-[9px] text-zinc-400 font-mono">
                    {constType === 'array' || constType === 'object' || constType === 'dictionary' ? 'Must be valid JSON formatted string.' : ''}
                  </p>
                </div>
              </>
            )}

            {entryType === 'table' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Schema Table Name</label>
                <Input
                  value={tableName}
                  onChange={e => setTableName(e.target.value)}
                  placeholder="e.g. orders"
                  className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs font-mono h-10 rounded-none focus-visible:ring-1 focus-visible:ring-zinc-400"
                />
              </div>
            )}

            {entryType === 'function' && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Cloud Function Name</label>
                  <Input
                    value={funcName}
                    onChange={e => setFuncName(e.target.value)}
                    placeholder="e.g. calculateTotalTax"
                    className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs font-mono h-10 rounded-none focus-visible:ring-1 focus-visible:ring-zinc-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Description</label>
                  <textarea
                    value={funcDesc}
                    onChange={e => setFuncDesc(e.target.value)}
                    placeholder="What logic does this cloud function perform? Parameters, dependencies..."
                    rows={3}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white rounded-none focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </>
            )}

            {entryType === 'dependency' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Dependency Name</label>
                    <Input
                      value={depName}
                      onChange={e => setDepName(e.target.value)}
                      placeholder="e.g. stripe"
                      className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs font-mono h-10 rounded-none focus-visible:ring-1 focus-visible:ring-zinc-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Version</label>
                    <Input
                      value={depVersion}
                      onChange={e => setDepVersion(e.target.value)}
                      placeholder="e.g. latest or ^14.2.0"
                      className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs font-mono h-10 rounded-none focus-visible:ring-1 focus-visible:ring-zinc-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Dependency Type</label>
                  <select
                    value={depType}
                    onChange={e => setDepType(e.target.value as any)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white h-10 px-3 rounded-none focus:outline-none focus:border-zinc-400"
                  >
                    <option value="npm">NPM Package (Backend Logic)</option>
                    <option value="api">External API Service</option>
                    <option value="service">Cloud Infrastructure / DB Provider</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      </StandardModal>
    </div>
  )
}
