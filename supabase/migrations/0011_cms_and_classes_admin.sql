-- EDTECH v2.7: complete CMS/class administration boundary
create or replace function public.cms_video_url(p_url text)
returns text
language plpgsql
immutable
as $$
declare u text := trim(p_url);
begin
  if u is null or u='' then return null; end if;
  if u !~ '^https://(www\\.)?(youtube\\.com|youtube-nocookie\\.com)/' then
    raise exception 'video_origin_rejected';
  end if;
  return u;
end $$;

drop policy if exists news_admin_manage on public.news;
create policy news_admin_manage on public.news
for all to authenticated
using(public.current_role()='admin' and (select auth.jwt()->>'aal')='aal2')
with check(public.current_role()='admin' and (select auth.jwt()->>'aal')='aal2');

drop policy if exists classes_admin_manage on public.classes;
create policy classes_admin_manage on public.classes
for all to authenticated
using(public.current_role()='admin' and (select auth.jwt()->>'aal')='aal2')
with check(public.current_role()='admin' and (select auth.jwt()->>'aal')='aal2');

drop policy if exists subjects_admin_manage on public.subjects;
create policy subjects_admin_manage on public.subjects
for all to authenticated
using(public.current_role()='admin' and (select auth.jwt()->>'aal')='aal2')
with check(public.current_role()='admin' and (select auth.jwt()->>'aal')='aal2');

drop policy if exists teacher_assignments_admin_manage on public.teacher_assignments;
create policy teacher_assignments_admin_manage on public.teacher_assignments
for all to authenticated
using(public.current_role()='admin' and (select auth.jwt()->>'aal')='aal2')
with check(public.current_role()='admin' and (select auth.jwt()->>'aal')='aal2');

grant select,insert,update,delete on public.news,public.classes,public.subjects,public.teacher_assignments to authenticated;

create or replace function public.validate_news_before_write()
returns trigger
language plpgsql
security definer
set search_path=public,extensions,pg_temp
as $$
begin
  new.slug := lower(regexp_replace(trim(new.slug),'[^a-zA-Z0-9]+','-','g'));
  new.title := left(trim(new.title),180);
  new.excerpt := left(trim(new.excerpt),500);
  if new.video_url is not null and trim(new.video_url)<>'' then
    new.video_url := public.cms_video_url(new.video_url);
  else
    new.video_url := null;
  end if;
  if new.published=true and new.published_at is null then new.published_at:=now(); end if;
  if new.published=false then new.published_at:=null; end if;
  return new;
end $$;

drop trigger if exists news_validate_before_write on public.news;
create trigger news_validate_before_write
before insert or update on public.news
for each row execute function public.validate_news_before_write();

revoke execute on function public.cms_video_url(text) from public,anon,authenticated;
revoke execute on function public.validate_news_before_write() from public,anon,authenticated;
