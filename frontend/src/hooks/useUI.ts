import { create } from 'zustand'

export type PillarView = 'identity' | 'schema' | 'logic' | 'design' | 'flows' | 'registry' | 'export' | 'collaborators'
export type ProjectMode = 'design' | 'dev' | 'architect'

interface UIState {
  activeView: PillarView
  setActiveView: (view: PillarView) => void
  activeMode: ProjectMode
  setActiveMode: (mode: ProjectMode) => void
  sidebarVisible: boolean
  toggleSidebar: () => void
}

export const useUI = create<UIState>((set) => ({
  activeView: 'flows',
  setActiveView: (view) => set({ activeView: view }),
  activeMode: 'design',
  setActiveMode: (mode) => set({ activeMode: mode }),
  sidebarVisible: true,
  toggleSidebar: () => set((state) => ({ sidebarVisible: !state.sidebarVisible })),
}))
