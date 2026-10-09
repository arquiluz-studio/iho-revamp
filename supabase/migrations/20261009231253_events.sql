-- Events. Past/upcoming is always derived from starts_at; it is never stored.
-- event_products is created with the catalog (products) migration.

create table public.events (
  id uuid primary key default gen_random_uuid(),
  country_code text not null references public.countries (code) on delete restrict,
  slug text not null,
  type public.event_type not null default 'event',
  title_es text not null,
  title_en text,
  summary_es text,
  summary_en text,
  -- Markdown.
  body_es text,
  body_en text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  -- Defaults to the country's timezone (see trigger).
  timezone text not null,
  venue_name text,
  address text,
  city text,
  is_online boolean not null default false,
  online_url text,
  access_type public.event_access not null default 'registration_required',
  capacity int check (capacity is null or capacity > 0),
  registration_enabled boolean not null default false,
  registration_closes_at timestamptz,
  cover_media_id uuid references public.media_assets (id) on delete set null,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (country_code, slug),
  check (ends_at is null or ends_at >= starts_at)
);

create index events_country_status_starts_idx on public.events (country_code, status, starts_at);
create index events_cover_idx on public.events (cover_media_id);

create table public.event_agenda_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  sort int not null default 0,
  time_label text,
  text_es text not null,
  text_en text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index event_agenda_items_event_idx on public.event_agenda_items (event_id, sort);

create table public.event_brands (
  event_id uuid not null references public.events (id) on delete cascade,
  brand_id uuid not null references public.brands (id) on delete cascade,
  primary key (event_id, brand_id)
);

create index event_brands_brand_idx on public.event_brands (brand_id);

-- Post-event gallery.
create table public.event_media (
  event_id uuid not null references public.events (id) on delete cascade,
  media_id uuid not null references public.media_assets (id) on delete cascade,
  sort int not null default 0,
  primary key (event_id, media_id)
);

create index event_media_media_idx on public.event_media (media_id);

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  full_name text not null,
  company text,
  email text not null,
  phone text,
  pass_type text,
  companions int not null default 0 check (companions between 0 and 10),
  locale text not null default 'es' check (locale in ('es', 'en')),
  consent_marketing boolean not null default false,
  consent_privacy boolean not null check (consent_privacy),
  status public.registration_status not null default 'pending',
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index event_registrations_event_status_idx on public.event_registrations (event_id, status);
create unique index event_registrations_unique_email
  on public.event_registrations (event_id, lower(email))
  where status <> 'cancelled';

alter table public.events enable row level security;
alter table public.event_agenda_items enable row level security;
alter table public.event_brands enable row level security;
alter table public.event_media enable row level security;
alter table public.event_registrations enable row level security;

create trigger set_updated_at before update on public.events
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.event_agenda_items
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.event_registrations
  for each row execute function private.set_updated_at();

create function private.set_event_timezone()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.timezone is null or new.timezone = '' then
    select c.timezone into new.timezone from public.countries c where c.code = new.country_code;
  end if;
  return new;
end;
$$;

create trigger set_event_timezone before insert or update of country_code, timezone on public.events
  for each row execute function private.set_event_timezone();
