-- Atomic public registration: locks the event row so concurrent sign-ups can't overbook `capacity`.
-- Seats count the registrant plus companions for pending, confirmed and attended registrations;
-- once full, new registrations go to the waitlist. Only the service role (server action) may call it.
create function public.register_for_event(
  p_event_id uuid,
  p_full_name text,
  p_company text,
  p_email text,
  p_phone text,
  p_pass_type text,
  p_companions int,
  p_locale text,
  p_consent_marketing boolean
)
returns table (registration_id uuid, registration_status public.registration_status)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.events;
  v_taken int;
  v_status public.registration_status;
  v_id uuid;
begin
  select * into v_event from public.events where id = p_event_id for update;
  if not found or v_event.status <> 'published' or not v_event.registration_enabled or v_event.access_type = 'invite_only' then
    raise exception 'registration_unavailable';
  end if;
  if coalesce(v_event.registration_closes_at, v_event.starts_at) < now() then
    raise exception 'registration_closed';
  end if;

  select coalesce(sum(1 + r.companions), 0) into v_taken
  from public.event_registrations r
  where r.event_id = p_event_id and r.status in ('pending', 'confirmed', 'attended');

  v_status := case
    when v_event.capacity is not null and v_taken + 1 + p_companions > v_event.capacity then 'waitlist'
    else 'confirmed'
  end;

  insert into public.event_registrations (event_id, full_name, company, email, phone, pass_type, companions, locale, consent_marketing, consent_privacy, status)
  values (p_event_id, p_full_name, p_company, lower(p_email), p_phone, p_pass_type, p_companions, p_locale, p_consent_marketing, true, v_status)
  returning id into v_id;

  return query select v_id, v_status;
end;
$$;

revoke all on function public.register_for_event(uuid, text, text, text, text, text, int, text, boolean) from public, anon, authenticated;
grant execute on function public.register_for_event(uuid, text, text, text, text, text, int, text, boolean) to service_role;
