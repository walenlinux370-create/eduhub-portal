-- EDTECH v3.3: secure institutional news CMS
create or replace function public.news_guard()
returns trigger
language plpgsql security definer set search_path=public
as $$
begin
  if length(trim(new.slug))<3 or length(new.slug)>180 or new.slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then raise exception 'invalid_news_slug'; end if;
  if length(trim(new.title)) not between 1 and 180 then raise exception 'invalid_news_title'; end if;
  if length(trim(new.excerpt)) not between 1 and 500 then raise exception 'invalid_news_excerpt'; end if;
  if length(trim(new.body_html))<1 or length(new.body_html)>100000 then raise exception 'invalid_news_body'; end if;
  if new.video_url is not null and new.video_url !~ '^https://(www\\.)?(youtube\\.com|youtu\\.be)/' then raise exception 'invalid_video_url'; end if;
  if new.published=true and (old.published is distinct from true) then new.published_at=coalesce(new.published_at,now()); end if;
  if new.published=false then new.published_at=null; end if;
  new.created_by=case when tg_op='INSERT' then auth.uid() else new.created_by end;
  return new;
end $$;

drop trigger if exists news_guard on public.news;
create trigger news_guard before insert or update on public.news for each row execute function public.news_guard();

create or replace function public.audit_news_change()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into public.audit_logs(actor_user_id,event_type,entity_table,entity_id,before_data,after_data,metadata)
 values(auth.uid(),lower(tg_op)||'_news','news',coalesce(new.id,old.id)::text,
 case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
 case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end,
 jsonb_build_object('source','news_cms'));
 return coalesce(new,old);
end $$;
drop trigger if exists news_audit on public.news;
create trigger news_audit after insert or update or delete on public.news for each row execute function public.audit_news_change();

drop policy if exists news_public_published on public.news;
create policy news_public_published on public.news for select to anon,authenticated using(published=true and published_at is not null);
drop policy if exists news_admin_aal2 on public.news;
create policy news_admin_aal2 on public.news for all to authenticated
using(public.current_role()='admin' and (select auth.jwt()->>'aal')='aal2')
with check(public.current_role()='admin' and (select auth.jwt()->>'aal')='aal2');

grant select on public.news to anon,authenticated;
grant insert,update,delete on public.news to authenticated;

revoke execute on function public.news_guard() from public,anon,authenticated;
revoke execute on function public.audit_news_change() from public,anon,authenticated;
