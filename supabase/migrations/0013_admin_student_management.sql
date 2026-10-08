-- EDTECH v2.9: administrator enrollment approval + student access code
create or replace function public.approve_registration(
  p_request_id uuid,
  p_class_id uuid,
  p_registration_number text,
  p_email text default null,
  p_actor uuid default auth.uid()
)
returns uuid
language plpgsql
security definer
set search_path=public,extensions
as $$
declare
  r public.registration_requests%rowtype;
  new_student uuid;
  class_level smallint;
begin
  if p_actor <> auth.uid()
     or public.current_role() <> 'admin'
     or (select auth.jwt()->>'aal') <> 'aal2' then
    raise exception 'forbidden';
  end if;

  select * into r from public.registration_requests
  where id=p_request_id and status='pending'
  for update;
  if r.id is null then raise exception 'request_not_found'; end if;

  select level into class_level from public.classes where id=p_class_id;
  if class_level is null or class_level<>r.class_level then raise exception 'invalid_class'; end if;

  if exists(select 1 from public.students where registration_number=trim(p_registration_number)) then
    raise exception 'registration_number_exists';
  end if;

  insert into public.students(
    full_name,registration_number,email,contact,guardian_name,guardian_contact,class_id,status
  ) values(
    r.full_name,trim(p_registration_number),nullif(trim(p_email),''),
    r.contact,r.guardian_name,r.guardian_contact,p_class_id,'pending'
  ) returning id into new_student;

  update public.registration_requests set status='approved' where id=r.id;

  insert into public.audit_logs(actor_user_id,event_type,entity_table,entity_id,after_data,metadata)
  values(p_actor,'registration_approved','registration_requests',r.id::text,
    jsonb_build_object('student_id',new_student,'class_id',p_class_id),
    jsonb_build_object('registration_number',trim(p_registration_number)));

  return new_student;
end $$;

revoke all on function public.approve_registration(uuid,uuid,text,text,uuid) from public,anon;
grant execute on function public.approve_registration(uuid,uuid,text,text,uuid) to authenticated;

create or replace function public.issue_student_auth_code(p_student_id uuid,p_actor uuid default auth.uid())
returns text language plpgsql security definer set search_path=public,extensions as $$
declare
  chars text:='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  code text:='';
  i int;
begin
  if p_actor <> auth.uid()
     or public.current_role() <> 'admin'
     or (select auth.jwt()->>'aal') <> 'aal2' then
    raise exception 'forbidden';
  end if;

  if not exists(select 1 from public.students where id=p_student_id and status in ('pending','active')) then
    raise exception 'student_not_eligible';
  end if;

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

revoke all on function public.issue_student_auth_code(uuid,uuid) from public,anon;
grant execute on function public.issue_student_auth_code(uuid,uuid) to authenticated;
