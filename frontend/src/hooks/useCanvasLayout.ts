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
}

export function useCanvasLayout(projectId: string | undefined) {
  const {
    pages, inputs, actions, outputs, transitions,
    fetchProjectPages, addPage, addTransition, removeTransition, updateTransition, updatePage
  } = usePages()

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
      const newNodes = pages.map((page, index) => {
        let simulationStatus: 'success' | 'warning' | 'error' | 'none' = 'none'

        if (isSimulating) {
          const hasInputs = inputs.some(i => i.page_id === page.id)
          const hasActions = actions.some(a => a.page_id === page.id)
          if (!hasInputs && !hasActions) simulationStatus = 'warning'
          else if (index % 3 === 0) simulationStatus = 'success'
          else if (index % 4 === 0) simulationStatus = 'error'
          else simulationStatus = 'success'
        }

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
            inputs: inputs.filter(i => i.page_id === page.id),
            actions: actions.filter(a => a.page_id === page.id),
            outputs: outputs.filter(o => o.page_id === page.id),
            onAddNextPage: (parentId: string) => addNextScreen(parentId),
            simulationStatus,
            isHighlighted: activePath.includes(page.id),
            isStart: simulationParams.startPageId === page.id,
            isEnd: simulationParams.endPageId === page.id
          },
        }
      })
      setNodes(newNodes)

      const newEdges = transitions.map((t, idx) => {
        let stroke = '#27272a'
        let strokeDasharray = '0'
        let animated = true
        let zIndex = 0

        const isPathEdge = activePath.includes(t.from_page_id) && 
                          activePath.includes(t.to_page_id) && 
                          activePath.indexOf(t.to_page_id) === activePath.indexOf(t.from_page_id) + 1

        if (isSimulating) {
          if (isPathEdge) {
            stroke = '#22c55e'
            animated = true
            zIndex = 10
          } else {
            stroke = '#18181b'
            strokeDasharray = '5 5'
            animated = false
          }
        } else {
          stroke = '#52525b' // Brighter zinc-600 for better visibility
          strokeDasharray = '5 5'
          animated = false
        }

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
            opacity: isSimulating && !isPathEdge ? 0.2 : 1
          }
        }
      })
      setEdges(newEdges)
    } else if (!isSimulating && pages.length === 0) {
      setNodes([])
      setEdges([])
    }
  }, [pages, inputs, actions, outputs, transitions, isSimulating, activePath, simulationParams, setNodes, setEdges, addNextScreen, selectedEdgeId])

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds: Edge[]) => addEdge({
        ...params,
        animated: false,
        style: { stroke: '#52525b', strokeWidth: 2, strokeDasharray: '5 5' }
      }, eds))
      if (params.source && params.target) {
        addTransition(params.source, params.target)
        toast.success('Link established')
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

  const onReconnectEnd = useCallback(
    (_: any, edge: Edge) => {
      removeTransition(edge.id)
    },
    [removeTransition]
  )

  const onNodeDragStop = useCallback(
    (_: any, node: Node) => {
      updatePage(node.id, {
        canvas_x: Math.round(node.position.x),
        canvas_y: Math.round(node.position.y)
      })
    },
    [updatePage]
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
  }
}
