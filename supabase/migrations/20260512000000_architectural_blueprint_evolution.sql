-- STEM: Architectural Blueprinting Evolution Migration
-- Description: Adds support for semantic grouping, failure paths, and enhanced state tracking.

-- 1. Add Semantic Grouping (Folders) to Pages
ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS folder TEXT DEFAULT 'Uncategorized';

-- 2. Add Failure Path Modeling to Transitions
ALTER TABLE public.page_flows 
ADD COLUMN IF NOT EXISTS is_failure_path BOOLEAN DEFAULT false;

-- 3. Enhance State Mutation Tracking in Page Outputs
ALTER TABLE public.page_outputs 
ADD COLUMN IF NOT EXISTS variable_id UUID REFERENCES public.variables(id) ON DELETE SET NULL;

-- 4. Add Tracing & Integrity Metadata (Optional for future use)
ALTER TABLE public.pages
ADD COLUMN IF NOT EXISTS integrity_score INTEGER DEFAULT 100;

-- 5. Update RLS Policies to allow these new fields (if necessary)
-- Note: Assuming existing policies cover new columns if they are on the same tables.

-- 6. Add trigger_metadata to transitions for complex pathing
ALTER TABLE public.page_flows
ADD COLUMN IF NOT EXISTS trigger_metadata JSONB DEFAULT '{}';

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_pages_folder ON public.pages(folder);
CREATE INDEX IF NOT EXISTS idx_page_flows_is_failure ON public.page_flows(is_failure_path);
CREATE INDEX IF NOT EXISTS idx_page_outputs_variable_id ON public.page_outputs(variable_id);
