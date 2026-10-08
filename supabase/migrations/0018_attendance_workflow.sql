-- EDTECH v3.1: secure attendance workflow, teacher scope and audit
create or replace function public.attendance_guard()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare assignment_teacher uuid;
begin
  if new.subject_id is null then
    raise exception 'attendance_subject_required';
  end if;

  if tg_op='UPDATE' and (
    new.student_id is distinct from old.student_id
    or new.class_id is distinct from old.class_id
    or new.subject_id is distinct from old.subject_id
    or new.attendance_date is distinct from old.attendance_date
  ) then
    raise exception 'attendance_identity_immutable';
  end if;

  if not exists (
    select 1 from public.students s
    where s.id=new.student_id
      and s.class_id=new.class_id
      and s.status='active'
  ) then
    raise exception 'invalid_attendance_student';
  end if;

  select teacher_id into assignment_teacher
  from public.teacher_assignments
  where subject_id=new.subject_id
    and class_id=new.class_id
    and academic_year=(select academic_year from public.classes where id=new.class_id)
  limit 1;

  if assignment_teacher is null then
    raise exception 'invalid_assignment';
  end if;

  new.teacher_id := assignment_teacher;
  return new;
end $$;

drop trigger if exists attendance_guard on public.attendance;
create trigger attendance_guard
before insert or update on public.attendance
for each row execute function public.attendance_guard();

create or replace function public.audit_attendance_change()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  if tg_op='INSERT' then
    insert into public.audit_logs(actor_user_id,event_type,entity_table,entity_id,after_data)
    values(auth.uid(),'attendance_created','attendance',new.id::text,to_jsonb(new));
    return new;
  elsif tg_op='UPDATE' then
    insert into public.audit_logs(actor_user_id,event_type,entity_table,entity_id,before_data,after_data)
    values(auth.uid(),'attendance_updated','attendance',new.id::text,to_jsonb(old),to_jsonb(new));
    return new;
  elsif tg_op='DELETE' then
    insert into public.audit_logs(actor_user_id,event_type,entity_table,entity_id,before_data)
    values(auth.uid(),'attendance_deleted','attendance',old.id::text,to_jsonb(old));
    return old;
  end if;
  return null;
end $$;

drop trigger if exists attendance_audit on public.attendance;
create trigger attendance_audit
after insert or update or delete on public.attendance
for each row execute function public.audit_attendance_change();

create index if not exists attendance_scope_idx
on public.attendance(class_id,subject_id,attendance_date,student_id);

drop policy if exists attendance_teacher_select on public.attendance;
create policy attendance_teacher_select on public.attendance
for select to authenticated
using (
  public.current_role()='admin'
  or (
    public.current_role()='teacher'
    and teacher_id=auth.uid()
    and public.is_teacher_assigned(
      class_id,
      subject_id,
      (select academic_year from public.classes where id=attendance.class_id)
    )
  )
);

drop policy if exists attendance_teacher_insert on public.attendance;
create policy attendance_teacher_insert on public.attendance
for insert to authenticated
with check (
  public.current_role()='teacher'
  and public.is_teacher_assigned(
    class_id,
    subject_id,
    (select academic_year from public.classes where id=attendance.class_id)
  )
);

drop policy if exists attendance_teacher_update on public.attendance;
create policy attendance_teacher_update on public.attendance
for update to authenticated
using (
  public.current_role()='teacher'
  and teacher_id=auth.uid()
  and public.is_teacher_assigned(
    class_id,
    subject_id,
    (select academic_year from public.classes where id=attendance.class_id)
  )
)
with check (
  public.current_role()='teacher'
  and public.is_teacher_assigned(
    class_id,
    subject_id,
    (select academic_year from public.classes where id=attendance.class_id)
  )
);

revoke delete on public.attendance from authenticated;

drop policy if exists attendance_admin_aal2 on public.attendance;
create policy attendance_admin_aal2 on public.attendance
for all to authenticated
using(public.current_role()='admin' and (select auth.jwt()->>'aal')='aal2')
with check(public.current_role()='admin' and (select auth.jwt()->>'aal')='aal2');

grant select,insert,update,delete on public.attendance to authenticated;
