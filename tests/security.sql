begin;
select plan(20);

select ok((select relrowsecurity from pg_class where oid='public.students'::regclass),'students RLS ativo');
select ok((select relrowsecurity from pg_class where oid='public.grades'::regclass),'grades RLS ativo');
select ok((select relrowsecurity from pg_class where oid='public.audit_logs'::regclass),'audit_logs RLS ativo');
select ok(not has_table_privilege('anon','public.students','SELECT'),'anon não lê students');
select ok(not has_table_privilege('anon','public.grades','SELECT'),'anon não lê grades');
select ok(not has_table_privilege('authenticated','public.audit_logs','SELECT'),'authenticated não lê audit_logs');
select ok(not has_function_privilege('anon','public.verify_student_login(text,text,inet)','EXECUTE'),'anon não executa login interno');
select ok(not has_function_privilege('authenticated','public.issue_student_auth_code(uuid,uuid)','EXECUTE'),'authenticated não emite códigos');
select ok(not has_function_privilege('authenticated','public.set_final_grade(uuid)','EXECUTE'),'cliente não calcula/altera nota final');
select ok(not has_table_privilege('authenticated','public.students','UPDATE'),'authenticated não altera students diretamente');
select ok(not has_table_privilege('authenticated','public.user_profiles','UPDATE'),'authenticated não altera role/email/estado de perfil');
select ok(not has_table_privilege('authenticated','public.audit_logs','DELETE'),'authenticated não apaga auditoria');
select ok(not has_table_privilege('authenticated','public.audit_logs','UPDATE'),'authenticated não altera auditoria');
select ok(exists(select 1 from pg_trigger where tgname='audit_no_update'),'trigger de imutabilidade da auditoria existe');
select ok(exists(select 1 from pg_trigger where tgname='grades_guard'),'trigger de integridade das notas existe');
select ok(has_function_privilege('service_role','public.verify_student_login(text,text,inet)','EXECUTE'),'service_role executa verificação server-side');
select ok(has_function_privilege('service_role','public.issue_student_auth_code(uuid,uuid)','EXECUTE'),'service_role emite código server-side');
select ok((select prosecdef from pg_proc where oid='public.verify_student_login(text,text,inet)'::regprocedure),'login é SECURITY DEFINER');
select ok((select relrowsecurity from pg_class where oid='public.public_rate_limits'::regclass),'rate limit RLS ativo');
select ok(not has_function_privilege('authenticated','public.check_public_rate_limit(text,text,integer,integer)','EXECUTE'),'rate limit só é executável pelo servidor');

select * from finish();
rollback;
