-- STEM: Security Audits Table Migration
-- Description: Creates the table to persist security audit reports and configures security policies.

CREATE TABLE IF NOT EXISTS public.security_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  report_content TEXT NOT NULL,
  flaws_count INT NOT NULL DEFAULT 0,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.security_audits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow safe re-runs)
DROP POLICY IF EXISTS "Users can view security audits of their projects" ON public.security_audits;
DROP POLICY IF EXISTS "Users can insert security audits of their projects" ON public.security_audits;
DROP POLICY IF EXISTS "Users can update security audits of their projects" ON public.security_audits;
DROP POLICY IF EXISTS "Users can delete security audits of their projects" ON public.security_audits;

-- Add RLS Policies
CREATE POLICY "Users can view security audits of their projects"
  ON public.security_audits
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      LEFT JOIN public.collaborators c ON c.project_id = p.id
      WHERE p.id = security_audits.project_id
        AND (p.owner_id = auth.uid() OR c.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert security audits of their projects"
  ON public.security_audits
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      LEFT JOIN public.collaborators c ON c.project_id = p.id
      WHERE p.id = security_audits.project_id
        AND (p.owner_id = auth.uid() OR c.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can update security audits of their projects"
  ON public.security_audits
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      LEFT JOIN public.collaborators c ON c.project_id = p.id
      WHERE p.id = security_audits.project_id
        AND (p.owner_id = auth.uid() OR c.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete security audits of their projects"
  ON public.security_audits
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      LEFT JOIN public.collaborators c ON c.project_id = p.id
      WHERE p.id = security_audits.project_id
        AND (p.owner_id = auth.uid() OR c.user_id = auth.uid())
    )
  );

-- Create index for faster lookups by project_id
CREATE INDEX IF NOT EXISTS idx_security_audits_project_id ON public.security_audits(project_id);
