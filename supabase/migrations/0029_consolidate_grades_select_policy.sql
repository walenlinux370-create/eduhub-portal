-- 0029: consolidate grades SELECT policies while preserving admin/teacher/student scope.
begin;
drop policy if exists grades_admin_manage on public.grades;
drop policy if exists grades_admin_insert on public.grades;
drop policy if exists grades_admin_update on public.grades;
drop policy if exists grades_admin_delete on public.grades;
drop policy if exists grades_authenticated_select on public.grades;

create policy grades_admin_insert on public.grades for insert to authenticated
with check ((select public."current_role"())='admin'::app_role and (select auth.jwt()->>'aal')='aal2');
create policy grades_admin_update on public.grades for update to authenticated
using ((select public."current_role"())='admin'::app_role and (select auth.jwt()->>'aal')='aal2')
with check ((select public."current_role"())='admin'::app_role and (select auth.jwt()->>'aal')='aal2');
create policy grades_admin_delete on public.grades for delete to authenticated
using ((select public."current_role"())='admin'::app_role and (select auth.jwt()->>'aal')='aal2');
create policy grades_authenticated_select on public.grades for select to authenticated
using (((select public."current_role"())='admin'::app_role and (select auth.jwt()->>'aal')='aal2') or (student_id=(select public.my_student_id()) and state='published'::grade_state) or ((select public."current_role"())='teacher'::app_role and (select public.is_teacher_assigned(class_id,subject_id,academic_year))));
drop policy if exists grades_student_published on public.grades;
drop policy if exists grades_teacher_select on public.grades;
commit;