'use client'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Palette, Type, Move, Layers, BoxSelect, Component } from 'lucide-react'
import { useDesignSystem } from '@/hooks/useDesignSystem'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { PillarHeader } from '@/components/layout/PillarHeader'
import { StandardModal } from '@/components/ui/StandardModal'
import { TokenSection } from '@/components/design/TokenSection'
import { ComponentCard } from '@/components/design/ComponentCard'

export function DesignSystem() {
  const { id: projectId } = useParams()
  const { tokens, components, fetchTokens, fetchComponents, addToken, deleteToken, addComponent, deleteComponent } = useDesignSystem()

  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false)
  const [newTokenName, setNewTokenName] = useState('')
  const [newTokenValue, setNewTokenValue] = useState('')
  const [newCompName, setNewCompName] = useState('')
  const [newCompType, setNewCompType] = useState<'button' | 'input' | 'form' | 'custom' | 'container'>('container')

  const presetColors = ['#ffffff', '#000000', '#27272a', '#3f3f46', '#52525b', '#71717a', '#a1a1aa', '#d4d4d8', '#e4e4e7', '#f4f4f5']

  useEffect(() => {
    if (projectId) {
      fetchTokens(projectId as string)
      fetchComponents(projectId as string)
    }
  }, [projectId, fetchTokens, fetchComponents])

  const handleAddToken = async (type: any) => {
    if (!newTokenName || !newTokenValue) return

    const isDuplicate = tokens.some(t => t.name.toLowerCase() === newTokenName.toLowerCase())
    if (isDuplicate) {
      toast.error(`A token with the name "${newTokenName}" already exists in your design system.`)
      return
    }

    await addToken(projectId as string, { name: newTokenName, value: newTokenValue, type })
    setNewTokenName(''); setNewTokenValue(''); setActiveModal(null)
  }

  const handleAddComponent = async () => {
    if (!newCompName) return

    const isDuplicate = components.some(c => c.name.toLowerCase() === newCompName.toLowerCase())
    if (isDuplicate) {
      toast.error(`A component with the name "${newCompName}" already exists in this project.`)
      return
    }

    await addComponent(projectId as string, { name: newCompName, type: newCompType, layout_config: {}, children_ids: [], variable_mappings: {} })
    setNewCompName(''); setIsComponentModalOpen(false)
  }

  return (
    <div className="p-8 space-y-8 bg-black min-h-full text-white selection:bg-white/20">
      <Tabs defaultValue="tokens" className="w-full flex flex-col gap-8 h-full">
        <PillarHeader
          title="Design System"
          description="Manage visual tokens and build reusable deterministic components for your application."
          stats={[{ label: 'Tokens', value: tokens.length }, { label: 'Components', value: components.length }]}
        />
        <TabsList className="bg-black/50 flex border border-zinc-800 p-1 rounded-none w-fit">
          <TabsTrigger value="tokens" className="px-8 h-fit py-2 rounded-none data-[state=active]:bg-white data-[state=active]:text-black text-xs font-medium">Tokens</TabsTrigger>
          <TabsTrigger value="components" className="px-8 h-fit py-2 rounded-none data-[state=active]:bg-white data-[state=active]:text-black text-xs font-medium">Components</TabsTrigger>
        </TabsList>

        <TabsContent value="tokens" className="space-y-12">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <TokenSection title="Colors" icon={<Palette className="size-4" />} tokens={tokens.filter(t => t.type === 'color')} onAdd={() => { setActiveModal('color'); setNewTokenValue('#ffffff'); }} onDelete={(id) => deleteToken(projectId as string, id)} />
            <TokenSection title="Typography" icon={<Type className="size-4" />} tokens={tokens.filter(t => t.type === 'typography')} onAdd={() => setActiveModal('typography')} onDelete={(id) => deleteToken(projectId as string, id)} />
            <TokenSection title="Spacing" icon={<Move className="size-4" />} tokens={tokens.filter(t => t.type === 'spacing')} onAdd={() => setActiveModal('spacing')} onDelete={(id) => deleteToken(projectId as string, id)} />
            <TokenSection title="Shadows" icon={<Layers className="size-4" />} tokens={tokens.filter(t => t.type === 'shadow')} onAdd={() => setActiveModal('shadow')} onDelete={(id) => deleteToken(projectId as string, id)} />
            <TokenSection title="Radius" icon={<BoxSelect className="size-4" />} tokens={tokens.filter(t => t.type === 'radius')} onAdd={() => setActiveModal('radius')} onDelete={(id) => deleteToken(projectId as string, id)} />
          </motion.div>
        </TabsContent>

        <TabsContent value="components">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h3 className="text-xl font-bold tracking-tight text-white">Component Registry</h3>
              <p className="text-xs text-zinc-500 font-medium">Atomic blocks and mini-page fragments.</p>
            </div>
            <Button onClick={() => setIsComponentModalOpen(true)} className="bg-white text-black hover:bg-zinc-200 rounded-none px-6 text-xs font-black h-11 transition-all group gap-2">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Build Component
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {components.map((comp) => (
                <ComponentCard key={comp.id} component={comp} onDelete={(id) => deleteComponent(projectId as string, id)} />
              ))}
            </AnimatePresence>
            {components.length === 0 && (
              <div className="col-span-full border border-dashed border-zinc-800 py-20 text-center flex flex-col items-center justify-center space-y-4">
                <div className="size-12 rounded-full border border-zinc-800 flex items-center justify-center"><Component className="size-6 text-zinc-700" /></div>
                <p className="text-xs text-zinc-500">No deterministic components defined.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <StandardModal isOpen={activeModal !== null} onClose={() => setActiveModal(null)} title={`New ${activeModal}`} description="Define a reusable visual variable." confirmText="Save Token" onConfirm={() => handleAddToken(activeModal)}>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs text-zinc-400 ">Token Name</Label>
            <Input value={newTokenName} onChange={(e) => setNewTokenName(e.target.value)} placeholder="brand-primary" className="bg-black border-zinc-800 rounded-none h-12 font-mono text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Value</Label>
            <div className="flex gap-2">
              <Input value={newTokenValue} onChange={(e) => setNewTokenValue(e.target.value)} className="bg-black border-zinc-800 rounded-none h-12 font-mono flex-1 text-white" />
              {activeModal === 'color' && (
                <Popover>
                  <PopoverTrigger className="w-12 h-12 border border-zinc-800 bg-black shrink-0" style={{ backgroundColor: newTokenValue }} />
                  <PopoverContent className="w-auto p-3 bg-black border-zinc-800 rounded-none shadow-2xl z-50">
                    <div className="grid grid-cols-5 gap-2">{presetColors.map((color) => (<button key={color} onClick={() => setNewTokenValue(color)} className="w-6 h-6 border border-zinc-800" style={{ backgroundColor: color }} />))}</div>
                  </PopoverContent></Popover>
              )}
            </div>
          </div>
        </div>
      </StandardModal>

      <StandardModal isOpen={isComponentModalOpen} onClose={() => setIsComponentModalOpen(false)} title="Construct Component" description="Define a new architectural block." confirmText="Create Component" onConfirm={handleAddComponent}>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-black text-zinc-500 ">Component name</Label>
            <Input value={newCompName} onChange={(e) => setNewCompName(e.target.value)} className="bg-black border-zinc-800 rounded-none h-12 font-mono text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-black text-zinc-500 ">Classification</Label>
            <Select value={newCompType} onValueChange={(v: any) => setNewCompType(v)}>
              <SelectTrigger className="bg-black w-full border-zinc-800 rounded-none h-14! text-xs text-white"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-black border-zinc-800 text-white capitalize rounded-none">
                <SelectItem value="button" className="text-xs">Button</SelectItem>
                <SelectItem value="input" className="text-xs">Input</SelectItem>
                <SelectItem value="form" className="text-xs">Form</SelectItem>
                <SelectItem value="container" className="text-xs">Layout</SelectItem>
                <SelectItem value="custom" className="text-xs">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </StandardModal>
    </div>
  )
}
