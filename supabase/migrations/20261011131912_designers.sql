-- Designers (global catalog): homage pages and many-to-many links with products, replacing the free-text
-- `products.designer` column.
alter type public.media_kind add value if not exists 'designer_photo';

create table public.designers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  portrait_media_id uuid references public.media_assets (id) on delete set null,
  cover_media_id uuid references public.media_assets (id) on delete set null,
  nationality_es text,
  nationality_en text,
  birth_year int check (birth_year between 1700 and 2100),
  death_year int check (death_year between 1700 and 2100),
  website_url text,
  bio_es text,
  bio_en text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (death_year is null or birth_year is null or death_year >= birth_year)
);

create index designers_portrait_idx on public.designers (portrait_media_id);
create index designers_cover_idx on public.designers (cover_media_id);

create table public.product_designers (
  product_id uuid not null references public.products (id) on delete cascade,
  designer_id uuid not null references public.designers (id) on delete cascade,
  primary key (product_id, designer_id)
);

create index product_designers_designer_idx on public.product_designers (designer_id);

alter table public.designers enable row level security;
alter table public.product_designers enable row level security;

create trigger set_updated_at before update on public.designers
  for each row execute function private.set_updated_at();
create trigger audit_row after insert or update or delete on public.designers
  for each row execute function private.audit_row();
create trigger audit_row after insert or update or delete on public.product_designers
  for each row execute function private.audit_row();

create policy "Anyone can read active designers" on public.designers
  for select to anon using (is_active);
create policy "Staff can read all designers" on public.designers
  for select to authenticated using (is_active or (select private.is_staff()));
create policy "Catalog admins can insert designers" on public.designers
  for insert to authenticated with check ((select private.can_manage_catalog()));
create policy "Catalog admins can update designers" on public.designers
  for update to authenticated using ((select private.can_manage_catalog())) with check ((select private.can_manage_catalog()));
create policy "Catalog admins can delete designers" on public.designers
  for delete to authenticated using ((select private.can_manage_catalog()));

create policy "Anyone can read product designers" on public.product_designers
  for select to anon, authenticated using (true);
create policy "Catalog admins can insert product designers" on public.product_designers
  for insert to authenticated with check ((select private.can_manage_catalog()));
create policy "Catalog admins can delete product designers" on public.product_designers
  for delete to authenticated using ((select private.can_manage_catalog()));

-- Existing free-text designers become records linked to their products.
insert into public.designers (slug, name)
select distinct on (slug) slug, name
from (
  select trim(designer) as name, trim(both '-' from regexp_replace(lower(trim(designer)), '[^a-z0-9]+', '-', 'g')) as slug
  from public.products
  where nullif(trim(designer), '') is not null
) d
where slug <> ''
on conflict (slug) do nothing;

insert into public.product_designers (product_id, designer_id)
select p.id, d.id
from public.products p
join public.designers d on d.slug = trim(both '-' from regexp_replace(lower(trim(p.designer)), '[^a-z0-9]+', '-', 'g'))
on conflict do nothing;

-- The catalog view exposed the old column; recreate it without it.
drop view public.v_country_catalog;
alter table public.products drop column designer;

create view public.v_country_catalog
with (security_invoker = true)
as
select
  cp.country_code,
  p.id as product_id,
  p.slug,
  p.brand_id,
  p.business_line_id,
  p.name_es,
  p.name_en,
  p.cover_media_id,
  p.status,
  cp.is_visible,
  cp.is_purchasable,
  cp.is_featured,
  cp.lead_time_days,
  cp.sort,
  v.id as variant_id,
  v.sku,
  v.name_es as variant_name_es,
  v.name_en as variant_name_en,
  v.options,
  v.sort as variant_sort,
  price.amount,
  price.compare_at_amount,
  price.currency,
  price.kind as price_kind,
  public.get_available_stock(cp.country_code, v.id) as available_stock
from public.country_products cp
join public.products p on p.id = cp.product_id
join public.product_variants v on v.product_id = p.id and v.is_active
left join lateral public.get_effective_price(cp.country_code, v.id) price on true;

grant select on public.v_country_catalog to anon, authenticated;
