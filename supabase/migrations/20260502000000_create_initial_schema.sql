-- STEM: Comprehensive Production-Grade PostgreSQL Schema
-- This schema captures the full complexity of the system design tool

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "plpgsql";

-- ============================================================================
-- 1. IDENTITY & USER MANAGEMENT
-- ============================================================================

CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  github_url TEXT,
  twitter_url TEXT,
  organization TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  max_projects INTEGER DEFAULT 5,
  max_collaborators INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 2. PROJECTS & METADATA
-- ============================================================================

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'shared', 'public')),
  
  -- Tech Stack Definition
  tech_stack JSONB DEFAULT '{}', -- {frontend: "Next.js", backend: "Go", database: "PostgreSQL", auth: "Supabase Auth"}
  
  -- Project metadata
  thumbnail_url TEXT,
  version_number INTEGER DEFAULT 1,
  last_simulation_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  CONSTRAINT unique_slug_per_owner UNIQUE(owner_id, slug)
);

CREATE INDEX idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX idx_projects_status ON public.projects(status);

-- ============================================================================
-- 3. COLLABORATION & PERMISSIONS
-- ============================================================================

CREATE TABLE public.collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer', 'comment_only')),
  
  -- Granular permissions
  can_edit_pages BOOLEAN DEFAULT true,
  can_edit_variables BOOLEAN DEFAULT true,
  can_edit_constraints BOOLEAN DEFAULT true,
  can_run_simulation BOOLEAN DEFAULT false,
  can_export BOOLEAN DEFAULT false,
  can_invite_others BOOLEAN DEFAULT false,
  
  invited_by UUID REFERENCES public.users(id),
  invited_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_collaborators_user_id ON public.collaborators(user_id);
CREATE INDEX idx_collaborators_project_id ON public.collaborators(project_id);

-- ============================================================================
-- 4. varIABLE REGISTRY (THE GLOBAL BRAIN)
-- ============================================================================

CREATE TABLE public.variables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  
  -- Immutable identifier
  registry_uuid varCHAR(36) UNIQUE NOT NULL, -- e.g., "var_001", never changes
  label TEXT NOT NULL, -- User-facing name, can be renamed
  
  -- Type system
  type TEXT NOT NULL CHECK (type IN ('string', 'number', 'boolean', 'date', 'object', 'array', 'custom')),
  custom_type_definition JSONB, -- For complex object types
  
  -- Scope (determines visibility and lifecycle)
  scope TEXT NOT NULL CHECK (scope IN ('persistent', 'transient', 'contextual')),
  
  -- Default values and constraints
  default_value JSONB,
  validation_schema JSONB, -- JSON Schema for validation
  
  -- Metadata
  description TEXT,
  is_deprecated BOOLEAN DEFAULT false,
  deprecation_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(project_id, label),
  UNIQUE(project_id, registry_uuid)
);

CREATE INDEX idx_variables_project_id ON public.variables(project_id);
CREATE INDEX idx_variables_registry_uuid ON public.variables(registry_uuid);

-- Change audit trail for variables
CREATE TABLE public.variable_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variable_id UUID REFERENCES public.variables(id) ON DELETE CASCADE NOT NULL,
  changed_by UUID REFERENCES public.users(id),
  change_type TEXT CHECK (change_type IN ('created', 'renamed', 'type_changed', 'deleted', 'deprecated')),
  old_value JSONB,
  new_value JSONB,
  change_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_variable_changes_variable_id ON public.variable_changes(variable_id);

-- ============================================================================
-- 5. IDENTITY PILLAR (User Types & Permissions)
-- ============================================================================

CREATE TABLE public.user_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL, -- e.g., "Admin", "Buyer", "Seller", "Visitor"
  description TEXT,
  icon TEXT,
  color TEXT, -- For UI visualization
  
  -- Hierarchical permission model
  base_permissions JSONB DEFAULT '{}', -- {canRead: [], canWrite: [], canDelete: []}
  is_default BOOLEAN DEFAULT false, -- Default user type for unauthenticated users
  is_admin BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(project_id, name)
);

CREATE INDEX idx_user_types_project_id ON public.user_types(project_id);

