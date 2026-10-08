-- Fase D: security regression tests
CREATE OR REPLACE FUNCTION public.security_test_phase_d()
RETURNS TABLE(test_id text, passed boolean, detail text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path=public,pg_temp
AS $$
DECLARE v_first text; v_second text; v_ok boolean := false; v_def text;
BEGIN
  RETURN QUERY SELECT 'D-01',
    NOT EXISTS (
      SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
      CROSS JOIN LATERAL aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a
      WHERE n.nspname='public' AND p.prosecdef AND a.privilege_type='EXECUTE'
        AND a.grantee IN (SELECT oid FROM pg_roles WHERE rolname IN ('anon','authenticated'))
    ), 'client roles cannot execute public SECURITY DEFINER functions';

  RETURN QUERY SELECT 'D-02',
    NOT EXISTS (
      SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND c.relname IN ('grade_sheets','grades','workflow_requests','audit_logs','grade_sheet_snapshots')
        AND NOT c.relrowsecurity
    ), 'protected tables have RLS enabled';

  RETURN QUERY SELECT 'D-03',
    EXISTS (
      SELECT 1 FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid
      WHERE c.relname='grades' AND p.polname='grades_authenticated_select'
        AND pg_get_expr(p.polqual,p.polrelid) ILIKE '%student_id%'
        AND pg_get_expr(p.polqual,p.polrelid) ILIKE '%my_student_id%'
    ), 'student grade reads are ownership-scoped';

  RETURN QUERY SELECT 'D-04',
    EXISTS (
      SELECT 1 FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid
      WHERE t.relname='workflow_requests'
        AND pg_get_constraintdef(c.oid) ILIKE '%approved_by%'
        AND pg_get_constraintdef(c.oid) ILIKE '%created_by%'
    ), 'self-approval is structurally denied';

  SELECT pg_get_functiondef(p.oid) INTO v_def
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.proname='grade_sheet_transition_guard';
  RETURN QUERY SELECT 'D-05',
    v_def ILIKE '%invalid grade sheet state transition%'
    AND v_def ILIKE '%OLD.state=''submitted''%'
    AND v_def ILIKE '%NEW.state=''reviewed''%',
    'grade workflow transition guard is installed';

  SELECT pg_get_functiondef(p.oid) INTO v_def
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.proname='audit_logs_hash_chain';
  RETURN QUERY SELECT 'D-06',
    v_def ILIKE '%pg_advisory_xact_lock%'
    AND v_def ILIKE '%ORDER BY id DESC LIMIT 1%',
    'audit hash generation uses transaction advisory locking';

  BEGIN
    INSERT INTO public.audit_logs(actor_user_id,event_type,entity_table,entity_id,before_data,after_data,metadata,created_at,entity_ref)
    VALUES (NULL,'phase_d_test','security_test','d-1','{}'::jsonb,'{}'::jsonb,'{"test":true}'::jsonb,now(),'D-1')
    RETURNING event_hash INTO v_first;
    INSERT INTO public.audit_logs(actor_user_id,event_type,entity_table,entity_id,before_data,after_data,metadata,created_at,entity_ref)
    VALUES (NULL,'phase_d_test','security_test','d-2','{}'::jsonb,'{}'::jsonb,'{"test":true}'::jsonb,now(),'D-2')
    RETURNING previous_hash INTO v_second;
    v_ok := v_first IS NOT NULL AND v_second = v_first;
    RAISE EXCEPTION 'PHASE_D_ROLLBACK';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM <> 'PHASE_D_ROLLBACK' THEN v_ok := false; END IF;
  END;
  RETURN QUERY SELECT 'D-07', v_ok, 'audit hash chain links each event to the previous event';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.security_test_phase_d() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.security_test_phase_d() TO postgres, service_role;
