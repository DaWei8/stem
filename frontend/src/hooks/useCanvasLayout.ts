'use client'

import { useCallback, useState, useEffect, useMemo, useRef } from 'react'
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
import { useVariables } from '@/hooks/useVariables'
import { useLogicBot } from '@/hooks/useLogicBot'
import { useUI } from '@/hooks/useUI'
import { useIdentity } from '@/hooks/useIdentity'
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
    pages, inputs, actions, outputs, transitions, constraints,
    fetchProjectPages, addPage, addTransition, removeTransition, updateTransition, updatePage
  } = usePages()

  const { variables, fetchVariables } = useVariables()

  const { canvasFilter, tracedItemId, isChaosMode, snapshot, activeVariableId } = useUI()

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<PageNodeData>>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationParams, setSimulationParams] = useState({
    startPageId: '',
    endPageId: '',
    userTypeId: '',
    personaInstanceId: ''
  })
  const [activePath, setActivePath] = useState<string[]>([])
  const [simulationStep, setSimulationStep] = useState(-1)
  const [simulationStatus, setSimulationStatus] = useState<'idle' | 'running' | 'path_found' | 'path_not_found'>('idle')
  const [simulationLogs, setSimulationLogs] = useState<string[]>([])
  const simulationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { isLoaded, createEngine } = useLogicBot()

  useEffect(() => {
    if (projectId) {
      fetchProjectPages(projectId)
      fetchVariables(projectId)
    }
  }, [projectId, fetchProjectPages, fetchVariables])

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
      // Pre-index items by page_id to avoid O(N*M) complexity in the map below
      const inputsByPage = inputs.reduce((acc, i) => {
        if (!acc[i.page_id]) acc[i.page_id] = []
        acc[i.page_id].push(i)
        return acc
      }, {} as Record<string, any[]>)

      const actionsByPage = actions.reduce((acc, a) => {
        if (!acc[a.page_id]) acc[a.page_id] = []
        acc[a.page_id].push(a)
        return acc
      }, {} as Record<string, any[]>)

      const outputsByPage = outputs.reduce((acc, o) => {
        if (!acc[o.page_id]) acc[o.page_id] = []
        acc[o.page_id].push(o)
        return acc
      }, {} as Record<string, any[]>)

      const screenNodes = pages.map((page, index) => {
        let simulationStatus: 'success' | 'warning' | 'error' | 'none' = 'none'

        if (isSimulating) {
          const hasInputs = inputsByPage[page.id]?.length > 0
          const hasActions = actionsByPage[page.id]?.length > 0
          
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


        const pageInputs = inputsByPage[page.id] || []
        const pageActions = actionsByPage[page.id] || []
        const pageOutputs = outputsByPage[page.id] || []

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
            isHighlighted: (activePath.some((id, i) => id === page.id && simulationStep >= i)) || isVariableActive,
            activeStep: activePath[simulationStep] === page.id,
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
      setNodes(screenNodes as any[])

      const newEdges = transitions.map((t, idx) => {
        let stroke = '#27272a'
        let strokeDasharray = '0'
        let animated = true
        let zIndex = 0

        const isPathEdge = activePath.some((id, i) => 
          id === t.from_page_id && 
          activePath[i+1] === t.to_page_id && 
          simulationStep >= i + 1
        )

        const isNavigation = t.trigger_type === 'auto' || t.trigger_type === 'click' || t.trigger_type === 'manual' || t.trigger_type === 'user_action'
        
        const isFailure = t.is_failure_path || t.trigger_type === 'failure'
        
        if (isSimulating) {
          if (isPathEdge) {
            stroke = (isFailure || simulationStatus === 'path_not_found') ? '#ef4444' : '#22c55e'
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
  }, [
    pages, inputs, actions, outputs, transitions, 
    isSimulating, activePath, simulationStep, simulationParams, simulationStatus,
    isChaosMode, snapshot, activeVariableId,
    setNodes, setEdges, addNextScreen, selectedEdgeId, canvasFilter, tracedItemId
  ])

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
        addTransition(params.source, params.target, isFailure ? 'failure' : 'auto', isFailure)
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
      // Group dragging logic removed for performance
    },
    []
  )

  const onReconnectEnd = useCallback(
    (_: any, edge: Edge) => {
      removeTransition(edge.id)
    },
    [removeTransition]
  )

  const onNodeDragStop = useCallback(
    async (_: any, node: Node) => {
      // 1. Update position
      await updatePage(node.id, {
        canvas_x: Math.round(node.position.x),
        canvas_y: Math.round(node.position.y)
      })
    },
    [updatePage]
  )

  const toggleSimulation = useCallback(() => {
    if (!isSimulating) {
      createEngine()
      setSimulationStatus('idle')
    } else {
      setActivePath([])
      setSimulationStep(-1)
      setSimulationLogs([])
    }
    setIsSimulating(!isSimulating)
  }, [isSimulating, createEngine])

  const runFlowSimulation = useCallback(() => {
    if (!simulationParams.startPageId || !simulationParams.endPageId) {
      toast.error('Select start and end points')
      return
    }

    const userTypeId = simulationParams.userTypeId
    const personaInstanceId = simulationParams.personaInstanceId
    const { userTypes } = useIdentity.getState()
    const currentUserType = userTypes.find(u => u.id === userTypeId)
    const agentName = currentUserType ? currentUserType.name : 'Anonymous / Guest'

    setSimulationStatus('running')
    setSimulationStep(-1)
    setActivePath([])

    let initialState: Record<string, any> = {}
    let personaName = 'Default Instance'

    if (currentUserType?.persona?.instances && personaInstanceId && personaInstanceId !== 'default') {
      const inst = currentUserType.persona.instances.find((i: any) => i.id === personaInstanceId)
      if (inst) {
        initialState = { ...inst.values }
        personaName = inst.name
      }
    }

    setSimulationLogs([
      `Initializing stateful path analysis...`,
      `Active Agent: "${agentName}" (Persona: "${personaName}")`,
      `Initial Context State: ${JSON.stringify(initialState)}`
    ])

    const evaluateConstraint = (val: any, op: string, expected: any) => {
      switch (op) {
        case 'eq': return val === expected
        case 'neq': return val !== expected
        case 'gt': return val > expected
        case 'gte': return val >= expected
        case 'lt': return val < expected
        case 'lte': return val <= expected
        case 'in': return Array.isArray(expected) && expected.includes(val)
        case 'nin': return !Array.isArray(expected) || !expected.includes(val)
        case 'contains':
          if (typeof val === 'string') return val.includes(expected)
          if (Array.isArray(val)) return val.includes(expected)
          return false
        case 'exists': return val !== undefined && val !== null
        default: return true
      }
    }

    // Helper: Verify if page is allowed for active role
    const isPageAllowed = (pageId: string) => {
      const page = pages.find(p => p.id === pageId)
      if (!page) return false
      if (!page.allowed_roles || page.allowed_roles.length === 0) return true
      if (!userTypeId) return false
      return page.allowed_roles.includes(userTypeId)
    }

    // 1. Stateful BFS to find a valid route
    const queue: [string, string[], Record<string, any>, string[]][] = [
      [
        simulationParams.startPageId,
        [simulationParams.startPageId],
        { ...initialState },
        []
      ]
    ]
    const visited = new Set<string>()
    let resolvedPath: string[] | null = null
    let resolvedLogs: string[] = []
    let resolvedFinalState: Record<string, any> = {}

    // Check if start page is allowed
    if (isPageAllowed(simulationParams.startPageId)) {
      while (queue.length > 0) {
        const [current, path, state, logs] = queue.shift()!
        
        if (current === simulationParams.endPageId) {
          resolvedPath = path
          resolvedLogs = logs
          resolvedFinalState = state
          break
        }

        const stateKey = `${current}-${JSON.stringify(state)}`
        if (visited.has(stateKey)) continue
        visited.add(stateKey)

        const neighbors = transitions
          .filter(t => t.from_page_id === current)
          .map(t => t.to_page_id)

        for (const nextId of neighbors) {
          const nextPage = pages.find(p => p.id === nextId)
          if (!nextPage) continue

          // Check role access
          if (!isPageAllowed(nextId)) continue

          // Check required inputs
          const pageInputs = inputs.filter(i => i.page_id === nextId)
          let inputsSatisfied = true
          for (const input of pageInputs) {
            if (input.is_required) {
              const v = variables.find(varItem => varItem.id === input.variable_id)
              const val = v ? state[v.label] : undefined
              if (val === undefined || val === null) {
                inputsSatisfied = false
                break
              }
            }
          }
          if (!inputsSatisfied) continue

          // Check constraints
          const pageConstraints = constraints.filter(c => c.page_id === nextId)
          let constraintsSatisfied = true
          let fallbackTargetId: string | null = null
          
          for (const c of pageConstraints) {
            const v = variables.find(varItem => varItem.id === c.variable_id)
            const val = v ? (state[v.label] !== undefined ? state[v.label] : v.default_value) : undefined
            const passed = evaluateConstraint(val, c.operator, c.expected_value)
            
            if (!passed) {
              if (c.fallback_page_id) {
                fallbackTargetId = c.fallback_page_id
              } else {
                constraintsSatisfied = false
              }
              break
            }
          }

          if (!constraintsSatisfied) continue

          let nextNodeId = nextId
          let stepLogs = [...logs]

          if (fallbackTargetId) {
            const fallbackPage = pages.find(p => p.id === fallbackTargetId)
            const fallbackTitle = fallbackPage?.title || fallbackPage?.name || 'Fallback'
            stepLogs.push(`REDIRECT: Flow diverted to fallback "${fallbackTitle}" due to constraint mismatch.`)
            nextNodeId = fallbackTargetId
          }

          // Apply mutations from outputs of nextNodeId
          const nextState = { ...state }
          const pageOutputs = outputs.filter(o => o.page_id === nextNodeId)
          for (const out of pageOutputs) {
            if (out.variable_id) {
              const v = variables.find(varItem => varItem.id === out.variable_id)
              if (v) {
                const val = out.output_config?.value
                nextState[v.label] = val
                const name = nextPage.title || nextPage.name || 'Screen'
                stepLogs.push(`MUTATE: [${name}] Set variable "${v.label}" = ${JSON.stringify(val)}`)
              }
            }
          }

          queue.push([nextNodeId, [...path, nextNodeId], nextState, stepLogs])
        }
      }
    }

    // 2. If a stateful path is found, animate and log it
    if (resolvedPath) {
      setActivePath(resolvedPath)
      let step = 0
      const animate = () => {
        if (step < resolvedPath.length) {
          setSimulationStep(step)
          const currentId = resolvedPath[step]
          const currentPage = pages.find(p => p.id === currentId)
          const pageTitle = currentPage?.title || currentPage?.name || 'Screen'
          const latency = 40 + Math.floor(Math.random() * 80)
          
          setSimulationLogs(prev => [
            ...prev,
            `[${step * 200}ms] Resolved: "${pageTitle}" (+${latency}ms logic overhead)`
          ])

          // Print any logs corresponding to this step/transition
          const stepMutations = resolvedLogs.filter(log => log.includes(`[${pageTitle}]`))
          if (stepMutations.length > 0) {
            setSimulationLogs(prev => [...prev, ...stepMutations.map(m => `  ↳ ${m}`)])
          }

          // Print output mutation logs
          const pageOutputs = outputs.filter(o => o.page_id === currentId)
          pageOutputs.forEach(out => {
            if (out.variable_id) {
              const v = variables.find(varItem => varItem.id === out.variable_id)
              if (v) {
                const val = out.output_config?.value
                setSimulationLogs(prev => [
                  ...prev,
                  `  ↳ Mutation: set state variable "${v.label}" = ${JSON.stringify(val)}`
                ])
              }
            }
          })

          step++
          simulationTimerRef.current = setTimeout(animate, 500)
        } else {
          setSimulationStatus('path_found')
          setSimulationLogs(prev => [
            ...prev,
            `Simulation complete: Stateful flow baseline verified successfully.`,
            `Final Context State: ${JSON.stringify(resolvedFinalState)}`
          ])
          toast.success(`Path resolved: ${resolvedPath.length} steps`)
        }
      }
      animate()
      return
    }

    // 3. Diagnostics Run: If no stateful path was found, trace structurally and report the block point
    const rawQueue: [string, string[]][] = [[simulationParams.startPageId, [simulationParams.startPageId]]]
    const rawVisited = new Set<string>([simulationParams.startPageId])
    let rawPath: string[] | null = null

    while (rawQueue.length > 0) {
      const [current, path] = rawQueue.shift()!
      if (current === simulationParams.endPageId) {
        rawPath = path
        break
      }

      const neighbors = transitions
        .filter(t => t.from_page_id === current)
        .map(t => t.to_page_id)

      for (const next of neighbors) {
        if (!rawVisited.has(next)) {
          rawVisited.add(next)
          rawQueue.push([next, [...path, next]])
        }
      }
    }

    if (!rawPath) {
      setSimulationStatus('path_not_found')
      setSimulationLogs(prev => [
        ...prev,
        'CRITICAL: No physical connection exists between these screens.',
        'Verify transitions and flow triggers on the canvas.'
      ])
      toast.error('No connection found between these screens')
      setActivePath([])
      return
    }

    // Trace step-by-step structurally and pinpoint why state check blocked it
    const pathToShow: string[] = []
    let blockLogs: string[] = []
    let tempState = { ...initialState }
    let blockedIndex = -1

    for (let i = 0; i < rawPath.length; i++) {
      const currentId = rawPath[i]
      const page = pages.find(p => p.id === currentId)
      if (!page) break

      pathToShow.push(currentId)

      // Role check
      if (!isPageAllowed(currentId)) {
        blockedIndex = i
        const requiredRoles = page.allowed_roles || []
        const requiredRoleNames = requiredRoles.map(rId => userTypes.find(u => u.id === rId)?.name || 'Unknown').join(', ')
        blockLogs.push(`SECURITY VIOLATION: Access Denied at "${page.title || page.name}"`)
        blockLogs.push(`↳ Page requires role(s): [${requiredRoleNames}]`)
        blockLogs.push(`↳ Current agent identity has role: "${agentName}"`)
        break
      }

      // Check required inputs
      const pageInputs = inputs.filter(inp => inp.page_id === currentId)
      let inputBlocked = false
      for (const input of pageInputs) {
        if (input.is_required) {
          const v = variables.find(varItem => varItem.id === input.variable_id)
          const label = v ? v.label : 'unknown'
          const val = v ? tempState[v.label] : undefined
          if (val === undefined || val === null) {
            blockedIndex = i
            inputBlocked = true
            blockLogs.push(`STATE VIOLATION: Required input "${label}" is missing at "${page.title || page.name}"`)
            blockLogs.push(`↳ Simulation context state: ${JSON.stringify(tempState)}`)
            break
          }
        }
      }
      if (inputBlocked) break

      // Check constraints
      const pageConstraints = constraints.filter(c => c.page_id === currentId)
      let constraintBlocked = false
      for (const c of pageConstraints) {
        const v = variables.find(varItem => varItem.id === c.variable_id)
        const label = v ? v.label : 'unknown'
        const val = v ? (tempState[v.label] !== undefined ? tempState[v.label] : v.default_value) : undefined
        const passed = evaluateConstraint(val, c.operator, c.expected_value)
        
        if (!passed) {
          if (c.fallback_page_id) {
            const fallback = pages.find(p => p.id === c.fallback_page_id)
            blockLogs.push(`REDIRECT: Constraint on "${label}" failed. Rediverting flow to fallback screen "${fallback?.title || fallback?.name}".`)
            rawPath[i + 1] = c.fallback_page_id
          } else {
            blockedIndex = i
            constraintBlocked = true
            blockLogs.push(`CONSTRAINT VIOLATION: Page guardrail failed at "${page.title || page.name}"`)
            blockLogs.push(`↳ Constraint: ${label} ${c.operator} ${JSON.stringify(c.expected_value)}`)
            blockLogs.push(`↳ Current value: ${JSON.stringify(val)}`)
            break
          }
        }
      }
      if (constraintBlocked) break

      // Apply mutations
      const pageOutputs = outputs.filter(o => o.page_id === currentId)
      for (const out of pageOutputs) {
        if (out.variable_id) {
          const v = variables.find(varItem => varItem.id === out.variable_id)
          if (v) {
            const val = out.output_config?.value
            tempState[v.label] = val
            blockLogs.push(`Mutated state at "${page.title || page.name}": set "${v.label}" = ${JSON.stringify(val)}`)
          }
        }
      }
    }

    setActivePath(pathToShow)
    let step = 0
    const animate = () => {
      if (step < pathToShow.length) {
        setSimulationStep(step)
        const currentId = pathToShow[step]
        const currentPage = pages.find(p => p.id === currentId)
        const pageTitle = currentPage?.title || currentPage?.name || 'Screen'

        if (blockedIndex !== -1 && step === blockedIndex) {
          setSimulationLogs(prev => [
            ...prev,
            ...blockLogs,
            `CRITICAL: Simulation failed due to policy or state restriction.`
          ])
          setSimulationStatus('path_not_found')
          toast.error(`Simulation blocked at "${pageTitle}"`)
        } else {
          setSimulationLogs(prev => [
            ...prev,
            `[${step * 200}ms] Resolved: "${pageTitle}"`
          ])
          step++
          simulationTimerRef.current = setTimeout(animate, 500)
        }
      }
    }
    animate()

  }, [simulationParams, transitions, pages, inputs, outputs, constraints, variables])

  const stopSimulation = useCallback(() => {
    if (simulationTimerRef.current) {
      clearTimeout(simulationTimerRef.current)
      simulationTimerRef.current = null
    }
    setSimulationStatus('idle')
    setActivePath([])
    setSimulationStep(-1)
    setSimulationLogs([])
  }, [])

  const autoLayout = useCallback(async () => {
    if (pages.length === 0) return

    // ── Layout Constants (Left-to-Right Tree) ──
    const NODE_W = 320
    const NODE_H = 380
    const COL_GAP = 500         // horizontal gap between depth columns (parent → child)
    const ROW_GAP = 120         // vertical gap between sibling nodes
    const TREE_GAP = 600        // vertical gap between separate disconnected trees
    const ORPHAN_ROWS = 3       // orphan grid rows
    const ORPHAN_H_GAP = 500    // orphan horizontal spacing
    const ORPHAN_V_GAP = 500    // orphan vertical spacing
    const ORPHAN_OFFSET = 800   // gap between tree and orphan section

    // ── 1. Build adjacency ──
    const childrenOf: Record<string, string[]> = {}
    const inDegree: Record<string, number> = {}

    pages.forEach(p => {
      childrenOf[p.id] = []
      inDegree[p.id] = 0
    })

    transitions.forEach(t => {
      if (childrenOf[t.from_page_id] && !childrenOf[t.from_page_id].includes(t.to_page_id)) {
        childrenOf[t.from_page_id].push(t.to_page_id)
      }
      if (inDegree[t.to_page_id] !== undefined) {
        inDegree[t.to_page_id]++
      }
    })

    // Roots: no incoming edges
    const roots = pages.filter(p => inDegree[p.id] === 0).map(p => p.id)
    if (roots.length === 0 && pages.length > 0) roots.push(pages[0].id)

    // ── 2. Build tree ──
    interface TreeNode {
      id: string
      children: TreeNode[]
      height: number   // total vertical span of this subtree
      depth: number
    }

    const claimed = new Set<string>()

    const buildTree = (id: string, depth: number): TreeNode | null => {
      if (claimed.has(id)) return null
      claimed.add(id)

      const kids: TreeNode[] = []
      for (const childId of (childrenOf[id] || [])) {
        const sub = buildTree(childId, depth + 1)
        if (sub) kids.push(sub)
      }

      // Sort children: largest subtrees first for visual balance
      kids.sort((a, b) => b.children.length - a.children.length)

      return { id, children: kids, height: 0, depth }
    }

    const forest: TreeNode[] = []
    for (const rootId of roots) {
      const tree = buildTree(rootId, 0)
      if (tree) forest.push(tree)
    }

    const orphans = pages.filter(p => !claimed.has(p.id)).map(p => p.id)

    // ── 3. Measure subtree heights bottom-up ──
    // Height = max(own height, sum of children heights + gaps between them)
    const measureHeight = (node: TreeNode): number => {
      if (node.children.length === 0) {
        node.height = NODE_H
        return node.height
      }
      let total = 0
      node.children.forEach((child, i) => {
        total += measureHeight(child)
        if (i < node.children.length - 1) total += ROW_GAP
      })
      node.height = Math.max(NODE_H, total)
      return node.height
    }
    forest.forEach(tree => measureHeight(tree))

    // Sort forest: tallest trees first
    forest.sort((a, b) => b.height - a.height)

    // ── 4. Position nodes left-to-right ──
    // X = depth column,  Y = centered vertically within allocated height band
    const newPositions: Record<string, { x: number, y: number }> = {}

    const positionTree = (node: TreeNode, x: number, y: number, allocatedHeight: number) => {
      // Center this node vertically within its allocated band
      newPositions[node.id] = {
        x,
        y: y + (allocatedHeight - NODE_H) / 2
      }

      if (node.children.length === 0) return

      // Stack children vertically, centered within the allocated height
      const childrenTotalHeight = node.children.reduce((s, c) => s + c.height, 0)
        + (node.children.length - 1) * ROW_GAP
      let childY = y + (allocatedHeight - childrenTotalHeight) / 2
      const childX = x + NODE_W + COL_GAP

      node.children.forEach(child => {
        positionTree(child, childX, childY, child.height)
        childY += child.height + ROW_GAP
      })
    }

    // Lay out each tree vertically stacked (one below the other)
    let forestY = 0
    forest.forEach(tree => {
      positionTree(tree, 0, forestY, tree.height)
      forestY += tree.height + TREE_GAP
    })

    // ── 5. Place orphans in a grid to the right of the tree ──
    if (orphans.length > 0) {
      // Find the rightmost X in the tree
      let maxX = 0
      Object.values(newPositions).forEach(p => {
        if (p.x + NODE_W > maxX) maxX = p.x + NODE_W
      })

      // Center the orphan grid vertically relative to the tree
      let maxY = 0
      Object.values(newPositions).forEach(p => {
        if (p.y + NODE_H > maxY) maxY = p.y + NODE_H
      })
      const orphanGridHeight = Math.min(orphans.length, ORPHAN_ROWS) * ORPHAN_V_GAP
      const orphanStartY = Math.max(0, (maxY - orphanGridHeight) / 2)

      const orphanStartX = maxX + ORPHAN_OFFSET
      orphans.forEach((id, i) => {
        const row = i % ORPHAN_ROWS
        const col = Math.floor(i / ORPHAN_ROWS)
        newPositions[id] = {
          x: orphanStartX + col * ORPHAN_H_GAP,
          y: orphanStartY + row * ORPHAN_V_GAP
        }
      })
    }

    // ── 6. Optimistic Client Update ──
    setNodes(nds => nds.map(n => ({
      ...n,
      position: newPositions[n.id] || n.position
    })))

    // ── 7. Persist to Database ──
    toast.promise(
      Promise.all(Object.entries(newPositions).map(([id, pos]) =>
        updatePage(id, { canvas_x: Math.round(pos.x), canvas_y: Math.round(pos.y) })
      )),
      {
        loading: 'Computing tree layout...',
        success: `${pages.length} nodes organized`,
        error: 'Layout synchronization failed'
      }
    )
  }, [pages, transitions, updatePage, setNodes])

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
    stopSimulation,
    activePath,
    simulationStatus,
    simulationLogs,
    simulationStep,
    updatePage,
    autoLayout
  }
}
