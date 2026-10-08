-- 0028: cache teacher-scope helper calls during each RLS statement.
begin;
alter policy attendance_teacher_select on public.attendance
using ((select public."current_role"())='teacher'::app_role and teacher_id=(select auth.uid()) and (select public.is_teacher_assigned(class_id,subject_id,(select classes.academic_year from public.classes where classes.id=attendance.class_id))));
alter policy attendance_teacher_update on public.attendance
using ((select public."current_role"())='teacher'::app_role and teacher_id=(select auth.uid()) and (select public.is_teacher_assigned(class_id,subject_id,(select classes.academic_year from public.classes where classes.id=attendance.class_id))))
with check ((select public."current_role"())='teacher'::app_role and (select public.is_teacher_assigned(class_id,subject_id,(select classes.academic_year from public.classes where classes.id=attendance.class_id))));
alter policy grades_teacher_insert on public.grades
with check ((select public."current_role"())='admin'::app_role or ((select public."current_role"())='teacher'::app_role and (select public.is_teacher_assigned(class_id,subject_id,academic_year)) and exists(select 1 from public.teacher_assignments a where a.teacher_id=(select auth.uid()) and a.class_id=grades.class_id and a.subject_id=grades.subject_id and a.academic_year=grades.academic_year) and exists(select 1 from public.students s where s.id=grades.student_id and s.class_id=grades.class_id and s.status='active'::account_status)));
commit;