-- Site-wide settings shared by every country (a single row). Stats move here from country_settings
-- so all country sites show the same counters.
create table public.site_settings (
  id text primary key default 'global' check (id = 'global'),
  -- [{"value": 35, "prefix": "+", "suffix": "", "label_es": "...", "label_en": "..."}]
  stats jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create trigger set_updated_at before update on public.site_settings
  for each row execute function private.set_updated_at();
create trigger audit_row after insert or update or delete on public.site_settings
  for each row execute function private.audit_row();

create policy "Anyone can read site settings" on public.site_settings
  for select to anon, authenticated using (true);
create policy "Super admins can insert site settings" on public.site_settings
  for insert to authenticated with check ((select private.is_super_admin()));
create policy "Super admins can update site settings" on public.site_settings
  for update to authenticated
  using ((select private.is_super_admin()))
  with check ((select private.is_super_admin()));

insert into public.site_settings (id, stats)
values (
  'global',
  coalesce((select stats from public.country_settings order by (country_code = 'mx') desc, country_code limit 1), '[]'::jsonb)
);

alter table public.country_settings drop column stats;
