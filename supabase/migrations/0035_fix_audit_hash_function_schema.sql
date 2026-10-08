CREATE OR REPLACE FUNCTION public.audit_logs_hash_chain()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE v_previous text;
BEGIN
  PERFORM pg_advisory_xact_lock(2147483000,271828);
  SELECT event_hash INTO v_previous FROM public.audit_logs ORDER BY id DESC LIMIT 1;
  NEW.previous_hash:=COALESCE(v_previous,'GENESIS');
  NEW.event_hash:=encode(extensions.digest(concat_ws('|',
    NEW.previous_hash,COALESCE(NEW.actor_user_id::text,''),COALESCE(NEW.event_type,''),
    COALESCE(NEW.entity_table,''),COALESCE(NEW.entity_id,''),COALESCE(NEW.entity_ref,''),
    COALESCE(NEW.before_data::text,''),COALESCE(NEW.after_data::text,''),
    COALESCE(NEW.metadata::text,''),NEW.created_at::text),'sha256'),'hex');
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.audit_logs_hash_chain() FROM PUBLIC,anon,authenticated;
