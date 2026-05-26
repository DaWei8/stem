-- Migration: 20260526000000_fix_project_invitations_rls.sql
-- Description: Fixes case-sensitivity issue for invitees and resolves infinite recursion/nested check issues on project_invitations RLS policies using get_project_role and a new helper function.

-- 1. Create a helper function to check if the user has project invitation/modification rights
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

-- 2. Drop existing project_invitations policies
DROP POLICY IF EXISTS "Users can view project invitations" ON public.project_invitations;
DROP POLICY IF EXISTS "Users can insert project invitations" ON public.project_invitations;
DROP POLICY IF EXISTS "Users can update project invitations" ON public.project_invitations;
DROP POLICY IF EXISTS "Users can delete project invitations" ON public.project_invitations;

-- 3. Create case-insensitive and optimized policies using helper functions
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
