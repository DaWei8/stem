'use client'

import { create } from 'zustand'
import { toast } from 'sonner'
import { Screen, ScreenAction, Variable, Transition } from '@/types'
import {
  getDocVersionsAction,
  createDocVersionAction,
  updateDocVersionAction,
  deleteDocVersionAction
} from '@/lib/actions/documentation'

export interface DocVersion {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  status: 'active' | 'archived' | 'draft'
  content: string
}

interface SystemSnapshot {
  pages: Screen[]
  actions: ScreenAction[]
  transitions: Transition[]
  variables: Variable[]
  tables: { id: string; name: string }[]
  columns: { id: string; table_id: string; name: string; type: string }[]
  userTypes: { id: string; name: string; description?: string | null }[]
  policies: { id: string; name: string; policy_type: string | null }[]
  tokens: { id: string; name: string; value: string }[]
  components: { id: string; name: string }[]
}

interface DocVersionsState {
  versions: DocVersion[]
  activeVersionId: string
  isEditing: boolean
  editedContent: string
  isLoading: boolean
  projectId: string | null
  fetchVersions: (projectId: string) => Promise<void>
  setActiveVersionId: (id: string) => void
  setIsEditing: (editing: boolean) => void
  setEditedContent: (content: string) => void
  saveContent: () => Promise<void>
  createVersion: (name: string) => Promise<void>
  deleteVersion: (id: string) => Promise<void>
  toggleStatus: (id: string) => Promise<void>
  duplicateVersion: (id: string) => Promise<void>
  generateAutoSpecs: (snapshot: SystemSnapshot, projectName?: string) => Promise<void>
  exportVersionAsMarkdown: (id: string, projectName?: string) => void
  aiRefineContent: (format: string, selectedModel?: string) => Promise<void>
}

const mapDbToVersion = (db: any): DocVersion => ({
  id: db.id,
  name: db.name,
  description: db.description || '',
  createdAt: db.created_at || db.createdAt || new Date().toISOString(),
  updatedAt: db.updated_at || db.updatedAt || new Date().toISOString(),
  status: db.status as 'active' | 'archived' | 'draft',
  content: db.content || ''
})

function buildSpecsFromSnapshot(snapshot: SystemSnapshot, projectName?: string): string {
  const now = new Date().toLocaleString()
  const name = projectName || 'Untitled System'

  const screenList = snapshot.pages.length > 0
    ? snapshot.pages.map(p => `  - ${p.title || p.name || 'Unnamed'} (${p.page_type})`).join('\n')
    : '  - No screens defined'

  const transitionList = snapshot.transitions.length > 0
    ? snapshot.transitions.map(t => {
      const from = snapshot.pages.find(p => p.id === t.from_page_id)
      const to = snapshot.pages.find(p => p.id === t.to_page_id)
      return `  - ${from?.title || 'Unknown'} → ${to?.title || 'Unknown'} (${t.trigger_type})`
    }).join('\n')
    : '  - No transitions defined'

  const tableDetails = snapshot.tables.length > 0
    ? snapshot.tables.map(t => {
      const cols = snapshot.columns.filter(c => c.table_id === t.id)
      const colList = cols.length > 0
        ? cols.map(c => `    - ${c.name} (${c.type})`).join('\n')
        : '    - No columns'
      return `  ### ${t.name}\n${colList}`
    }).join('\n\n')
    : '  No tables defined'

  const variableList = snapshot.variables.length > 0
    ? snapshot.variables.map(v => `  - **${v.label}** — \`${v.type}\` / ${v.scope}${v.description ? ` — ${v.description}` : ''}`).join('\n')
    : '  - No variables registered'

  const personaList = snapshot.userTypes.length > 0
    ? snapshot.userTypes.map(u => `  - **${u.name}**${u.description ? ` — ${u.description}` : ''}`).join('\n')
    : '  - No user types defined'

  const policyList = snapshot.policies.length > 0
    ? snapshot.policies.map(p => `  - ${p.name} (${p.policy_type || 'unset'})`).join('\n')
    : '  - No policies defined'

  const tokenList = snapshot.tokens.length > 0
    ? snapshot.tokens.map(t => `  - **${t.name}**: \`${t.value}\``).join('\n')
    : '  - No tokens defined'

  const componentList = snapshot.components.length > 0
    ? snapshot.components.map(c => `  - ${c.name}`).join('\n')
    : '  - No components defined'

  const isSparse = snapshot.tables.length === 0 && snapshot.userTypes.length === 0;

  let aiInference = '';
  if (isSparse) {
    aiInference = `
## 🧠 SYSTEM INTELLIGENCE & INFERENCES

> **Analysis**: The architecture is currently in a draft state focusing primarily on UI flows. To build this project properly tailored to your vision, the STEM engine requires additional context.

### What's Missing for a Complete Build

1. **Business & Feature Context**
   - **User Roles:** Are there distinct roles (e.g., admins, customers, vendors)?
   - **Core Features:** What are the primary transactions or activities?
   - **Key Flows:** How do users accomplish their main goals?

2. **Data Model**
   - Define database tables (e.g., Users, Products, Orders) in the Schema pillar.
   - Establish relationships and constraints.

3. **Authentication & Permissions**
   - Define access control and RLS policies in the Identity pillar.
   - Specify login methods and security requirements.

4. **API & Integrations**
   - Define external API endpoints and webhooks in the Logic pillar.
   - Specify third-party services (Payments, SMS, Maps, Logistics).

5. **User Experience & State Management**
   - Map out complete user journeys beyond basic navigation.
   - Define global variables for complex interactions in the Registry.

**Action Required:** Please populate the missing pillars (Schema, Identity, Logic) so the engine can generate a complete, deterministic build blueprint.

---
`;
  }

  return `# ${name.toUpperCase()} — SYSTEM SPECIFICATION
> Auto-generated on ${now}

---
${aiInference}
## 1. ARCHITECTURE OVERVIEW

**Screens:** ${snapshot.pages.length} | **Transitions:** ${snapshot.transitions.length} | **Variables:** ${snapshot.variables.length}

### 1.1 Screen Inventory
${screenList}

### 1.2 Navigation Flow
${transitionList}

---

## 2. DATA SCHEMA

**Tables:** ${snapshot.tables.length} | **Total Columns:** ${snapshot.columns.length}

${tableDetails}

---

## 3. STATE MANAGEMENT

**Global Variables:** ${snapshot.variables.length}

${variableList}

---

## 4. IDENTITY & ACCESS CONTROL

**User Personas:** ${snapshot.userTypes.length} | **Security Policies:** ${snapshot.policies.length}

### 4.1 Personas
${personaList}

### 4.2 Access Policies
${policyList}

---

## 5. DESIGN LANGUAGE

**Tokens:** ${snapshot.tokens.length} | **Components:** ${snapshot.components.length}

### 5.1 Design Tokens
${tokenList}

### 5.2 Component Library
${componentList}

---

## 6. BUSINESS LOGIC

**Actions:** ${snapshot.actions.length}

${snapshot.actions.length > 0 ? snapshot.actions.map(a => `  - ${a.name} (${a.action_type})`).join('\n') : '  - No actions defined'}

---

*This document is the single source of truth for the ${name} system. Keep it updated across versions.*
`
}

