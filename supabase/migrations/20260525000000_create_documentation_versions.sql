-- STEM: Documentation Versions Table Migration
-- Description: Creates the table to persist documentation versions and configures security policies.

CREATE TABLE IF NOT EXISTS public.documentation_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'archived', 'draft')) DEFAULT 'draft',
  content TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.documentation_versions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow safe re-runs)
DROP POLICY IF EXISTS "Users can view documentation versions of their projects" ON public.documentation_versions;
DROP POLICY IF EXISTS "Users can insert documentation versions of their projects" ON public.documentation_versions;
DROP POLICY IF EXISTS "Users can update documentation versions of their projects" ON public.documentation_versions;
DROP POLICY IF EXISTS "Users can delete documentation versions of their projects" ON public.documentation_versions;

-- Add RLS Policies
CREATE POLICY "Users can view documentation versions of their projects"
  ON public.documentation_versions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      LEFT JOIN public.collaborators c ON c.project_id = p.id
      WHERE p.id = documentation_versions.project_id
        AND (p.owner_id = auth.uid() OR c.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert documentation versions of their projects"
  ON public.documentation_versions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      LEFT JOIN public.collaborators c ON c.project_id = p.id
      WHERE p.id = documentation_versions.project_id
        AND (p.owner_id = auth.uid() OR c.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can update documentation versions of their projects"
  ON public.documentation_versions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      LEFT JOIN public.collaborators c ON c.project_id = p.id
      WHERE p.id = documentation_versions.project_id
        AND (p.owner_id = auth.uid() OR c.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete documentation versions of their projects"
  ON public.documentation_versions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      LEFT JOIN public.collaborators c ON c.project_id = p.id
      WHERE p.id = documentation_versions.project_id
        AND (p.owner_id = auth.uid() OR c.user_id = auth.uid())
    )
  );

-- Create index for faster lookups by project_id
CREATE INDEX IF NOT EXISTS idx_doc_versions_project_id ON public.documentation_versions(project_id);
