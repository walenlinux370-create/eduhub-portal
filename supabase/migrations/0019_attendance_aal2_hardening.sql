-- EDTECH v3.1: prevent non-AAL2 admin reads through teacher attendance policy
drop policy if exists attendance_teacher_select on public.attendance;
create policy attendance_teacher_select on public.attendance
for select to authenticated
using (
  public.current_role()='teacher'
  and teacher_id=auth.uid()
  and public.is_teacher_assigned(
    class_id,
    subject_id,
    (select academic_year from public.classes where id=attendance.class_id)
  )
);