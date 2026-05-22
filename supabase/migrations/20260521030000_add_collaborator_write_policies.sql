-- Migration: 20260521030000_add_collaborator_write_policies.sql
-- Description: Adds RLS policies for inserting, updating, and deleting collaborators.

-- 1. Policies for public.collaborators

-- INSERT policy
CREATE POLICY "Users can insert collaborators if project owner, editor, or self-accepting invite" ON public.collaborators
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Is the project owner
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = project_id
            AND projects.owner_id = auth.uid()
        )
        OR
        -- Is an editor of the project
        EXISTS (
            SELECT 1 FROM public.collaborators existing
            WHERE existing.project_id = collaborators.project_id
            AND existing.user_id = auth.uid()
            AND existing.role IN ('owner', 'editor')
        )
        OR
        -- Is the user themselves accepting a pending invitation matching their JWT email
        (
            user_id = auth.uid()
            AND EXISTS (
                SELECT 1 FROM public.project_invitations
                WHERE project_invitations.project_id = collaborators.project_id
                AND LOWER(project_invitations.email) = LOWER(auth.jwt() ->> 'email')
                AND project_invitations.status IN ('pending', 'accepted')
            )
        )
    );

-- UPDATE policy
CREATE POLICY "Users can update collaborators if project owner or editor" ON public.collaborators
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = project_id
            AND projects.owner_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.collaborators existing
            WHERE existing.project_id = collaborators.project_id
            AND existing.user_id = auth.uid()
            AND existing.role IN ('owner', 'editor')
        )
    );

-- DELETE policy
CREATE POLICY "Users can delete collaborators if project owner, editor, or self" ON public.collaborators
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
            SELECT 1 FROM public.collaborators existing
            WHERE existing.project_id = collaborators.project_id
            AND existing.user_id = auth.uid()
            AND existing.role IN ('owner', 'editor')
        )
        OR
        user_id = auth.uid()
    );
