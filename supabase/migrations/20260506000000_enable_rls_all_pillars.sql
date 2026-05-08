-- STEM: Enable RLS and add policies for missing Identity, Logic, and Database pillars
-- This migration ensures that all tables have Row Level Security enabled and proper policies for project members.

-- 1. Identity & Permissions
ALTER TABLE public.user_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_type_page_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User types are visible to project members" ON public.user_types
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "User types can be managed by project editors" ON public.user_types
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  ) WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Page access rules are visible to project members" ON public.user_type_page_access
  FOR SELECT USING (
    user_type_id IN (SELECT id FROM public.user_types WHERE project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
    ))
  );

-- 2. Logic Layer
ALTER TABLE public.constants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dependencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Constants are visible to project members" ON public.constants
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Constants can be managed by project editors" ON public.constants
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  ) WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Functions are visible to project members" ON public.functions
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Functions can be managed by project editors" ON public.functions
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  ) WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Dependencies are visible to project members" ON public.dependencies
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Dependencies can be managed by project editors" ON public.dependencies
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  ) WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- 3. Database Schema
ALTER TABLE public.database_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.database_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.database_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rls_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Database tables are visible to project members" ON public.database_tables
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Database tables can be managed by project editors" ON public.database_tables
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  ) WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Database columns are visible to project members" ON public.database_columns
  FOR SELECT USING (
    table_id IN (SELECT id FROM public.database_tables WHERE project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "Database columns can be managed by project editors" ON public.database_columns
  FOR ALL USING (
    table_id IN (SELECT id FROM public.database_tables WHERE project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    ))
  ) WITH CHECK (
    table_id IN (SELECT id FROM public.database_tables WHERE project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    ))
  );

CREATE POLICY "Database relationships are visible to project members" ON public.database_relationships
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Database relationships can be managed by project editors" ON public.database_relationships
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  ) WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "RLS policies are visible to project members" ON public.rls_policies
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "RLS policies can be managed by project editors" ON public.rls_policies
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  ) WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- 4. Components & Design System Extras
ALTER TABLE public.component_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.component_props ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.component_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Component data is visible to project members" ON public.component_variants
  FOR SELECT USING (
    component_id IN (SELECT id FROM public.components WHERE project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "Component data can be managed by project editors" ON public.component_variants
  FOR ALL USING (
    component_id IN (SELECT id FROM public.components WHERE project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    ))
  ) WITH CHECK (
    component_id IN (SELECT id FROM public.components WHERE project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    ))
  );

CREATE POLICY "Component props are visible to project members" ON public.component_props
  FOR SELECT USING (
    component_id IN (SELECT id FROM public.components WHERE project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "Component props can be managed by project editors" ON public.component_props
  FOR ALL USING (
    component_id IN (SELECT id FROM public.components WHERE project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    ))
  ) WITH CHECK (
    component_id IN (SELECT id FROM public.components WHERE project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    ))
  );

CREATE POLICY "Component events are visible to project members" ON public.component_events
  FOR SELECT USING (
    component_id IN (SELECT id FROM public.components WHERE project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "Component events can be managed by project editors" ON public.component_events
  FOR ALL USING (
    component_id IN (SELECT id FROM public.components WHERE project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    ))
  ) WITH CHECK (
    component_id IN (SELECT id FROM public.components WHERE project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    ))
  );

-- 5. Page Instances & Constraints
ALTER TABLE public.page_component_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.constraint_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Page components are visible to project members" ON public.page_component_instances
  FOR SELECT USING (
    page_id IN (SELECT id FROM public.pages WHERE project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "Page components can be managed by project editors" ON public.page_component_instances
  FOR ALL USING (
    page_id IN (SELECT id FROM public.pages WHERE project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    ))
  ) WITH CHECK (
    page_id IN (SELECT id FROM public.pages WHERE project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    ))
  );

CREATE POLICY "Constraint groups are visible to project members" ON public.constraint_groups
  FOR SELECT USING (
    page_id IN (SELECT id FROM public.pages WHERE project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "Constraint groups can be managed by project editors" ON public.constraint_groups
  FOR ALL USING (
    page_id IN (SELECT id FROM public.pages WHERE project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    ))
  ) WITH CHECK (
    page_id IN (SELECT id FROM public.pages WHERE project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    ))
  );

-- 6. Audit & Metrics
ALTER TABLE public.canvas_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Canvas metrics are visible to project members" ON public.canvas_metrics
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
    )
  );
