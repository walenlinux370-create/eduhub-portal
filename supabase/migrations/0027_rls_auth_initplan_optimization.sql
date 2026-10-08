-- 0027: optimize RLS auth/helper evaluation.
-- Wrap stable auth/helper calls in SELECT so PostgreSQL can initialize them once
-- per statement instead of re-evaluating them for every row.

begin;

alter policy user_profiles_admin_read on public.user_profiles
  using ((select public."current_role"()) = 'admin'::app_role and (select auth.jwt() ->> 'aal') = 'aal2');

alter policy classes_admin_manage on public.classes
  using ((select public."current_role"()) = 'admin'::app_role and (select auth.jwt() ->> 'aal') = 'aal2')
  with check ((select public."current_role"()) = 'admin'::app_role and (select auth.jwt() ->> 'aal') = 'aal2');

alter policy admin_aal2_manage on public.students
  using ((select public."current_role"()) = 'admin'::app_role and (select auth.jwt() ->> 'aal') = 'aal2')
  with check ((select public."current_role"()) = 'admin'::app_role and (select auth.jwt() ->> 'aal') = 'aal2');

alter policy admin_aal2_manage on public.registration_requests
  using ((select public."current_role"()) = 'admin'::app_role and (select auth.jwt() ->> 'aal') = 'aal2')
  with check ((select public."current_role"()) = 'admin'::app_role and (select auth.jwt() ->> 'aal') = 'aal2');

alter policy subjects_admin_manage on public.subjects
  using ((select public."current_role"()) = 'admin'::app_role and (select auth.jwt() ->> 'aal') = 'aal2')
  with check ((select public."current_role"()) = 'admin'::app_role and (select auth.jwt() ->> 'aal') = 'aal2');

alter policy teacher_assignments_admin_manage on public.teacher_assignments
  using ((select public."current_role"()) = 'admin'::app_role and (select auth.jwt() ->> 'aal') = 'aal2')
  with check ((select public."current_role"()) = 'admin'::app_role and (select auth.jwt() ->> 'aal') = 'aal2');

alter policy grades_admin_manage on public.grades
  using ((select public."current_role"()) = 'admin'::app_role and (select auth.jwt() ->> 'aal') = 'aal2')
  with check ((select public."current_role"()) = 'admin'::app_role and (select auth.jwt() ->> 'aal') = 'aal2');

alter policy grades_teacher_insert on public.grades
  with check (
    (select public."current_role"()) = 'admin'::app_role
    or (
      (select public."current_role"()) = 'teacher'::app_role
      and public.is_teacher_assigned(class_id, subject_id, academic_year)
      and exists (
        select 1 from public.teacher_assignments a
        where a.teacher_id = (select auth.uid())
          and a.class_id = grades.class_id
          and a.subject_id = grades.subject_id
          and a.academic_year = grades.academic_year
      )
      and exists (
        select 1 from public.students s
        where s.id = grades.student_id
          and s.class_id = grades.class_id
          and s.status = 'active'::account_status
      )
    )
  );

alter policy admin_aal2_manage on public.attendance
  using ((select public."current_role"()) = 'admin'::app_role and (select auth.jwt() ->> 'aal') = 'aal2')
  with check ((select public."current_role"()) = 'admin'::app_role and (select auth.jwt() ->> 'aal') = 'aal2');

alter policy attendance_teacher_select on public.attendance
  using (
    (select public."current_role"()) = 'teacher'::app_role
    and teacher_id = (select auth.uid())
    and public.is_teacher_assigned(class_id, subject_id, (select classes.academic_year from public.classes where classes.id = attendance.class_id))
  );

alter policy attendance_teacher_update on public.attendance
  using (
    (select public."current_role"()) = 'teacher'::app_role
    and teacher_id = (select auth.uid())
    and public.is_teacher_assigned(class_id, subject_id, (select classes.academic_year from public.classes where classes.id = attendance.class_id))
  )
  with check (
    (select public."current_role"()) = 'teacher'::app_role
    and public.is_teacher_assigned(class_id, subject_id, (select classes.academic_year from public.classes where classes.id = attendance.class_id))
  );

alter policy admin_aal2_manage on public.schedules
  using ((select public."current_role"()) = 'admin'::app_role and (select auth.jwt() ->> 'aal') = 'aal2')
  with check ((select public."current_role"()) = 'admin'::app_role and (select auth.jwt() ->> 'aal') = 'aal2');

alter policy schedules_read on public.schedules
  using (
    (select public."current_role"()) = 'admin'::app_role
    or class_id = (select s.class_id from public.students s where s.user_id = (select auth.uid()) and s.status = 'active'::account_status)
    or exists (
      select 1 from public.teacher_assignments a
      where a.teacher_id = (select auth.uid())
        and a.class_id = schedules.class_id
        and a.subject_id = schedules.subject_id
    )
  );

alter policy admin_aal2_manage on public.materials
  using ((select public."current_role"()) = 'admin'::app_role and (select auth.jwt() ->> 'aal') = 'aal2')
  with check ((select public."current_role"()) = 'admin'::app_role and (select auth.jwt() ->> 'aal') = 'aal2');

alter policy materials_read on public.materials
  using (
    (select public."current_role"()) = 'admin'::app_role
    or class_id = (select s.class_id from public.students s where s.user_id = (select auth.uid()) and s.status = 'active'::account_status)
    or exists (
      select 1 from public.teacher_assignments a
      where a.teacher_id = (select auth.uid())
        and a.class_id = materials.class_id
        and a.subject_id = materials.subject_id
    )
  );

alter policy news_admin_aal2 on public.news
  using ((select public."current_role"()) = 'admin'::app_role and (select auth.jwt() ->> 'aal') = 'aal2')
  with check ((select public."current_role"()) = 'admin'::app_role and (select auth.jwt() ->> 'aal') = 'aal2');

alter policy audit_logs_admin_read on public.audit_logs
  using ((select public."current_role"()) = 'admin'::app_role and (select auth.jwt() ->> 'aal') = 'aal2');

commit;
