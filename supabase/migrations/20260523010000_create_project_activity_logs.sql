-- Migration: 20260523010000_create_project_activity_logs.sql
-- Description: Create project activity logging table and auto-logging triggers for all major pillars

CREATE TABLE IF NOT EXISTS public.project_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    part_affected TEXT NOT NULL,
    details TEXT NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    user_email TEXT,
    user_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_project_activity_logs_project_id ON public.project_activity_logs(project_id);

-- Enable RLS
ALTER TABLE public.project_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Project members can view activity logs" ON public.project_activity_logs;
CREATE POLICY "Project members can view activity logs" ON public.project_activity_logs
    FOR SELECT
    TO authenticated
    USING (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
            UNION
            SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Project members can insert activity logs" ON public.project_activity_logs;
CREATE POLICY "Project members can insert activity logs" ON public.project_activity_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
            UNION
            SELECT project_id FROM public.collaborators WHERE user_id = auth.uid()
        )
    );

-- Trigger Function for Auto-Logging
CREATE OR REPLACE FUNCTION public.log_project_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_project_id UUID;
  v_user_id UUID;
  v_user_email TEXT;
  v_user_name TEXT;
  v_action TEXT;
  v_part TEXT;
  v_details TEXT;
BEGIN
  -- 1. Determine User Info
  v_user_id := auth.uid();
  IF v_user_id IS NOT NULL THEN
    SELECT email, full_name INTO v_user_email, v_user_name
    FROM public.users
    WHERE id = v_user_id;
  ELSE
    v_user_email := 'system@stem.dev';
    v_user_name := 'System Architect';
  END IF;

  -- 2. Determine Action
  v_action := TG_OP; -- 'INSERT', 'UPDATE', 'DELETE'
  
  -- Determine project_id, part_affected and details
  IF TG_TABLE_NAME = 'pages' THEN
    v_part := 'Canvas';
    IF TG_OP = 'DELETE' THEN
      v_project_id := OLD.project_id;
      v_details := 'Removed screen "' || OLD.title || '"';
    ELSIF TG_OP = 'INSERT' THEN
      v_project_id := NEW.project_id;
      v_details := 'Added screen "' || NEW.title || '"';
    ELSE
      v_project_id := NEW.project_id;
      v_details := 'Updated screen details for "' || NEW.title || '"';
    END IF;

  ELSIF TG_TABLE_NAME = 'page_flows' THEN
    v_part := 'Canvas';
    IF TG_OP = 'DELETE' THEN
      v_project_id := OLD.project_id;
      v_details := 'Removed connection between screens';
    ELSE
      v_project_id := NEW.project_id;
      v_details := 'Connected screens in canvas flows';
    END IF;

  ELSIF TG_TABLE_NAME = 'page_inputs' THEN
    v_part := 'Canvas';
    IF TG_OP = 'DELETE' THEN
      SELECT project_id INTO v_project_id FROM public.pages WHERE id = OLD.page_id;
      v_details := 'Removed input "' || OLD.name || '"';
    ELSE
      SELECT project_id INTO v_project_id FROM public.pages WHERE id = NEW.page_id;
      v_details := 'Added/updated input "' || NEW.name || '"';
    END IF;

  ELSIF TG_TABLE_NAME = 'page_actions' THEN
    v_part := 'Canvas';
    IF TG_OP = 'DELETE' THEN
      SELECT project_id INTO v_project_id FROM public.pages WHERE id = OLD.page_id;
      v_details := 'Removed trigger "' || OLD.name || '"';
    ELSE
      SELECT project_id INTO v_project_id FROM public.pages WHERE id = NEW.page_id;
      v_details := 'Added/updated trigger "' || NEW.name || '"';
    END IF;

  ELSIF TG_TABLE_NAME = 'page_outputs' THEN
    v_part := 'Canvas';
    IF TG_OP = 'DELETE' THEN
      SELECT project_id INTO v_project_id FROM public.pages WHERE id = OLD.page_id;
      v_details := 'Removed mutation "' || OLD.name || '"';
    ELSE
      SELECT project_id INTO v_project_id FROM public.pages WHERE id = NEW.page_id;
      v_details := 'Added/updated mutation "' || NEW.name || '"';
    END IF;

  ELSIF TG_TABLE_NAME = 'constraints' THEN
    v_part := 'Canvas';
    IF TG_OP = 'DELETE' THEN
      SELECT project_id INTO v_project_id FROM public.pages WHERE id = OLD.page_id;
      v_details := 'Deleted route constraint';
    ELSE
      SELECT project_id INTO v_project_id FROM public.pages WHERE id = NEW.page_id;
      v_details := 'Added/updated route constraint';
    END IF;

  ELSIF TG_TABLE_NAME = 'variables' THEN
    v_part := 'System Engine';
    IF TG_OP = 'DELETE' THEN
      v_project_id := OLD.project_id;
      v_details := 'Deleted variable "' || OLD.label || '"';
    ELSIF TG_OP = 'INSERT' THEN
      v_project_id := NEW.project_id;
      v_details := 'Created variable "' || NEW.label || '" (' || NEW.type || ')';
    ELSE
      v_project_id := NEW.project_id;
      v_details := 'Updated variable "' || NEW.label || '"';
    END IF;

  ELSIF TG_TABLE_NAME = 'database_tables' THEN
    v_part := 'System Engine';
    IF TG_OP = 'DELETE' THEN
      v_project_id := OLD.project_id;
      v_details := 'Deleted table "' || OLD.name || '"';
    ELSIF TG_OP = 'INSERT' THEN
      v_project_id := NEW.project_id;
      v_details := 'Created database table "' || NEW.name || '"';
    ELSE
      v_project_id := NEW.project_id;
      v_details := 'Updated database table "' || NEW.name || '"';
    END IF;

  ELSIF TG_TABLE_NAME = 'database_columns' THEN
    v_part := 'System Engine';
    IF TG_OP = 'DELETE' THEN
      SELECT project_id INTO v_project_id FROM public.database_tables WHERE id = OLD.table_id;
      v_details := 'Removed column "' || OLD.name || '"';
    ELSIF TG_OP = 'INSERT' THEN
      SELECT project_id INTO v_project_id FROM public.database_tables WHERE id = NEW.table_id;
      v_details := 'Added column "' || NEW.name || '" (' || NEW.type || ')';
    ELSE
      SELECT project_id INTO v_project_id FROM public.database_tables WHERE id = NEW.table_id;
      v_details := 'Updated column "' || NEW.name || '"';
    END IF;

  ELSIF TG_TABLE_NAME = 'constants' THEN
    v_part := 'System Engine';
    IF TG_OP = 'DELETE' THEN
      v_project_id := OLD.project_id;
      v_details := 'Deleted constant "' || OLD.name || '"';
    ELSIF TG_OP = 'INSERT' THEN
      v_project_id := NEW.project_id;
      v_details := 'Created constant "' || NEW.name || '"';
    ELSE
      v_project_id := NEW.project_id;
      v_details := 'Updated constant "' || NEW.name || '"';
    END IF;

  ELSIF TG_TABLE_NAME = 'functions' THEN
    v_part := 'System Engine';
    IF TG_OP = 'DELETE' THEN
      v_project_id := OLD.project_id;
      v_details := 'Deleted logic function "' || OLD.name || '"';
    ELSIF TG_OP = 'INSERT' THEN
      v_project_id := NEW.project_id;
      v_details := 'Created logic function "' || NEW.name || '"';
    ELSE
      v_project_id := NEW.project_id;
      v_details := 'Updated logic function "' || NEW.name || '"';
    END IF;

  ELSIF TG_TABLE_NAME = 'user_types' THEN
    v_part := 'User Types';
    IF TG_OP = 'DELETE' THEN
      v_project_id := OLD.project_id;
      v_details := 'Deleted role/persona "' || OLD.name || '"';
    ELSIF TG_OP = 'INSERT' THEN
      v_project_id := NEW.project_id;
      IF NEW.is_persona = true THEN
        v_details := 'Created persona instance "' || NEW.name || '"';
      ELSE
        v_details := 'Created user role "' || NEW.name || '"';
      END IF;
    ELSE
      v_project_id := NEW.project_id;
      v_details := 'Updated role/persona "' || NEW.name || '"';
    END IF;

  ELSIF TG_TABLE_NAME = 'rls_policies' THEN
    v_part := 'User Types';
    IF TG_OP = 'DELETE' THEN
      v_project_id := OLD.project_id;
      v_details := 'Deleted RLS Policy "' || OLD.name || '"';
    ELSIF TG_OP = 'INSERT' THEN
      v_project_id := NEW.project_id;
      v_details := 'Created RLS Policy "' || NEW.name || '"';
    ELSE
      v_project_id := NEW.project_id;
      v_details := 'Updated RLS Policy "' || NEW.name || '"';
    END IF;

  ELSIF TG_TABLE_NAME = 'collaborators' THEN
    v_part := 'Collaborators';
    IF TG_OP = 'DELETE' THEN
      v_project_id := OLD.project_id;
      v_details := 'Revoked collaborator access';
    ELSIF TG_OP = 'INSERT' THEN
      v_project_id := NEW.project_id;
      v_details := 'Added new project collaborator';
    ELSE
      v_project_id := NEW.project_id;
      v_details := 'Updated collaborator role/permissions';
    END IF;

  ELSIF TG_TABLE_NAME = 'chat_messages' THEN
    v_part := 'System Blueprint';
    IF TG_OP = 'UPDATE' AND NEW.is_committed = true AND OLD.is_committed = false THEN
      v_project_id := NEW.project_id;
      v_action := 'COMMIT';
      v_details := 'Committed proposed blueprint script changes';
    ELSE
      RETURN NEW;
    END IF;

  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Insert activity log
  IF v_project_id IS NOT NULL THEN
    INSERT INTO public.project_activity_logs (
      project_id,
      action,
      part_affected,
      details,
      user_id,
      user_email,
      user_name
    ) VALUES (
      v_project_id,
      v_action,
      v_part,
      v_details,
      v_user_id,
      v_user_email,
      v_user_name
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
EXCEPTION
  WHEN OTHERS THEN
    -- Prevent trigger errors from blocking core user updates
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach triggers (Drop first if exists to prevent errors)
DROP TRIGGER IF EXISTS trg_log_pages ON public.pages;
CREATE TRIGGER trg_log_pages AFTER INSERT OR UPDATE OR DELETE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.log_project_activity();

DROP TRIGGER IF EXISTS trg_log_page_flows ON public.page_flows;
CREATE TRIGGER trg_log_page_flows AFTER INSERT OR UPDATE OR DELETE ON public.page_flows FOR EACH ROW EXECUTE FUNCTION public.log_project_activity();

DROP TRIGGER IF EXISTS trg_log_page_inputs ON public.page_inputs;
CREATE TRIGGER trg_log_page_inputs AFTER INSERT OR UPDATE OR DELETE ON public.page_inputs FOR EACH ROW EXECUTE FUNCTION public.log_project_activity();

DROP TRIGGER IF EXISTS trg_log_page_actions ON public.page_actions;
CREATE TRIGGER trg_log_page_actions AFTER INSERT OR UPDATE OR DELETE ON public.page_actions FOR EACH ROW EXECUTE FUNCTION public.log_project_activity();

DROP TRIGGER IF EXISTS trg_log_page_outputs ON public.page_outputs;
CREATE TRIGGER trg_log_page_outputs AFTER INSERT OR UPDATE OR DELETE ON public.page_outputs FOR EACH ROW EXECUTE FUNCTION public.log_project_activity();

DROP TRIGGER IF EXISTS trg_log_constraints ON public.constraints;
CREATE TRIGGER trg_log_constraints AFTER INSERT OR UPDATE OR DELETE ON public.constraints FOR EACH ROW EXECUTE FUNCTION public.log_project_activity();

DROP TRIGGER IF EXISTS trg_log_variables ON public.variables;
CREATE TRIGGER trg_log_variables AFTER INSERT OR UPDATE OR DELETE ON public.variables FOR EACH ROW EXECUTE FUNCTION public.log_project_activity();

DROP TRIGGER IF EXISTS trg_log_database_tables ON public.database_tables;
CREATE TRIGGER trg_log_database_tables AFTER INSERT OR UPDATE OR DELETE ON public.database_tables FOR EACH ROW EXECUTE FUNCTION public.log_project_activity();

DROP TRIGGER IF EXISTS trg_log_database_columns ON public.database_columns;
CREATE TRIGGER trg_log_database_columns AFTER INSERT OR UPDATE OR DELETE ON public.database_columns FOR EACH ROW EXECUTE FUNCTION public.log_project_activity();

DROP TRIGGER IF EXISTS trg_log_constants ON public.constants;
CREATE TRIGGER trg_log_constants AFTER INSERT OR UPDATE OR DELETE ON public.constants FOR EACH ROW EXECUTE FUNCTION public.log_project_activity();

DROP TRIGGER IF EXISTS trg_log_functions ON public.functions;
CREATE TRIGGER trg_log_functions AFTER INSERT OR UPDATE OR DELETE ON public.functions FOR EACH ROW EXECUTE FUNCTION public.log_project_activity();

DROP TRIGGER IF EXISTS trg_log_user_types ON public.user_types;
CREATE TRIGGER trg_log_user_types AFTER INSERT OR UPDATE OR DELETE ON public.user_types FOR EACH ROW EXECUTE FUNCTION public.log_project_activity();

DROP TRIGGER IF EXISTS trg_log_rls_policies ON public.rls_policies;
CREATE TRIGGER trg_log_rls_policies AFTER INSERT OR UPDATE OR DELETE ON public.rls_policies FOR EACH ROW EXECUTE FUNCTION public.log_project_activity();

DROP TRIGGER IF EXISTS trg_log_collaborators ON public.collaborators;
CREATE TRIGGER trg_log_collaborators AFTER INSERT OR UPDATE OR DELETE ON public.collaborators FOR EACH ROW EXECUTE FUNCTION public.log_project_activity();

DROP TRIGGER IF EXISTS trg_log_chat_messages ON public.chat_messages;
CREATE TRIGGER trg_log_chat_messages AFTER UPDATE ON public.chat_messages FOR EACH ROW EXECUTE FUNCTION public.log_project_activity();
