'use client'

import { create } from 'zustand'
import { toast } from 'sonner'
import { Screen, ScreenAction, Variable, Transition } from '@/types'

export interface TechRequirement {
  id: string
  category: string
  title: string
  desc: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
}

export interface CostItem {
  id: string
  service: string
  metric: string
  unitCost: number
  volume: number
}

export interface DocMetadata {
  requirements: TechRequirement[]
  costs: CostItem[]
}

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
  setActiveVersionId: (id: string) => void
  setIsEditing: (editing: boolean) => void
  setEditedContent: (content: string) => void
  saveContent: () => void
  createVersion: (name: string) => void
  deleteVersion: (id: string) => void
  toggleStatus: (id: string) => void
  duplicateVersion: (id: string) => void
  generateAutoSpecs: (snapshot: SystemSnapshot, projectName?: string) => void
  exportVersionAsMarkdown: (id: string, projectName?: string) => void
}

export function parseMetadata(content: string): DocMetadata {
  const match = content.match(/<!-- STEM_METADATA_START([\s\S]*?)STEM_METADATA_END -->/)
  if (match) {
    try {
      return JSON.parse(match[1].trim())
    } catch {
      // Ignored
    }
  }
  return { requirements: [], costs: [] }
}

export function serializeMetadata(content: string, metadata: DocMetadata): string {
  const stripped = content.replace(/<!-- STEM_METADATA_START[\s\S]*?STEM_METADATA_END -->/g, '').trim()
  return `${stripped}\n\n<!-- STEM_METADATA_START\n${JSON.stringify(metadata, null, 2)}\nSTEM_METADATA_END -->`
}

const DEFAULT_VERSIONS: DocVersion[] = [
  {
    id: 'v-mvp',
    name: 'MVP',
    description: 'Core deterministic flows for initial release.',
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-05-01T10:00:00Z',
    status: 'archived',
    content: '# MVP SPECIFICATION\n\nThis document outlines the core requirements for the system MVP.\n\nUse "Auto-Generate Specs" to populate this document with your current system state.'
  },
  {
    id: 'v-1.0',
    name: 'v1.0',
    description: 'Full system technical engine management.',
    createdAt: '2026-05-10T09:00:00Z',
    updatedAt: '2026-05-10T09:00:00Z',
    status: 'active',
    content: ''
  }
]

