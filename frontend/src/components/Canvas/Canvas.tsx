'use client'

import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
} from '@xyflow/react'
import { PageNode } from './PageNode'
import { Play, ShieldAlert, Cpu, Plus } from 'lucide-react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useCanvasLayout } from '@/hooks/useCanvasLayout'
import { ProjectSidebar } from './ProjectSidebar'
import { useState, useCallback, useEffect } from 'react'
import { useIdentity } from '@/hooks/useIdentity'
import { usePages } from '@/hooks/usePages'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'
import { StandardModal } from '@/components/ui/StandardModal'

const nodeTypes = {
  screen: PageNode,
}

export function Canvas() {
  const params = useParams()
  const projectId = params?.id as string
  const [selectedNode, setSelectedNode] = useState<any>(null)

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onReconnect,
    onReconnectEnd,
    onEdgeClick,
    onNodeDragStop,
    isSimulating,
    isLoaded,
    toggleSimulation,
    handleAddManualScreen,
    setNodes,
    simulationParams,
    setSimulationParams,
    runFlowSimulation,
    activePath
  } = useCanvasLayout(projectId)

  const { pages, removePage } = usePages()
  const { userTypes } = useIdentity()
  const [pageToDelete, setPageToDelete] = useState<string | null>(null)

  const onSelectionChange = useCallback(({ nodes }: { nodes: any[] }) => {
    setSelectedNode(nodes.length > 0 ? nodes[0] : null)
  }, [])

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
        // Check if we're not in an input/textarea
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

  return (
    <div className="w-full h-full bg-black relative flex overflow-hidden">
      {/* Canvas Area */}
      <div className="flex-1 h-full relative">
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              onClick={handleAddManualScreen}
              className="bg-black text-white hover:bg-zinc-800 rounded-none transition-none h-8 px-4 text-xs font-bold border border-zinc-800"
            >
              <Plus className="w-3 h-3" /> Add Screen
            </Button>
            <Button
              onClick={toggleSimulation}
              className={`h-8 rounded-none px-4 text-xs font-bold transition-none ${isSimulating ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-zinc-400 hover:bg-zinc-800'
                }`}
            >
              {isSimulating ? (
                <><Cpu className="w-3 h-3" /> Stop Sim</>
              ) : (
                <><Play className="w-3 h-3" />Test Flow</>
              )}
              <div className={`size-1.5 rounded-full ${isLoaded ? 'bg-green-500' : 'bg-yellow-500'}`} />
            </Button>
          </div>
        </div>

        {isSimulating && (
          <div className="absolute bottom-6 left-6 z-50">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black border border-zinc-800 p-5 shadow-[0_0_50px_rgba(255,255,255,0.1)] w-[320px] space-y-6"
            >
              <div className="flex items-center gap-3 border-zinc-900">
                <div>
                  <p className="text-sm font-semibold text-white">Simulation Engine</p>
                  <p className="text-xs font-medium text-zinc-500">Deterministic Path Analysis</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-zinc-500">Entry Point</Label>
                  <Select
                    value={simulationParams.startPageId}
                    onValueChange={(v) => setSimulationParams({ ...simulationParams, startPageId: v || '' })}
                  >
                    <SelectTrigger className="bg-zinc-950 h-12! w-full! border-zinc-800 rounded-none text-xs font-bold text-white">
                      <SelectValue placeholder="Select Start Screen">
                        {pages.find(p => p.id === simulationParams.startPageId)?.title || 
                         pages.find(p => p.id === simulationParams.startPageId)?.name || 
                         "Select Start Screen"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 min-h-12! w-full! border-zinc-800 text-white rounded-none">
                      {pages.map((p: any) => (
                        <SelectItem key={p.id} value={p.id} className="text-xs font-bold">{p.title || p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-zinc-500">Terminal Point</Label>
                  <Select
                    value={simulationParams.endPageId}
                    onValueChange={(v) => setSimulationParams({ ...simulationParams, endPageId: v || '' })}
                  >
                    <SelectTrigger className="bg-zinc-950 h-12! w-full! border-zinc-800 rounded-none text-xs font-bold text-white">
                      <SelectValue placeholder="Select End Screen">
                        {pages.find(p => p.id === simulationParams.endPageId)?.title || 
                         pages.find(p => p.id === simulationParams.endPageId)?.name || 
                         "Select End Screen"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 min-h-12! w-full! border-zinc-800 text-white rounded-none">
                      {pages.map((p: any) => (
                        <SelectItem key={p.id} value={p.id} className="text-xs font-bold">{p.title || p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-zinc-500">User Type</Label>
                  <Select
                    value={simulationParams.userTypeId}
                    onValueChange={(v) => setSimulationParams({ ...simulationParams, userTypeId: v || '' })}
                  >
                    <SelectTrigger className="bg-zinc-950 h-12! w-full! border-zinc-800 rounded-none text-xs font-bold text-white">
                      <SelectValue placeholder="All Users">
                        {userTypes.find(ut => ut.id === simulationParams.userTypeId)?.name || "All Users"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 min-h-12! w-full! border-zinc-800 text-white rounded-none">
                      {userTypes.map((ut: any) => (
                        <SelectItem key={ut.id} value={ut.id} className="text-xs font-bold">
                          <div className="flex items-center gap-2">
                            <div
                              className="size-1.5 rounded-full"
                              style={{ backgroundColor: ut.color || '#3f3f46' }}
                            />
                            {ut.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={runFlowSimulation}
                  className="w-full bg-white text-black hover:bg-zinc-200 rounded-none text-xs font-semibold"
                >
                  Run Flow
                </Button>
              </div>

              {activePath.length > 0 && (
                <div className="pt-4 border-t border-zinc-900">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
                    <span>Page length</span>
                    <span className="text-white">{activePath.length} steps</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onReconnect={onReconnect}
          onReconnectEnd={onReconnectEnd}
          onEdgeClick={onEdgeClick}
          onNodeDragStop={onNodeDragStop}
          onSelectionChange={onSelectionChange}
          nodeTypes={nodeTypes}
          colorMode="dark"
          fitView
        >
          <Controls className="bg-black border-zinc-800 fill-white shadow-none! rounded-none!" />
          <MiniMap
            className="bg-black border-zinc-800 rounded-none!"
            nodeColor="#27272a"
            maskColor="rgba(0,0,0,0.8)"
          />
          <Background variant={BackgroundVariant.Dots} gap={32} size={1} color="#ffffff" />
        </ReactFlow>
      </div>

      {/* Right Sidebar */}
      <ProjectSidebar
        selectedNode={selectedNode}
        projectId={projectId}
        onSelectScreen={handleSelectScreen}
        onTriggerDelete={(id) => setPageToDelete(id)}
      />

      <StandardModal
        isOpen={!!pageToDelete}
        onClose={() => setPageToDelete(null)}
        title="Delete Screen"
      >
        <div className="space-y-6">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-xs text-red-400 font-medium leading-relaxed">
              Are you sure you want to delete this screen? This will permanently remove all associated inputs, outputs, and transitions.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setPageToDelete(null)}
              className="flex-1 rounded-lg h-11 text-xs font-bold border-zinc-800 hover:bg-zinc-900"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeletePage}
              className="flex-1 bg-red-600 text-white hover:bg-red-700 rounded-lg h-11 text-xs font-bold"
            >
              Delete Permanently
            </Button>
          </div>
        </div>
      </StandardModal>
    </div>
  )
}
