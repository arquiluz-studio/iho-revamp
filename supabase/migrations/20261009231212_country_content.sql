-- Per-country home content, offices, social accounts and team.

create table public.country_settings (
  country_code text primary key references public.countries (code) on delete cascade,
  hero_eyebrow_es text,
  hero_eyebrow_en text,
  hero_title_es text,
  hero_title_en text,
  hero_subtitle_es text,
  hero_subtitle_en text,
  hero_video_media_id uuid references public.media_assets (id) on delete set null,
  hero_image_media_id uuid references public.media_assets (id) on delete set null,
  contact_image_media_id uuid references public.media_assets (id) on delete set null,
  -- [{"value": 35, "prefix": "+", "suffix": "", "label_es": "...", "label_en": "..."}]
  stats jsonb not null default '[]'::jsonb,
  seo_title_es text,
  seo_title_en text,
  seo_description_es text,
  seo_description_en text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index country_settings_hero_video_idx on public.country_settings (hero_video_media_id);
create index country_settings_hero_image_idx on public.country_settings (hero_image_media_id);
create index country_settings_contact_image_idx on public.country_settings (contact_image_media_id);

create table public.offices (
  id uuid primary key default gen_random_uuid(),
  country_code text not null references public.countries (code) on delete cascade,
  city text not null,
  address text not null,
  maps_url text,
  phone text,
  email text,
  is_main boolean not null default false,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index offices_country_code_idx on public.offices (country_code, sort);

create table public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  country_code text not null references public.countries (code) on delete cascade,
  platform public.social_platform not null,
  handle text,
  url text not null,
  sort int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index social_accounts_country_code_idx on public.social_accounts (country_code, sort);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  country_code text not null references public.countries (code) on delete cascade,
  full_name text not null,
  role_es text not null,
  role_en text,
  photo_media_id uuid references public.media_assets (id) on delete set null,
  -- CSS object-position for the portrait crop, e.g. '0% 9.5%'.
  photo_position text,
  linkedin_url text,
  sort int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index team_members_country_code_idx on public.team_members (country_code, sort);
create index team_members_photo_idx on public.team_members (photo_media_id);

alter table public.country_settings enable row level security;
alter table public.offices enable row level security;
alter table public.social_accounts enable row level security;
alter table public.team_members enable row level security;

create trigger set_updated_at before update on public.country_settings
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.offices
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.social_accounts
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.team_members
  for each row execute function private.set_updated_at();
