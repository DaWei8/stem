'use client'

import { ReactFlow, MiniMap, Controls, Background, BackgroundVariant } from '@xyflow/react'
import { PageNode } from './PageNode'
import { Folder } from 'lucide-react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useCanvasLayout } from '@/hooks/useCanvasLayout'
import { ProjectSidebar } from './ProjectSidebar'
import { useState, useCallback, useEffect } from 'react'
import { useIdentity } from '@/hooks/useIdentity'
import { usePages } from '@/hooks/usePages'
import { StandardModal } from '@/components/ui/StandardModal'
import { validateArchitecture, ValidationIssue } from '@/lib/validationUtils'
import { useUI } from '@/hooks/useUI'
import { toast } from 'sonner'
import { SimulationPanel } from './SimulationPanel'
import { ValidationModal } from './ValidationModal'
import { CanvasToolbar } from './CanvasToolbar'
import { CommandPalette } from './CommandPalette'

const GroupNode = ({ data }: any) => (
  <div className="relative w-full h-full p-6">
    <div className="absolute -top-7 left-2 flex items-center gap-2">
      <div className="p-1.5 bg-zinc-900 rounded-md border border-zinc-800">
        <Folder className="size-3 text-zinc-400" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500/60">{data.label}</span>
    </div>
  </div>
)

const nodeTypes = {
  screen: PageNode,
  group: GroupNode,
}

