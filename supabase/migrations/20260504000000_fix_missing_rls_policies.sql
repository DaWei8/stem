-- STEM: Missing RLS Policies Fix
-- This migration adds the missing INSERT, UPDATE, and DELETE policies for core tables

-- 1. Variables
CREATE POLICY "Variables can be created by project editors" ON public.variables
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Variables can be deleted by project editors" ON public.variables
  FOR DELETE USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- 2. Pages
CREATE POLICY "Pages can be created by project editors" ON public.pages
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Pages can be deleted by project editors" ON public.pages
  FOR DELETE USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- 3. Page Inputs
ALTER TABLE public.page_inputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Page inputs are visible to project members" ON public.page_inputs
  FOR SELECT USING (
    page_id IN (
      SELECT p.id FROM public.pages p
      JOIN public.projects proj ON p.project_id = proj.id
      WHERE proj.owner_id = auth.uid() OR proj.id IN (SELECT project_id FROM public.collaborators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Page inputs can be created by project editors" ON public.page_inputs
  FOR INSERT WITH CHECK (
    page_id IN (
      SELECT p.id FROM public.pages p
      JOIN public.projects proj ON p.project_id = proj.id
      WHERE proj.owner_id = auth.uid() OR proj.id IN (SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

CREATE POLICY "Page inputs can be updated by project editors" ON public.page_inputs
  FOR UPDATE USING (
    page_id IN (
      SELECT p.id FROM public.pages p
      JOIN public.projects proj ON p.project_id = proj.id
      WHERE proj.owner_id = auth.uid() OR proj.id IN (SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

-- 4. Page Actions
ALTER TABLE public.page_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Page actions are visible to project members" ON public.page_actions
  FOR SELECT USING (
    page_id IN (
      SELECT p.id FROM public.pages p
      JOIN public.projects proj ON p.project_id = proj.id
      WHERE proj.owner_id = auth.uid() OR proj.id IN (SELECT project_id FROM public.collaborators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Page actions can be created by project editors" ON public.page_actions
  FOR INSERT WITH CHECK (
    page_id IN (
      SELECT p.id FROM public.pages p
      JOIN public.projects proj ON p.project_id = proj.id
      WHERE proj.owner_id = auth.uid() OR proj.id IN (SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

-- 5. Page Outputs
ALTER TABLE public.page_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Page outputs are visible to project members" ON public.page_outputs
  FOR SELECT USING (
    page_id IN (
      SELECT p.id FROM public.pages p
      JOIN public.projects proj ON p.project_id = proj.id
      WHERE proj.owner_id = auth.uid() OR proj.id IN (SELECT project_id FROM public.collaborators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Page outputs can be created by project editors" ON public.page_outputs
  FOR INSERT WITH CHECK (
    page_id IN (
      SELECT p.id FROM public.pages p
      JOIN public.projects proj ON p.project_id = proj.id
      WHERE proj.owner_id = auth.uid() OR proj.id IN (SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

-- 6. Design Tokens
ALTER TABLE public.design_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Design tokens are visible to project members" ON public.design_tokens
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Design tokens can be created by project editors" ON public.design_tokens
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Design tokens can be updated by project editors" ON public.design_tokens
  FOR UPDATE USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );
