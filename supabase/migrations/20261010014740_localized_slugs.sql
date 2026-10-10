-- Localized URLs: `slug` is the Spanish slug, `slug_en` the optional English one (English URLs fall back to `slug`).
alter table public.business_lines add column slug_en text unique check (slug_en ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
alter table public.sectors add column slug_en text unique check (slug_en ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
alter table public.products add column slug_en text unique check (slug_en ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
alter table public.events add column slug_en text check (slug_en ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
alter table public.events add constraint events_country_code_slug_en_key unique (country_code, slug_en);
alter table public.projects add column slug_en text check (slug_en ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
alter table public.projects add constraint projects_country_code_slug_en_key unique (country_code, slug_en);

comment on column public.business_lines.slug is 'Spanish URL slug';
comment on column public.business_lines.slug_en is 'English URL slug (falls back to slug)';
comment on column public.sectors.slug_en is 'English URL slug (falls back to slug)';
comment on column public.products.slug_en is 'English URL slug (falls back to slug)';
comment on column public.events.slug_en is 'English URL slug (falls back to slug)';
comment on column public.projects.slug_en is 'English URL slug (falls back to slug)';

-- Taxonomies were seeded with English slugs: move them to slug_en and give them Spanish slugs.
update public.business_lines set slug_en = slug, slug = v.es
from (values ('furniture', 'mobiliario'), ('specialty', 'arquitectura'), ('lighting', 'iluminacion')) as v(en, es)
where slug = v.en;
update public.sectors set slug_en = slug, slug = v.es
from (values ('healthcare', 'salud'), ('residential', 'residencial')) as v(en, es)
where slug = v.en;

-- Seeded content with Spanish slugs gets an English one.
update public.events set slug_en = v.en
from (values ('feria-contract', 'contract-fair'), ('webinar-iluminacion', 'lighting-webinar'), ('lanzamiento-collection', 'collection-launch'),
  ('showroom-abierto', 'open-showroom'), ('feria-industrial', 'industrial-fair'), ('webinar-disenio', 'design-webinar'), ('lanzamiento-premium', 'premium-launch')) as v(es, en)
where slug = v.es;
update public.projects set slug_en = 'digital-entertainment' where slug = 'entretenimiento-digital';
update public.products set slug_en = 'path-high-chair' where slug = 'silla-path-alta';
