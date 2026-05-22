-- Add persona column to user_types for UX research details
ALTER TABLE public.user_types ADD COLUMN IF NOT EXISTS persona JSONB DEFAULT '{}';
