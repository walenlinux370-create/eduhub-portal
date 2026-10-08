REVOKE EXECUTE ON FUNCTION public.admin_audit_logs(text,text,text,timestamptz,timestamptz,text,integer,integer) FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.approve_registration(uuid,uuid,text,text,uuid) FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.calculate_grade_final(uuid) FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.current_role() FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.is_teacher_assigned(uuid,uuid,smallint) FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.issue_student_auth_code(uuid,uuid) FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.my_student_id() FROM authenticated, anon;
