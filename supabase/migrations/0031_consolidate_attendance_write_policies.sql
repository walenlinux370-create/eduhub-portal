begin;

drop policy if exists attendance_admin_insert on public.attendance;
drop policy if exists attendance_teacher_insert on public.attendance;

create policy attendance_authenticated_insert
on public.attendance for insert to authenticated
with check (
  (
    (select public."current_role"()) = 'admin'::app_role
    and (select auth.jwt()->>'aal') = 'aal2'
  )
  or
  (
    (select public."current_role"()) = 'teacher'::app_role
    and (select public.is_teacher_assigned(
      class_id,
      subject_id,
      (select classes.academic_year from public.classes where classes.id = attendance.class_id)
    ))
  )
);

drop policy if exists attendance_admin_update on public.attendance;
drop policy if exists attendance_teacher_update on public.attendance;

create policy attendance_authenticated_update
on public.attendance for update to authenticated
using (
  (
    (select public."current_role"()) = 'admin'::app_role
    and (select auth.jwt()->>'aal') = 'aal2'
  )
  or
  (
    (select public."current_role"()) = 'teacher'::app_role
    and teacher_id = (select auth.uid())
    and (select public.is_teacher_assigned(
      attendance.class_id,
      attendance.subject_id,
      (select classes.academic_year from public.classes where classes.id = attendance.class_id)
    ))
  )
)
with check (
  (
    (select public."current_role"()) = 'admin'::app_role
    and (select auth.jwt()->>'aal') = 'aal2'
  )
  or
  (
    (select public."current_role"()) = 'teacher'::app_role
    and (select public.is_teacher_assigned(
      attendance.class_id,
      attendance.subject_id,
      (select classes.academic_year from public.classes where classes.id = attendance.class_id)
    ))
  )
);

commit;