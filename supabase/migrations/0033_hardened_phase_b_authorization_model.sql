CREATE TABLE IF NOT EXISTS public.user_role_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  granted_by uuid REFERENCES auth.users(id),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (valid_until IS NULL OR valid_until > valid_from),
  UNIQUE (user_id, role, valid_from)
);
CREATE INDEX IF NOT EXISTS user_role_assignments_user_active_idx ON public.user_role_assignments (user_id, role, valid_from, valid_until);
ALTER TABLE public.user_role_assignments ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.active_role_sessions (
  session_id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  active_role public.app_role NOT NULL,
  selected_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  CHECK (expires_at > selected_at)
);
CREATE INDEX IF NOT EXISTS active_role_sessions_user_idx ON public.active_role_sessions (user_id, expires_at);
ALTER TABLE public.active_role_sessions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.grade_sheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id),
  subject_id uuid NOT NULL REFERENCES public.subjects(id),
  academic_year smallint NOT NULL,
  trimester smallint NOT NULL CHECK (trimester BETWEEN 1 AND 3),
  owner_teacher_id uuid NOT NULL REFERENCES auth.users(id),
  state public.grade_state NOT NULL DEFAULT 'draft',
  submitted_at timestamptz,
  reviewed_at timestamptz,
  approved_at timestamptz,
  returned_at timestamptz,
  published_at timestamptz,
  return_reason text,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (class_id, subject_id, academic_year, trimester)
);
CREATE INDEX IF NOT EXISTS grade_sheets_owner_state_idx ON public.grade_sheets (owner_teacher_id, state);
ALTER TABLE public.grade_sheets ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.grade_sheet_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_sheet_id uuid NOT NULL REFERENCES public.grade_sheets(id) ON DELETE RESTRICT,
  version integer NOT NULL,
  state public.grade_state NOT NULL,
  snapshot jsonb NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (grade_sheet_id, version)
);
CREATE INDEX IF NOT EXISTS grade_sheet_snapshots_sheet_idx ON public.grade_sheet_snapshots (grade_sheet_id, version DESC);
ALTER TABLE public.grade_sheet_snapshots ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.workflow_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  current_level smallint NOT NULL DEFAULT 1 CHECK (current_level >= 1),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','returned','cancelled')),
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (approved_by IS NULL OR approved_by <> created_by)
);
CREATE INDEX IF NOT EXISTS workflow_requests_created_by_status_idx ON public.workflow_requests (created_by, status);
ALTER TABLE public.workflow_requests ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS previous_hash text;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS event_hash text;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS entity_ref text;

CREATE OR REPLACE FUNCTION public.audit_logs_hash_chain()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE v_previous text;
BEGIN
  PERFORM pg_advisory_xact_lock(2147483000, 271828);
  SELECT event_hash INTO v_previous FROM public.audit_logs ORDER BY id DESC LIMIT 1;
  NEW.previous_hash := COALESCE(v_previous, 'GENESIS');
  NEW.event_hash := encode(extensions.digest(concat_ws('|',
    NEW.previous_hash, COALESCE(NEW.actor_user_id::text,''), COALESCE(NEW.event_type,''),
    COALESCE(NEW.entity_table,''), COALESCE(NEW.entity_id,''), COALESCE(NEW.entity_ref,''),
    COALESCE(NEW.before_data::text,''), COALESCE(NEW.after_data::text,''),
    COALESCE(NEW.metadata::text,''), NEW.created_at::text), 'sha256'),'hex');
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS audit_logs_hash_chain_trigger ON public.audit_logs;
CREATE TRIGGER audit_logs_hash_chain_trigger BEFORE INSERT ON public.audit_logs FOR EACH ROW EXECUTE FUNCTION public.audit_logs_hash_chain();
ALTER TABLE public.audit_logs ALTER COLUMN previous_hash SET NOT NULL;
ALTER TABLE public.audit_logs ALTER COLUMN event_hash SET NOT NULL;
REVOKE UPDATE, DELETE ON public.audit_logs FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_logs_hash_chain() FROM PUBLIC,anon,authenticated;

DROP POLICY IF EXISTS user_role_assignments_self_or_admin ON public.user_role_assignments;
CREATE POLICY user_role_assignments_self_or_admin ON public.user_role_assignments FOR SELECT TO authenticated USING (
  user_id=(select auth.uid()) OR ((select public.current_role())='admin'::public.app_role AND (select auth.jwt() ->> 'aal')='aal2')
);
DROP POLICY IF EXISTS active_role_sessions_self ON public.active_role_sessions;
CREATE POLICY active_role_sessions_self ON public.active_role_sessions FOR SELECT TO authenticated USING (user_id=(select auth.uid()));

DROP POLICY IF EXISTS grade_sheets_scope_read ON public.grade_sheets;
CREATE POLICY grade_sheets_scope_read ON public.grade_sheets FOR SELECT TO authenticated USING (
  owner_teacher_id=(select auth.uid()) OR ((select public.current_role()) IN ('admin'::public.app_role,'director'::public.app_role) AND (select auth.jwt() ->> 'aal')='aal2')
);
DROP POLICY IF EXISTS grade_sheets_teacher_insert ON public.grade_sheets;
CREATE POLICY grade_sheets_teacher_insert ON public.grade_sheets FOR INSERT TO authenticated WITH CHECK (
  owner_teacher_id=(select auth.uid()) AND (select public.current_role())='teacher'::public.app_role
  AND (select public.is_teacher_assigned(class_id,subject_id,academic_year))
);
DROP POLICY IF EXISTS grade_sheets_teacher_update ON public.grade_sheets;
CREATE POLICY grade_sheets_teacher_update ON public.grade_sheets FOR UPDATE TO authenticated
USING (owner_teacher_id=(select auth.uid()) AND state IN ('draft'::public.grade_state,'returned'::public.grade_state))
WITH CHECK (owner_teacher_id=(select auth.uid()) AND state IN ('draft'::public.grade_state,'submitted'::public.grade_state));

DROP POLICY IF EXISTS grade_sheet_snapshots_read ON public.grade_sheet_snapshots;
CREATE POLICY grade_sheet_snapshots_read ON public.grade_sheet_snapshots FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.grade_sheets g WHERE g.id=grade_sheet_id AND (
    g.owner_teacher_id=(select auth.uid()) OR ((select public.current_role()) IN ('admin'::public.app_role,'director'::public.app_role) AND (select auth.jwt() ->> 'aal')='aal2')
  ))
);

DROP POLICY IF EXISTS workflow_requests_self_or_admin ON public.workflow_requests;
CREATE POLICY workflow_requests_self_or_admin ON public.workflow_requests FOR SELECT TO authenticated USING (
  created_by=(select auth.uid()) OR ((select public.current_role()) IN ('admin'::public.app_role,'director'::public.app_role) AND (select auth.jwt() ->> 'aal')='aal2')
);
