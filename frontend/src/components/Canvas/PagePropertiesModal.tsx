import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '../ui/textarea'
import { Save, Plus, Trash2, Fingerprint, Zap, Database, Settings2, Code } from 'lucide-react'
import { toast } from 'sonner'
import { usePages } from '@/hooks/usePages'
import { useVariables } from '@/hooks/useVariables'
import { ScreenInput, ScreenAction, ScreenOutput } from '@/types'

interface PagePropertiesModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  page_id: string
  label: string
  description: string
  inputs: ScreenInput[]
  actions: ScreenAction[]
  outputs: ScreenOutput[]
  constraints?: any[]
  functions?: any[]
  variables?: any[]
  context?: any
}

export function PagePropertiesModal({
  isOpen,
  onOpenChange,
  page_id,
  label,
  description: initialDescription,
  inputs,
  actions,
  outputs,
  constraints = [],
  functions = [],
  variables = [],
  context = {}
}: PagePropertiesModalProps) {
  const { updatePage, addInput, addAction, addOutput } = usePages()
  const { fetchVariables } = useVariables()
  const [title, setTitle] = useState(label)
  const [description, setDescription] = useState(initialDescription)
  const [isSaving, setIsSaving] = useState(false)

  const pages = usePages((state) => state.pages)
  const currentPage = pages.find(p => p.id === page_id)
  const projectId = currentPage?.project_id

  useEffect(() => {
    setTitle(label)
    setDescription(initialDescription)
    if (projectId) fetchVariables(projectId)
  }, [label, initialDescription, projectId, fetchVariables])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updatePage(page_id, { title, description })
      toast.success('Changes saved')
      onOpenChange(false)
    } catch (err) {
      toast.error('Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  const availableVariables = useVariables((state) => state.variables)
  const allInputs = usePages((state) => state.inputs)
  const allOutputs = usePages((state) => state.outputs)

  const filteredVariables = useMemo(() => {
    return availableVariables.filter(v => {
      if (v.scope !== 'transient') return true
      const boundPageIds = new Set<string>()
      allInputs.forEach(i => {
        if (i.variable_id === v.id) boundPageIds.add(i.page_id)
      })
      allOutputs.forEach(o => {
        if (o.variable_id === v.id) boundPageIds.add(o.page_id)
      })
      return boundPageIds.size === 0 || boundPageIds.has(page_id)
    })
  }, [availableVariables, allInputs, allOutputs, page_id])

  const handleAddInput = async () => {
    if (!projectId) return
    if (filteredVariables.length === 0) {
      toast.error('Define variables in the Registry first.')
      return
    }
    await addInput(page_id, {
      name: `input_${inputs.length + 1}`,
      input_type: 'form_field',
      variable_id: filteredVariables[0].id
    })
  }

  const handleAddAction = async () => {
    await addAction(page_id, {
      name: `trigger_${actions.length + 1}`,
      action_type: 'function_call'
    })
  }

  const handleAddOutput = async () => {
    await addOutput(page_id, {
      name: `output_${outputs.length + 1}`,
      output_type: 'state_update'
    })
  }

  const totalElements = inputs.length + actions.length + outputs.length

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 sm:max-w-[520px] p-0 overflow-hidden rounded-xl">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
          <DialogTitle className="text-base font-semibold">
            {title || 'Untitled page'}
          </DialogTitle>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            {totalElements} element{totalElements !== 1 ? 's' : ''} configured &middot; <span className="font-mono">{page_id.slice(0, 8)}</span>
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="flex-1 flex flex-col">
          <TabsList className="px-5 w-full justify-start h-auto bg-transparent border-b border-zinc-100 dark:border-zinc-800/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="inputs">Inputs</TabsTrigger>
            <TabsTrigger value="actions">Triggers</TabsTrigger>
            <TabsTrigger value="outputs">Outputs</TabsTrigger>
            <TabsTrigger value="logic">Logic</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto max-h-[440px] p-6">
            {/* Overview */}
            <TabsContent value="overview" className="m-0 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Page name</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-lg h-9 text-sm"
                  placeholder="e.g. Login screen"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-lg min-h-[80px] text-sm resize-none"
                  placeholder="What does this page do?"
                />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <StatCard icon={<Fingerprint className="size-3.5" />} label="Inputs" value={inputs.length} />
                <StatCard icon={<Zap className="size-3.5" />} label="Triggers" value={actions.length} />
                <StatCard icon={<Database className="size-3.5" />} label="Outputs" value={outputs.length} />
              </div>
            </TabsContent>

            {/* Inputs */}
            <TabsContent value="inputs" className="m-0">
              <SectionHeader
                title="Incoming data"
                subtitle="Variables mapped to this screen."
                onAdd={handleAddInput}
                addLabel="Add input"
              />
              <ItemList
                items={inputs}
                renderItem={(i) => <ConfigItem key={i.id} label={i.name} type={i.input_type} />}
                emptyMessage="No inputs configured"
              />
            </TabsContent>

            {/* Triggers */}
            <TabsContent value="actions" className="m-0">
              <SectionHeader
                title="Active triggers"
                subtitle="Event-based execution flows."
                onAdd={handleAddAction}
                addLabel="Add trigger"
              />
              <ItemList
                items={actions}
                renderItem={(a) => <ConfigItem key={a.id} label={a.name} type={a.action_type} />}
                emptyMessage="No triggers defined"
              />
            </TabsContent>

            {/* Outputs */}
            <TabsContent value="outputs" className="m-0">
              <SectionHeader
                title="Page output"
                subtitle="Changes propagated to the system."
                onAdd={handleAddOutput}
                addLabel="Add output"
              />
              <ItemList
                items={outputs}
                renderItem={(o) => <ConfigItem key={o.id} label={o.name} type={o.output_type} />}
                emptyMessage="No outputs registered"
              />
            </TabsContent>

            {/* Logic */}
            <TabsContent value="logic" className="m-0 space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Local logic</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Rules governing this page's behavior.</p>
              </div>
              <div className="bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                  <div className="size-2 rounded-full bg-red-400" />
                  <div className="size-2 rounded-full bg-yellow-400" />
                  <div className="size-2 rounded-full bg-green-400" />
                  <span className="ml-2 text-[10px] font-mono text-zinc-400 dark:text-zinc-500">logic_engine.wasm</span>
                </div>
                <div className="p-4 font-mono text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  <div><span className="text-purple-500 dark:text-purple-400">fn</span> <span className="text-blue-500 dark:text-blue-400">evaluate</span>() {'{'}</div>
                  <div className="pl-4 text-zinc-400 dark:text-zinc-600">// connect via wasm engine</div>
                  <div>{'}'}</div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800/50 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-black"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 text-xs font-semibold rounded-lg bg-black dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            <Save className="size-3.5 mr-1.5" />
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SectionHeader({ title, subtitle, onAdd, addLabel }: { title: string; subtitle: string; onAdd: () => void; addLabel: string }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{subtitle}</p>
      </div>
      <Button
        onClick={onAdd}
        variant="outline"
        className="h-7 text-xs rounded-lg border-zinc-200 dark:border-zinc-800 gap-1.5 hover:bg-zinc-50 dark:hover:bg-black"
      >
        <Plus className="size-3" /> {addLabel}
      </Button>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-center">
      <div className="flex items-center justify-center text-zinc-400 dark:text-zinc-500 mb-1">{icon}</div>
      <div className="text-lg font-semibold text-zinc-900 dark:text-white font-mono">{value}</div>
      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{label}</p>
    </div>
  )
}

function ConfigItem({ label, type }: { label: string; type: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
          {type}
        </span>
        <button className="text-zinc-300 dark:text-zinc-700 hover:text-red-500 dark:hover:text-red-400 transition-colors">
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

function ItemList({ items, renderItem, emptyMessage }: { items: any[]; renderItem: (item: any) => React.ReactNode; emptyMessage: string }) {
  if (items.length === 0) {
    return (
      <div className="py-10 flex flex-col items-center justify-center gap-2 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
        <Settings2 className="size-5 text-zinc-300 dark:text-zinc-700" />
        <span className="text-xs text-zinc-400 dark:text-zinc-600">{emptyMessage}</span>
      </div>
    )
  }
  return <div className="space-y-2">{items.map(renderItem)}</div>
}
