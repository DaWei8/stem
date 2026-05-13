'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { FeatureFlag, FeatureFlagGate, SchemaMigration, MigrationTransform } from '@/types'
import {
  addFeatureFlagAction,
  updateFeatureFlagAction,
  deleteFeatureFlagAction,
  addFlagGateAction,
  deleteFlagGateAction,
  addSchemaMigrationAction,
  updateSchemaMigrationAction,
  deleteSchemaMigrationAction,
  addMigrationTransformAction,
  deleteMigrationTransformAction
} from '@/lib/actions/lifecycle'

interface LifecycleState {
  featureFlags: FeatureFlag[]
  flagGates: FeatureFlagGate[]
  migrations: SchemaMigration[]
  transforms: MigrationTransform[]
  isLoading: boolean

  // Fetch
  fetchLifecycleData: (projectId: string) => Promise<void>

  // Feature Flags
  addFeatureFlag: (projectId: string, payload: { flag_key: string; label: string; description?: string; lifecycle_stage?: string }) => Promise<void>
  updateFeatureFlag: (projectId: string, id: string, updates: Partial<FeatureFlag>) => Promise<void>
  deleteFeatureFlag: (projectId: string, id: string) => Promise<void>
  toggleFlag: (projectId: string, id: string) => Promise<void>

  // Flag Gates
  addFlagGate: (projectId: string, flagId: string, pageId: string, gateType: string, fallbackPageId?: string) => Promise<void>
  deleteFlagGate: (projectId: string, id: string) => Promise<void>

  // Schema Migrations
  addMigration: (projectId: string, payload: { from_version: string; to_version: string; migration_name: string; description?: string }) => Promise<void>
  updateMigration: (projectId: string, id: string, updates: Partial<SchemaMigration>) => Promise<void>
  deleteMigration: (projectId: string, id: string) => Promise<void>

  // Transforms
  addTransform: (projectId: string, migrationId: string, payload: { transform_type: string; variable_id?: string; table_id?: string; old_definition?: Record<string, unknown>; new_definition?: Record<string, unknown>; transform_logic?: string; is_reversible?: boolean }) => Promise<void>
  deleteTransform: (projectId: string, id: string) => Promise<void>

  // Derived: Architectural Mesh
  getGatedPages: () => string[]
  isPageGated: (pageId: string) => boolean
  getFlagsForPage: (pageId: string) => FeatureFlag[]
  getActiveFlags: () => FeatureFlag[]
}

const supabase = createClient()

