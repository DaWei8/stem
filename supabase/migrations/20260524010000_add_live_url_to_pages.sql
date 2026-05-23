-- Add live_url column to pages table for linking screens to deployed URLs
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS live_url TEXT DEFAULT NULL;

COMMENT ON COLUMN public.pages.live_url IS 'Optional URL linking this screen to its live deployed page (e.g. https://myapp.com/dashboard)';
