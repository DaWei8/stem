'use client'

import { create } from 'zustand'
import { toast } from 'sonner'
import {
  getSecurityAuditsAction,
  createSecurityAuditAction,
  deleteSecurityAuditAction
} from '@/lib/actions/audit'

export interface DeterministicFlaw {
  id: string
  title: string
  severity: 'critical' | 'warning' | 'optimization'
  category: 'database' | 'access' | 'data_integrity' | 'routing' | 'tauri'
  setupsAffected: string[]
  description: string
  remedy: string
}

export interface SecurityAuditReport {
  id: string
  project_id: string
  report_content: string
  flaws_count: number
  meta: any
  created_at: string
}

interface SecurityAuditState {
  audits: SecurityAuditReport[]
  activeAuditId: string
  localFlaws: DeterministicFlaw[]
  isLoading: boolean
  isGenerating: boolean
  projectId: string | null
  fetchAudits: (projectId: string) => Promise<void>
  runLocalScan: (snapshot: {
    pages: any[]
    transitions: any[]
    inputs: any[]
    actions: any[]
    outputs: any[]
    tables: any[]
    columns: any[]
    userTypes: any[]
    policies: any[]
    variables: any[]
  }) => void
  runAIAudit: (
    snapshot: any,
    selectedModel?: string
  ) => Promise<void>
  deleteAudit: (id: string) => Promise<void>
  setActiveAuditId: (id: string) => void
}

