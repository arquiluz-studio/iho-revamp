-- Global taxonomies. business_lines are labelled "Áreas / Areas" in the UI; sectors are "Espacios / Spaces".

create table public.business_lines (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_es text not null,
  name_en text,
  description_es text,
  description_en text,
  cover_media_id uuid references public.media_assets (id) on delete set null,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sectors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_es text not null,
  name_en text,
  description_es text,
  description_en text,
  cover_media_id uuid references public.media_assets (id) on delete set null,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index business_lines_cover_idx on public.business_lines (cover_media_id);
create index sectors_cover_idx on public.sectors (cover_media_id);

alter table public.business_lines enable row level security;
alter table public.sectors enable row level security;

create trigger set_updated_at before update on public.business_lines
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.sectors
  for each row execute function private.set_updated_at();
