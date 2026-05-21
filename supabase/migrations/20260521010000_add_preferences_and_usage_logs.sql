-- Migration: 20260521010000_add_preferences_and_usage_logs.sql
-- Description: Adds active_model and deterministic_mode to user_api_keys table, and creates the ai_usage_logs table for audit/cost tracking.

-- 1. Add preferences columns to public.user_api_keys
ALTER TABLE public.user_api_keys 
ADD COLUMN IF NOT EXISTS active_model TEXT DEFAULT 'gemini-2.5-flash',
ADD COLUMN IF NOT EXISTS deterministic_mode BOOLEAN DEFAULT true;

-- 2. Create the ai_usage_logs table
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    cost_usd DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    prompt_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
-- 4.1 SELECT Policy: Users can only view their own logs
CREATE POLICY "Users can view their own usage logs" ON public.ai_usage_logs
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- 4.2 INSERT Policy: Users/system can insert logs for themselves
CREATE POLICY "Users can insert their own usage logs" ON public.ai_usage_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 4.3 DELETE Policy: Users can delete their own logs (e.g. clear logs)
CREATE POLICY "Users can delete their own usage logs" ON public.ai_usage_logs
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
