create table public.contact_leads (
  id uuid primary key default gen_random_uuid(),
  country_code text not null references public.countries (code) on delete restrict,
  locale text not null default 'es' check (locale in ('es', 'en')),
  first_name text not null,
  last_name text,
  email text not null,
  phone text,
  company text,
  message text,
  business_line_id uuid references public.business_lines (id) on delete set null,
  sector_id uuid references public.sectors (id) on delete set null,
  -- 'contact_form', 'project_download', 'product_inquiry', ...
  source text not null default 'contact_form',
  -- id of the related project / product / media when applicable.
  source_ref uuid,
  consent_marketing boolean not null default false,
  status public.lead_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contact_leads_country_status_idx on public.contact_leads (country_code, status, created_at desc);
create index contact_leads_business_line_idx on public.contact_leads (business_line_id);
create index contact_leads_sector_idx on public.contact_leads (sector_id);

alter table public.contact_leads enable row level security;

create trigger set_updated_at before update on public.contact_leads
  for each row execute function private.set_updated_at();