-- ============================================================================
-- 6. DATABASE SCHEMA PILLAR (ERD)
-- ============================================================================

CREATE TABLE public.database_tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL, -- Table name
  description TEXT,
  icon TEXT,
  
  -- Database-specific metadata
  db_type TEXT DEFAULT 'sql' CHECK (db_type IN ('sql', 'nosql')),
  is_junction_table BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(project_id, name)
);

CREATE INDEX idx_database_tables_project_id ON public.database_tables(project_id);

CREATE TABLE public.database_columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID REFERENCES public.database_tables(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- varchar, integer, timestamp, json, uuid, etc.
  
  -- Column constraints
  is_nullable BOOLEAN DEFAULT false,
  is_primary_key BOOLEAN DEFAULT false,
  is_unique BOOLEAN DEFAULT false,
  is_indexed BOOLEAN DEFAULT false,
  
  -- Default values and metadata
  default_value TEXT,
  description TEXT,
  
  -- Relationships
  foreign_key_table_id UUID REFERENCES public.database_tables(id),
  foreign_key_column_id UUID REFERENCES public.database_columns(id),
  
  -- Link to Variable Registry
  variable_id UUID REFERENCES public.variables(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(table_id, name)
);

CREATE INDEX idx_database_columns_table_id ON public.database_columns(table_id);
CREATE INDEX idx_database_columns_variable_id ON public.database_columns(variable_id);

-- Database relationships (foreign keys)
CREATE TABLE public.database_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  
  from_table_id UUID REFERENCES public.database_tables(id) NOT NULL,
  to_table_id UUID REFERENCES public.database_tables(id) NOT NULL,
  
  from_column_id UUID REFERENCES public.database_columns(id) NOT NULL,
  to_column_id UUID REFERENCES public.database_columns(id) NOT NULL,
  
  relationship_type TEXT CHECK (relationship_type IN ('one_to_one', 'one_to_many', 'many_to_many')),
  cascade_on_delete BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies for each table
CREATE TABLE public.rls_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  table_id UUID REFERENCES public.database_tables(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  
  policy_type TEXT CHECK (policy_type IN ('select', 'insert', 'update', 'delete')),
  user_type_id UUID REFERENCES public.user_types(id) ON DELETE CASCADE,
  
  -- Policy logic (SQL snippet)
  policy_logic TEXT NOT NULL, -- e.g., "auth.uid() = user_id"
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(table_id, name)
);

-- ============================================================================
-- 7. LOGIC LAYER PILLAR (Functions, Constants, Dependencies)
-- ============================================================================

CREATE TABLE public.constants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL,
  value JSONB NOT NULL,
  type TEXT, -- Inferred from value
  description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(project_id, name)
);

CREATE TABLE public.functions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- Function signature
  parameters JSONB NOT NULL, -- [{name: "email", type: "string"}, ...]
  return_type TEXT,
  
  -- Implementation
  implementation_language TEXT, -- JavaScript, Go, Python, etc.
  implementation_code TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(project_id, name)
);

CREATE TABLE public.dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('npm', 'pip', 'cargo', 'maven', 'nuget', 'go_module', 'api')),
  version TEXT,
  
  -- For APIs: Store OpenAPI spec
  api_spec_url TEXT,
  openapi_definition JSONB,
  
  description TEXT,
  documentation_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(project_id, name, type)
);

CREATE INDEX idx_dependencies_project_id ON public.dependencies(project_id);

-- ============================================================================
-- 8. DESIGN SYSTEM PILLAR (Components, Tokens, Variants)
-- ============================================================================

CREATE TABLE public.design_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  
  category TEXT NOT NULL CHECK (category IN ('color', 'typography', 'spacing', 'shadow', 'border-radius', 'duration', 'z-index')),
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(project_id, category, name)
);

CREATE TABLE public.components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL, -- Button, Input, Modal, Card
  category TEXT, -- Form, Layout, Feedback, Navigation
  description TEXT,
  icon TEXT,
  
  -- Component metadata
  is_atomic BOOLEAN DEFAULT true, -- Part of atomic design
  parent_component_id UUID REFERENCES public.components(id),
  
  -- Accessibility
  accessible BOOLEAN DEFAULT true,
  aria_labels JSONB,
  keyboard_shortcuts JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(project_id, name)
);

