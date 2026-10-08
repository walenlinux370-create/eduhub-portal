-- EDTECH v3.0: permissive admin policies paired with restrictive AAL2 boundary
do $$
declare t text;
begin
 foreach t in array array['students','registration_requests','attendance','schedules','materials'] loop
   execute format('drop policy if exists admin_aal2_access on public.%I',t);
   execute format('create policy admin_aal2_access on public.%I for all to authenticated using(public.current_role()=''admin'') with check(public.current_role()=''admin'')',t);
 end loop;
end $$;

grant select,insert,update,delete on public.students,public.registration_requests,public.attendance,public.schedules,public.materials to authenticated;
