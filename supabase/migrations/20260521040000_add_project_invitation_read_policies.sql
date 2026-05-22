-- Migration: 20260521040000_add_project_invitation_read_policies.sql
-- Description: Adds SELECT policy to projects and users tables to allow collaboration features.

-- Allow users to view projects they have been invited to
CREATE POLICY "Users can view projects they are invited to" ON public.projects
    FOR SELECT
    TO authenticated
    USING (
        id IN (
            SELECT project_id FROM public.project_invitations
            WHERE LOWER(email) = LOWER(auth.jwt() ->> 'email')
        )
    );

-- Allow users to view profiles of other users for invitation lookup and collaboration display
CREATE POLICY "Users can view all profiles" ON public.users
    FOR SELECT
    TO authenticated
    USING (true);