CREATE INDEX idx_components_project_id ON public.components(project_id);

-- Component variants (Button: primary, secondary, outline, ghost)
CREATE TABLE public.component_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id UUID REFERENCES public.components(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL, -- "primary", "secondary"
  description TEXT,
  
  -- Visual properties
  default_props JSONB, -- {size: "md", color: "blue"}
  style_overrides JSONB, -- CSS-in-JS
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(component_id, name)
);

-- Component props (Button can have size, variant, disabled, loading, etc.)
CREATE TABLE public.component_props (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id UUID REFERENCES public.components(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL, -- "size", "variant", "disabled"
  type TEXT NOT NULL, -- "string", "number", "boolean", "enum", "object"
  default_value JSONB,
  description TEXT,
  
  -- For enum types
  allowed_values JSONB, -- ["small", "medium", "large"]
  
  is_required BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(component_id, name)
);

-- Component inputs/outputs (what events does a component emit?)
CREATE TABLE public.component_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id UUID REFERENCES public.components(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL, -- "onClick", "onChange", "onSubmit"
  description TEXT,
  payload_schema JSONB, -- Shape of event data
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(component_id, name)
);

-- ============================================================================
-- 9. PAGES & SCREENS (Canvas nodes)
-- ============================================================================

CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  path TEXT, -- URL route (e.g., "/dashboard/:userId")
  icon TEXT,
  
  -- Canvas positioning
  canvas_x INTEGER DEFAULT 0,
  canvas_y INTEGER DEFAULT 0,
  canvas_width INTEGER DEFAULT 300,
  canvas_height INTEGER DEFAULT 200,
  
  -- Page type
  page_type TEXT DEFAULT 'screen' CHECK (page_type IN ('screen', 'modal', 'drawer', 'popover')),
  is_layout BOOLEAN DEFAULT false, -- Layout/wrapper pages
  
  -- Layout reference
  parent_layout_id UUID REFERENCES public.pages(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(project_id, path)
);

CREATE INDEX idx_pages_project_id ON public.pages(project_id);

-- Map user types to pages (visibility/access control)
CREATE TABLE public.user_type_page_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_type_id UUID REFERENCES public.user_types(id) ON DELETE CASCADE NOT NULL,
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
  
  can_view BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  
  UNIQUE(user_type_id, page_id)
);

-- Page flow relationships (transitions between pages)
CREATE TABLE public.page_flows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  
  from_page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
  to_page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
  
  trigger_type TEXT CHECK (trigger_type IN ('click', 'submit', 'auto', 'manual')),
  trigger_element TEXT, -- Which button/element triggered it
  
  -- Conditional logic
  condition_logic JSONB, -- {operator: "and", conditions: [...]}
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_page_flows_from_page ON public.page_flows(from_page_id);
CREATE INDEX idx_page_flows_to_page ON public.page_flows(to_page_id);

-- ============================================================================
-- 10. PAGE CONSTRAINTS (The Gatekeepers)
-- ============================================================================