export const useDocVersions = create<DocVersionsState>((set, get) => ({
  versions: [],
  activeVersionId: '',
  isEditing: false,
  editedContent: '',
  isLoading: false,
  projectId: null,

  fetchVersions: async (projectId) => {
    set({ isLoading: true, projectId })
    try {
      let data = await getDocVersionsAction(projectId)

      if (data.length === 0) {
        // Create initial default versions in the database
        const mvp = await createDocVersionAction(projectId, 'MVP', 'Core deterministic flows for initial release.')
        await updateDocVersionAction(projectId, mvp.id, {
          content: '# MVP SPECIFICATION\n\nThis document outlines the core requirements for the system MVP.\n\nUse "Sync Documentation" to populate this document with your current system state.',
          status: 'archived'
        })

        await createDocVersionAction(projectId, 'v1.0', 'Full system technical engine management.')
        
        // Refetch to get populated defaults
        data = await getDocVersionsAction(projectId)
      }

      const mapped = data.map(mapDbToVersion)
      const activeId = mapped.find(v => v.status === 'active')?.id || mapped[0]?.id || ''

      set({
        versions: mapped,
        activeVersionId: activeId,
        editedContent: mapped.find(v => v.id === activeId)?.content || '',
        isEditing: false
      })
    } catch (err: any) {
      console.error('Error fetching doc versions:', err)
      toast.error(`Failed to load documentation versions: ${err.message}`)
    } finally {
      set({ isLoading: false })
    }
  },

  setActiveVersionId: (id) => {
    const version = get().versions.find(v => v.id === id)
    set({
      activeVersionId: id,
      isEditing: false,
      editedContent: version?.content || ''
    })
  },

  setIsEditing: (editing) => {
    if (editing) {
      const version = get().versions.find(v => v.id === get().activeVersionId)
      set({ isEditing: true, editedContent: version?.content || '' })
    } else {
      set({ isEditing: false })
    }
  },

  setEditedContent: (content) => set({ editedContent: content }),

  saveContent: async () => {
    const { activeVersionId, editedContent, projectId } = get()
    if (!projectId || !activeVersionId) return

    try {
      await updateDocVersionAction(projectId, activeVersionId, {
        content: editedContent
      })
      set(state => ({
        versions: state.versions.map(v =>
          v.id === activeVersionId
            ? { ...v, content: editedContent, updatedAt: new Date().toISOString() }
            : v
        ),
        isEditing: false
      }))
      toast.success('Documentation saved to cloud')
    } catch (err: any) {
      toast.error(`Save failed: ${err.message}`)
    }
  },

  createVersion: async (name) => {
    const { projectId } = get()
    if (!projectId) return

    try {
      const dbVersion = await createDocVersionAction(projectId, name)
      const newVersion = mapDbToVersion(dbVersion)
      set(state => ({
        versions: [...state.versions, newVersion],
        activeVersionId: newVersion.id,
        isEditing: false,
        editedContent: ''
      }))
      toast.success(`Version "${name}" created`)
    } catch (err: any) {
      toast.error(`Failed to create version: ${err.message}`)
    }
  },

  deleteVersion: async (id) => {
    const { versions, activeVersionId, projectId } = get()
    if (!projectId) return
    if (versions.length <= 1) {
      toast.error('Cannot delete the last version')
      return
    }

    try {
      await deleteDocVersionAction(projectId, id)
      const remaining = versions.filter(v => v.id !== id)
      const newActiveId = activeVersionId === id ? remaining[0].id : activeVersionId
      set({
        versions: remaining,
        activeVersionId: newActiveId,
        editedContent: remaining.find(v => v.id === newActiveId)?.content || ''
      })
      toast.success('Version deleted')
    } catch (err: any) {
      toast.error(`Delete failed: ${err.message}`)
    }
  },

  toggleStatus: async (id) => {
    const { versions, projectId } = get()
    if (!projectId) return
    const version = versions.find(v => v.id === id)
    if (!version) return

    const newStatus = version.status === 'active' ? 'archived' : version.status === 'archived' ? 'draft' : 'active'

    try {
      await updateDocVersionAction(projectId, id, { status: newStatus })
      set(state => ({
        versions: state.versions.map(v =>
          v.id === id
            ? { ...v, status: newStatus, updatedAt: new Date().toISOString() }
            : v
        )
      }))
      toast.success('Status updated')
    } catch (err: any) {
      toast.error(`Failed to update status: ${err.message}`)
    }
  },

  duplicateVersion: async (id) => {
    const { versions, projectId } = get()
    if (!projectId) return
    const source = versions.find(v => v.id === id)
    if (!source) return

    try {
      const dbVersion = await createDocVersionAction(projectId, `${source.name} (Copy)`, source.description)
      await updateDocVersionAction(projectId, dbVersion.id, {
        content: source.content,
        status: 'draft'
      })
      const finalDb = await getDocVersionsAction(projectId)
      const mapped = finalDb.map(mapDbToVersion)
      set({
        versions: mapped,
        activeVersionId: dbVersion.id,
        editedContent: source.content
      })
      toast.success('Version duplicated')
    } catch (err: any) {
      toast.error(`Failed to duplicate version: ${err.message}`)
    }
  },

  generateAutoSpecs: async (snapshot, projectName) => {
    const { projectId, activeVersionId } = get()
    if (!projectId || !activeVersionId) return

    const specs = buildSpecsFromSnapshot(snapshot, projectName)

    try {
      await updateDocVersionAction(projectId, activeVersionId, { content: specs })
      set(state => ({
        editedContent: specs,
        isEditing: false,
        versions: state.versions.map(v =>
          v.id === activeVersionId
            ? { ...v, content: specs, updatedAt: new Date().toISOString() }
            : v
        )
      }))
      toast.success('Full system specifications generated')
    } catch (err: any) {
      toast.error(`Generation failed: ${err.message}`)
    }
  },

  exportVersionAsMarkdown: (id, projectName) => {
    const version = get().versions.find(v => v.id === id)
    if (!version || !version.content) {
      toast.error('No content to export. Generate specs first.')
      return
    }
    const blob = new Blob([version.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const slug = projectName?.toLowerCase().replace(/\s+/g, '_') || 'system'
    a.download = `${slug}_${version.name.toLowerCase().replace(/\s+/g, '_')}_docs.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Documentation exported as Markdown')
  },

  aiRefineContent: async (format, selectedModel) => {
    const { activeVersionId, editedContent, projectId } = get()
    if (!projectId || !activeVersionId) {
      toast.error('No active version loaded')
      return
    }
    if (!editedContent) {
      toast.error('Generate or add some content first to refine.')
      return
    }

    const promise = async () => {
      const response = await fetch('/api/architect/documentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editedContent,
          format,
          selectedModel
        })
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || 'AI Refinement failed')
      }

      const data = await response.json()
      
      // Save refined content in DB
      await updateDocVersionAction(projectId, activeVersionId, {
        content: data.content
      })

      set(state => ({
        editedContent: data.content,
        versions: state.versions.map(v =>
          v.id === activeVersionId
            ? { ...v, content: data.content, updatedAt: new Date().toISOString() }
            : v
        )
      }))

      return data.content
    }

    toast.promise(promise(), {
      loading: `Refining documentation as ${format.toUpperCase()}...`,
      success: 'Refined successfully!',
      error: (err) => `Refinement failed: ${err.message}`
    })
  }
}))
