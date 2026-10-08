begin;

drop policy if exists admin_aal2_manage on public.attendance;

create policy attendance_admin_insert
on public.attendance for insert to authenticated
with check (
  (select public."current_role"()) = 'admin'::app_role
  and (select auth.jwt()->>'aal') = 'aal2'
);

create policy attendance_admin_update
on public.attendance for update to authenticated
using (
  (select public."current_role"()) = 'admin'::app_role
  and (select auth.jwt()->>'aal') = 'aal2'
)
with check (
  (select public."current_role"()) = 'admin'::app_role
  and (select auth.jwt()->>'aal') = 'aal2'
);

create policy attendance_admin_delete
on public.attendance for delete to authenticated
using (
  (select public."current_role"()) = 'admin'::app_role
  and (select auth.jwt()->>'aal') = 'aal2'
);

drop policy if exists attendance_student on public.attendance;
drop policy if exists attendance_teacher_select on public.attendance;

create policy attendance_authenticated_select
on public.attendance for select to authenticated
using (
  (student_id = (select public.my_student_id()))
  or (
    (select public."current_role"()) = 'teacher'::app_role
    and teacher_id = (select auth.uid())
    and (select public.is_teacher_assigned(
      attendance.class_id,
      attendance.subject_id,
      (select classes.academic_year from public.classes where classes.id = attendance.class_id)
    ))
  )
  or (
    (select public."current_role"()) = 'admin'::app_role
    and (select auth.jwt()->>'aal') = 'aal2'
  )
);

commit;