export type VariableScope = 'persistent' | 'transient' | 'contextual'
export type VariableType = 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array' | 'custom'

export interface Variable {
  id: string
  registry_uuid: string
  label: string
  type: VariableType
  scope: VariableScope
  description?: string | null
  default_value?: any
  validation_schema?: any
}

export interface Project {
  id: string
  name: string
  description?: string | null
  owner_id: string
  system_type?: 'SYSTEM_blueprint' | 'SYSTEM_engine' | string
  status?: string
  created_at: string
  updated_at: string
  collaborators?: {
    id: string
    project_id: string
    user_id: string
    role: string
    can_edit_pages?: boolean
    can_edit_variables?: boolean
    can_edit_constraints?: boolean
    can_run_simulation?: boolean
    can_export?: boolean
    can_invite_others?: boolean
    user?: {
      id: string
      email: string
      full_name: string | null
      avatar_url: string | null
    } | null
  }[]
}

export interface DatabaseTable {
  id: string
  project_id: string
  name: string
  description?: string | null
}

export interface DatabaseColumn {
  id: string
  table_id: string
  variable_id: string // Links to Variable Registry
  name: string
  is_primary_key: boolean
  is_nullable: boolean
  is_unique: boolean
  default_value?: string
}

export interface DatabaseRelationship {
  id: string
  source_table_id: string
  source_column_id: string
  target_table_id: string
  target_column_id: string
  cardinality: '1:1' | '1:N' | 'N:1' | 'N:N'
}

export interface Constant {
  id: string
  project_id: string
  name: string
  value: string
  type: 'string' | 'number' | 'boolean' | 'json'
}

export interface LogicFunction {
  id: string
  project_id: string
  name: string
  parameters: { name: string; type: string }[]
  return_type: string
  description?: string | null
}

export interface Dependency {
  id: string
  project_id: string
  name: string
  version: string
  type: 'npm' | 'api' | 'service'
}

export interface UserType {
  id: string
  project_id: string
  name: string // Buyer, Seller, Admin, etc.
  description?: string | null
  icon?: string | null
  color?: string | null
  base_permissions?: any
  is_default?: boolean
  is_admin?: boolean
  persona?: any
  created_at?: string
  updated_at?: string
}

export interface RLSPolicy {
  id: string
  table_id: string
  name: string
  user_type_id: string | null
  policy_type: 'select' | 'insert' | 'update' | 'delete' | null
  policy_logic: string
  project_id: string
}

export interface Screen {
  id: string
  project_id: string
  title: string
  name?: string // Compatibility
  description?: string | null
  path?: string
  page_type: 'screen' | 'modal' | 'drawer' | 'popover'
  canvas_x?: number
  canvas_y?: number
  canvas_width?: number
  canvas_height?: number
  constraints?: any[]
  functions?: any[]
  variables?: any[]
  context?: any
  folder?: string
  group_id?: string | null
  is_collapsed?: boolean
  allowed_roles?: string[]
  live_url?: string | null
}

export interface PageConstraint {
  id: string
  page_id: string
  variable_id?: string | null
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'exists'
  expected_value?: any
  logic_operator?: 'and' | 'or' | null
  error_message?: string | null
  fallback_page_id?: string | null
  custom_validation_function_id?: string | null
  created_at?: string
  updated_at?: string
}

export interface ScreenInput {
  id: string
  page_id: string
  name: string
  input_type: string
  variable_id?: string | null
  label?: string | null
  is_required?: boolean
}

export interface ScreenAction {
  id: string
  page_id: string
  name: string
  action_type: string
  function_id?: string | null
}

export interface ScreenOutput {
  id: string
  page_id: string
  name: string
  output_type: string
  variable_id?: string | null
  output_config?: any
}


export interface Transition {
  id: string
  project_id: string
  from_page_id: string
  to_page_id: string
  trigger_type: string
  is_failure_path?: boolean
  trigger_metadata?: any
}


// ============================================================================
// PILLAR 6: OBSERVABILITY (The "Nervous System")
// ============================================================================

