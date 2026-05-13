'use client'

import { useCallback, useState, useEffect, useMemo } from 'react'
import {
  useNodesState,
  useEdgesState,
  addEdge,
  reconnectEdge,
  Connection,
  Edge,
  Node,
} from '@xyflow/react'
import { usePages } from '@/hooks/usePages'
import { useLogicBot } from '@/hooks/useLogicBot'
import { useUI } from '@/hooks/useUI'
import { toast } from 'sonner'

export type PageNodeData = {
  label: string
  page_id: string
  page?: any
  description?: string
  inputs?: any[]
  actions?: any[]
  outputs?: any[]
  constraints?: any[]
  functions?: any[]
  variables?: any[]
  context?: any
  onAddNextPage?: (parentId: string) => void
  simulationStatus?: 'success' | 'warning' | 'error' | 'none'
  isHighlighted?: boolean
  isStart?: boolean
  isEnd?: boolean
  isFiltered?: boolean
  filterType?: string
  isTraced?: boolean
  isNew?: boolean
}

export function useCanvasLayout(projectId: string | undefined) {
  const {
    pages, inputs, actions, outputs, transitions,
    fetchProjectPages, addPage, addTransition, removeTransition, updateTransition, updatePage
  } = usePages()

  const { canvasFilter, tracedItemId, isChaosMode, snapshot, activeVariableId } = useUI()

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<PageNodeData>>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationParams, setSimulationParams] = useState({
    startPageId: '',
    endPageId: '',
    userTypeId: ''
  })
  const [activePath, setActivePath] = useState<string[]>([])
  const { isLoaded, createEngine } = useLogicBot()

  useEffect(() => {
    if (projectId) {
      fetchProjectPages(projectId)
    }
  }, [projectId, fetchProjectPages])

  const addNextScreen = useCallback(async (parentId: string) => {
    if (!projectId) return

    const name = `New Page ${pages.length + 1}`
    const newPage = await addPage(projectId, name)

    if (newPage) {
      await addTransition(parentId, newPage.id)
      toast.success('Connected new page')
    }
  }, [projectId, pages.length, addPage, addTransition])

  useEffect(() => {
    if (pages.length > 0) {
      const uniqueFolders = Array.from(new Set(pages.map(p => p.folder).filter(Boolean))) as string[]
      
      const groupNodes = uniqueFolders.map(folder => {
        const folderPages = pages.filter(p => p.folder === folder)
        const minX = Math.min(...folderPages.map(p => p.canvas_x ?? 0))
        const minY = Math.min(...folderPages.map(p => p.canvas_y ?? 0))
        const maxX = Math.max(...folderPages.map(p => (p.canvas_x ?? 0) + 300))
        const maxY = Math.max(...folderPages.map(p => (p.canvas_y ?? 0) + 400))
        
        return {
          id: `group-${folder}`,
          type: 'group',
          data: { label: folder },
          position: { x: minX - 40, y: minY - 80 },
          style: {
            width: (maxX - minX) + 80,
            height: (maxY - minY) + 120,
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            pointerEvents: 'all',
            zIndex: -1
          },
          draggable: true
        }
      })

      const screenNodes = pages.map((page, index) => {
        let simulationStatus: 'success' | 'warning' | 'error' | 'none' = 'none'

        if (isSimulating) {
          const hasInputs = inputs.some(i => i.page_id === page.id)
          const hasActions = actions.some(a => a.page_id === page.id)
          
          if (isChaosMode) {
            // Chaos Mode: Deterministic failure based on ID
            const charSum = page.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
            if (charSum % 7 === 0) simulationStatus = 'error'
            else if (charSum % 5 === 0) simulationStatus = 'warning'
            else simulationStatus = 'success'
          } else {
            if (!hasInputs && !hasActions) simulationStatus = 'warning'
            else if (index % 3 === 0) simulationStatus = 'success'
            else if (index % 4 === 0) simulationStatus = 'error'
            else simulationStatus = 'success'
          }
        }


        const pageInputs = inputs.filter(i => i.page_id === page.id)
        const pageActions = actions.filter(a => a.page_id === page.id)
        const pageOutputs = outputs.filter(o => o.page_id === page.id)

        let isFiltered = false
        if (canvasFilter !== 'none') {
          if (canvasFilter === 'inputs') isFiltered = pageInputs.length > 0
          else if (canvasFilter === 'outputs') isFiltered = pageOutputs.length > 0
          else if (canvasFilter === 'triggers') isFiltered = pageActions.length > 0
          else if (canvasFilter === 'screens') isFiltered = true
          else if (canvasFilter === 'variables') isFiltered = pageInputs.some(i => i.variable_id)
        }

        // Traceability check
        const isTraced = tracedItemId ? (
          pageInputs.some(i => i.variable_id === tracedItemId) ||
          pageActions.some(a => a.function_id === tracedItemId) ||
          pageOutputs.some(o => o.id === tracedItemId) // Or other relations
        ) : false

        // Benchmarking check
        const isNew = snapshot ? !snapshot.architecture.pages.some((p: any) => p.id === page.id) : false

        // Architectural Linting
        const validationWarnings: string[] = []
        if (pageOutputs.length > 0 && !actions.some(a => a.page_id === page.id)) {
          validationWarnings.push('Mutation occurs without explicit trigger logic.')
        }
        if (pageInputs.length === 0 && simulationParams.startPageId !== page.id) {
          validationWarnings.push('Orphaned state: No incoming data defined.')
        }

        const isVariableActive = activeVariableId ? (
          pageInputs.some(i => i.variable_id === activeVariableId) ||
          pageOutputs.some(o => o.variable_id === activeVariableId)
        ) : false

        const { viewAsUserTypeId } = useUI.getState()
        const isPermissionDenied = viewAsUserTypeId && page.allowed_roles ? !page.allowed_roles.includes(viewAsUserTypeId) : false

        return {
          id: page.id,
          type: 'screen',

          position: {
            x: page.canvas_x ?? index * 400,
            y: page.canvas_y ?? 100
          },
          data: {
            label: page.title || page.name || 'Untitled',
            page_id: page.id,
            page: page,
            description: page.description,
            inputs: pageInputs,
            actions: pageActions,
            outputs: pageOutputs,
            onAddNextPage: (parentId: string) => addNextScreen(parentId),
            simulationStatus,
            isHighlighted: activePath.includes(page.id) || isVariableActive,
            isStart: simulationParams.startPageId === page.id,
            isEnd: simulationParams.endPageId === page.id,
            isFiltered: isFiltered || isTraced || isNew || isVariableActive || isPermissionDenied,
            filterType: isPermissionDenied ? 'permission' : (isNew ? 'new' : (isTraced ? 'trace' : (isVariableActive ? 'variable' : canvasFilter))),
            isTraced,

            isNew,
            validationWarnings
          },
        }


      })
      setNodes([...groupNodes, ...screenNodes] as any[])

      const newEdges = transitions.map((t, idx) => {
        let stroke = '#27272a'
        let strokeDasharray = '0'
        let animated = true
        let zIndex = 0

        const isPathEdge = activePath.includes(t.from_page_id) && 
                          activePath.includes(t.to_page_id) && 
                          activePath.indexOf(t.to_page_id) === activePath.indexOf(t.from_page_id) + 1

        const isNavigation = t.trigger_type === 'user_action' || t.trigger_type === 'click' || t.trigger_type === 'manual'
        
        const isFailure = t.is_failure_path || t.trigger_type === 'failure'
        
        if (isSimulating) {
          if (isPathEdge) {
            stroke = isFailure ? '#ef4444' : '#22c55e'
            animated = true
            zIndex = 10
          } else {
            stroke = '#18181b'
            strokeDasharray = '5 5'
            animated = false
          }
        } else {
          if (isFailure) {
            stroke = '#ef4444' // Red: Failure/Error path
            strokeDasharray = '4 2'
          } else if (isNavigation) {
            stroke = '#3b82f6' // Solid Blue: Hard navigation
            strokeDasharray = '0'
          } else {
            stroke = '#f59e0b' // Dashed Amber: Data Dependency
            strokeDasharray = '5 5'
          }
          animated = false
        }

        const isTracedEdge = tracedItemId && (
          // Logic to determine if edge is traced
          false
        )

        return {
          id: t.id,
          source: t.from_page_id,
          target: t.to_page_id,
          animated,
          reconnectable: true,
          zIndex,
          style: {
            stroke,
            strokeWidth: isPathEdge ? 4 : (selectedEdgeId === t.id ? 3 : 2),
            strokeDasharray,
            opacity: isSimulating && !isPathEdge ? 0.2 : (canvasFilter !== 'none' || tracedItemId ? 0.3 : 1)
          }
        }

      })
      setEdges(newEdges)
    } else if (!isSimulating && pages.length === 0) {
      setNodes([])
      setEdges([])
    }
  }, [pages, inputs, actions, outputs, transitions, isSimulating, activePath, simulationParams, setNodes, setEdges, addNextScreen, selectedEdgeId, canvasFilter, tracedItemId])



  const onConnect = useCallback(
    (params: Connection) => {
      const isFailure = params.sourceHandle === 'failure'
      setEdges((eds: Edge[]) => addEdge({
        ...params,
        animated: isFailure,
        style: { 
          stroke: isFailure ? '#ef4444' : '#52525b', 
          strokeWidth: 2, 
          strokeDasharray: isFailure ? '4 2' : '5 5' 
        }
      }, eds))
      if (params.source && params.target) {
        addTransition(params.source, params.target, isFailure ? 'failure' : 'user_action', isFailure)
        toast.success(isFailure ? 'Negative path mapped' : 'Link established')
      }
    },

    [setEdges, addTransition]
  )

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els))
      if (newConnection.source && newConnection.target) {
        updateTransition(oldEdge.id, {
          from_page_id: newConnection.source,
          to_page_id: newConnection.target
        })
        toast.success('Link re-routed')
      }
    },
    [setEdges, updateTransition]
  )

  const onNodeDrag = useCallback(
    (_: any, node: Node) => {
      if (node.type === 'group') {
        const folderName = node.data.label
        const folderPages = pages.filter(p => p.folder === folderName)
        
        // We use setNodes to update the local positions of the children in real-time
        setNodes((nds) => nds.map((n) => {
          if (n.type === 'screen' && n.data.page.folder === folderName) {
            // Find the original position from the pages state
            const page = folderPages.find(p => p.id === n.id)
            if (!page) return n

            // Calculate the bounding box of original pages to find the offset
            const minX = Math.min(...folderPages.map(p => p.canvas_x ?? 0))
            const minY = Math.min(...folderPages.map(p => p.canvas_y ?? 0))
            
            const offsetX = node.position.x - (minX - 40)
            const offsetY = node.position.y - (minY - 80)

            return {
              ...n,
              position: {
                x: (page.canvas_x ?? 0) + offsetX,
                y: (page.canvas_y ?? 0) + offsetY
              }
            }
          }
          return n
        }))
      }
    },
    [pages, setNodes]
  )

  const onReconnectEnd = useCallback(
    (_: any, edge: Edge) => {
      removeTransition(edge.id)
    },
    [removeTransition]
  )

  const onNodeDragStop = useCallback(
    async (_: any, node: Node) => {
      if (node.type === 'group') {
        // Move all pages in this group based on new group position
        const folderName = node.data.label
        const folderPages = pages.filter(p => p.folder === folderName)
        
        // Calculate the bounding box of original pages to find the offset
        const minX = Math.min(...folderPages.map(p => p.canvas_x ?? 0))
        const minY = Math.min(...folderPages.map(p => p.canvas_y ?? 0))
        
        const offsetX = node.position.x - (minX - 40)
        const offsetY = node.position.y - (minY - 80)

        for (const page of folderPages) {
          await updatePage(page.id, {
            canvas_x: Math.round((page.canvas_x ?? 0) + offsetX),
            canvas_y: Math.round((page.canvas_y ?? 0) + offsetY)
          })
        }
        return
      }

      // 1. Update position
      await updatePage(node.id, {
        canvas_x: Math.round(node.position.x),
        canvas_y: Math.round(node.position.y)
      })

      // 2. Folder Drop Detection
      // We look for 'group' nodes that contain this node's center point
      const nodeCenterX = node.position.x + 150
      const nodeCenterY = node.position.y + 200

      const parentGroup = nodes.find(n => 
        n.type === 'group' && 
        nodeCenterX >= n.position.x && 
        nodeCenterX <= n.position.x + (n.style?.width as number || 0) &&
        nodeCenterY >= n.position.y &&
        nodeCenterY <= n.position.y + (n.style?.height as number || 0)
      )

      if (parentGroup) {
        const folderName = parentGroup.data.label
        await updatePage(node.id, { folder: folderName })
        toast.success(`Moved to ${folderName}`)
      }
    },
    [updatePage, nodes]
  )

  const toggleSimulation = useCallback(() => {
    if (!isSimulating) {
      createEngine()
    } else {
      setActivePath([])
    }
    setIsSimulating(!isSimulating)
  }, [isSimulating, createEngine])

  const runFlowSimulation = useCallback(() => {
    if (!simulationParams.startPageId || !simulationParams.endPageId) {
      toast.error('Select start and end points')
      return
    }

    // BFS to find shortest path
    const queue: [string, string[]][] = [[simulationParams.startPageId, [simulationParams.startPageId]]]
    const visited = new Set<string>([simulationParams.startPageId])

    while (queue.length > 0) {
      const [current, path] = queue.shift()!
      if (current === simulationParams.endPageId) {
        setActivePath(path)
        toast.success(`Path found: ${path.length} steps`)
        return
      }

      const neighbors = transitions
        .filter(t => t.from_page_id === current)
        .map(t => t.to_page_id)

      for (const next of neighbors) {
        if (!visited.has(next)) {
          visited.add(next)
          queue.push([next, [...path, next]])
        }
      }
    }

    toast.error('No deterministic path found between these screens')
    setActivePath([])
  }, [simulationParams, transitions])

  const onEdgeClick = useCallback((_: any, edge: Edge) => {
    setSelectedEdgeId(edge.id)
  }, [])

  const handleAddManualScreen = useCallback(async () => {
    if (!projectId) return
    const name = `New Page ${pages.length + 1}`
    await addPage(projectId, name)
    toast.success('Page added')
  }, [projectId, pages.length, addPage])

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onReconnect,
    onReconnectEnd,
    onEdgeClick,
    onNodeDrag,
    onNodeDragStop,
    isSimulating,
    isLoaded,
    toggleSimulation,
    handleAddManualScreen,
    setNodes,
    simulationParams,
    setSimulationParams,
    runFlowSimulation,
    activePath,
    updatePage
  }
}