CREATE TABLE public.constraints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
  
  -- Reference to a variable in the registry
  variable_id UUID REFERENCES public.variables(id) ON DELETE CASCADE,
  
  -- Constraint definition
  operator TEXT NOT NULL CHECK (operator IN ('eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'contains', 'exists')),
  expected_value JSONB,
  
  -- Complex logic
  logic_operator TEXT CHECK (logic_operator IN ('and', 'or')), -- For multiple constraints
  
  error_message TEXT, -- User-facing error if constraint fails
  fallback_page_id UUID REFERENCES public.pages(id) ON DELETE SET NULL, -- Where to redirect if constraint fails
  
  -- Optional: for complex constraint definitions
  custom_validation_function_id UUID REFERENCES public.functions(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_constraints_page_id ON public.constraints(page_id);
CREATE INDEX idx_constraints_variable_id ON public.constraints(variable_id);

-- Grouped constraints (AND/OR logic)
CREATE TABLE public.constraint_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
  
  operator TEXT CHECK (operator IN ('and', 'or')),
  constraints JSONB, -- Array of constraint IDs
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 11. PAGE INPUTS & OUTPUTS
-- ============================================================================

-- Page inputs (form fields, URL params, global state)
CREATE TABLE public.page_inputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL,
  input_type TEXT CHECK (input_type IN ('form_field', 'url_param', 'query_param', 'global_state', 'local_storage')),
  
  -- Link to variable registry
  variable_id UUID REFERENCES public.variables(id) ON DELETE CASCADE NOT NULL,
  
  -- UI component for this input
  ui_component_id UUID REFERENCES public.components(id) ON DELETE SET NULL,
  
  -- Input validation
  is_required BOOLEAN DEFAULT false,
  validation_schema JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(page_id, name)
);

CREATE INDEX idx_page_inputs_page_id ON public.page_inputs(page_id);
CREATE INDEX idx_page_inputs_variable_id ON public.page_inputs(variable_id);

-- Page outputs (success/error modals, redirects, state updates, side effects)
CREATE TABLE public.page_outputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL,
  output_type TEXT CHECK (output_type IN ('modal', 'toast', 'redirect', 'state_update', 'side_effect', 'webhook')),
  
  -- Output configuration
  output_config JSONB, -- {title: "Success", message: "...", redirectTo: "/next-page"}
  
  -- When to trigger this output
  trigger_condition JSONB, -- {on: "success"} or {on: "error"}
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(page_id, name)
);

CREATE INDEX idx_page_outputs_page_id ON public.page_outputs(page_id);

-- ============================================================================
-- 12. PAGE ACTIONS (Functions called on pages)
-- ============================================================================

CREATE TABLE public.page_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL,
  action_type TEXT CHECK (action_type IN ('function_call', 'api_call', 'navigation', 'state_mutation')),
  
  -- For function calls
  function_id UUID REFERENCES public.functions(id) ON DELETE CASCADE,
  
  -- For API calls
  api_endpoint TEXT,
  api_method TEXT CHECK (api_method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
  api_body JSONB,
  api_headers JSONB,
  
  -- Parameter mapping (which page inputs map to function/API inputs?)
  parameter_mapping JSONB,
  
  -- What happens after action completes
  on_success_output_id UUID REFERENCES public.page_outputs(id) ON DELETE SET NULL,
  on_error_output_id UUID REFERENCES public.page_outputs(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(page_id, name)
);

CREATE INDEX idx_page_actions_page_id ON public.page_actions(page_id);
CREATE INDEX idx_page_actions_function_id ON public.page_actions(function_id);

-- ============================================================================
-- 13. PAGE COMPONENTS (Components used on pages)
-- ============================================================================

CREATE TABLE public.page_component_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
  component_id UUID REFERENCES public.components(id) ON DELETE CASCADE NOT NULL,
  
  instance_name TEXT, -- Human-readable name
  
  -- Component instance props
  props JSONB, -- {size: "md", variant: "primary", ...}
  
  -- Position on page
  canvas_x INTEGER,
  canvas_y INTEGER,
  
  -- Data binding
  data_source_variable_id UUID REFERENCES public.variables(id) ON DELETE SET NULL,
  
  -- Event handlers
  event_handlers JSONB, -- {onClick: {action_id: "..."}, onChange: {...}}
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_page_component_instances_page_id ON public.page_component_instances(page_id);
CREATE INDEX idx_page_component_instances_component_id ON public.page_component_instances(component_id);

-- ============================================================================
-- 14. USER GOALS & JOURNEYS
-- ============================================================================

CREATE TABLE public.user_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL, -- "User Buys Product", "Reset Password"
  description TEXT,
  success_criteria TEXT,
  
  -- Goal tracking
  primary_user_type_id UUID REFERENCES public.user_types(id) ON DELETE SET NULL,
  start_page_id UUID REFERENCES public.pages(id) ON DELETE SET NULL,
  end_page_id UUID REFERENCES public.pages(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(project_id, name)
);

CREATE INDEX idx_user_goals_project_id ON public.user_goals(project_id);

-- ============================================================================
-- 15. TESTING & SIMULATION
-- ============================================================================

CREATE TABLE public.test_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_goal_id UUID REFERENCES public.user_goals(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- AAA Pattern
  arrange JSONB NOT NULL, -- Initial state: {userType: "Buyer", walletBalance: 1000}
  act JSONB NOT NULL, -- Actions: {type: "click", target: "button_checkout"}
  assert JSONB NOT NULL, -- Expected outcome: {expectedPage: "order_confirmation", expectedEvent: "email_sent"}
  
  -- Test metadata
  user_type_id UUID REFERENCES public.user_types(id) ON DELETE CASCADE,
  is_permission_test BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(project_id, name)
);

CREATE INDEX idx_test_cases_project_id ON public.test_cases(project_id);

-- Map functions/constants to pages (what uses what)
CREATE TABLE public.page_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
  
  dependency_type TEXT CHECK (dependency_type IN ('function', 'constant', 'api', 'variable')),
  dependency_id UUID, -- References function, constant, dependency, or variable
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(page_id, dependency_type, dependency_id)
);

-- Test results (from running Logic Bot)
CREATE TABLE public.test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_case_id UUID REFERENCES public.test_cases(id) ON DELETE CASCADE NOT NULL,
  
  status TEXT CHECK (status IN ('passed', 'failed', 'error')),
  
  -- For failures
  failure_reason TEXT,
  expected_value JSONB,
  actual_value JSONB,
  
  -- For errors
  error_message TEXT,
  error_stack TEXT,
  
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_test_results_test_case_id ON public.test_results(test_case_id);

-- Simulation runs (Logic Bot execution)
CREATE TABLE public.simulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_goal_id UUID REFERENCES public.user_goals(id) ON DELETE CASCADE,
  initiated_by UUID REFERENCES public.users(id),
  
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  
  -- Simulation results
  result_summary JSONB, -- {totalTests: 10, passed: 8, failed: 2, errors: 0}
  found_issues JSONB, -- [{type: "constraint_violation", page: "...", reason: "..."}]
  execution_time_ms INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_simulations_project_id ON public.simulations(project_id);

-- ============================================================================
-- 16. EXPORTS & ARTIFACTS
-- ============================================================================

CREATE TABLE public.exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES public.users(id),
  
  name TEXT NOT NULL,
  export_type TEXT CHECK (export_type IN ('stem_manifest', 'code_boilerplate', 'sql_schema', 'tests', 'diagrams', 'documentation')),
  
  -- Export metadata
  file_size_bytes INTEGER,
  file_url TEXT, -- URL to download
  
  -- What was included
  config JSONB, -- {includeTests: true, includeCode: true, ...}
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_exports_project_id ON public.exports(project_id);

-- ============================================================================
-- 17. ACTIVITY LOG & AUDIT TRAIL
-- ============================================================================

CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  
  action TEXT NOT NULL, -- "created_page", "edited_constraint", "ran_simulation", "exported"
  resource_type TEXT, -- "page", "variable", "constraint", "test"
  resource_id UUID,
  
  old_value JSONB,
  new_value JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_activity_log_project_id ON public.activity_log(project_id);
CREATE INDEX idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at);

