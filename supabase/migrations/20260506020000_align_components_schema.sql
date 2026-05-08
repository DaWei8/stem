-- STEM: Align Components Table with Design System Hook
-- Adds missing columns to public.components to support complex layout and variable mapping.

ALTER TABLE public.components 
  ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('button', 'input', 'form', 'custom', 'container')),
  ADD COLUMN IF NOT EXISTS layout_config JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS children_ids UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS variable_mappings JSONB DEFAULT '{}';

-- Optional: Migrate existing category to type if needed
-- UPDATE public.components SET type = category WHERE type IS NULL;
