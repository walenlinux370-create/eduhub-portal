-- EDTECH v3.1: Supabase security advisor hardening
-- Keep SECURITY DEFINER functions callable only by roles that actually need them.
alter function public.cms_video_url(text) set search_path=pg_catalog,public,extensions,pg_temp;

revoke execute on function public.cms_video_url(text) from public,anon,authenticated;
revoke execute on function public.attendance_guard() from public,anon,authenticated;
revoke execute on function public.audit_attendance_change() from public,anon,authenticated;
revoke execute on function public.audit_material_change() from public,anon,authenticated;
revoke execute on function public.grade_workflow_guard() from public,anon,authenticated;
revoke execute on function public.material_guard() from public,anon,authenticated;
revoke execute on function public.subject_matches_class(uuid,uuid) from public,anon,authenticated;
revoke execute on function public.current_role() from public,anon;
revoke execute on function public.my_student_id() from public,anon;
revoke execute on function public.is_teacher_assigned(uuid,uuid,smallint) from public,anon;

-- Internal security tables are intentionally unreachable through the Data API.
create policy student_login_attempts_deny on public.student_login_attempts
for all to anon,authenticated using (false) with check (false);
create policy admin_notifications_deny on public.admin_notifications
for all to anon,authenticated using (false) with check (false);
create policy public_rate_limits_deny on public.public_rate_limits
for all to anon,authenticated using (false) with check (false);

-- Prevent newly created public functions from becoming callable by signed-out clients.
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon;

-- Existing application-facing helper functions retain only the privileges
-- required by their RLS policies or authenticated admin workflows.
grant execute on function public.current_role() to authenticated;
grant execute on function public.my_student_id() to authenticated;
grant execute on function public.is_teacher_assigned(uuid,uuid,smallint) to authenticated;
