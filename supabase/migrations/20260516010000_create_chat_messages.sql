-- Migration: 20260516010000_create_chat_messages.sql
-- Description: Creates a table to persist AI Architect chat history for projects.

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    script TEXT, -- Stores the STEM-script V2 blueprint if generated
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies

-- 3.1 Policy for READ
-- Users can read messages for projects they own or collaborate on
CREATE POLICY "Users can view chat history for their projects" ON public.chat_messages
    FOR SELECT
    TO authenticated
    USING (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
            UNION
            SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
        )
    );

-- 3.2 Policy for INSERT
-- Users can insert messages for projects they have access to
CREATE POLICY "Users can insert chat messages for their projects" ON public.chat_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
            UNION
            SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
        )
        AND user_id = auth.uid()
    );

-- 4. Create Index for performance
CREATE INDEX IF NOT EXISTS chat_messages_project_id_idx ON public.chat_messages(project_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON public.chat_messages(created_at);
