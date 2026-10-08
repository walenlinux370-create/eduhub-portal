-- EDTECH v3.2: secure pedagogical materials and private storage
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values (
  'materials',
  'materials',
  false,
  52428800,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'image/jpeg',
    'image/png'
  ]
)
on conflict (id) do update set
  public=false,
  file_size_limit=52428800,
  allowed_mime_types=excluded.allowed_mime_types;

create or replace function public.material_guard()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare c public.classes%rowtype; s public.subjects%rowtype;
begin
  if new.title is null or length(trim(new.title)) not between 1 and 160 then
    raise exception 'invalid_material_title';
  end if;
  select * into c from public.classes where id=new.class_id;
  if c.id is null then raise exception 'class_not_found'; end if;
  select * into s from public.subjects where id=new.subject_id;
  if s.id is null then raise exception 'subject_not_found'; end if;
  if c.level < s.min_level or c.level > s.max_level then raise exception 'subject_level_mismatch'; end if;
  if new.size_bytes <= 0 or new.size_bytes > 52428800 then raise exception 'material_too_large'; end if;
  if new.mime_type not in (
    'application/pdf','application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain','image/jpeg','image/png'
  ) then raise exception 'material_type_not_allowed'; end if;
  if new.storage_path not like new.class_id::text || '/' || new.subject_id::text || '/%' then
    raise exception 'invalid_material_storage_path';
  end if;
  new.created_by := auth.uid();
  return new;
end $$;

drop trigger if exists materials_guard on public.materials;
create trigger materials_guard
before insert or update on public.materials
for each row execute function public.material_guard();

create or replace function public.audit_material_change()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  insert into public.audit_logs(actor_user_id,event_type,entity_table,entity_id,before_data,after_data,metadata)
  values(
    auth.uid(), lower(tg_op)||'_material','materials',coalesce(new.id,old.id)::text,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end,
    jsonb_build_object('source','materials_management')
  );
  return coalesce(new,old);
end $$;

drop trigger if exists materials_audit on public.materials;
create trigger materials_audit
after insert or update or delete on public.materials
for each row execute function public.audit_material_change();

create index if not exists materials_scope_idx on public.materials(class_id,subject_id,created_at desc);

drop policy if exists admin_aal2_access on public.materials;
drop policy if exists materials_admin_aal2 on public.materials;
create policy materials_admin_aal2 on public.materials
for all to authenticated
using(public.current_role()='admin' and (select auth.jwt()->>'aal')='aal2')
with check(public.current_role()='admin' and (select auth.jwt()->>'aal')='aal2');

drop policy if exists materials_student on public.materials;
create policy materials_student on public.materials
for select to authenticated
using(class_id=(select class_id from public.students where id=public.my_student_id()));

drop policy if exists materials_teacher_select on public.materials;
create policy materials_teacher_select on public.materials
for select to authenticated
using(
  public.current_role()='teacher'
  and public.is_teacher_assigned(
    class_id,subject_id,(select academic_year from public.classes where id=materials.class_id)
  )
);

drop policy if exists materials_teacher_insert on public.materials;
create policy materials_teacher_insert on public.materials
for insert to authenticated
with check(
  public.current_role()='teacher'
  and public.is_teacher_assigned(
    class_id,subject_id,(select academic_year from public.classes where id=materials.class_id)
  )
);

revoke delete on public.materials from authenticated;

-- Storage: private bucket. Object paths must begin with class_id/subject_id/.
drop policy if exists materials_storage_select on storage.objects;
create policy materials_storage_select on storage.objects
for select to authenticated
using(
  bucket_id='materials'
  and (
    (
      public.current_role()='admin'
      and (select auth.jwt()->>'aal')='aal2'
    )
    or exists(
      select 1 from public.materials m
      where m.storage_path=name
        and (
          m.class_id=(select class_id from public.students where id=public.my_student_id())
          or (
            public.current_role()='teacher'
            and public.is_teacher_assigned(
              m.class_id,m.subject_id,
              (select academic_year from public.classes where id=m.class_id)
            )
          )
        )
    )
  )
);

drop policy if exists materials_storage_insert on storage.objects;
create policy materials_storage_insert on storage.objects
for insert to authenticated
with check(
  bucket_id='materials'
  and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}[^/]*$'
  and (
    (
      public.current_role()='admin'
      and (select auth.jwt()->>'aal')='aal2'
    )
    or (
      public.current_role()='teacher'
      and public.is_teacher_assigned(
        split_part(name,'/',1)::uuid,
        split_part(name,'/',2)::uuid,
        (select academic_year from public.classes where id=split_part(name,'/',1)::uuid)
      )
    )
  )
);

drop policy if exists materials_storage_update on storage.objects;
create policy materials_storage_update on storage.objects
for update to authenticated
using(bucket_id='materials' and public.current_role()='admin' and (select auth.jwt()->>'aal')='aal2')
with check(bucket_id='materials' and public.current_role()='admin' and (select auth.jwt()->>'aal')='aal2');

drop policy if exists materials_storage_delete on storage.objects;
create policy materials_storage_delete on storage.objects
for delete to authenticated
using(bucket_id='materials' and public.current_role()='admin' and (select auth.jwt()->>'aal')='aal2');

grant select,insert,update,delete on public.materials to authenticated;
