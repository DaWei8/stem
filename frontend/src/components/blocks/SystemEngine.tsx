'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Database, Code2, Layers, Search, Plus, ArrowRight, Package, Terminal, Cpu
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Sub-components (Data Engine)
import { DataEntityTable } from './dataengine/DataEntityTable'
import { DataStateTable } from './dataengine/DataStateTable'
import { DataLineagePanel } from './dataengine/DataLineagePanel'

// Sub-components (Logic Layer)
import { FunctionCard } from '@/components/logic/FunctionCard'
import { ConstantCard } from '@/components/logic/ConstantCard'
import { ConstantDrawer } from '@/components/logic/ConstantDrawer'
import { EngineBot } from './EngineBot'

export function SystemEngine() {
  const params = useParams()
  const projectId = params?.id as string
  const [activeTab, setActiveTab] = useState('state')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVarId, setSelectedVarId] = useState<string | null>(null)
  const [selectedConstantId, setSelectedConstantId] = useState<string | null>(null)

  // Data Engine Hooks
  const { variables, deleteVariable } = useVariables()
  const { tables, columns, deleteTable, updateTable, addColumn } = useDatabase()
  const { pages, inputs, outputs, actions } = usePages()

  // Logic Layer Hooks
  const { constants, functions, dependencies, deleteConstant, deleteFunction, deleteDependency } = useLogic()
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
              className={cn("px-4 h-10 text-xs font-bold rounded-none gap-2", isOpen ? "bg-emerald-500 text-white hover:bg-emerald-600 border-none" : "bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800")}
            >
              <Cpu className="size-3.5" /> AI Architect
            </Button>
            <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-none h-10 text-xs font-bold gap-2 group">
              <Plus className="size-3" /> New Entry <ArrowRight className="size-0 group-hover:size-3 transition-all" />
            </Button>
          </div>
        </PillarHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full items-start space-y-4">
          <div className="flex items-center justify-between gap-4">
            <TabsList className="bg-zinc-50 flex max-w-2xl dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 p-0 rounded-none overflow-hidden transition-colors">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="px-6 h-12 border-white/20 w-full text-nowrap rounded-none data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black text-zinc-400 dark:text-zinc-500 text-[10px] font-black border tracking-widest transition-all gap-2"
                >
                  <tab.icon className="size-3" />
                  {tab.name}
                  <span className="opacity-40 font-mono text-[9px] ml-1">{tab.count}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 max-w-2xl relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search engine components..."
                className="bg-zinc-50 dark:bg-black/50 border-zinc-200 dark:border-zinc-800 rounded-none pl-10 h-11 text-[11px] font-mono text-black dark:text-white"
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="state" className="m-0 space-y-8">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500  tracking-widest px-1">Global Constants</h3>
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
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500  tracking-widest px-1">Registry (Variables)</h3>
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
              </TabsContent>

              <TabsContent value="schema" className="m-0">
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
              </TabsContent>

              <TabsContent value="logic" className="m-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {functions.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map(f => (
                    <FunctionCard key={f.id} func={f} onDelete={id => deleteFunction(projectId, id)} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="deps" className="m-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {dependencies.map(d => (
                    <div key={d.id} className="p-4 bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-zinc-800 flex items-center gap-4 group hover:border-black dark:hover:border-white transition-all">
                      <div className="size-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                        <Package className="size-5 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-black dark:text-white">{d.name}</p>
                        <p className="text-[10px] font-mono text-zinc-400 ">{d.type} v{d.version}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
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
    </div>
  )
}
