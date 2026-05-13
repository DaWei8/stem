'use client'

import { useState, useMemo } from 'react'
import {
  Fingerprint, Zap, Database, Trash2, Save, ChevronRight, ArrowRight, Folder, Code, ShieldCheck, AlertTriangle, Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { useDatabase } from '@/hooks/useDatabase'
import { useIdentity } from '@/hooks/useIdentity'
import { SidebarSection } from './helpers'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Props {
  page: any
  allPages: any[]
  transitions: any[]
  availableVariables: any[]
  updatePage: any
  addInput: any
  addAction: any
  addOutput: any
  onSelectScreen?: (id: string) => void
  onDelete: () => void
}

export function ScreenDetails({
  page, allPages, transitions, availableVariables, updatePage, addInput, addAction, addOutput, onSelectScreen, onDelete
}: Props) {
  const { columns, tables } = useDatabase()
  const { policies } = useIdentity()
  
  const [title, setTitle] = useState(page.title)
  const [description, setDescription] = useState(page.description || '')
  const [folder, setFolder] = useState(page.folder || '')
  const [isSaving, setIsSaving] = useState(false)

  // Derived data for context
  const persistentVars = useMemo(() => {
    const colVarIds = new Set(columns.map(c => c.variable_id).filter(Boolean))
    return availableVariables.filter(v => colVarIds.has(v.id))
  }, [availableVariables, columns])

  const incomingScreens = useMemo(() => {
    const screens = transitions.filter(t => t.to_page_id === page.id).map(t => allPages.find(p => p.id === t.from_page_id)).filter(Boolean)
    return Array.from(new Map(screens.map(s => [s.id, s])).values())
  }, [transitions, page.id, allPages])

  const outgoingScreens = useMemo(() => {
    const screens = transitions.filter(t => t.from_page_id === page.id).map(t => allPages.find(p => p.id === t.to_page_id)).filter(Boolean)
    return Array.from(new Map(screens.map(s => [s.id, s])).values())
  }, [transitions, page.id, allPages])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updatePage(page.id, { title, description, folder })
      toast.success('Screen updated')
    } catch (err) {
      toast.error('Failed to update')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-900 bg-white dark:bg-black flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-lg font-bold text-black dark:text-white truncate max-w-[180px]">{page.title}</h2>
          <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest text-[9px]">Screen Properties</span>
        </div>
        <Button variant="ghost" onClick={onDelete} className="size-8 p-0 text-zinc-400 hover:text-red-500 rounded-lg">
          <Trash2 className="size-4" />
        </Button>
      </div>

      <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
        <TabsList className="bg-white dark:bg-black px-4 border-b border-zinc-200 dark:border-zinc-900 h-12 w-full justify-start gap-4 rounded-none transition-colors">
          <TabsTrigger value="overview" className="text-zinc-400 data-[state=active]:text-black dark:data-[state=active]:text-white text-[10px] font-black uppercase tracking-widest bg-transparent">Overview</TabsTrigger>
          <TabsTrigger value="data" className="text-zinc-400 data-[state=active]:text-black dark:data-[state=active]:text-white text-[10px] font-black uppercase tracking-widest bg-transparent">Data Context</TabsTrigger>
          <TabsTrigger value="logic" className="text-zinc-400 data-[state=active]:text-black dark:data-[state=active]:text-white text-[10px] font-black uppercase tracking-widest bg-transparent">Logic</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-8 custom-scrollbar">
          <TabsContent value="overview" className="m-0 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Title</label>
                <Input value={title} onChange={e => setTitle(e.target.value)} className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none h-11 text-xs font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Architectural Folder</label>
                <div className="relative flex items-center">
                  <Folder className="absolute left-3 size-3 text-zinc-400" />
                  <Input value={folder} onChange={e => setFolder(e.target.value)} placeholder="Auth Flow, Dashboard..." className="pl-8 bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none h-11 text-xs" />
                </div>
              </div>
              <Button onClick={handleSave} disabled={isSaving} className="w-full bg-black dark:bg-white text-white dark:text-black rounded-none h-11 text-xs font-bold">
                <Save className="size-3.5 mr-2" /> {isSaving ? 'Updating...' : 'Save Architecture'}
              </Button>
            </div>

            {/* Flows */}
            <div className="space-y-6 pt-6 border-t border-zinc-200 dark:border-zinc-900">
              <FlowSection icon={<ArrowRight className="size-3 rotate-180 text-blue-500" />} title="Incoming" screens={incomingScreens} onSelect={onSelectScreen} />
              <FlowSection icon={<ArrowRight className="size-3 text-emerald-500" />} title="Outgoing" screens={outgoingScreens} onSelect={onSelectScreen} />
            </div>
          </TabsContent>

          <TabsContent value="data" className="m-0 space-y-8">
            <SidebarSection
              title="Active Subscriptions"
              icon={<Fingerprint className="size-3 text-blue-500" />}
              onAdd={() => addInput(page.id, { name: `input_${(page.inputs || []).length + 1}`, input_type: 'form_field', variable_id: availableVariables[0]?.id })}
              items={page.inputs || []}
              renderItem={(i) => {
                const variable = availableVariables.find(v => v.id === i.variable_id)
                const linkedCol = columns.find(c => c.variable_id === i.variable_id)
                const table = tables.find(t => t.id === linkedCol?.table_id)
                const tablePolicies = table ? policies.filter(p => p.table_id === table.id) : []

                return (
                  <div key={i.id} className="p-4 bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-zinc-800 rounded-none space-y-3 group">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-black dark:text-white uppercase font-mono">{i.name}</span>
                      <button className="text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="size-3" /></button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-500/5 text-blue-500 border border-blue-500/10 uppercase tracking-tighter">
                        {variable?.label || 'Transient'}
                      </span>
                      {table && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 uppercase tracking-tighter">
                          Persistent: {table.name}
                        </span>
                      )}
                    </div>
                    {tablePolicies.length > 0 && (
                      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="size-2.5 text-red-500" />
                          <span className="text-[9px] font-black text-zinc-400 uppercase">Governance (RLS)</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {tablePolicies.map(p => (
                            <div key={p.id} className="text-[8px] font-bold bg-white dark:bg-black px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-800 text-zinc-500">
                              {p.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              }}
            />

            <SidebarSection
              title="State Mutations"
              icon={<Database className="size-3 text-emerald-500" />}
              onAdd={() => addOutput(page.id, { name: `output_${(page.outputs || []).length + 1}`, output_type: 'state_update' })}
              items={page.outputs || []}
              renderItem={(o) => (
                <div key={o.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-zinc-800 rounded-none group">
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase font-mono">{o.name}</span>
                  <button className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-colors"><Trash2 className="size-3" /></button>
                </div>
              )}
            />
          </TabsContent>

          <TabsContent value="logic" className="m-0 space-y-6">
            <SidebarSection
              title="Active Triggers"
              icon={<Zap className="size-3 text-amber-500" />}
              onAdd={() => addAction(page.id, { name: `trigger_${(page.actions || []).length + 1}`, action_type: 'function_call' })}
              items={page.actions || []}
              renderItem={(a) => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-zinc-800 rounded-none group">
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase font-mono">{a.name}</span>
                  <button className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-colors"><Trash2 className="size-3" /></button>
                </div>
              )}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

function FlowSection({ icon, title, screens, onSelect }: { icon: any; title: string; screens: any[]; onSelect?: any }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{title} Flows</span>
      </div>
      <div className="space-y-2">
        {screens.length === 0 ? (
          <p className="text-[10px] text-zinc-300 dark:text-zinc-700 italic px-1">No connections defined</p>
        ) : (
          screens.map(s => (
            <div key={s.id} onClick={() => onSelect?.(s.id)} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-none hover:border-black dark:hover:border-zinc-600 cursor-pointer group transition-all">
              <span className="text-xs font-bold text-zinc-500 group-hover:text-black dark:group-hover:text-white transition-colors">{s.title}</span>
              <ChevronRight className="size-3 text-zinc-300 group-hover:text-zinc-500" />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
