-- Migration: 20260521000000_create_user_api_keys.sql
-- Description: Creates a table to store encrypted AI provider API keys for users.

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.user_api_keys (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    openai_key TEXT,
    anthropic_key TEXT,
    google_key TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies
-- 3.1 SELECT Policy: Users can only see their own keys
CREATE POLICY "Users can view their own API keys" ON public.user_api_keys
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- 3.2 ALL (INSERT/UPDATE/DELETE) Policy: Users can only manage their own keys
CREATE POLICY "Users can manage their own API keys" ON public.user_api_keys
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Create trigger to automatically update the updated_at column
CREATE TRIGGER update_user_api_keys_updated_at BEFORE UPDATE ON public.user_api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