export function Canvas() {
  const params = useParams()
  const projectId = params?.id as string
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [selectedNodes, setSelectedNodes] = useState<any[]>([])

  const {
    nodes, edges, onNodesChange, onEdgesChange, onConnect,
    onReconnect, onReconnectEnd, onEdgeClick, onNodeDrag, onNodeDragStop,
    isSimulating, isLoaded, toggleSimulation, handleAddManualScreen,
    setNodes, simulationParams, setSimulationParams, runFlowSimulation, activePath
  } = useCanvasLayout(projectId)

  const { pages, removePage, inputs, actions, outputs, transitions, setSelectedNodeId } = usePages()
  const { userTypes } = useIdentity()
  const [pageToDelete, setPageToDelete] = useState<string | null>(null)
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([])
  const [isValidationOpen, setIsValidationOpen] = useState(false)
  const [narrative, setNarrative] = useState('')
  const { isChaosMode, toggleChaosMode, setSnapshot, snapshot } = useUI()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && typeof window !== 'undefined' && document.documentElement.classList.contains('dark')

  const onSelectionChange = useCallback(({ nodes }: { nodes: any[] }) => {
    const selected = nodes.length === 1 ? nodes[0] : null
    setSelectedNodes(nodes)
    setSelectedNode(selected)
    setSelectedNodeId(selected ? selected.id : null)
  }, [setSelectedNodeId])

  const handleDeletePage = useCallback(async () => {
    if (pageToDelete) {
      await removePage(pageToDelete)
      setPageToDelete(null)
      setSelectedNode(null)
    }
  }, [pageToDelete, removePage])

  // Keyboard listener for Delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNode) {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          setPageToDelete(selectedNode.data.page_id)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNode])

  const handleSelectScreen = useCallback((pageId: string) => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        selected: node.id === pageId,
      }))
    )
  }, [setNodes])

  const handleValidate = useCallback(() => {
    const issues = validateArchitecture(pages, transitions, inputs, actions, outputs)
    setValidationIssues(issues)
    setIsValidationOpen(true)
    if (issues.length === 0) {
      toast.success('Architecture validated: No logical orphans or gaps detected.')
    } else {
      toast.warning(`Validation complete: ${issues.length} potential issues found.`)
    }
  }, [pages, transitions, inputs, actions, outputs])

  const handleTraceNarrative = useCallback(() => {
    if (!narrative) return
    const mentionedScreens = pages.filter(p =>
      narrative.toLowerCase().includes(p.title.toLowerCase())
    ).sort((a, b) =>
      narrative.toLowerCase().indexOf(a.title.toLowerCase()) -
      narrative.toLowerCase().indexOf(b.title.toLowerCase())
    )

    if (mentionedScreens.length >= 2) {
      setSimulationParams({
        ...simulationParams,
        startPageId: mentionedScreens[0].id,
        endPageId: mentionedScreens[mentionedScreens.length - 1].id
      })
      setTimeout(() => runFlowSimulation(), 0)
      toast.success(`Storyboarding path: ${mentionedScreens.map(s => s.title).join(' → ')}`)
    } else if (mentionedScreens.length === 1) {
      handleSelectScreen(mentionedScreens[0].id)
      toast.info(`Located '${mentionedScreens[0].title}' in your narrative.`)
    } else {
      toast.error('No known architectural entities found in narrative.')
    }
  }, [narrative, pages, runFlowSimulation, handleSelectScreen, simulationParams, setSimulationParams])

  const handleCreateSnapshot = useCallback(() => {
    const currentState = {
      project: null,
      architecture: { pages, transitions, inputs, actions, outputs },
      schema: { tables: [], columns: [] },
      identity: { userTypes: [], policies: [] },
      logic: { variables: [] },
      designSystem: { tokens: [], components: [] },
      observability: { latencyModels: [], costProjections: [], bottlenecks: [] },
      lifecycle: { featureFlags: [], flagGates: [], migrations: [], transforms: [] }
    }
    setSnapshot(currentState)
    toast.success('System baseline captured for benchmarking.')
  }, [pages, transitions, inputs, actions, outputs, setSnapshot])

  return (
    <div className="w-full h-full bg-zinc-50 dark:bg-zinc-900 relative flex overflow-hidden transition-colors duration-300">
      {/* Canvas Area */}
      <div className="flex-1 h-full relative">
        <CanvasToolbar
          onAddScreen={handleAddManualScreen}
          onValidate={handleValidate}
          onCreateSnapshot={handleCreateSnapshot}
          toggleSimulation={toggleSimulation}
          isSimulating={isSimulating}
          isLoaded={isLoaded}
        />

        {isSimulating && (
          <SimulationPanel
            snapshot={snapshot}
            setSnapshot={setSnapshot}
            isChaosMode={isChaosMode}
            toggleChaosMode={toggleChaosMode}
            simulationParams={simulationParams}
            setSimulationParams={setSimulationParams}
            pages={pages}
            userTypes={userTypes}
            narrative={narrative}
            setNarrative={setNarrative}
            handleTraceNarrative={handleTraceNarrative}
            runFlowSimulation={runFlowSimulation}
            activePath={activePath}
          />
        )}

        <ReactFlow
          nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onConnect={onConnect} onReconnect={onReconnect} onReconnectEnd={onReconnectEnd}
          onEdgeClick={onEdgeClick} onNodeDrag={onNodeDrag} onNodeDragStop={onNodeDragStop} onSelectionChange={onSelectionChange}
          nodeTypes={nodeTypes} colorMode={isDark ? 'dark' : 'light'} fitView
          minZoom={0.1} maxZoom={1.5}
        >

          <Controls className="bg-white/10 dark:bg-black border-zinc-200 dark:border-zinc-800 fill-black dark:fill-white shadow-sm! rounded-none!" />
          <MiniMap className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none!" nodeColor="#a1a1aa" maskColor="rgba(0,0,0,0.1)" />
          <Background variant={BackgroundVariant.Dots} gap={32} size={1} color={isDark ? '#ffffff' : '#000000'} />
        </ReactFlow>
      </div>

      <ProjectSidebar
        selectedNode={selectedNode}
        selectedNodes={selectedNodes}
        projectId={projectId}
        onSelectScreen={handleSelectScreen}
        onTriggerDelete={(id) => setPageToDelete(id)}
      />

      <StandardModal isOpen={!!pageToDelete} onClose={() => setPageToDelete(null)} title="Delete Screen">
        <div className="space-y-6">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-xs text-red-400 font-medium leading-relaxed">
              Are you sure you want to delete this screen? This will permanently remove all associated inputs, outputs, and transitions.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setPageToDelete(null)} className="flex-1 rounded-lg h-11 text-xs font-bold border-zinc-800 hover:bg-zinc-900">Cancel</Button>
            <Button onClick={handleDeletePage} className="flex-1 bg-red-600 text-white hover:bg-red-700 rounded-lg h-11 text-xs font-bold">Delete Permanently</Button>
          </div>
        </div>
      </StandardModal>

      <ValidationModal
        isOpen={isValidationOpen}
        onClose={() => setIsValidationOpen(false)}
        issues={validationIssues}
        onLocate={handleSelectScreen}
      />

      <CommandPalette selectedNodeId={selectedNode?.id} projectId={projectId} />
    </div>
  )
}



