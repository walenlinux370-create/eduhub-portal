-- 0025: RLS auth init-plan optimization
-- Wrap row-independent auth/helper calls in SELECT subqueries so PostgreSQL
-- can evaluate them once per statement instead of once per row.

begin;

drop policy if exists user_profiles_self on public.user_profiles;
create policy user_profiles_self on public.user_profiles
for select to authenticated
using (id = (select auth.uid()));

drop policy if exists student_self on public.students;
create policy student_self on public.students
for select to authenticated
using (user_id = (select auth.uid()) and status = 'active'::account_status);

drop policy if exists teacher_assignments_self_read on public.teacher_assignments;
create policy teacher_assignments_self_read on public.teacher_assignments
for select to authenticated
using (
  (select public."current_role"()) = 'admin'::app_role
  or teacher_id = (select auth.uid())
);

drop policy if exists attendance_student on public.attendance;
create policy attendance_student on public.attendance
for select to authenticated
using (student_id = (select public.my_student_id()));

drop policy if exists grades_student_published on public.grades;
create policy grades_student_published on public.grades
for select to authenticated
using (
  student_id = (select public.my_student_id())
  and state = 'published'::grade_state
);

commit;
