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
import { PillarHeader } from '@/components/layout/PillarHeader'
import { StandardModal } from '@/components/ui/StandardModal'
import { ConstantCard } from '@/components/logic/ConstantCard'
import { FunctionCard } from '@/components/logic/FunctionCard'
import { toast } from 'sonner'

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
    <div className="p-8 space-y-8 bg-black min-h-full text-white selection:bg-white/20">
      <PillarHeader
        title="Logic Layer"
        description="Manage your system's global constants, cloud functions, and external library dependencies."
        stats={[{ label: 'Methods', value: functions.length }, { label: 'Deps', value: dependencies.length }]}
      />

      <Tabs defaultValue="constants" className="w-full space-y-6">
        <TabsList className="bg-black/50 max-w-xl border px-0! h-fit! border-zinc-800 rounded-none w-auto inline-flex overflow-hidden">
          {['constants', 'functions', 'dependencies'].map((tab) => (
            <TabsTrigger key={tab} value={tab} className="px-8 py-2 h-fit! rounded-none data-[state=active]:bg-white data-[state=active]:text-black text-xs font-medium capitalize transition-all">
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
            <Button variant="ghost" onClick={() => setIsConstantModalOpen(true)} className="border border-dashed border-zinc-800 p-4 flex items-center justify-center gap-3 text-zinc-600 hover:text-white hover:bg-black/50 transition-all h-fit rounded-none group">
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
            <Button variant="ghost" onClick={() => setIsFunctionModalOpen(true)} className="border border-dashed border-zinc-800 p-4 flex flex-col items-center justify-center gap-3 text-zinc-600 hover:text-white hover:bg-black/50 transition-all h-fit rounded-none group">
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
                  <Card className="bg-black/30 border border-zinc-800 rounded-none shadow-none group hover:border-zinc-500 transition-all relative">
                    <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="size-9 bg-black border border-zinc-800 flex items-center justify-center shrink-0"><Package className="w-4 h-4 text-zinc-500" /></div>
                        <div className="overflow-hidden"><CardTitle className="text-xs font-black truncate text-zinc-200">{d.name}</CardTitle><p className="text-[9px] font-mono text-zinc-600 mt-0.5">{d.type} v{d.version}</p></div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-7 rounded-none hover:bg-zinc-800 p-0"><MoreVertical className="size-3 text-zinc-600" /></Button>} />
                        <DropdownMenuContent align="end" className="bg-black border-zinc-800 text-white rounded-none">
                          <DropdownMenuItem onClick={() => deleteDependency(projectId as string, d.id)} className="text-red-400 hover:bg-red-950 rounded-none text-xs font-bold py-2 cursor-pointer"><Trash2 className="size-3 mr-2" /> Uninstall</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            <Button variant="ghost" onClick={() => setIsDepModalOpen(true)} className="border border-dashed border-zinc-800 p-4 flex items-center justify-center gap-3 text-zinc-600 hover:text-white hover:bg-black/50 transition-all rounded-none group">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              <span className="text-xs font-black">Add Package</span>
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <StandardModal isOpen={isConstantModalOpen} onClose={() => setIsConstantModalOpen(false)} title="Define Constant" description="Global system parameters." confirmText="Save Constant" onConfirm={handleSaveConstant}>
        <div className="space-y-4">
          <div className="space-y-2"><Label className="text-[10px] font-black text-zinc-500 ">Constant Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="bg-black border-zinc-800 rounded-none h-12 font-mono text-white" /></div>
          <div className="space-y-2"><Label className="text-[10px] font-black text-zinc-500 ">Value</Label><Input value={value} onChange={(e) => setValue(e.target.value)} className="bg-black border-zinc-800 rounded-none h-12 font-mono text-white" /></div>
        </div>
      </StandardModal>

      <StandardModal isOpen={isFunctionModalOpen} onClose={() => setIsFunctionModalOpen(false)} title="New Cloud Function" description="Declare a deterministic logic block." confirmText="Create Function" onConfirm={handleSaveFunction}>
        <div className="space-y-4">
          <div className="space-y-2"><Label className="text-[10px] font-black text-zinc-500 ">Function Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="bg-black border-zinc-800 rounded-none h-12 font-mono text-white" /></div>
          <div className="space-y-2"><Label className="text-[10px] font-black text-zinc-500 ">Specification</Label><textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-black w-full min-h-[100px] p-4 border border-zinc-800 rounded-none text-sm font-mono focus:outline-none focus:border-zinc-600 transition-colors resize-none text-white" /></div>
        </div>
      </StandardModal>

      <StandardModal isOpen={isDepModalOpen} onClose={() => setIsDepModalOpen(false)} title="Attach Dependency" description="Integrate external libraries." confirmText="Install Dependency" onConfirm={handleSaveDependency}>
        <div className="space-y-2"><Label className="text-[10px] font-black text-zinc-500 ">NPM Package Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="bg-black border-zinc-800 rounded-none h-12 font-mono text-white" /></div>
      </StandardModal>
    </div>
  )
}
