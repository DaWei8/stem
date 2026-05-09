'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StandardModal } from '@/components/ui/StandardModal'

interface NewProjectModalProps {
  onCreate: (name: string, description: string) => Promise<void>
}

export function NewProjectModal({ onCreate }: NewProjectModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleCreate = async () => {
    if (!name) return
    setIsLoading(true)
    try {
      await onCreate(name, description)
      setName('')
      setDescription('')
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-white text-black hover:bg-zinc-200 rounded-none h-11 px-6 text-xs font-black transition-all flex items-center gap-2 group"
      >
        <Plus className="size-4 group-hover:rotate-90 transition-transform duration-300" />
        New Project
      </Button>

      <StandardModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create Project"
        description="Define the boundaries and core parameters of your new system architecture."
        confirmText="Create Project"
        onConfirm={handleCreate}
        isConfirmLoading={isLoading}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[10px] font-bold text-zinc-500 ">
              System Identifier
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Neural Nexus Core"
              className="bg-black border-zinc-800 rounded-none h-12 text-sm focus-visible:ring-1 focus-visible:ring-zinc-600 transition-all text-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-[10px] font-bold text-zinc-500 ">
              Operational Specification
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="High-level description of the system architecture..."
              className="bg-black w-full min-h-[120px] p-4 border border-zinc-800 rounded-none text-sm focus:outline-none focus:border-zinc-600 transition-colors resize-none text-white"
            />
          </div>
        </div>
      </StandardModal>
    </>
  )
}