export type ObservabilityEntityType = 'function' | 'api_call' | 'page_action' | 'transition'
export type CostEntityType = 'database_table' | 'page_action' | 'function' | 'api_call' | 'storage'
export type BottleneckSeverity = 'low' | 'medium' | 'high' | 'critical'
export type BottleneckDetection = 'manual' | 'simulation' | 'ai_inference'
export type CloudProvider = 'aws' | 'gcp' | 'azure' | 'vercel' | 'supabase' | 'custom'

export interface LatencyModel {
  id: string
  project_id: string
  entity_type: ObservabilityEntityType
  entity_id: string
  latency_min_ms: number
  latency_max_ms: number
  latency_p95_ms?: number
  conditions?: Record<string, { min: number; max: number }>
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface CostProjection {
  id: string
  project_id: string
  entity_type: CostEntityType
  entity_id: string
  cost_per_invocation_usd?: number
  cost_per_gb_month_usd?: number
  estimated_monthly_invocations?: number
  estimated_monthly_cost_usd?: number
  cloud_provider?: CloudProvider
  service_name?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface BottleneckAnnotation {
  id: string
  project_id: string
  entity_type: 'page' | 'transition' | 'function' | 'api_call'
  entity_id: string
  severity: BottleneckSeverity
  detection_method?: BottleneckDetection
  description: string
  is_resolved: boolean
  resolved_by?: string
  resolved_at?: string
  resolution_notes?: string
  created_at?: string
  updated_at?: string
}

// ============================================================================
// PILLAR 7: LIFECYCLE (The "Time Machine")
// ============================================================================

export type LifecycleStage = 'development' | 'staging' | 'canary' | 'production' | 'deprecated'
export type GateType = 'visibility' | 'redirect' | 'fallback'
export type MigrationStatus = 'draft' | 'reviewed' | 'approved' | 'applied' | 'rolled_back'
export type TransformType = 'rename' | 'retype' | 'add_column' | 'drop_column' | 'add_default' | 'split_field' | 'merge_fields' | 'add_index' | 'add_constraint' | 'custom'

export interface FeatureFlag {
  id: string
  project_id: string
  flag_key: string
  label: string
  description?: string
  is_enabled: boolean
  rollout_percentage: number
  target_user_types?: string[]
  target_conditions?: Record<string, unknown>
  lifecycle_stage: LifecycleStage
  expires_at?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface FeatureFlagGate {
  id: string
  feature_flag_id: string
  page_id: string
  gate_type: GateType
  fallback_page_id?: string
  created_at?: string
}

export interface SchemaMigration {
  id: string
  project_id: string
  from_version: string
  to_version: string
  migration_name: string
  description?: string
  status: MigrationStatus
  authored_by?: string
  reviewed_by?: string
  applied_at?: string
  created_at?: string
  updated_at?: string
}

export interface MigrationTransform {
  id: string
  migration_id: string
  variable_id?: string
  table_id?: string
  transform_type: TransformType
  old_definition?: Record<string, unknown>
  new_definition?: Record<string, unknown>
  transform_logic?: string
  is_reversible: boolean
  rollback_logic?: string
  created_at?: string
}

// ============================================================================
// PROJECT STATE (Unified Cross-Pillar Model)
// ============================================================================

export interface ProjectState {
  project: Project | null
  architecture: {
    pages: Screen[]
    transitions: Transition[]
    inputs: ScreenInput[]
    actions: ScreenAction[]
    outputs: ScreenOutput[]
    constraints?: PageConstraint[]
  }
  schema: {
    tables: any[]
    columns: any[]
  }
  identity: {
    userTypes: UserType[]
    policies: RLSPolicy[]
  }
  logic: {
    variables: Variable[]
  }
  designSystem: {
    tokens: any[]
    components: any[]
  }
  observability?: {
    latencyModels: LatencyModel[]
    costProjections: CostProjection[]
    bottlenecks: BottleneckAnnotation[]
  }
  lifecycle?: {
    featureFlags: FeatureFlag[]
    flagGates: FeatureFlagGate[]
    migrations: SchemaMigration[]
    transforms: MigrationTransform[]
  }
  meta?: any
}