export const useSecurityAudit = create<SecurityAuditState>((set, get) => ({
  audits: [],
  activeAuditId: '',
  localFlaws: [],
  isLoading: false,
  isGenerating: false,
  projectId: null,

  fetchAudits: async (projectId) => {
    set({ isLoading: true, projectId })
    try {
      const data = await getSecurityAuditsAction(projectId)
      const formatted = (data || []).map((db: any) => ({
        id: db.id,
        project_id: db.project_id,
        report_content: db.report_content,
        flaws_count: db.flaws_count,
        meta: db.meta || {},
        created_at: db.created_at
      }))

      set({
        audits: formatted,
        activeAuditId: formatted[0]?.id || ''
      })
    } catch (err: any) {
      console.error('Error fetching security audits:', err)
      toast.error(`Failed to load security reports: ${err.message}`)
    } finally {
      set({ isLoading: false })
    }
  },

  runLocalScan: (snapshot) => {
    const flaws: DeterministicFlaw[] = []
    const { pages, transitions, inputs, actions, tables, policies, variables } = snapshot

    // 1. Critical Database Flaw - Missing RLS Policy on Schema Tables
    if (tables && tables.length > 0) {
      tables.forEach((table: any) => {
        const hasPolicy = policies && policies.some(
          (policy: any) => policy.table_id === table.id || 
                           policy.table === table.name || 
                           (policy.meta && policy.meta.table === table.name)
        )
        if (!hasPolicy) {
          flaws.push({
            id: `db-rls-missing-${table.id}`,
            title: 'Missing Row-Level Security (RLS) Policy',
            severity: 'critical',
            category: 'database',
            setupsAffected: ['Supabase Database'],
            description: `Database table "${table.name}" has no corresponding Row-Level Security policy. Under default Supabase environments, tables lacking explicit RLS rules might permit wildcard access to public/anonymous client callers, resulting in complete data leakage.`,
            remedy: `Execute SQL statement to enforce security constraints: ALTER TABLE public.${table.name} ENABLE ROW LEVEL SECURITY; and create specific user role policies.`
          })
        }
      })
    }

    // 2. Critical Access Flaw - Route containing sensitive words without check gates
    if (pages && pages.length > 0) {
      pages.forEach((page: any) => {
        const titleLower = (page.title || page.name || '').toLowerCase()
        const isSensitive = ['admin', 'dashboard', 'settings', 'billing', 'profile', 'security', 'wallet'].some(
          word => titleLower.includes(word)
        )
        if (isSensitive) {
          const hasGate = transitions && transitions.some(
            (t: any) => t.to_page_id === page.id && 
                       (t.trigger_condition || t.condition || t.trigger_type === 'authenticated' || t.trigger_type === 'role_restriction')
          )
          if (!hasGate) {
            flaws.push({
              id: `access-gate-missing-${page.id}`,
              title: 'Sensitive Route Lacks Access Gating',
              severity: 'critical',
              category: 'access',
              setupsAffected: ['Next.js Middleware', 'Web Client Router'],
              description: `The screen "${page.title || 'Screen'}" corresponds to a sensitive user view, but has no explicit entrance constraints. Unauthenticated or low-privilege roles can transit directly to this screen.`,
              remedy: `Modify the canvas flow to restrict transition paths, or configure middleware rules check: if (!user || user.role !== 'admin') redirect('/login');`
            })
          }
        }
      })
    }

    // 3. Warning Data Integrity Flaw - Unvalidated input bound to database columns
    if (inputs && inputs.length > 0) {
      inputs.forEach((input: any) => {
        const inputVar = variables && variables.find(v => v.id === input.variable_id || v.registry_uuid === input.variable_id)
        if (inputVar && inputVar.scope === 'persistent') {
          const hasValidation = input.validation_rules || input.pattern || input.type === 'email' || input.type === 'number'
          if (!hasValidation) {
            const pageName = pages.find(p => p.id === input.page_id)?.title || 'Unknown Screen'
            flaws.push({
              id: `integrity-validation-missing-${input.id}`,
              title: 'Unvalidated Form Input on Persistent Variable',
              severity: 'warning',
              category: 'data_integrity',
              setupsAffected: ['Next.js Forms', 'Supabase API Payload'],
              description: `The input field "${input.label || input.name}" on screen "${pageName}" is bound to the database variable "${inputVar.label}", but has no format validation constraints. This exposes the database column to sql injection, cross-site scripting (XSS), or malformed inputs.`,
              remedy: `Assign a rigorous format regex pattern on the input component or implement Zod validation in the form submission handler.`
            })
          }
        }
      })
    }

    // 4. Warning Routing Flaw - Orphaned Screen
    if (pages && pages.length > 0 && pages.length > 1) {
      pages.forEach((page: any) => {
        const hasIncoming = transitions && transitions.some((t: any) => t.to_page_id === page.id)
        const hasOutgoing = transitions && transitions.some((t: any) => t.from_page_id === page.id)
        if (!hasIncoming && !hasOutgoing) {
          flaws.push({
            id: `routing-orphaned-${page.id}`,
            title: 'Orphaned Navigation Node',
            severity: 'warning',
            category: 'routing',
            setupsAffected: ['Web Client Router'],
            description: `The screen "${page.title || 'Screen'}" is isolated from all user journey loops. It is unreachable via standard UI page flows.`,
            remedy: `Link incoming and outgoing transition edges in the UI Flows canvas editor.`
          })
        }
      })
    }

    // 5. Optimization Routing Flaw - Dead End Screen
    if (pages && pages.length > 0 && pages.length > 1) {
      pages.forEach((page: any) => {
        const hasIncoming = transitions && transitions.some((t: any) => t.to_page_id === page.id)
        const hasOutgoing = transitions && transitions.some((t: any) => t.from_page_id === page.id)
        const hasActions = actions && actions.some((a: any) => a.page_id === page.id)
        const hasInputs = inputs && inputs.some((i: any) => i.page_id === page.id)
        
        if (hasIncoming && !hasOutgoing && (hasActions || hasInputs)) {
          flaws.push({
            id: `routing-deadend-${page.id}`,
            title: 'Dead-End User Flow',
            severity: 'optimization',
            category: 'routing',
            setupsAffected: ['Web Client Router'],
            description: `The screen "${page.title || 'Screen'}" collects form data or triggers actions, but has no outgoing transitions. Users will be stuck on this page with no exit direction upon completion.`,
            remedy: `Add a success redirect transition or a 'Back' button action route linking to a parent view.`
          })
        }
      })
    }

    // 6. Warning Tauri Flaw - Tauri Commands Scope
    const hasTauri = typeof window !== 'undefined' && (window as any).__TAURI__ !== undefined
    if (hasTauri) {
      flaws.push({
        id: 'tauri-scope-warning',
        title: 'Tauri App Wrapper Scope Overexposure',
        severity: 'warning',
        category: 'tauri',
        setupsAffected: ['Tauri Desktop Wrapper'],
        description: `Tauri APIs are active, but custom commands do not have explicit payload isolation checks. Front-end code injection could execute arbitrary native filesystem processes if scope parameters are unsanitized.`,
        remedy: `Verify that tauri.conf.json limits shell access and restrict system parameters within the rust command handlers.`
      })
    }

    set({ localFlaws: flaws })
  },

  runAIAudit: async (snapshot, selectedModel) => {
    const { projectId, localFlaws } = get()
    if (!projectId) {
      toast.error('No project loaded to perform audit')
      return
    }

    set({ isGenerating: true })

    try {
      const response = await fetch('/api/architect/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectState: snapshot,
          selectedModel
        })
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || 'AI Audit generation failed')
      }

      const data = await response.json()
      
      // Save the generated audit in DB
      const savedReport = await createSecurityAuditAction(
        projectId,
        data.content,
        localFlaws.length,
        { model: selectedModel || 'gemini-2.5-flash', generatedAt: new Date().toISOString() }
      )

      const formattedReport: SecurityAuditReport = {
        id: savedReport.id,
        project_id: savedReport.project_id,
        report_content: savedReport.report_content,
        flaws_count: savedReport.flaws_count,
        meta: savedReport.meta || {},
        created_at: savedReport.created_at
      }

      set(state => ({
        audits: [formattedReport, ...state.audits],
        activeAuditId: formattedReport.id
      }))

      toast.success('AI Threat modeling audit generated successfully')
    } catch (err: any) {
      console.error(err)
      toast.error(`AI Audit failed: ${err.message}`)
    } finally {
      set({ isGenerating: false })
    }
  },

  deleteAudit: async (id) => {
    const { audits, activeAuditId, projectId } = get()
    if (!projectId) return

    try {
      await deleteSecurityAuditAction(projectId, id)
      const remaining = audits.filter(a => a.id !== id)
      const newActiveId = activeAuditId === id ? remaining[0]?.id || '' : activeAuditId

      set({
        audits: remaining,
        activeAuditId: newActiveId
      })
      toast.success('Audit report deleted from log')
    } catch (err: any) {
      toast.error(`Delete failed: ${err.message}`)
    }
  },

  setActiveAuditId: (id) => set({ activeAuditId: id })
}))