export const useLifecycle = create<LifecycleState>((set, get) => ({
  featureFlags: [],
  flagGates: [],
  migrations: [],
  transforms: [],
  isLoading: false,

  fetchLifecycleData: async (projectId: string) => {
    set({ isLoading: true })
    try {
      const [flagRes, gateRes, migRes, transRes] = await Promise.all([
        supabase.from('feature_flags').select('*').eq('project_id', projectId),
        supabase.from('feature_flag_gates').select('*'),
        supabase.from('schema_migration_registry').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
        supabase.from('migration_transforms').select('*')
      ])

      if (flagRes.error) throw flagRes.error
      if (gateRes.error) throw gateRes.error
      if (migRes.error) throw migRes.error
      if (transRes.error) throw transRes.error

      // Filter gates to only those belonging to this project's flags
      const flagIds = new Set((flagRes.data || []).map(f => f.id))
      const migIds = new Set((migRes.data || []).map(m => m.id))

      set({
        featureFlags: flagRes.data || [],
        flagGates: (gateRes.data || []).filter(g => flagIds.has(g.feature_flag_id)),
        migrations: migRes.data || [],
        transforms: (transRes.data || []).filter(t => migIds.has(t.migration_id))
      })
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Lifecycle fetch failed: ${msg}`)
    } finally {
      set({ isLoading: false })
    }
  },

  // ── Feature Flags ──

  addFeatureFlag: async (projectId, payload) => {
    try {
      const data = await addFeatureFlagAction(projectId, payload)
      set((state) => ({ featureFlags: [...state.featureFlags, data] }))
      toast.success('Feature flag created')
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to create flag: ${msg}`)
    }
  },

  updateFeatureFlag: async (projectId, id, updates) => {
    try {
      const data = await updateFeatureFlagAction(projectId, id, updates as Record<string, unknown>)
      set((state) => ({
        featureFlags: state.featureFlags.map(f => f.id === id ? data : f)
      }))
      toast.success('Feature flag updated')
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Update failed: ${msg}`)
    }
  },

  deleteFeatureFlag: async (projectId, id) => {
    try {
      await deleteFeatureFlagAction(projectId, id)
      set((state) => ({
        featureFlags: state.featureFlags.filter(f => f.id !== id),
        flagGates: state.flagGates.filter(g => g.feature_flag_id !== id)
      }))
      toast.success('Feature flag deleted')
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Delete failed: ${msg}`)
    }
  },

  toggleFlag: async (projectId, id) => {
    const flag = get().featureFlags.find(f => f.id === id)
    if (!flag) return

    const newState = !flag.is_enabled

    // Optimistic update
    set((state) => ({
      featureFlags: state.featureFlags.map(f =>
        f.id === id ? { ...f, is_enabled: newState } : f
      )
    }))

    try {
      await updateFeatureFlagAction(projectId, id, { is_enabled: newState })
      toast.success(newState ? 'Flag enabled' : 'Flag disabled')
    } catch (error: unknown) {
      // Rollback
      set((state) => ({
        featureFlags: state.featureFlags.map(f =>
          f.id === id ? { ...f, is_enabled: !newState } : f
        )
      }))
      const msg = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Toggle failed: ${msg}`)
    }
  },

  // ── Flag Gates ──

  addFlagGate: async (projectId, flagId, pageId, gateType, fallbackPageId) => {
    try {
      const data = await addFlagGateAction(projectId, flagId, pageId, gateType, fallbackPageId)
      set((state) => ({ flagGates: [...state.flagGates, data] }))
      toast.success('Page gated by feature flag')
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to gate page: ${msg}`)
    }
  },

  deleteFlagGate: async (projectId, id) => {
    try {
      await deleteFlagGateAction(projectId, id)
      set((state) => ({ flagGates: state.flagGates.filter(g => g.id !== id) }))
      toast.success('Gate removed')
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Delete failed: ${msg}`)
    }
  },

  // ── Schema Migrations ──

  addMigration: async (projectId, payload) => {
    try {
      const data = await addSchemaMigrationAction(projectId, payload)
      set((state) => ({ migrations: [data, ...state.migrations] }))
      toast.success('Migration blueprint created')
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to create migration: ${msg}`)
    }
  },

  updateMigration: async (projectId, id, updates) => {
    try {
      const data = await updateSchemaMigrationAction(projectId, id, updates as Record<string, unknown>)
      set((state) => ({
        migrations: state.migrations.map(m => m.id === id ? data : m)
      }))
      toast.success('Migration updated')
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Update failed: ${msg}`)
    }
  },

  deleteMigration: async (projectId, id) => {
    try {
      await deleteSchemaMigrationAction(projectId, id)
      set((state) => ({
        migrations: state.migrations.filter(m => m.id !== id),
        transforms: state.transforms.filter(t => t.migration_id !== id)
      }))
      toast.success('Migration blueprint deleted')
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Delete failed: ${msg}`)
    }
  },

  // ── Transforms ──

  addTransform: async (projectId, migrationId, payload) => {
    try {
      const data = await addMigrationTransformAction(projectId, migrationId, payload)
      set((state) => ({ transforms: [...state.transforms, data] }))
      toast.success('Transform rule added')
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to add transform: ${msg}`)
    }
  },

  deleteTransform: async (projectId, id) => {
    try {
      await deleteMigrationTransformAction(projectId, id)
      set((state) => ({ transforms: state.transforms.filter(t => t.id !== id) }))
      toast.success('Transform rule removed')
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Delete failed: ${msg}`)
    }
  },

  // ── Derived Computations (Architectural Mesh) ──

  getGatedPages: () => {
    const { flagGates, featureFlags } = get()
    const disabledFlagIds = new Set(featureFlags.filter(f => !f.is_enabled).map(f => f.id))
    return flagGates
      .filter(g => disabledFlagIds.has(g.feature_flag_id))
      .map(g => g.page_id)
  },

  isPageGated: (pageId) => {
    return get().getGatedPages().includes(pageId)
  },

  getFlagsForPage: (pageId) => {
    const { flagGates, featureFlags } = get()
    const flagIds = flagGates.filter(g => g.page_id === pageId).map(g => g.feature_flag_id)
    return featureFlags.filter(f => flagIds.includes(f.id))
  },

  getActiveFlags: () => {
    return get().featureFlags.filter(f => f.is_enabled)
  }
}))
