-- EDTECH v2.5: security boundary hardening
-- Enforces server-derived grade identity/final grade, curriculum compatibility,
-- teacher scope, safer material RLS and least-privilege function execution.

create or replace function public.subject_matches_class(p_subject uuid,p_class uuid)
returns boolean
language sql stable security definer
set search_path=public,pg_temp
as $$
  select exists(
    select 1
    from public.subjects s
    join public.classes c on c.id=p_class
    where s.id=p_subject and c.level between s.min_level and s.max_level
  )
$$;

revoke all on function public.subject_matches_class(uuid,uuid) from public,anon;
grant execute on function public.subject_matches_class(uuid,uuid) to authenticated;

create or replace function public.calculate_final_grade(p_scores jsonb)
returns numeric
language plpgsql immutable
set search_path=public,pg_temp
as $$
declare
  result numeric;
begin
  if p_scores is null or jsonb_typeof(p_scores) <> 'object' then
    return 0;
  end if;
  if exists (
    select 1 from jsonb_each_text(p_scores) e
    where e.value !~ '^([0-9]+([.][0-9]+)?|[.][0-9]+)$'
       or (e.value)::numeric < 0
       or (e.value)::numeric > 20
  ) then
    raise exception 'invalid_component_score';
  end if;
  select avg((value)::numeric) into result from jsonb_each_text(p_scores);
  return round(least(20,greatest(0,coalesce(result,0))),2);
end $$;

revoke all on function public.calculate_final_grade(jsonb) from public,anon,authenticated;

create or replace function public.grade_guard()
returns trigger
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare
  assignment_teacher uuid;
begin
  if not public.subject_matches_class(new.subject_id,new.class_id) then
    raise exception 'subject_class_mismatch';
  end if;

  select teacher_id into assignment_teacher
  from public.teacher_assignments
  where subject_id=new.subject_id
    and class_id=new.class_id
    and academic_year=new.academic_year;

  if assignment_teacher is null then
    raise exception 'invalid_assignment';
  end if;

  if tg_op='UPDATE' and (
    new.student_id<>old.student_id
    or new.subject_id<>old.subject_id
    or new.class_id<>old.class_id
    or new.trimester<>old.trimester
    or new.academic_year<>old.academic_year
    or new.teacher_id<>old.teacher_id
  ) then
    raise exception 'grade_identity_immutable';
  end if;

  if not exists(
    select 1 from public.students s
    where s.id=new.student_id
      and s.class_id=new.class_id
      and s.status='active'
  ) then
    raise exception 'student_class_mismatch';
  end if;

  new.teacher_id:=assignment_teacher;
  new.final_grade:=public.calculate_final_grade(new.component_scores);

  if new.state='published' and old.state is distinct from 'published' then
    new.published_at:=now();
  elsif new.state='draft' then
    new.published_at:=null;
  end if;

  if tg_op='UPDATE' and old.state='published' then
    insert into public.audit_logs(
      actor_user_id,event_type,entity_table,entity_id,before_data,after_data
    ) values(
      auth.uid(),'grade_published_edit','grades',new.id::text,to_jsonb(old),to_jsonb(new)
    );
  end if;

  return new;
end $$;

drop trigger if exists grades_guard on public.grades;
create trigger grades_guard
before insert or update on public.grades
for each row execute function public.grade_guard();

revoke all on function public.grade_guard() from public,anon,authenticated;

-- Teachers must only be able to write records belonging to their actual allocation.
drop policy if exists grades_teacher_insert on public.grades;
create policy grades_teacher_insert on public.grades
for insert to authenticated
with check (
  public.current_role()='admin'
  or (
    public.current_role()='teacher'
    and public.is_teacher_assigned(class_id,subject_id,academic_year)
    and exists(
      select 1 from public.teacher_assignments a
      where a.teacher_id=auth.uid()
        and a.class_id=grades.class_id
        and a.subject_id=grades.subject_id
        and a.academic_year=grades.academic_year
    )
    and exists(
      select 1 from public.students s
      where s.id=student_id and s.class_id=grades.class_id and s.status='active'
    )
  )
);

drop policy if exists grades_teacher_update on public.grades;
create policy grades_teacher_update on public.grades
for update to authenticated
using (
  public.current_role()='admin'
  or (
    public.current_role()='teacher'
    and public.is_teacher_assigned(class_id,subject_id,academic_year)
  )
)
with check (
  public.current_role()='admin'
  or (
    public.current_role()='teacher'
    and public.is_teacher_assigned(class_id,subject_id,academic_year)
  )
);

-- Fix the old incorrect student-material predicate and keep access class-scoped.
drop policy if exists materials_teacher_select on public.materials;
drop policy if exists materials_read on public.materials;
create policy materials_read on public.materials
for select to authenticated
using (
  public.current_role()='admin'
  or class_id=(select s.class_id from public.students s where s.user_id=auth.uid() and s.status='active')
  or exists(
    select 1 from public.teacher_assignments a
    where a.teacher_id=auth.uid()
      and a.class_id=materials.class_id
      and a.subject_id=materials.subject_id
  )
);

-- Schedule reads are likewise constrained to the student's class or assigned teacher.
drop policy if exists schedules_read on public.schedules;
create policy schedules_read on public.schedules
for select to authenticated
using (
  public.current_role()='admin'
  or class_id=(select s.class_id from public.students s where s.user_id=auth.uid() and s.status='active')
  or exists(
    select 1 from public.teacher_assignments a
    where a.teacher_id=auth.uid()
      and a.class_id=schedules.class_id
      and a.subject_id=schedules.subject_id
  )
);

-- No client role can ever mutate identity/security fields.
revoke update on public.user_profiles from authenticated;
revoke update on public.students from authenticated;
revoke update on public.teacher_assignments from authenticated;
revoke delete on public.teacher_assignments,public.students,public.user_profiles from authenticated;

-- Sensitive functions are callable only by the server-side service role,
-- except final-grade calculation is now entirely trigger-driven.
revoke all on function public.set_final_grade(uuid) from public,anon,authenticated;
grant execute on function public.verify_student_login(text,text,inet) to service_role;
grant execute on function public.issue_student_auth_code(uuid,uuid) to service_role;

-- Security-definer functions must not search writable schemas.
alter function public.current_role() set search_path=public,pg_temp;
alter function public.my_student_id() set search_path=public,pg_temp;
alter function public.is_teacher_assigned(uuid,uuid,smallint) set search_path=public,pg_temp;
alter function public.verify_student_login(text,text,inet) set search_path=public,extensions,pg_temp;
alter function public.issue_student_auth_code(uuid,uuid) set search_path=public,extensions,pg_temp;
alter function public.set_final_grade(uuid) set search_path=public,pg_temp;

-- Keep the audit table immutable even for service_role calls: the trigger remains
-- authoritative at the database boundary.
drop trigger if exists audit_no_update on public.audit_logs;
create trigger audit_no_update
before update or delete on public.audit_logs
for each row execute function public.audit_immutable();
