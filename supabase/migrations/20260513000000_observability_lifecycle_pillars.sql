-- ============================================================================
-- STEM EVOLUTION: OBSERVABILITY + LIFECYCLE PILLARS
-- Migration: 20260513000000
-- Purpose: Add the two missing structural pillars to complete the System OS
-- ============================================================================

-- ============================================================================
-- PILLAR 6: OBSERVABILITY (The "Nervous System")
-- ============================================================================

-- 6.1 Latency Models: Deterministic performance projections per function/action
CREATE TABLE public.latency_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,

  -- What entity does this model describe?
  entity_type TEXT NOT NULL CHECK (entity_type IN ('function', 'api_call', 'page_action', 'transition')),
  entity_id UUID NOT NULL,

  -- Latency range (in milliseconds)
  latency_min_ms INTEGER NOT NULL DEFAULT 0,
  latency_max_ms INTEGER NOT NULL DEFAULT 100,
  latency_p95_ms INTEGER, -- 95th percentile projection

  -- Conditions that affect latency
  conditions JSONB, -- e.g., {"cache_hit": {"min": 5, "max": 20}, "cold_start": {"min": 200, "max": 800}}

  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  UNIQUE(project_id, entity_type, entity_id)
);

CREATE INDEX idx_latency_models_project_id ON public.latency_models(project_id);
CREATE INDEX idx_latency_models_entity ON public.latency_models(entity_type, entity_id);

-- 6.2 Cost Projections: Map cloud costs to architectural entities
CREATE TABLE public.cost_projections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,

  -- What entity does this cost describe?
  entity_type TEXT NOT NULL CHECK (entity_type IN ('database_table', 'page_action', 'function', 'api_call', 'storage')),
  entity_id UUID NOT NULL,

  -- Cost modeling
  cost_per_invocation_usd NUMERIC(10, 6), -- e.g., 0.000012 per Lambda invocation
  cost_per_gb_month_usd NUMERIC(10, 4),   -- e.g., 0.023 per GB for S3
  estimated_monthly_invocations INTEGER,
  estimated_monthly_cost_usd NUMERIC(10, 4),

  -- Provider context
  cloud_provider TEXT CHECK (cloud_provider IN ('aws', 'gcp', 'azure', 'vercel', 'supabase', 'custom')),
  service_name TEXT, -- e.g., "Lambda", "RDS", "Edge Functions"

  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  UNIQUE(project_id, entity_type, entity_id)
);

CREATE INDEX idx_cost_projections_project_id ON public.cost_projections(project_id);

-- 6.3 Bottleneck Annotations: Mark architectural hot paths
CREATE TABLE public.bottleneck_annotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,

  -- Where is the bottleneck?
  entity_type TEXT NOT NULL CHECK (entity_type IN ('page', 'transition', 'function', 'api_call')),
  entity_id UUID NOT NULL,

  -- Severity
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),

  -- Detection
  detection_method TEXT CHECK (detection_method IN ('manual', 'simulation', 'ai_inference')),
  description TEXT NOT NULL,

  -- Resolution tracking
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES public.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_bottleneck_annotations_project_id ON public.bottleneck_annotations(project_id);
CREATE INDEX idx_bottleneck_annotations_entity ON public.bottleneck_annotations(entity_type, entity_id);

-- ============================================================================
-- PILLAR 7: LIFECYCLE (The "Time Machine")
-- ============================================================================

-- 7.1 Feature Flags: First-class architectural entities
CREATE TABLE public.feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,

  -- Flag identity
  flag_key TEXT NOT NULL, -- e.g., "v2_onboarding", "dark_mode_beta"
  label TEXT NOT NULL,    -- Human-readable name
  description TEXT,

  -- Flag state
  is_enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),

  -- Targeting
  target_user_types JSONB, -- Array of user_type IDs this flag applies to
  target_conditions JSONB, -- Complex targeting rules: {"country": "US", "subscription": "pro"}

  -- Lifecycle
  lifecycle_stage TEXT DEFAULT 'development' CHECK (lifecycle_stage IN ('development', 'staging', 'canary', 'production', 'deprecated')),
  expires_at TIMESTAMP WITH TIME ZONE,

  -- Audit
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  UNIQUE(project_id, flag_key)
);

CREATE INDEX idx_feature_flags_project_id ON public.feature_flags(project_id);
CREATE INDEX idx_feature_flags_key ON public.feature_flags(flag_key);

-- 7.2 Feature Flag ↔ Page Associations: Which screens are gated?
CREATE TABLE public.feature_flag_gates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature_flag_id UUID REFERENCES public.feature_flags(id) ON DELETE CASCADE NOT NULL,
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,

  -- Gate behavior
  gate_type TEXT DEFAULT 'visibility' CHECK (gate_type IN ('visibility', 'redirect', 'fallback')),
  fallback_page_id UUID REFERENCES public.pages(id) ON DELETE SET NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  UNIQUE(feature_flag_id, page_id)
);