-- ============================================================================
-- 18. NOTIFICATIONS & COLLABORATION
-- ============================================================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  notification_type TEXT CHECK (notification_type IN ('invited_to_project', 'comment', 'simulation_complete', 'export_ready')),
  
  related_project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  message TEXT,
  action_url TEXT,
  
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- Comments/threaded discussions on specific elements
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  
  author_id UUID REFERENCES public.users(id),
  
  comment_type TEXT CHECK (comment_type IN ('page', 'constraint', 'component', 'general')),
  target_id UUID, -- The page/constraint/component being commented on
  
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- For nested replies
  
  content TEXT NOT NULL,
  mentions JSONB, -- {userId: "...", userName: "..."}
  
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES public.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_comments_project_id ON public.comments(project_id);
CREATE INDEX idx_comments_author_id ON public.comments(author_id);
CREATE INDEX idx_comments_target_id ON public.comments(target_id);

-- ============================================================================
-- 19. PERFORMANCE & ANALYTICS
-- ============================================================================

CREATE TABLE public.canvas_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  
  metric_type TEXT, -- "render_time", "memory_usage", "nodes_count"
  metric_value NUMERIC,
  
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 20. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users: Can view own profile
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Projects: Complex access control
CREATE POLICY "Users can view projects they own or collaborate on" ON public.projects
  FOR SELECT USING (
    owner_id = auth.uid() OR 
    id IN (SELECT project_id FROM public.collaborators WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create projects" ON public.projects
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own or editor projects" ON public.projects
  FOR UPDATE USING (
    owner_id = auth.uid() OR 
    id IN (SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
  );

CREATE POLICY "Users can delete only their own projects" ON public.projects
  FOR DELETE USING (owner_id = auth.uid());

-- Collaborators: Access based on project membership
CREATE POLICY "Users can view collaborators for accessible projects" ON public.collaborators
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
    )
  );

-- Variables: Access based on project membership
CREATE POLICY "Variables are visible to project members" ON public.variables
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Variables can be edited by project editors" ON public.variables
  FOR UPDATE USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- Pages: Same visibility rules as variables
CREATE POLICY "Pages are visible to project members" ON public.pages
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Pages can be edited by project editors" ON public.pages
  FOR UPDATE USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- Components: View for all project members, edit for editors
CREATE POLICY "Components visible to project members" ON public.components
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
    )
  );

