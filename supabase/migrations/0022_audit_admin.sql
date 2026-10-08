-- EDTECH v2.9: immutable audit administration
-- Admin-only AAL2 read access. Audit records cannot be updated or deleted.

create index if not exists audit_logs_created_at_idx
  on public.audit_logs(created_at desc);
create index if not exists audit_logs_event_type_idx
  on public.audit_logs(event_type, created_at desc);
create index if not exists audit_logs_entity_idx
  on public.audit_logs(entity_table, entity_id, created_at desc);
create index if not exists audit_logs_actor_idx
  on public.audit_logs(actor_user_id, created_at desc);

create or replace function public.redact_audit_json(p_value jsonb)
returns jsonb
language plpgsql
immutable
security invoker
set search_path=public
as $$
declare
  result jsonb;
  item record;
  arr jsonb := '[]'::jsonb;
  key text;
  value jsonb;
begin
  if p_value is null then
    return null;
  end if;

  if jsonb_typeof(p_value) = 'object' then
    result := '{}'::jsonb;
    for item in select key, value from jsonb_each(p_value)
    loop
      if lower(item.key) in (
        'auth_code_hash','password','password_hash','token','access_token',
        'refresh_token','secret','client_secret','api_key','totp_secret',
        'mfa_secret','otp_secret'
      ) then
        result := result || jsonb_build_object(item.key, '[REDACTED]');
      else
        result := result || jsonb_build_object(item.key, public.redact_audit_json(item.value));
      end if;
    end loop;
    return result;
  elsif jsonb_typeof(p_value) = 'array' then
    for value in select value from jsonb_array_elements(p_value)
    loop
      arr := arr || jsonb_build_array(public.redact_audit_json(value));
    end loop;
    return arr;
  end if;

  return p_value;
end
$$;

create or replace function public.admin_audit_logs(
  p_event_type text default null,
  p_entity_table text default null,
  p_actor text default null,
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_search text default null,
  p_limit integer default 25,
  p_offset integer default 0
)
returns table(
  id bigint,
  actor_user_id uuid,
  actor_name text,
  event_type text,
  entity_table text,
  entity_id text,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb,
  created_at timestamptz,
  total_count bigint
)
language plpgsql
security definer
set search_path=public
as $$
begin
  if public.current_role() <> 'admin'
     or coalesce(auth.jwt()->>'aal','') <> 'aal2' then
    raise exception 'forbidden';
  end if;

  if p_limit is null or p_limit < 1 or p_limit > 100 then
    raise exception 'invalid_limit';
  end if;
  if p_offset is null or p_offset < 0 then
    raise exception 'invalid_offset';
  end if;

  return query
  with filtered as (
    select
      a.id,
      a.actor_user_id,
      coalesce(up.display_name, au.email, 'Sistema') as actor_name,
      a.event_type,
      a.entity_table,
      a.entity_id,
      public.redact_audit_json(a.before_data) as before_data,
      public.redact_audit_json(a.after_data) as after_data,
      public.redact_audit_json(a.metadata) as metadata,
      a.created_at
    from public.audit_logs a
    left join public.user_profiles up on up.id = a.actor_user_id
    left join auth.users au on au.id = a.actor_user_id
    where (p_event_type is null or p_event_type = '' or a.event_type = p_event_type)
      and (p_entity_table is null or p_entity_table = '' or a.entity_table = p_entity_table)
      and (
        p_actor is null or p_actor = ''
        or a.actor_user_id::text = p_actor
        or coalesce(up.display_name,'') ilike '%' || p_actor || '%'
        or coalesce(au.email,'') ilike '%' || p_actor || '%'
      )
      and (p_from is null or a.created_at >= p_from)
      and (p_to is null or a.created_at < p_to)
      and (
        p_search is null or p_search = ''
        or a.event_type ilike '%' || p_search || '%'
        or a.entity_table ilike '%' || p_search || '%'
        or coalesce(a.entity_id,'') ilike '%' || p_search || '%'
        or coalesce(up.display_name,'') ilike '%' || p_search || '%'
      )
  )
  select f.*, count(*) over() as total_count
  from filtered f
  order by f.created_at desc, f.id desc
  limit p_limit offset p_offset;
end
$$;

revoke all on function public.admin_audit_logs(text,text,text,timestamptz,timestamptz,text,integer,integer) from public, anon;
grant execute on function public.admin_audit_logs(text,text,text,timestamptz,timestamptz,text,integer,integer) to authenticated;

-- Keep audit storage inaccessible as a table to browser clients.
revoke all on public.audit_logs from public, anon, authenticated;

-- Defense in depth: all direct UPDATE/DELETE attempts fail at trigger level,
-- including attempts made by privileged database roles.
create or replace function public.audit_immutable()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  raise exception 'audit_logs_immutable';
end
$$;

drop trigger if exists audit_no_update on public.audit_logs;
create trigger audit_no_update
before update or delete on public.audit_logs
for each row execute function public.audit_immutable();

revoke execute on function public.audit_immutable() from public, anon, authenticated;
