create table public.projects (
  id uuid primary key default gen_random_uuid(),
  country_code text not null references public.countries (code) on delete restrict,
  slug text not null,
  title_es text not null,
  title_en text,
  client_name text,
  city text,
  year int check (year between 1900 and 2200),
  summary_es text,
  summary_en text,
  -- Markdown.
  body_es text,
  body_en text,
  sector_id uuid references public.sectors (id) on delete set null,
  cover_media_id uuid references public.media_assets (id) on delete set null,
  status public.content_status not null default 'draft',
  is_featured boolean not null default false,
  sort int not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (country_code, slug)
);

create index projects_country_status_idx on public.projects (country_code, status, sort);
create index projects_sector_idx on public.projects (sector_id);
create index projects_cover_idx on public.projects (cover_media_id);

create table public.project_business_lines (
  project_id uuid not null references public.projects (id) on delete cascade,
  business_line_id uuid not null references public.business_lines (id) on delete cascade,
  primary key (project_id, business_line_id)
);

create index project_business_lines_business_line_idx on public.project_business_lines (business_line_id);

create table public.project_brands (
  project_id uuid not null references public.projects (id) on delete cascade,
  brand_id uuid not null references public.brands (id) on delete cascade,
  primary key (project_id, brand_id)
);

create index project_brands_brand_idx on public.project_brands (brand_id);

create table public.project_media (
  project_id uuid not null references public.projects (id) on delete cascade,
  media_id uuid not null references public.media_assets (id) on delete cascade,
  sort int not null default 0,
  caption_es text,
  caption_en text,
  primary key (project_id, media_id)
);

create index project_media_media_idx on public.project_media (media_id);

alter table public.projects enable row level security;
alter table public.project_business_lines enable row level security;
alter table public.project_brands enable row level security;
alter table public.project_media enable row level security;

create trigger set_updated_at before update on public.projects
  for each row execute function private.set_updated_at();

create function private.set_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

create trigger set_published_at before insert or update of status on public.projects
  for each row execute function private.set_published_at();
