-- EDTECH v2.6: public endpoint abuse protection
create extension if not exists pgcrypto;

create table if not exists public.public_rate_limits (
  key_hash text not null,
  endpoint text not null,
  occurred_at timestamptz not null default now()
);

create index if not exists public_rate_limits_lookup_idx
  on public.public_rate_limits(endpoint,key_hash,occurred_at desc);

alter table public.public_rate_limits enable row level security;
revoke all on public.public_rate_limits from public,anon,authenticated;

create or replace function public.check_public_rate_limit(
  p_key text,
  p_endpoint text,
  p_window_seconds integer,
  p_max_requests integer
)
returns boolean
language plpgsql
security definer
set search_path=public,extensions,pg_temp
as $$
declare
  v_key text := encode(digest(coalesce(p_key,'unknown'), 'sha256'), 'hex');
  v_count integer;
begin
  if p_window_seconds < 1 or p_window_seconds > 86400
     or p_max_requests < 1 or p_max_requests > 1000 then
    raise exception 'invalid_rate_limit_parameters';
  end if;

  perform pg_advisory_xact_lock(hashtext(coalesce(p_endpoint,'unknown') || ':' || v_key));

  delete from public.public_rate_limits
  where occurred_at < now() - interval '1 day';

  select count(*) into v_count
  from public.public_rate_limits
  where endpoint=p_endpoint
    and key_hash=v_key
    and occurred_at >= now() - make_interval(secs => p_window_seconds);

  if v_count >= p_max_requests then
    return false;
  end if;

  insert into public.public_rate_limits(key_hash,endpoint)
  values(v_key,p_endpoint);

  return true;
end $$;

revoke all on function public.check_public_rate_limit(text,text,integer,integer) from public,anon,authenticated;
grant execute on function public.check_public_rate_limit(text,text,integer,integer) to service_role;