-- 7.3 Schema Migration Registry: Track version-to-version data evolution
CREATE TABLE public.schema_migration_registry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,

  -- Version tracking
  from_version TEXT NOT NULL, -- e.g., "1.0.0"
  to_version TEXT NOT NULL,   -- e.g., "1.1.0"
  migration_name TEXT NOT NULL,
  description TEXT,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'reviewed', 'approved', 'applied', 'rolled_back')),

  -- Audit
  authored_by UUID REFERENCES public.users(id),
  reviewed_by UUID REFERENCES public.users(id),
  applied_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  UNIQUE(project_id, from_version, to_version)
);

CREATE INDEX idx_schema_migration_registry_project_id ON public.schema_migration_registry(project_id);

-- 7.4 Migration Transforms: Per-variable transformation rules
CREATE TABLE public.migration_transforms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  migration_id UUID REFERENCES public.schema_migration_registry(id) ON DELETE CASCADE NOT NULL,

  -- What changed?
  variable_id UUID REFERENCES public.variables(id) ON DELETE SET NULL,
  table_id UUID REFERENCES public.database_tables(id) ON DELETE SET NULL,

  -- Transform definition
  transform_type TEXT NOT NULL CHECK (transform_type IN (
    'rename', 'retype', 'add_column', 'drop_column', 'add_default',
    'split_field', 'merge_fields', 'add_index', 'add_constraint', 'custom'
  )),

  -- Before/After
  old_definition JSONB, -- { "name": "email", "type": "text" }
  new_definition JSONB, -- { "name": "email_address", "type": "varchar(255)" }

  -- For custom transforms
  transform_logic TEXT, -- SQL or pseudo-code for the transformation

  -- Rollback
  is_reversible BOOLEAN DEFAULT true,
  rollback_logic TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_migration_transforms_migration_id ON public.migration_transforms(migration_id);

-- ============================================================================
-- ENABLE RLS ON NEW TABLES
-- ============================================================================

ALTER TABLE public.latency_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bottleneck_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flag_gates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schema_migration_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migration_transforms ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Same project-membership pattern as existing tables
CREATE POLICY "Latency models visible to project members" ON public.latency_models
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Cost projections visible to project members" ON public.cost_projections
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Bottleneck annotations visible to project members" ON public.bottleneck_annotations
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Feature flags visible to project members" ON public.feature_flags
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Feature flag gates visible via flag" ON public.feature_flag_gates
  FOR ALL USING (
    feature_flag_id IN (
      SELECT id FROM public.feature_flags WHERE project_id IN (
        SELECT id FROM public.projects WHERE owner_id = auth.uid()
        UNION
        SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Schema migrations visible to project members" ON public.schema_migration_registry
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Migration transforms visible via migration" ON public.migration_transforms
  FOR ALL USING (
    migration_id IN (
      SELECT id FROM public.schema_migration_registry WHERE project_id IN (
        SELECT id FROM public.projects WHERE owner_id = auth.uid()
        UNION
        SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- TRIGGERS: Auto-update timestamps
-- ============================================================================

CREATE TRIGGER update_latency_models_updated_at BEFORE UPDATE ON public.latency_models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cost_projections_updated_at BEFORE UPDATE ON public.cost_projections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bottleneck_annotations_updated_at BEFORE UPDATE ON public.bottleneck_annotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON public.feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schema_migration_registry_updated_at BEFORE UPDATE ON public.schema_migration_registry FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- View: Accumulated latency for a flow path
CREATE OR REPLACE FUNCTION calculate_path_latency(page_ids UUID[])
RETURNS TABLE (
  total_min_ms INTEGER,
  total_max_ms INTEGER,
  total_p95_ms INTEGER,
  bottleneck_count INTEGER
) AS $$
  SELECT
    COALESCE(SUM(lm.latency_min_ms), 0)::INTEGER as total_min_ms,
    COALESCE(SUM(lm.latency_max_ms), 0)::INTEGER as total_max_ms,
    COALESCE(SUM(lm.latency_p95_ms), 0)::INTEGER as total_p95_ms,
    (SELECT COUNT(*)::INTEGER FROM public.bottleneck_annotations ba
     WHERE ba.entity_type = 'page' AND ba.entity_id = ANY($1) AND ba.is_resolved = false) as bottleneck_count
  FROM public.latency_models lm
  WHERE lm.entity_type = 'page_action'
    AND lm.entity_id IN (
      SELECT pa.id FROM public.page_actions pa WHERE pa.page_id = ANY($1)
    )
$$ LANGUAGE SQL;

-- ============================================================================
-- END OF EVOLUTION
-- ============================================================================
