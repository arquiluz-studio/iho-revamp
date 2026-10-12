-- Whether the hero of a content page is published.
-- A country that uses the global page follows this flag on site_pages.
-- A country that publishes its own page follows its own flag.

alter table public.site_pages
  add column hero_enabled boolean not null default true;

alter table public.country_settings
  add column hero_enabled boolean not null default true;

alter table public.country_pages
  add column hero_enabled boolean not null default true;
