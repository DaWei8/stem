-- Migration: 20260521020000_create_project_invitations_and_revoked_logs.sql
-- Description: Creates the tables project_invitations and project_revoked_logs with secure RLS policies.

-- 1. Create project_invitations table
CREATE TABLE IF NOT EXISTS public.project_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('editor', 'viewer', 'comment_only')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    invited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_project_email_invitation UNIQUE (project_id, email)
);

-- 2. Create project_revoked_logs table
CREATE TABLE IF NOT EXISTS public.project_revoked_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    name TEXT,
    role TEXT NOT NULL,
    revoked_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_revoked_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for project_invitations

-- Helper function to check if the user has project invitation/modification rights (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_project_invite_permission(p_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    u_id UUID := auth.uid();
    v_role TEXT;
    v_invite BOOLEAN;
BEGIN
    IF u_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Owner check (fast index lookup)
    IF EXISTS (SELECT 1 FROM public.projects WHERE id = p_id AND owner_id = u_id) THEN
        RETURN TRUE;
    END IF;

    -- Collaborator check
    SELECT role, can_invite_others INTO v_role, v_invite
    FROM public.collaborators
    WHERE project_id = p_id AND user_id = u_id;

    IF v_role = 'editor' OR v_invite = TRUE THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE POLICY "Users can view project invitations" ON public.project_invitations
    FOR SELECT
    TO authenticated
    USING (
        LOWER(auth.jwt() ->> 'email') = LOWER(email)
        OR
        public.get_project_role(project_id) IS NOT NULL
    );

CREATE POLICY "Users can insert project invitations" ON public.project_invitations
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.has_project_invite_permission(project_id)
    );

CREATE POLICY "Users can update project invitations" ON public.project_invitations
    FOR UPDATE
    TO authenticated
    USING (
        LOWER(auth.jwt() ->> 'email') = LOWER(email)
        OR
        public.has_project_invite_permission(project_id)
    );

CREATE POLICY "Users can delete project invitations" ON public.project_invitations
    FOR DELETE
    TO authenticated
    USING (
        public.has_project_invite_permission(project_id)
    );

-- 5. RLS Policies for project_revoked_logs
CREATE POLICY "Users can view project revoked logs" ON public.project_revoked_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = project_id
            AND projects.owner_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.collaborators
            WHERE collaborators.project_id = project_id
            AND collaborators.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert project revoked logs" ON public.project_revoked_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = project_id
            AND projects.owner_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.collaborators
            WHERE collaborators.project_id = project_id
            AND collaborators.user_id = auth.uid()
            AND collaborators.role IN ('owner', 'editor')
        )
    );

CREATE POLICY "Users can delete project revoked logs" ON public.project_revoked_logs
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = project_id
            AND projects.owner_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.collaborators
            WHERE collaborators.project_id = project_id
            AND collaborators.user_id = auth.uid()
            AND collaborators.role IN ('owner', 'editor')
        )
    );
