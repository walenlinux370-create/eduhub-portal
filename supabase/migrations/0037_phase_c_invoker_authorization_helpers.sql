-- Fase C: authorization helpers run as invoker so RLS remains authoritative.
CREATE OR REPLACE FUNCTION public.current_role()
RETURNS public.app_role
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT role FROM public.user_profiles
  WHERE id = auth.uid() AND is_active;
$$;

CREATE OR REPLACE FUNCTION public.is_teacher_assigned(p_class uuid, p_subject uuid, p_year smallint)
RETURNS boolean
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teacher_assignments a
    WHERE a.teacher_id = auth.uid()
      AND a.class_id = p_class
      AND a.subject_id = p_subject
      AND a.academic_year = p_year
  );
$$;

CREATE OR REPLACE FUNCTION public.my_student_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT id FROM public.students
  WHERE user_id = auth.uid() AND status = 'active';
$$;

CREATE OR REPLACE FUNCTION public.has_aal2()
RETURNS boolean
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT (auth.jwt() ->> 'aal') = 'aal2';
$$;

REVOKE EXECUTE ON FUNCTION public.has_aal2() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_aal2() TO authenticated;

CREATE INDEX IF NOT EXISTS idx_user_profiles_active_role
  ON public.user_profiles (id, role) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_teacher_assignments_scope
  ON public.teacher_assignments (teacher_id, class_id, subject_id, academic_year);

CREATE INDEX IF NOT EXISTS idx_grade_sheets_owner_state
  ON public.grade_sheets (owner_teacher_id, state, academic_year);

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.proname, p.prosecdef
    FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public'
      AND p.proname IN ('current_role','is_teacher_assigned','my_student_id','has_aal2')
  LOOP
    IF r.prosecdef THEN
      RAISE EXCEPTION 'Fase C: helper % must not be SECURITY DEFINER', r.proname;
    END IF;
  END LOOP;
END $$;
