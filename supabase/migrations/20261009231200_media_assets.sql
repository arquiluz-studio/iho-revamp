create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  -- null = global asset (brand logos, product photos).
  country_code text references public.countries (code) on delete restrict,
  kind public.media_kind not null,
  original_bucket text,
  original_path text,
  -- {"thumb": "...", "md": "...", "lg": "..."} inside the public `media` bucket.
  public_paths jsonb not null default '{}'::jsonb,
  width int,
  height int,
  lqip text,
  dominant_color text,
  mime_type text,
  bytes bigint,
  alt_es text,
  alt_en text,
  credit text,
  is_downloadable boolean not null default false,
  processing_status public.media_processing_status not null default 'pending',
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index media_assets_country_kind_idx on public.media_assets (country_code, kind);
create index media_assets_created_by_idx on public.media_assets (created_by);

alter table public.media_assets enable row level security;

create trigger set_updated_at before update on public.media_assets
  for each row execute function private.set_updated_at();
