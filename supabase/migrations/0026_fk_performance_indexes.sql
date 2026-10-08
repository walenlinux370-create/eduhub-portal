-- 0026: indexes for foreign-key columns flagged by Supabase Performance Advisor.
-- These indexes support joins, RLS filters and referential actions as the dataset grows.

create index if not exists admin_notifications_student_id_idx on public.admin_notifications (student_id);
create index if not exists attendance_subject_id_idx on public.attendance (subject_id);
create index if not exists grades_subject_id_idx on public.grades (subject_id);
create index if not exists grades_teacher_id_idx on public.grades (teacher_id);
create index if not exists materials_created_by_idx on public.materials (created_by);
create index if not exists materials_subject_id_idx on public.materials (subject_id);
create index if not exists news_created_by_idx on public.news (created_by);
create index if not exists schedules_class_id_idx on public.schedules (class_id);
create index if not exists schedules_subject_id_idx on public.schedules (subject_id);
create index if not exists teacher_assignments_class_id_idx on public.teacher_assignments (class_id);
