create table public.countries (
  code text primary key check (code ~ '^[a-z]{2}$'),
  name_es text not null,
  name_en text,
  domain text unique,
  is_hq boolean not null default false,
  is_active boolean not null default true,
  currency char(3) not null,
  default_locale text not null default 'es' check (default_locale in ('es', 'en')),
  timezone text not null,
  phone text,
  whatsapp text,
  email text,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index countries_single_hq on public.countries (is_hq) where is_hq;

alter table public.countries enable row level security;

create trigger set_updated_at before update on public.countries
  for each row execute function private.set_updated_at();