-- Test Cases: View for all, edit for editors
CREATE POLICY "Test cases visible to project members" ON public.test_cases
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
    )
  );

-- Simulations: Only project editors can run
CREATE POLICY "Simulations visible to project members" ON public.simulations
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
    )
  );

-- Activity Log: Access like projects
CREATE POLICY "Activity visible to project members" ON public.activity_log
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
    )
  );

-- Comments: Access to project's comments
CREATE POLICY "Comments visible in accessible projects" ON public.comments
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
    )
  );

-- Notifications: Only own notifications
CREATE POLICY "Users can only see their notifications" ON public.notifications
  FOR SELECT USING (recipient_id = auth.uid());

-- ============================================================================
-- 21. HELPFUL VIEWS & FUNCTIONS
-- ============================================================================

-- View: User's accessible projects with role info
CREATE VIEW user_projects AS
SELECT 
  p.*,
  CASE 
    WHEN p.owner_id = auth.uid() THEN 'owner'
    ELSE c.role
  END as user_role
FROM public.projects p
LEFT JOIN public.collaborators c ON p.id = c.project_id AND c.user_id = auth.uid()
WHERE p.owner_id = auth.uid() OR c.user_id = auth.uid();

-- Function: Get all variables used on a page
CREATE OR REPLACE FUNCTION get_page_variables(page_id UUID)
RETURNS TABLE (variable_id UUID, label TEXT, type TEXT) AS $$
  SELECT DISTINCT v.id, v.label, v.type
  FROM public.variables v
  WHERE v.id IN (
    SELECT DISTINCT variable_id FROM public.page_inputs WHERE page_id = $1
    UNION
    SELECT DISTINCT variable_id FROM public.constraints WHERE page_id = $1
  )
$$ LANGUAGE SQL;

-- Function: Check if simulation has issues
CREATE OR REPLACE FUNCTION check_simulation_issues(sim_id UUID)
RETURNS TABLE (issue_type TEXT, issue_count INT) AS $$
  SELECT 
    jsonb_object_keys(found_issues)::TEXT as issue_type,
    jsonb_array_length(found_issues -> jsonb_object_keys(found_issues)) as issue_count
  FROM public.simulations
  WHERE id = $1
$$ LANGUAGE SQL;

-- Function: Get all pages using a variable
CREATE OR REPLACE FUNCTION get_variable_usage(var_id UUID)
RETURNS TABLE (page_id UUID, page_title TEXT, usage_type TEXT) AS $$
  SELECT p.id, p.title, 'input'::TEXT as usage_type
  FROM public.pages p
  WHERE p.id IN (SELECT page_id FROM public.page_inputs WHERE variable_id = $1)
  UNION
  SELECT p.id, p.title, 'constraint'::TEXT
  FROM public.pages p
  WHERE p.id IN (SELECT page_id FROM public.constraints WHERE variable_id = $1)
$$ LANGUAGE SQL;

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all main tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_variables_updated_at BEFORE UPDATE ON public.variables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_components_updated_at BEFORE UPDATE ON public.components FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_test_cases_updated_at BEFORE UPDATE ON public.test_cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
