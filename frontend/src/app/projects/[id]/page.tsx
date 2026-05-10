'use client'

import { Canvas } from '@/components/Canvas/Canvas'
import { VariableRegistry } from '@/components/blocks/VariableRegistry'
import { DatabaseSchema } from '@/components/blocks/DatabaseSchema'
import { LogicLayer } from '@/components/blocks/LogicLayer'
import { IdentityPermissions } from '@/components/blocks/IdentityPermissions'
import { DesignSystem } from '@/components/blocks/DesignSystem'
import { ExportView } from '@/components/blocks/ExportView'
import { CollaboratorsView } from '@/components/blocks/CollaboratorsView'
import { LogicBot } from '@/components/blocks/LogicBot'
import { useUI } from '@/hooks/useUI'
import { useVariables } from '@/hooks/useVariables'
import { useLogicBot } from '@/hooks/useLogicBot'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { AlertCircle, ChevronLeft, Loader2, Sparkles, Share2, Save, Download, Terminal } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useProjects } from '@/hooks/useProjects'
import { usePages } from '@/hooks/usePages'
import { motion, AnimatePresence } from 'framer-motion'

export default function ProjectEditorPage() {
  const { activeView, activeMode } = useUI()
  const { id } = useParams()
  const { currentProject, fetchProjectById, isLoading: isProjectLoading } = useProjects()
  const { fetchVariables, isLoading: isVarsLoading, error: variableError } = useVariables()
  const { error: logicError } = useLogicBot()
  const { error: pageError } = usePages()

  useEffect(() => {
    if (id) {
      fetchProjectById(id as string)
      fetchVariables(id as string)
    }
  }, [id, fetchProjectById, fetchVariables])

  const displayError = variableError || logicError || pageError

  const renderContent = () => {
    switch (activeView) {
      case 'registry':
        return <VariableRegistry />
      case 'identity':
        return <IdentityPermissions />
      case 'schema':
        return <DatabaseSchema />
      case 'logic':
        return <LogicLayer />
      case 'design':
        return <DesignSystem />
      case 'export':
        return <ExportView />
      case 'collaborators':
        return <CollaboratorsView />
      case 'flows':
        return <Canvas />
      default:
        return (
          <div className="flex items-center justify-center h-full text-zinc-600 bg-black">
            <div className="text-center space-y-4">
              <div className="size-16 bg-black border border-zinc-800 flex items-center justify-center mx-auto">
                <Terminal className="size-8 text-zinc-700" />
              </div>
              <div>
                <h3 className="text-sm font-black  text-zinc-400">Pillar: {activeView}</h3>
                <p className="text-[10px] font-medium text-zinc-600 mt-1 tracking-tighter">This deterministic module is under construction.</p>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex-1 h-screen w-full relative bg-black overflow-hidden flex flex-col selection:bg-white/20">
      {/* Premium Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="h-16 bg-black border-b border-zinc-800 flex items-center justify-between pl-2 pr-4 z-50 shrink-0"
      >
        <div className="flex items-center gap-3">
          <Button href='../projects/' className='bg-zinc-600 border border-zinc-800 size-7 rounded-none p-0 group hover:bg-white hover:text-black transition-all'>
            <ChevronLeft className='size-5 group-hover:-translate-x-0.5 transition-transform' />
          </Button>

          <div className="h-10 w-0.5 bg-zinc-800/50" />

          <div className="flex flex-col">
            <div className="text-lg font-black tracking-tighter text-white flex items-center gap-3">
              {isProjectLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin text-zinc-500" />
                  <span className="text-zinc-700">Loading...</span>
                </div>
              ) : (
                <>
                  <span className="bg-linear-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                    {currentProject?.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            disabled
            className="text-[10px] font-black text-zinc-700 rounded-none h-10 px-6 gap-2 cursor-not-allowed"
          >
            <Share2 className="size-3.5" />
            Share
          </Button>

          <Button
            className="bg-black border border-zinc-800 text-[10px] font-black text-white hover:bg-zinc-800 rounded-none h-10 px-6 gap-2"
            onClick={() => toast.info('Auto-save enabled. Registry state is persistent.')}
          >
            <Save className="size-3.5 text-zinc-500" />
            Save changes
          </Button>

          <Button disabled className="bg-zinc-800 text-zinc-500 rounded-none h-10 px-8 text-[10px] font-black gap-2 cursor-not-allowed">
            <Download className="size-3.5" />
            Export .stem
          </Button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {displayError && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="bg-red-500/10 border-b border-red-500/20 px-8 py-3 flex items-center gap-4 text-[10px] font-black  text-red-400"
          >
            <AlertCircle className="size-4 shrink-0" />
            {displayError}
          </motion.div>
        )}

        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="h-full w-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <LogicBot />
    </div>
  )
}
