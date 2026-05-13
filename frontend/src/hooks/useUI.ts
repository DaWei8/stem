import { create } from 'zustand'
import { ProjectState } from '@/types'

export type PillarView = 'identity' | 'dataengine' | 'logic' | 'design' | 'flows' | 'export' | 'collaborators' | 'documentation' | 'observability' | 'lifecycle'
export type ProjectMode = 'design' | 'dev' | 'architect'
export type CanvasFilterType = 'none' | 'inputs' | 'outputs' | 'triggers' | 'variables' | 'screens'

interface UIState {
  activeView: PillarView
  setActiveView: (view: PillarView) => void
  activeMode: ProjectMode
  setActiveMode: (mode: ProjectMode) => void
  sidebarVisible: boolean
  toggleSidebar: () => void
  canvasFilter: CanvasFilterType
  setCanvasFilter: (filter: CanvasFilterType) => void
  tracedItemId: string | null
  setTracedItemId: (id: string | null) => void
  isChaosMode: boolean
  toggleChaosMode: () => void
  snapshot: ProjectState | null
  setSnapshot: (snapshot: ProjectState | null) => void
  activeVariableId: string | null
  setActiveVariableId: (id: string | null) => void
  viewAsUserTypeId: string | null
  setViewAsUserTypeId: (id: string | null) => void
}


export const useUI = create<UIState>((set) => ({
  activeView: 'flows',
  setActiveView: (view) => set({ activeView: view }),
  activeMode: 'architect',
  setActiveMode: (mode) => set({ activeMode: mode }),
  sidebarVisible: true,
  toggleSidebar: () => set((state) => ({ sidebarVisible: !state.sidebarVisible })),
  canvasFilter: 'none',
  setCanvasFilter: (filter) => set({ canvasFilter: filter }),
  tracedItemId: null,
  setTracedItemId: (id) => set({ tracedItemId: id }),
  isChaosMode: false,
  toggleChaosMode: () => set((state) => ({ isChaosMode: !state.isChaosMode })),
  snapshot: null,
  setSnapshot: (snapshot) => set({ snapshot }),
  activeVariableId: null,
  setActiveVariableId: (id) => set({ activeVariableId: id }),
  viewAsUserTypeId: null,
  setViewAsUserTypeId: (id) => set({ viewAsUserTypeId: id }),
}))






