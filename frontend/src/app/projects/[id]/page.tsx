'use client'

import { Canvas } from '@/components/Canvas/Canvas'
import { IdentityPermissions } from '@/components/blocks/IdentityPermissions'
import { DesignSystem } from '@/components/blocks/DesignSystem'
import { SystemEngine } from '@/components/blocks/SystemEngine'
import { CollaboratorsView } from '@/components/blocks/CollaboratorsView'
import { DocumentationView } from '@/components/blocks/DocumentationView'
import { OverviewView } from '@/components/blocks/OverviewView'
import { HistoryView } from '@/components/blocks/HistoryView'
import { useActivityLogs } from '@/hooks/useActivityLogs'
import { useCollaborators } from '@/hooks/useCollaborators'
import { useUI } from '@/hooks/useUI'
import { cn } from '@/lib/utils'
import { useVariables } from '@/hooks/useVariables'
import { useLogicBot } from '@/hooks/useLogicBot'
import { useDesignSystem } from '@/hooks/useDesignSystem'
import { useDatabase } from '@/hooks/useDatabase'
import { useIdentity } from '@/hooks/useIdentity'
import { useLogic } from '@/hooks/useLogic'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { AlertCircle, ChevronLeft, Loader2, Sparkles, Share2, Save, Download, Terminal } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useProjects } from '@/hooks/useProjects'
import { usePages } from '@/hooks/usePages'
import { useSystemArchitect } from '@/hooks/useSystemArchitect'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { StandardModal } from '@/components/ui/StandardModal'
import { generateProjectDocumentation } from '@/lib/exportUtils'

