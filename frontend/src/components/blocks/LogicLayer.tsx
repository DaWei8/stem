'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Package, MoreVertical, Trash2 } from 'lucide-react'
import { useLogic } from '@/hooks/useLogic'
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
import { motion, AnimatePresence } from 'framer-motion'

import { FunctionCard } from '@/components/logic/FunctionCard'
import { toast } from 'sonner'
import { PillarHeader } from '../layout/PillarHeader'
import { ConstantCard } from '../logic/ConstantCard'
import { SlideInModal } from '../ui/SlideInModal'

export function LogicLayer() {
  const { id: projectId } = useParams()
  const {
    constants, functions, dependencies,
    fetchLogicData, addConstant, deleteConstant, addFunction, deleteFunction, addDependency, deleteDependency
  } = useLogic()

  const [isConstantModalOpen, setIsConstantModalOpen] = useState(false)
  const [isFunctionModalOpen, setIsFunctionModalOpen] = useState(false)
  const [isDepModalOpen, setIsDepModalOpen] = useState(false)

  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (projectId) fetchLogicData(projectId as string)
  }, [projectId, fetchLogicData])

  const handleSaveConstant = async () => {
    if (!name || !value || !projectId) return

    // Security: Validate constant name (alphanumeric and underscores only)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
      toast.error('Invalid name. Constants must start with a letter/underscore and contain only alphanumeric characters.')
      return
    }

    const isDuplicate = constants.some(c => c.name.toLowerCase() === name.toLowerCase())
    if (isDuplicate) {
      toast.error(`A constant with the name "${name}" already exists in this project.`)
      return
    }

    await addConstant(projectId as string, name, value, 'string')
    setName(''); setValue(''); setIsConstantModalOpen(false)
  }

  const handleSaveFunction = async () => {
    if (!name || !projectId) return

    // Security: Validate function name
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
      toast.error('Invalid function name. Use alphanumeric characters and underscores only.')
      return
    }

    const isDuplicate = functions.some(f => f.name.toLowerCase() === name.toLowerCase())
    if (isDuplicate) {
      toast.error(`A function with the name "${name}" already exists in this project.`)
      return
    }

    await addFunction(projectId as string, name, description)
    setName(''); setDescription(''); setIsFunctionModalOpen(false)
  }

  const handleSaveDependency = async () => {
    if (!name || !projectId) return

    const isDuplicate = dependencies.some(d => d.name.toLowerCase() === name.toLowerCase())
    if (isDuplicate) {
      toast.error(`The package "${name}" is already installed as a dependency.`)
      return
    }

    await addDependency(projectId as string, name, 'latest', 'npm')
    setName(''); setIsDepModalOpen(false)
  }

  return (
    <div className="p-8 space-y-8 bg-white dark:bg-black min-h-full text-black dark:text-white selection:bg-black/10 dark:selection:bg-white/20 transition-colors duration-300">
      <PillarHeader
        title="Frontend Logic"
        description="Manage your system's global constants, cloud functions, and external library dependencies."
        stats={[{ label: 'Methods', value: functions.length }, { label: 'Deps', value: dependencies.length }]}
      />

      <Tabs defaultValue="constants" className="w-full space-y-6">
        <TabsList className="bg-zinc-50 dark:bg-black/50 max-w-xl border px-0! h-fit! border-zinc-200 dark:border-zinc-800 rounded-none w-auto inline-flex overflow-hidden transition-colors">
          {['constants', 'functions', 'dependencies'].map((tab) => (
            <TabsTrigger key={tab} value={tab} className="px-8 py-2 h-fit! rounded-none data-[state=inactive]:bg-black/5 dark:data-[state=inactive]:bg-white/5 data-[state=active]:bg-black dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-white text-zinc-400 dark:text-zinc-500 text-xs font-bold capitalize transition-all">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="constants">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {constants.map((c) => (
                <ConstantCard key={c.id} constant={c} onDelete={(id) => deleteConstant(projectId as string, id)} />
              ))}
            </AnimatePresence>
            <Button variant="ghost" onClick={() => setIsConstantModalOpen(true)} className="border border-dashed border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-center gap-3 text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-black/50 transition-all h-fit rounded-none group">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              <span className="text-xs font-black">New Constant</span>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="functions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {functions.map((f) => (
                <FunctionCard key={f.id} func={f} onDelete={(id) => deleteFunction(projectId as string, id)} />
              ))}
            </AnimatePresence>
            <Button variant="ghost" onClick={() => setIsFunctionModalOpen(true)} className="border border-dashed border-zinc-200 dark:border-zinc-800 p-4 flex flex-col items-center justify-center gap-3 text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-black/50 transition-all h-fit rounded-none group">
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              <span className="text-xs font-black">New Function</span>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="dependencies">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {dependencies.map((d) => (
                <motion.div key={d.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card className="bg-zinc-50/50 dark:bg-black/30 border border-zinc-200 dark:border-zinc-800 rounded-none shadow-none group hover:border-black dark:hover:border-zinc-500 transition-all relative">
                    <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="size-9 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0"><Package className="w-4 h-4 text-zinc-400 dark:text-zinc-500" /></div>
                        <div className="overflow-hidden"><CardTitle className="text-xs font-black truncate text-zinc-900 dark:text-zinc-200">{d.name}</CardTitle><p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-600 mt-0.5">{d.type} v{d.version}</p></div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-7 rounded-none hover:bg-zinc-100 dark:hover:bg-zinc-800 p-0"><MoreVertical className="size-3 text-zinc-400 dark:text-zinc-600" /></Button>} />
                        <DropdownMenuContent align="end" className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-none">
                          <DropdownMenuItem onClick={() => deleteDependency(projectId as string, d.id)} className="text-red-500 dark:text-red-400 hover:bg-zinc-50 dark:hover:bg-red-950 rounded-none text-xs font-bold py-2 cursor-pointer transition-colors"><Trash2 className="size-3 mr-2" /> Uninstall</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            <Button variant="ghost" onClick={() => setIsDepModalOpen(true)} className="border border-dashed border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-center gap-3 text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-black/50 transition-all rounded-none group">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              <span className="text-xs font-black">Add Package</span>
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Constants Drawer */}
      <SlideInModal
        isOpen={isConstantModalOpen}
        onClose={() => setIsConstantModalOpen(false)}
        title="Define Constant"
        description="Global system parameters that remain immutable during runtime."
        footer={
          <Button onClick={handleSaveConstant} className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-none h-12 text-xs font-black uppercase tracking-widest transition-all">
            Save Constant
          </Button>
        }
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-black text-zinc-400 dark:text-zinc-500">Constant Identifier</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value.replace(/\s+/g, '_'))}
              placeholder="e.g. API_TIMEOUT"
              className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none h-12 font-mono text-black dark:text-white focus:border-black dark:focus:border-white transition-colors"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-black text-zinc-400 dark:text-zinc-500">Value</Label>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. 5000"
              className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none h-12 font-mono text-black dark:text-white focus:border-black dark:focus:border-white transition-colors"
            />
          </div>
        </div>
      </SlideInModal>

      {/* Functions Drawer */}
      <SlideInModal
        isOpen={isFunctionModalOpen}
        onClose={() => setIsFunctionModalOpen(false)}
        title="New Cloud Function"
        description="Declare a deterministic logic block for system execution."
        footer={
          <Button onClick={handleSaveFunction} className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-none h-12 text-xs font-black uppercase tracking-widest transition-all">
            Create Function
          </Button>
        }
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-black text-zinc-400 dark:text-zinc-500">Function Identifier</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value.replace(/\s+/g, '_').toLowerCase())}
              placeholder="e.g. calculate_total"
              className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none h-12 font-mono text-black dark:text-white focus:border-black dark:focus:border-white transition-colors"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-black text-zinc-400 dark:text-zinc-500">Logic Specification</Label>
            <div className="relative group">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Declare the deterministic logic here..."
                className="bg-zinc-50 dark:bg-black w-full min-h-[200px] p-4 border border-zinc-200 dark:border-zinc-800 rounded-none text-sm font-mono focus:outline-none focus:border-black dark:focus:border-white transition-colors resize-none text-black dark:text-white selection:bg-black/10 dark:selection:bg-white/20"
              />
              <div className="absolute bottom-2 right-2 opacity-30 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600">Deterministic Sandbox</span>
              </div>
            </div>
          </div>
        </div>
      </SlideInModal>

      {/* Dependencies Drawer */}
      <SlideInModal
        isOpen={isDepModalOpen}
        onClose={() => setIsDepModalOpen(false)}
        title="Attach Dependency"
        description="Integrate verified external libraries into your runtime."
        footer={
          <Button onClick={handleSaveDependency} className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-none h-12 text-xs font-black uppercase tracking-widest transition-all">
            Install Dependency
          </Button>
        }
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-black text-zinc-400 dark:text-zinc-500">NPM Package Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase())}
              placeholder="e.g. lodash"
              className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none h-12 font-mono text-black dark:text-white focus:border-black dark:focus:border-white transition-colors"
            />
          </div>
        </div>
      </SlideInModal>
    </div>
  )
}
