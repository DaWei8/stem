export type VariableScope = 'persistent' | 'transient' | 'contextual'
export type VariableType = 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array' | 'custom'

export interface Variable {
  id: string
  registry_uuid: string
  label: string
  type: VariableType
  scope: VariableScope
  description?: string
  default_value?: any
  validation_schema?: any
}

export interface Project {
  id: string
  name: string
  description?: string
  owner_id: string
  status?: string
  created_at: string
  updated_at: string
}

export interface DatabaseTable {
  id: string
  project_id: string
  name: string
  description?: string
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
  description?: string
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
  description?: string
}

export interface RLSPolicy {
  id: string
  table_id: string
  name: string
  user_type_id: string
  action: 'select' | 'insert' | 'update' | 'delete'
  using_expression: string
  check_expression?: string
}

export interface Screen {
  id: string
  project_id: string
  title: string
  name?: string // Compatibility
  description?: string
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
}

export interface ScreenInput {
  id: string
  page_id: string
  name: string
  input_type: string
  variable_id: string
  label?: string
}

export interface ScreenAction {
  id: string
  page_id: string
  name: string
  action_type: string
  function_id?: string
}

export interface ScreenOutput {
  id: string
  page_id: string
  name: string
  output_type: string
}

export interface Transition {
  id: string
  project_id: string
  from_page_id: string
  to_page_id: string
  trigger_type: string
}

