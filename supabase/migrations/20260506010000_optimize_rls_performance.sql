-- STEM: Performance Optimization & Socket Crash Fix
-- Addresses UND_ERR_SOCKET by reducing RLS evaluation overhead and context switching.

-- 1. Create the STABLE permission check function
-- Tells Postgres the result is constant within a scan, allowing result caching.
CREATE OR REPLACE FUNCTION public.get_project_role(p_id UUID)
RETURNS TEXT AS $$
DECLARE
    u_id UUID := auth.uid();
    v_role TEXT;
BEGIN
    -- Fast null guard for unauthenticated requests
    IF u_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Check ownership (indexed primary lookup)
    SELECT 'owner' INTO v_role
    FROM public.projects
    WHERE id = p_id AND owner_id = u_id;

    IF v_role IS NOT NULL THEN
        RETURN v_role;
    END IF;

    -- Check collaborator status
    SELECT role INTO v_role
    FROM public.collaborators
    WHERE project_id = p_id AND user_id = u_id;

    RETURN v_role;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2. Denormalize project_id for direct RLS evaluation
-- This eliminates nested loop joins through the 'pages' table.

-- Page Inputs
ALTER TABLE public.page_inputs ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
UPDATE public.page_inputs pi SET project_id = p.project_id FROM public.pages p WHERE pi.page_id = p.id;
ALTER TABLE public.page_inputs ALTER COLUMN project_id SET NOT NULL;
CREATE INDEX idx_page_inputs_project_id ON public.page_inputs(project_id);

-- Page Actions
ALTER TABLE public.page_actions ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
UPDATE public.page_actions pa SET project_id = p.project_id FROM public.pages p WHERE pa.page_id = p.id;
ALTER TABLE public.page_actions ALTER COLUMN project_id SET NOT NULL;
CREATE INDEX idx_page_actions_project_id ON public.page_actions(project_id);

-- Page Outputs
ALTER TABLE public.page_outputs ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
UPDATE public.page_outputs po SET project_id = p.project_id FROM public.pages p WHERE po.page_id = p.id;
ALTER TABLE public.page_outputs ALTER COLUMN project_id SET NOT NULL;
CREATE INDEX idx_page_outputs_project_id ON public.page_outputs(project_id);

-- Constraints
ALTER TABLE public.constraints ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
UPDATE public.constraints c SET project_id = p.project_id FROM public.pages p WHERE c.page_id = p.id;
ALTER TABLE public.constraints ALTER COLUMN project_id SET NOT NULL;
CREATE INDEX idx_constraints_project_id ON public.constraints(project_id);

-- Page Component Instances
ALTER TABLE public.page_component_instances ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
UPDATE public.page_component_instances pci SET project_id = p.project_id FROM public.pages p WHERE pci.page_id = p.id;
ALTER TABLE public.page_component_instances ALTER COLUMN project_id SET NOT NULL;
CREATE INDEX idx_page_component_instances_project_id ON public.page_component_instances(project_id);

-- 3. Hardened RLS Policies (Optimized via get_project_role)

-- Variables
DROP POLICY IF EXISTS "Variables are visible to project members" ON public.variables;
CREATE POLICY "Variables are visible to project members" ON public.variables
  FOR SELECT USING (get_project_role(project_id) IS NOT NULL);

-- Pages
DROP POLICY IF EXISTS "Pages are visible to project members" ON public.pages;
CREATE POLICY "Pages are visible to project members" ON public.pages
  FOR SELECT USING (get_project_role(project_id) IS NOT NULL);

-- Page Inputs (Now using direct project_id)
DROP POLICY IF EXISTS "Page inputs are visible to project members" ON public.page_inputs;
CREATE POLICY "Page inputs are visible to project members" ON public.page_inputs
  FOR SELECT USING (get_project_role(project_id) IS NOT NULL);

DROP POLICY IF EXISTS "Page inputs can be created by project editors" ON public.page_inputs;
CREATE POLICY "Page inputs can be created by project editors" ON public.page_inputs
  FOR INSERT WITH CHECK (get_project_role(project_id) IN ('owner', 'editor'));

-- Page Actions
DROP POLICY IF EXISTS "Page actions are visible to project members" ON public.page_actions;
CREATE POLICY "Page actions are visible to project members" ON public.page_actions
  FOR SELECT USING (get_project_role(project_id) IS NOT NULL);

-- Activity Log (Audit Protection)
DROP POLICY IF EXISTS "Activity visible to project members" ON public.activity_log;
CREATE POLICY "Activity visible to project members" ON public.activity_log
  FOR SELECT USING (get_project_role(project_id) IS NOT NULL);

DROP POLICY IF EXISTS "Users can only create logs for themselves" ON public.activity_log;
CREATE POLICY "Users can only create logs for themselves" ON public.activity_log
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND 
    get_project_role(project_id) IN ('owner', 'editor')
  );

-- 4. Component Metadata Policies
CREATE POLICY "Variants are visible to project members" ON public.component_variants
  FOR SELECT USING (
    component_id IN (SELECT id FROM public.components WHERE get_project_role(project_id) IS NOT NULL)
  );
