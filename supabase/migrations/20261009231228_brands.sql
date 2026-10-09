create table public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  logo_media_id uuid references public.media_assets (id) on delete set null,
  -- Wordmarks drawn with thin strokes get a slightly larger logo box on the brands wall.
  logo_is_thin boolean not null default false,
  website_url text,
  origin_country text,
  description_es text,
  description_en text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index brands_logo_idx on public.brands (logo_media_id);

create table public.brand_business_lines (
  brand_id uuid not null references public.brands (id) on delete cascade,
  business_line_id uuid not null references public.business_lines (id) on delete cascade,
  primary key (brand_id, business_line_id)
);

create index brand_business_lines_business_line_idx on public.brand_business_lines (business_line_id);

create table public.country_brands (
  country_code text not null references public.countries (code) on delete cascade,
  brand_id uuid not null references public.brands (id) on delete cascade,
  is_exclusive boolean not null default false,
  is_visible boolean not null default true,
  sort int not null default 0,
  primary key (country_code, brand_id)
);

create index country_brands_brand_idx on public.country_brands (brand_id);

alter table public.brands enable row level security;
alter table public.brand_business_lines enable row level security;
alter table public.country_brands enable row level security;

create trigger set_updated_at before update on public.brands
  for each row execute function private.set_updated_at();
