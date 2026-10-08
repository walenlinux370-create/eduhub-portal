-- EDTECH v2.9.1: require MFA for administrative grade calculation
create or replace function public.calculate_grade_final(p_grade_id uuid)
returns numeric
language plpgsql
security definer
set search_path=public
as $$
declare g public.grades%rowtype; result numeric; role_now public.app_role;
begin
  role_now := public.current_role();
  if role_now not in ('teacher','admin') then raise exception 'forbidden'; end if;
  if role_now='admin' and (select auth.jwt()->>'aal') <> 'aal2' then raise exception 'mfa_required'; end if;

  select * into g from public.grades where id=p_grade_id;
  if g.id is null then raise exception 'not_found'; end if;
  if role_now='teacher' and not public.is_teacher_assigned(g.class_id,g.subject_id,g.academic_year) then raise exception 'forbidden'; end if;

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
