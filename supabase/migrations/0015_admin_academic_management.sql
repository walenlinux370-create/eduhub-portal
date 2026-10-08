-- EDTECH v2.8: academic administration (classes, subjects, teachers)
-- All writes remain protected by admin + AAL2 RLS.

drop policy if exists user_profiles_admin_read on public.user_profiles;
create policy user_profiles_admin_read on public.user_profiles
for select to authenticated
using (
  public.current_role()='admin'
  and (select auth.jwt()->>'aal')='aal2'
);

grant select on public.user_profiles to authenticated;

create or replace function public.validate_academic_assignment()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  c public.classes%rowtype;
  s public.subjects%rowtype;
  t public.user_profiles%rowtype;
begin
  select * into c from public.classes where id=new.class_id;
  if c.id is null then raise exception 'class_not_found'; end if;

  select * into s from public.subjects where id=new.subject_id;
  if s.id is null then raise exception 'subject_not_found'; end if;

  select * into t from public.user_profiles where id=new.teacher_id and role='teacher' and is_active=true;
  if t.id is null then raise exception 'teacher_not_found'; end if;

  if c.level < s.min_level or c.level > s.max_level then
    raise exception 'subject_level_mismatch';
  end if;

  if new.academic_year <> c.academic_year then
    raise exception 'academic_year_mismatch';
  end if;

  return new;
end $$;

drop trigger if exists teacher_assignment_validate on public.teacher_assignments;
create trigger teacher_assignment_validate
before insert or update on public.teacher_assignments
for each row execute function public.validate_academic_assignment();

create or replace function public.audit_academic_change()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  insert into public.audit_logs(
    actor_user_id,event_type,entity_table,entity_id,before_data,after_data,metadata
  )
  values(
    auth.uid(),
    lower(tg_op)||'_academic_record',
    tg_table_name,
    coalesce(new.id,old.id)::text,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end,
    jsonb_build_object('source','admin_academic_management')
  );
  return coalesce(new,old);
end $$;

drop trigger if exists classes_audit on public.classes;
create trigger classes_audit after insert or update or delete on public.classes
for each row execute function public.audit_academic_change();

drop trigger if exists subjects_audit on public.subjects;
create trigger subjects_audit after insert or update or delete on public.subjects
for each row execute function public.audit_academic_change();

drop trigger if exists teacher_assignments_audit on public.teacher_assignments;
create trigger teacher_assignments_audit after insert or update or delete on public.teacher_assignments
for each row execute function public.audit_academic_change();

revoke execute on function public.validate_academic_assignment() from public,anon,authenticated;
revoke execute on function public.audit_academic_change() from public,anon,authenticated;