function buildSpecsFromSnapshot(snapshot: SystemSnapshot, projectName?: string, metadata?: DocMetadata): string {
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

  const hasReqs = metadata && metadata.requirements && metadata.requirements.length > 0
  const reqMarkdown = hasReqs
    ? `| Category | Technical Requirement | Priority |\n| :--- | :--- | :---: |\n` +
      metadata!.requirements.map(r => `| **${r.category.toUpperCase()}** | **${r.title}**: ${r.desc} | \`${r.priority}\` |`).join('\n')
    : '*No custom technical requirements defined.*'

  const hasCosts = metadata && metadata.costs && metadata.costs.length > 0
  const totalCost = hasCosts ? metadata!.costs.reduce((sum, c) => sum + (c.unitCost * c.volume), 0) : 0
  const costMarkdown = hasCosts
    ? `| Service | Metric | Unit Cost | Projected Volume | Estimated Monthly Cost |\n| :--- | :--- | :---: | :---: | :---: |\n` +
      metadata!.costs.map(c => `| **${c.service}** | ${c.metric} | $${c.unitCost.toFixed(2)} | ${c.volume} | $${(c.unitCost * c.volume).toFixed(2)} |`).join('\n') +
      `\n\n**Total Estimated Monthly Budget:** $${totalCost.toFixed(2)}`
    : '*No custom cost implications defined.*'

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

## 2. TECHNICAL REQUIREMENTS
${reqMarkdown}

---

## 3. COST IMPLICATIONS & PROJECTIONS
${costMarkdown}

---

## 4. DATA SCHEMA

**Tables:** ${snapshot.tables.length} | **Total Columns:** ${snapshot.columns.length}

${tableDetails}

---

## 5. STATE MANAGEMENT

**Global Variables:** ${snapshot.variables.length}

${variableList}

---

## 6. IDENTITY & ACCESS CONTROL

**User Personas:** ${snapshot.userTypes.length} | **Security Policies:** ${snapshot.policies.length}

### 6.1 Personas
${personaList}

### 6.2 Access Policies
${policyList}

---

## 7. DESIGN LANGUAGE

**Tokens:** ${snapshot.tokens.length} | **Components:** ${snapshot.components.length}

### 7.1 Design Tokens
${tokenList}

### 7.2 Component Library
${componentList}

---

## 8. BUSINESS LOGIC

**Actions:** ${snapshot.actions.length}

${snapshot.actions.length > 0 ? snapshot.actions.map(a => `  - ${a.name} (${a.action_type})`).join('\n') : '  - No actions defined'}

---

*This document is the single source of truth for the ${name} system. Keep it updated across versions.*
`
}

export const useDocVersions = create<DocVersionsState>((set, get) => ({
  versions: DEFAULT_VERSIONS,
  activeVersionId: 'v-1.0',
  isEditing: false,
  editedContent: '',

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

  saveContent: () => {
    const { activeVersionId, editedContent } = get()
    set(state => ({
      versions: state.versions.map(v =>
        v.id === activeVersionId
          ? { ...v, content: editedContent, updatedAt: new Date().toISOString() }
          : v
      ),
      isEditing: false
    }))
    toast.success('Documentation saved')
  },

  createVersion: (name) => {
    const id = `v-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`
    const newVersion: DocVersion = {
      id,
      name,
      description: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      content: ''
    }
    set(state => ({
      versions: [...state.versions, newVersion],
      activeVersionId: id,
      isEditing: false,
      editedContent: ''
    }))
    toast.success(`Version "${name}" created`)
  },

  deleteVersion: (id) => {
    const { versions, activeVersionId } = get()
    if (versions.length <= 1) {
      toast.error('Cannot delete the last version')
      return
    }
    const remaining = versions.filter(v => v.id !== id)
    const newActiveId = activeVersionId === id ? remaining[0].id : activeVersionId
    set({
      versions: remaining,
      activeVersionId: newActiveId,
      editedContent: remaining.find(v => v.id === newActiveId)?.content || ''
    })
    toast.success('Version deleted')
  },

  toggleStatus: (id) => {
    set(state => ({
      versions: state.versions.map(v =>
        v.id === id
          ? { ...v, status: v.status === 'active' ? 'archived' : v.status === 'archived' ? 'draft' : 'active' }
          : v
      )
    }))
    toast.success('Status updated')
  },

  duplicateVersion: (id) => {
    const source = get().versions.find(v => v.id === id)
    if (!source) return
    const newId = `${source.id}-copy-${Date.now().toString(36)}`
    const duplicate: DocVersion = {
      ...source,
      id: newId,
      name: `${source.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft'
    }
    set(state => ({
      versions: [...state.versions, duplicate],
      activeVersionId: newId,
      editedContent: duplicate.content
    }))
    toast.success('Version duplicated')
  },

  generateAutoSpecs: (snapshot, projectName) => {
    const current = get().versions.find(v => v.id === get().activeVersionId)
    const currentContent = current?.content || ''
    const currentMeta = parseMetadata(currentContent)

    const specs = buildSpecsFromSnapshot(snapshot, projectName, currentMeta)
    const newContent = serializeMetadata(specs, currentMeta)

    set(state => ({
      editedContent: newContent,
      isEditing: false,
      versions: state.versions.map(v =>
        v.id === state.activeVersionId
          ? { ...v, content: newContent, updatedAt: new Date().toISOString() }
          : v
      )
    }))
    toast.success('Full system specifications generated')
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
  }
}))
