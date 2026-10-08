CREATE OR REPLACE FUNCTION public.grade_sheet_transition_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
  IF NEW.owner_teacher_id<>OLD.owner_teacher_id OR NEW.class_id<>OLD.class_id OR NEW.subject_id<>OLD.subject_id
     OR NEW.academic_year<>OLD.academic_year OR NEW.trimester<>OLD.trimester THEN
    RAISE EXCEPTION 'immutable grade sheet identity';
  END IF;
  IF OLD.state='draft' AND NEW.state='submitted' THEN
    NEW.submitted_at=COALESCE(NEW.submitted_at,now());
  ELSIF OLD.state='submitted' AND NEW.state='reviewed' THEN
    NEW.reviewed_at=COALESCE(NEW.reviewed_at,now());
  ELSIF OLD.state='reviewed' AND NEW.state='approved' THEN
    NEW.approved_at=COALESCE(NEW.approved_at,now());
  ELSIF OLD.state='approved' AND NEW.state='published' THEN
    NEW.published_at=COALESCE(NEW.published_at,now());
  ELSIF OLD.state='submitted' AND NEW.state='returned' THEN
    IF NEW.return_reason IS NULL OR length(trim(NEW.return_reason))<10 THEN RAISE EXCEPTION 'return requires justification'; END IF;
    NEW.returned_at=COALESCE(NEW.returned_at,now());
  ELSIF OLD.state='returned' AND NEW.state='submitted' THEN
    NEW.submitted_at=COALESCE(NEW.submitted_at,now());
    NEW.version=OLD.version+1;
  ELSIF NEW.state=OLD.state THEN NULL;
  ELSE RAISE EXCEPTION 'invalid grade sheet state transition';
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS grade_sheet_transition_guard ON public.grade_sheets;
CREATE TRIGGER grade_sheet_transition_guard BEFORE UPDATE ON public.grade_sheets FOR EACH ROW EXECUTE FUNCTION public.grade_sheet_transition_guard();
REVOKE EXECUTE ON FUNCTION public.grade_sheet_transition_guard() FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.workflow_request_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
  IF TG_OP='UPDATE' THEN
    IF NEW.created_by<>OLD.created_by THEN RAISE EXCEPTION 'request owner is immutable'; END IF;
    IF OLD.status='pending' AND NEW.status='approved' THEN
      IF NEW.approved_by IS NULL OR NEW.approved_by=OLD.created_by THEN RAISE EXCEPTION 'creator cannot self-approve'; END IF;
      IF NEW.current_level<>OLD.current_level+1 THEN RAISE EXCEPTION 'approval must advance exactly one level'; END IF;
      NEW.approved_at=COALESCE(NEW.approved_at,now());
    ELSIF OLD.status='pending' AND NEW.status IN ('rejected','returned') THEN NULL;
    ELSIF NEW.status=OLD.status THEN NULL;
    ELSE RAISE EXCEPTION 'invalid workflow request transition';
    END IF;
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS workflow_request_guard ON public.workflow_requests;
CREATE TRIGGER workflow_request_guard BEFORE UPDATE ON public.workflow_requests FOR EACH ROW EXECUTE FUNCTION public.workflow_request_guard();
REVOKE EXECUTE ON FUNCTION public.workflow_request_guard() FROM PUBLIC,anon,authenticated;

DROP POLICY IF EXISTS workflow_requests_insert_self ON public.workflow_requests;
CREATE POLICY workflow_requests_insert_self ON public.workflow_requests FOR INSERT TO authenticated WITH CHECK (created_by=(select auth.uid()));
DROP POLICY IF EXISTS workflow_requests_approve ON public.workflow_requests;
CREATE POLICY workflow_requests_approve ON public.workflow_requests FOR UPDATE TO authenticated
USING (status='pending' AND created_by<>(select auth.uid()) AND (select public.current_role()) IN ('admin'::public.app_role,'director'::public.app_role) AND (select auth.jwt() ->> 'aal')='aal2')
WITH CHECK (created_by<>(select auth.uid()) AND approved_by=(select auth.uid()));

DROP POLICY IF EXISTS grade_sheets_admin_workflow ON public.grade_sheets;
CREATE POLICY grade_sheets_admin_workflow ON public.grade_sheets FOR UPDATE TO authenticated
USING ((select public.current_role()) IN ('admin'::public.app_role,'director'::public.app_role) AND (select auth.jwt() ->> 'aal')='aal2')
WITH CHECK ((select public.current_role()) IN ('admin'::public.app_role,'director'::public.app_role) AND (select auth.jwt() ->> 'aal')='aal2');

CREATE OR REPLACE FUNCTION public.security_test_schema()
RETURNS TABLE(test_id text, passed boolean, detail text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
  SELECT 'B-01', EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname='grade_sheets' AND c.relrowsecurity), 'grade_sheets RLS enabled'
  UNION ALL SELECT 'B-02', EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid WHERE c.relname='grades' AND p.polname='grades_authenticated_select' AND pg_get_expr(p.polqual,p.polrelid) ILIKE '%my_student_id%'), 'grades student scope prevents cross-student access'
  UNION ALL SELECT 'B-03', EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid WHERE t.relname='workflow_requests' AND pg_get_constraintdef(c.oid) ILIKE '%approved_by%'), 'workflow request prevents self-approval structurally'
  UNION ALL SELECT 'B-04', EXISTS (SELECT 1 FROM pg_trigger tr JOIN pg_class t ON t.oid=tr.tgrelid WHERE t.relname='audit_logs' AND tr.tgname='audit_logs_hash_chain_trigger'), 'audit hash chain trigger installed'
  UNION ALL SELECT 'B-05', NOT EXISTS (SELECT 1 FROM information_schema.role_table_grants WHERE table_schema='public' AND table_name='audit_logs' AND grantee='authenticated' AND privilege_type IN ('UPDATE','DELETE')), 'authenticated cannot update/delete audit logs';
$$;
REVOKE EXECUTE ON FUNCTION public.security_test_schema() FROM PUBLIC,anon,authenticated;
