-- EDTECH v2.9: grade workflow, validation and publication controls

create or replace function public.grade_workflow_guard()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare role_now public.app_role;
begin
  role_now := public.current_role();

  if role_now is null then raise exception 'forbidden'; end if;

  if tg_op='UPDATE' and old.state='published' and role_now='teacher' then
    raise exception 'published_grade_locked';
  end if;

  if new.final_grade is not null and (new.final_grade < 0 or new.final_grade > 20) then
    raise exception 'grade_out_of_range';
  end if;

  if jsonb_typeof(new.component_scores) <> 'object' then
    raise exception 'invalid_component_scores';
  end if;

  if new.state='published' and role_now='teacher'
     and not public.is_teacher_assigned(new.class_id,new.subject_id,new.academic_year) then
    raise exception 'forbidden';
  end if;

  return new;
end $$;

drop trigger if exists grades_workflow_guard on public.grades;
create trigger grades_workflow_guard
before insert or update on public.grades
for each row execute function public.grade_workflow_guard();

create or replace function public.calculate_grade_final(p_grade_id uuid)
returns numeric
language plpgsql
security definer
set search_path=public
as $$
declare g public.grades%rowtype; result numeric;
begin
  select * into g from public.grades where id=p_grade_id;
  if g.id is null then raise exception 'not_found'; end if;
  if public.current_role() not in ('teacher','admin') then raise exception 'forbidden'; end if;
  if public.current_role()='teacher' and not public.is_teacher_assigned(g.class_id,g.subject_id,g.academic_year) then raise exception 'forbidden'; end if;

  result := least(20,greatest(0,coalesce(
    (select avg((value)::numeric)
     from jsonb_each_text(g.component_scores)
     where value ~ '^[0-9]+(\\.[0-9]+)?$'),0)));

  update public.grades set final_grade=result where id=p_grade_id;
  insert into public.audit_logs(actor_user_id,event_type,entity_table,entity_id,after_data,metadata)
  values(auth.uid(),'grade_final_calculated','grades',p_grade_id::text,
         jsonb_build_object('final_grade',result),
         jsonb_build_object('source','calculate_grade_final'));
  return result;
end $$;

revoke execute on function public.calculate_grade_final(uuid) from public,anon;
grant execute on function public.calculate_grade_final(uuid) to authenticated;

create index if not exists grades_scope_idx
on public.grades(class_id,subject_id,academic_year,trimester,state);

drop policy if exists grades_admin_manage on public.grades;
create policy grades_admin_manage on public.grades
for all to authenticated
using(public.current_role()='admin' and (select auth.jwt()->>'aal')='aal2')
with check(public.current_role()='admin' and (select auth.jwt()->>'aal')='aal2');