export default function ProjectEditorPage() {
  const { activeView, activeMode, isChaosMode, toggleChaosMode } = useUI()
  const { id } = useParams()
  const { currentProject, fetchProjectById, isLoading: isProjectLoading } = useProjects()
  const { fetchVariables, isLoading: isVarsLoading, error: variableError } = useVariables()
  const { error: logicError } = useLogicBot()
  const { pages, inputs, actions, outputs, transitions, fetchProjectPages, error: pageError } = usePages()
  const { variables } = useVariables()
  const { tokens, components } = useDesignSystem()
  const { tables, columns, fetchProjectData: fetchDatabaseData } = useDatabase()
  const { userTypes, policies, fetchIdentityData } = useIdentity()
  const { fetchLogicData } = useLogic()
  const { fetchMessages } = useSystemArchitect()
  const { fetchLogs } = useActivityLogs()
  const { fetchCollaborators, fetchInvitations } = useCollaborators()

  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  const cleanExportData = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(cleanExportData)
    } else if (obj !== null && typeof obj === 'object') {
      const cleaned: any = {}
      const keysToRemove = [
        'project_id', 'owner_id', 'created_at', 'updated_at',
        'icon', 'canvas_x', 'canvas_y', 'canvas_width', 'canvas_height',
        'last_simulation_at'
      ]
      for (const [key, value] of Object.entries(obj)) {
        if (!keysToRemove.includes(key)) {
          cleaned[key] = cleanExportData(value)
        }
      }
      return cleaned
    }
    return obj
  }

  const downloadFile = (data: any, filename: string) => {
    const cleanedData = cleanExportData(data)
    const blob = new Blob([JSON.stringify(cleanedData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadTextFile = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadDocFile = (htmlContent: string, filename: string) => {
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportOptions = [
    {
      label: 'Product Documentation (.doc)',
      description: 'A beautifully formatted MS Word document of your entire project.',
      action: () => {
        const data = {
          project: currentProject,
          architecture: { pages, transitions, inputs, actions, outputs },
          schema: { tables, columns },
          identity: { userTypes, policies },
          logic: { variables },
          designSystem: { tokens, components },
          meta: { version: '0.1.0-alpha', exportedAt: new Date().toISOString(), engine: 'STEM-CORE-V1' }
        }
        const docText = generateProjectDocumentation(data)
        downloadDocFile(docText, `${currentProject?.name?.toLowerCase().replace(/\\s+/g, '_') || 'project'}_docs.doc`)
        toast.success('Product Documentation exported')
        setIsExportModalOpen(false)
      }
    },
    {
      label: 'Full System Blueprint (.stem)',
      description: 'The entire deterministic project state including all pillars.',
      action: () => {
        const data = {
          project: currentProject,
          architecture: { pages, transitions, inputs, actions, outputs },
          schema: { tables, columns },
          identity: { userTypes, policies },
          logic: { variables },
          designSystem: { tokens, components },
          meta: { version: '0.1.0-alpha', exportedAt: new Date().toISOString(), engine: 'STEM-CORE-V1' }
        }
        downloadFile(data, `${currentProject?.name?.toLowerCase().replace(/\\s+/g, '_') || 'project'}.stem`)
        toast.success('Full system exported')
        setIsExportModalOpen(false)
      }
    },
    {
      label: 'UI Flows & Architecture',
      description: 'Screens, inputs, outputs, and transitions.',
      action: () => {
        downloadFile({ pages, transitions, inputs, actions, outputs }, 'architecture.json')
        toast.success('Architecture exported')
        setIsExportModalOpen(false)
      }
    },
    {
      label: 'Database Schema',
      description: 'Tables, columns, and relationships.',
      action: () => {
        downloadFile({ tables, columns }, 'schema.json')
        toast.success('Schema exported')
        setIsExportModalOpen(false)
      }
    },
    {
      label: 'Design System',
      description: 'Tokens, palettes, and components.',
      action: () => {
        downloadFile({ tokens, components }, 'design_system.json')
        toast.success('Design System exported')
        setIsExportModalOpen(false)
      }
    }
  ]

  useEffect(() => {
    if (id) {
      const projectId = id as string
      fetchProjectById(projectId)
      fetchVariables(projectId)
      fetchProjectPages(projectId)
      fetchDatabaseData(projectId)
      fetchIdentityData(projectId)
      fetchLogicData(projectId)
      fetchMessages(projectId)
      fetchLogs(projectId)
      fetchCollaborators(projectId)
      fetchInvitations(projectId)
    }
  }, [
    id,
    fetchProjectById,
    fetchVariables,
    fetchProjectPages,
    fetchDatabaseData,
    fetchIdentityData,
    fetchLogicData,
    fetchMessages,
    fetchLogs,
    fetchCollaborators,
    fetchInvitations
  ])



  const displayError = variableError || logicError || pageError

  const renderContent = () => {
    switch (activeView) {
      case 'dataengine':
      case 'logic':
        return <SystemEngine />
      case 'identity':
        return <IdentityPermissions />
      case 'design':
        return <DesignSystem />
      case 'export':
      case 'documentation':
        return <DocumentationView />
      case 'collaborators':
        return <CollaboratorsView />
      case 'flows':
        return <Canvas />
      case 'overview':
        return <OverviewView />
      case 'history':
        return <HistoryView />
      default:
        return (
          <div className="flex items-center justify-center h-full text-zinc-600 bg-zinc-50 dark:bg-black transition-colors duration-300">
            <div className="text-center space-y-4">
              <div className="size-16 bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto">
                <Terminal className="size-8 text-zinc-400 dark:text-zinc-700" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-600 dark:text-zinc-400">Pillar: {activeView}</h3>
                <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-600 mt-1 tracking-tighter">This deterministic module is under construction.</p>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex-1 h-screen w-full relative bg-zinc-50 dark:bg-black overflow-hidden flex flex-col selection:bg-black/10 dark:selection:bg-white/20 transition-colors duration-300">
      {/* Premium Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="h-16 bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between pl-2 pr-4 z-50 shrink-0 transition-colors duration-300"
      >
        <div className="flex items-center gap-3">
          <Button href='../projects/' className='bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white size-7 rounded-md p-0 group hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all'>
            <ChevronLeft className='size-5 group-hover:-translate-x-0.5 transition-transform' />
          </Button>

          <div className="h-10 w-0.5 bg-zinc-200 dark:bg-zinc-800/50" />

          <div className="flex flex-col">
            <div className="text-lg font-black tracking-tighter text-black dark:text-white flex items-center gap-3">
              {isProjectLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin text-zinc-400 dark:text-zinc-500" />
                  <span className="text-zinc-500 dark:text-zinc-700">Loading...</span>
                </div>
              ) : (
                <>
                  <span className="bg-linear-to-r from-black to-zinc-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent">
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
            onClick={() => setIsShareModalOpen(true)}
            className="text-[10px] font-black text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md h-10 px-4 gap-2 transition-colors"
          >
            <Share2 className="size-3.5" />
            Share
          </Button>

          <Button
            variant='outline'
            onClick={() => setIsExportModalOpen(true)}
            className=" rounded-md h-10 px-4 text-[10px] font-black gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <Download className="size-3.5" />
            Export
          </Button>
          <Button
            className="bg-black dark:bg-white border-black dark:border-white text-[10px] font-black text-white dark:text-black hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-md h-10 px-4 gap-2 transition-colors"
            onClick={() => toast.info('Auto-save enabled. Registry state is persistent.')}
          >
            <Save className="size-3.5 text-zinc-400 dark:text-zinc-500" />
            Save changes
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
      <StandardModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Project Collaboration"
        description="Invite colleagues to collaborate on this deterministic system blueprint."
        className="sm:max-w-3xl"
      >
        <div className="max-h-[70vh] overflow-y-auto py-2 custom-scrollbar">
          <CollaboratorsView isModal={true} />
        </div>
      </StandardModal>

      <StandardModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Project Options"
        description="Select what you would like to export."
        className="max-w-xl"
      >
        <div className="flex flex-col gap-3 py-4">
          {exportOptions.map((opt, i) => (
            <button
              key={i}
              onClick={opt.action}
              className="flex flex-col text-left p-4 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-colors bg-zinc-50 dark:bg-black/50 group"
            >
              <span className="text-sm font-bold text-black dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors">{opt.label}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 transition-colors">{opt.description}</span>
            </button>
          ))}
        </div>
      </StandardModal>
    </div>
  )
}
