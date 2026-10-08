-- 0024: RLS policy cleanup and performance hardening
-- Removes legacy permissive policies superseded by the hardened policies,
-- and removes a duplicate material index.

begin;

drop policy if exists admin_aal2_access on public.attendance;
drop policy if exists admin_aal2_access on public.registration_requests;
drop policy if exists admin_aal2_access on public.schedules;
drop policy if exists admin_aal2_access on public.students;

drop policy if exists admin_teacher_aal2_delete on public.attendance;
drop policy if exists admin_teacher_aal2_insert on public.attendance;
drop policy if exists admin_teacher_aal2_select on public.attendance;
drop policy if exists admin_teacher_aal2_update on public.attendance;
drop policy if exists admin_teacher_aal2_delete on public.classes;
drop policy if exists admin_teacher_aal2_insert on public.classes;
drop policy if exists admin_teacher_aal2_select on public.classes;
drop policy if exists admin_teacher_aal2_update on public.classes;
drop policy if exists admin_teacher_aal2_delete on public.grades;
drop policy if exists admin_teacher_aal2_insert on public.grades;
drop policy if exists admin_teacher_aal2_select on public.grades;
drop policy if exists admin_teacher_aal2_update on public.grades;
drop policy if exists admin_teacher_aal2_delete on public.materials;
drop policy if exists admin_teacher_aal2_insert on public.materials;
drop policy if exists admin_teacher_aal2_select on public.materials;
drop policy if exists admin_teacher_aal2_update on public.materials;
drop policy if exists admin_teacher_aal2_delete on public.news;
drop policy if exists admin_teacher_aal2_insert on public.news;
drop policy if exists admin_teacher_aal2_select on public.news;
drop policy if exists admin_teacher_aal2_update on public.news;
drop policy if exists admin_teacher_aal2_delete on public.schedules;
drop policy if exists admin_teacher_aal2_insert on public.schedules;
drop policy if exists admin_teacher_aal2_select on public.schedules;
drop policy if exists admin_teacher_aal2_update on public.schedules;
drop policy if exists admin_teacher_aal2_delete on public.students;
drop policy if exists admin_teacher_aal2_insert on public.students;
drop policy if exists admin_teacher_aal2_select on public.students;
drop policy if exists admin_teacher_aal2_update on public.students;
drop policy if exists admin_teacher_aal2_delete on public.subjects;
drop policy if exists admin_teacher_aal2_insert on public.subjects;
drop policy if exists admin_teacher_aal2_select on public.subjects;
drop policy if exists admin_teacher_aal2_update on public.subjects;
drop policy if exists admin_teacher_aal2_delete on public.teacher_assignments;
drop policy if exists admin_teacher_aal2_insert on public.teacher_assignments;
drop policy if exists admin_teacher_aal2_select on public.teacher_assignments;
drop policy if exists admin_teacher_aal2_update on public.teacher_assignments;

drop policy if exists grade_student_read on public.grades;
drop policy if exists grade_teacher_insert on public.grades;
drop policy if exists grade_teacher_read on public.grades;
drop policy if exists grade_teacher_update on public.grades;
drop policy if exists news_public_read on public.news;
drop policy if exists attendance_student_read on public.attendance;
drop policy if exists student_self_read on public.students;

drop policy if exists attendance_admin_aal2 on public.attendance;
drop policy if exists materials_admin_aal2 on public.materials;
drop policy if exists news_admin_manage on public.news;

drop index if exists public.materials_scope_idx;

commit;
