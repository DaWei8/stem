'use client'

import { useState } from 'react'
import { Folder, Layout, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { FolderSelect } from './FolderSelect'

interface Props {
  selectedNodes: any[]
  updatePage: (id: string, updates: any) => Promise<void>
}

export function BulkEdit({ selectedNodes, updatePage }: Props) {
  const [folder, setFolder] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleBulkUpdate = async () => {
    setIsSaving(true)
    const toastId = toast.loading(`Moving ${selectedNodes.length} screens to "${folder}"...`)
    try {
      await Promise.all(
        selectedNodes.map(node => updatePage(node.id, { folder }))
      )
      toast.success(`Moved ${selectedNodes.length} screens to "${folder}"`, {
        id: toastId,
      })
    } catch (err) {
      toast.error('Bulk update failed', {
        id: toastId,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-zinc-50 dark:bg-black transition-colors">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-900 bg-white dark:bg-black shrink-0">
        <h2 className="text-lg font-bold text-black dark:text-white">Bulk Actions</h2>
        <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500  mt-1">
          {selectedNodes.length} Elements Selected
        </p>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-8 custom-scrollbar">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 ">Move to Folder</label>
            <FolderSelect value={folder} onChange={setFolder} placeholder="e.g. Auth Flow, Onboarding" inputClassName="h-11" />
          </div>

          <Button
            onClick={handleBulkUpdate}
            disabled={isSaving || !folder}
            className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-lg h-11 text-xs font-bold transition-all"
          >
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Layout className="size-4 mr-2" />}
            Move Selected to Folder
          </Button>
        </div>

        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-900">
          <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500  mb-4 block">Selected Elements</label>
          <div className="space-y-2">
            {selectedNodes.map(node => (
              <div key={node.id} className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300 truncate max-w-[150px]">
                  {node.data?.label || 'Untitled Screen'}
                </span>
                <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-600 ">
                  {node.data?.page?.folder || 'No Folder'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
