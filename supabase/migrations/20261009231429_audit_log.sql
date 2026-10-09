create table public.audit_log (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles (id) on delete set null,
  country_code text,
  table_name text not null,
  -- Text so composite / natural keys (e.g. countries.code) fit too.
  row_id text,
  action text not null check (action in ('insert', 'update', 'delete')),
  -- insert: {"new": {...}}, delete: {"old": {...}}, update: {"old": {changed}, "new": {changed}}
  diff jsonb not null,
  created_at timestamptz not null default now()
);

create index audit_log_country_created_idx on public.audit_log (country_code, created_at desc);
create index audit_log_table_row_idx on public.audit_log (table_name, row_id);
create index audit_log_user_idx on public.audit_log (user_id);

alter table public.audit_log enable row level security;

create policy "Admins can read the audit log" on public.audit_log
  for select to authenticated using (
    (select private.is_super_admin()) or (country_code is not null and private.has_country_role(country_code, 'admin'))
  );

create function private.audit_row()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old jsonb := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end;
  v_new jsonb := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end;
  v_row jsonb := coalesce(v_new, v_old);
  v_diff jsonb;
  v_row_id text;
  v_country text;
begin
  if tg_op = 'UPDATE' then
    select
      jsonb_build_object(
        'old', coalesce(jsonb_object_agg(o.key, o.value) filter (where o.key is not null), '{}'::jsonb),
        'new', coalesce(jsonb_object_agg(o.key, v_new -> o.key) filter (where o.key is not null), '{}'::jsonb)
      )
    into v_diff
    from jsonb_each(v_old) o
    where o.value is distinct from v_new -> o.key and o.key <> 'updated_at';
    if v_diff = '{"old": {}, "new": {}}'::jsonb then
      return null;
    end if;
  elsif tg_op = 'INSERT' then
    v_diff := jsonb_build_object('new', v_new);
  else
    v_diff := jsonb_build_object('old', v_old);
  end if;

  v_row_id := coalesce(
    v_row ->> 'id',
    v_row ->> 'code',
    nullif(concat_ws(':', v_row ->> 'country_code', v_row ->> 'project_id', v_row ->> 'event_id',
                     v_row ->> 'brand_id', v_row ->> 'media_id', v_row ->> 'user_id', v_row ->> 'business_line_id'), '')
  );
  v_country := coalesce(v_row ->> 'country_code', case when tg_table_name = 'countries' then v_row ->> 'code' end);

  insert into public.audit_log (user_id, country_code, table_name, row_id, action, diff)
  values (
    (select auth.uid()),
    v_country,
    tg_table_name,
    v_row_id,
    lower(tg_op),
    v_diff
  );
  return null;
end;
$$;

revoke all on function private.audit_row() from public;

do $$
declare
  t text;
begin
  foreach t in array array[
    'countries', 'country_settings', 'offices', 'social_accounts', 'team_members',
    'profiles', 'user_country_roles', 'media_assets',
    'business_lines', 'sectors', 'brands', 'brand_business_lines', 'country_brands',
    'projects', 'project_business_lines', 'project_brands', 'project_media',
    'events', 'event_agenda_items', 'event_brands', 'event_media'
  ] loop
    execute format(
      'create trigger audit_row after insert or update or delete on public.%I for each row execute function private.audit_row()',
      t
    );
  end loop;
end;
$$;

-- Personal-data tables: only staff changes (status, check-in, deletion) are audited, not public submissions.
create trigger audit_row after update or delete on public.event_registrations
  for each row execute function private.audit_row();
create trigger audit_row after update or delete on public.contact_leads
  for each row execute function private.audit_row();
