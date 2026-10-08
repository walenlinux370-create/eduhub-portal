-- EDTECH v2.8: admin panel database boundary
-- All privileged admin access requires an authenticated AAL2 session.

do $$
declare
  t text;
begin
  foreach t in array array[
    'students',
    'registration_requests',
    'attendance',
    'schedules',
    'materials'
  ] loop
    execute format('drop policy if exists admin_aal2_manage on public.%I', t);
    execute format(
      'create policy admin_aal2_manage on public.%I as restrictive for all to authenticated
       using (public.current_role() = ''admin'' and (select auth.jwt()->>''aal'') = ''aal2'')
       with check (public.current_role() = ''admin'' and (select auth.jwt()->>''aal'') = ''aal2'')',
      t
    );
  end loop;
end $$;

drop policy if exists audit_logs_admin_read on public.audit_logs;
create policy audit_logs_admin_read on public.audit_logs
for select to authenticated
using (public.current_role() = 'admin' and (select auth.jwt()->>'aal') = 'aal2');

grant select, insert, update, delete on public.students, public.registration_requests, public.attendance, public.schedules, public.materials to authenticated;
grant select on public.audit_logs to authenticated;

create or replace function public.issue_student_auth_code(p_student_id uuid,p_actor uuid)
returns text language plpgsql security definer set search_path=public,extensions as $$
declare
  chars text:='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  code text:='';
  i int;
  student_user uuid;
begin
  if p_actor <> auth.uid()
     or public.current_role() <> 'admin'
     or (select auth.jwt()->>'aal') <> 'aal2' then
    raise exception 'forbidden';
  end if;

  select user_id into student_user
  from public.students
  where id=p_student_id and status in ('pending','active');

  if student_user is null then raise exception 'student_not_eligible'; end if;

  for i in 1..12 loop
    code:=code||substr(chars,1+(get_byte(gen_random_bytes(1),0)%length(chars)),1);
  end loop;

  update public.students
  set auth_code_hash=crypt(code,gen_salt('bf',12)),
      auth_code_issued_at=now(),
      failed_code_attempts=0,
      locked_until=null,
      status='active'
  where id=p_student_id;

  insert into public.audit_logs(actor_user_id,event_type,entity_table,entity_id,metadata)
  values(auth.uid(),'student_auth_code_issued','students',p_student_id::text,jsonb_build_object('issued_at',now()));

  return code;
end $$;

revoke execute on function public.issue_student_auth_code(uuid,uuid) from public,anon,authenticated;
grant execute on function public.issue_student_auth_code(uuid,uuid) to authenticated;
