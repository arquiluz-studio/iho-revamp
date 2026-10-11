-- Each country owns its catalog: the product, its cost and its sale price in the country's currency.
-- Web brands stay global. A country may also sell brands that are not advertised on the site.
-- Warehouses and quantities live in each country's ERP; this database only keeps the item code.

-- Commercial brands of one country. brand_id is set only when the brand is also a web brand.
create table public.catalog_brands (
  id uuid primary key default gen_random_uuid(),
  country_code text not null references public.countries (code) on delete cascade,
  name text not null,
  brand_id uuid references public.brands (id) on delete set null,
  erp_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (country_code, name)
);

create index catalog_brands_brand_idx on public.catalog_brands (brand_id);
create unique index catalog_brands_country_web_brand_idx
  on public.catalog_brands (country_code, brand_id)
  where brand_id is not null;

comment on table public.catalog_brands is
  'Brands sold in one country. Link brand_id only for brands advertised on the site.';

-- Cost and sale price live on the variant. Cost is never exposed to the public API.
create table public.variant_prices (
  variant_id uuid primary key references public.product_variants (id) on delete cascade,
  currency char(3) not null,
  cost numeric(12, 2) check (cost is null or cost >= 0),
  price numeric(12, 2) check (price is null or price >= 0),
  updated_at timestamptz not null default now()
);

comment on table public.variant_prices is
  'Cost and sale price of a variant in its country currency. Stock is not stored here.';
comment on column public.product_variants.erp_ref is
  'Item code in this country ERP. Warehouses and on-hand quantities live in the ERP.';

create trigger set_updated_at before update on public.catalog_brands
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.variant_prices
  for each row execute function private.set_updated_at();

-- A new variant gets an empty price row in the country's currency.
create function private.create_variant_price()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.variant_prices (variant_id, currency)
  select new.id, c.currency
  from public.products p
  join public.countries c on c.code = p.country_code
  where p.id = new.product_id
  on conflict (variant_id) do nothing;
  return null;
end;
$$;

create trigger create_variant_price after insert on public.product_variants
  for each row execute function private.create_variant_price();

revoke all on function private.create_variant_price() from public;

-- Products become country rows. Columns start nullable so existing rows can be split first.
alter table public.products add column country_code text;
alter table public.products add column catalog_brand_id uuid;
alter table public.products add column is_visible boolean not null default true;
alter table public.products add column is_purchasable boolean not null default false;
alter table public.products add column is_featured boolean not null default false;
alter table public.products add column lead_time_days int check (lead_time_days is null or lead_time_days >= 0);
alter table public.products add column sort int not null default 0;

alter table public.products drop constraint products_slug_key;
alter table public.products drop constraint products_slug_en_key;

-- One commercial brand per web brand in each country that already sells it.
insert into public.catalog_brands (country_code, name, brand_id)
select distinct cp.country_code, b.name, b.id
from public.country_products cp
join public.products p on p.id = cp.product_id
join public.brands b on b.id = p.brand_id
on conflict (country_code, name) do nothing;

-- The first country (by code) keeps the original product id. The rest get copies.
with ranked as (
  select
    product_id,
    country_code,
    row_number() over (partition by product_id order by country_code) as rn
  from public.country_products
)
update public.products p
set
  country_code = r.country_code,
  is_visible = cp.is_visible,
  is_purchasable = cp.is_purchasable,
  is_featured = cp.is_featured,
  lead_time_days = cp.lead_time_days,
  sort = cp.sort
from ranked r
join public.country_products cp on cp.product_id = r.product_id and cp.country_code = r.country_code
where r.rn = 1 and p.id = r.product_id;

create temporary table product_clones (
  source_id uuid not null,
  country_code text not null,
  new_id uuid not null,
  primary key (source_id, country_code)
);

insert into product_clones (source_id, country_code, new_id)
select cp.product_id, cp.country_code, gen_random_uuid()
from public.country_products cp
join public.products p on p.id = cp.product_id
where p.country_code is distinct from cp.country_code;

alter table public.products disable trigger create_default_variant;

insert into public.products (
  id, slug, slug_en, brand_id, business_line_id, name_es, name_en, description_es, description_en,
  specs, cover_media_id, status, erp_ref, created_at, updated_at,
  country_code, is_visible, is_purchasable, is_featured, lead_time_days, sort
)
select
  c.new_id, p.slug, p.slug_en, p.brand_id, p.business_line_id, p.name_es, p.name_en, p.description_es, p.description_en,
  p.specs, p.cover_media_id, p.status, p.erp_ref, p.created_at, p.updated_at,
  c.country_code, cp.is_visible, cp.is_purchasable, cp.is_featured, cp.lead_time_days, cp.sort
from product_clones c
join public.products p on p.id = c.source_id
join public.country_products cp on cp.product_id = c.source_id and cp.country_code = c.country_code;

insert into public.product_sectors (product_id, sector_id)
select c.new_id, ps.sector_id
from product_clones c
join public.product_sectors ps on ps.product_id = c.source_id;

insert into public.product_media (product_id, media_id, sort)
select c.new_id, pm.media_id, pm.sort
from product_clones c
join public.product_media pm on pm.product_id = c.source_id;

insert into public.product_designers (product_id, designer_id)
select c.new_id, pd.designer_id
from product_clones c
join public.product_designers pd on pd.product_id = c.source_id;

create temporary table variant_clones (
  source_variant uuid not null,
  new_variant uuid not null,
  new_product uuid not null,
  country_code text not null,
  primary key (source_variant, country_code)
);

insert into variant_clones (source_variant, new_variant, new_product, country_code)
select v.id, gen_random_uuid(), c.new_id, c.country_code
from product_clones c
join public.product_variants v on v.product_id = c.source_id;

insert into public.product_variants (
  id, product_id, sku, name_es, name_en, options, weight_kg, dimensions, erp_ref, is_active, sort, created_at, updated_at
)
select
  vc.new_variant,
  vc.new_product,
  case when v.sku is null then null else v.sku || '-' || upper(vc.country_code) end,
  v.name_es, v.name_en, v.options, v.weight_kg, v.dimensions, v.erp_ref, v.is_active, v.sort, v.created_at, v.updated_at
from variant_clones vc
join public.product_variants v on v.id = vc.source_variant;

alter table public.products enable trigger create_default_variant;

-- Events only show products of their own country. Point each link at that country's copy.
update public.event_products ep
set product_id = c.new_id
from public.events e, product_clones c
where ep.event_id = e.id
  and ep.product_id = c.source_id
  and e.country_code = c.country_code;

delete from public.event_products ep
using public.events e, public.products p
where ep.event_id = e.id
  and ep.product_id = p.id
  and e.country_code <> p.country_code;

-- Products never assigned to a country stay on HQ, hidden, so the column can be required.
update public.products p
set country_code = coalesce(
  (select c.code from public.countries c where c.is_hq order by c.code limit 1),
  (select c.code from public.countries c order by c.code limit 1)
)
where p.country_code is null;

insert into public.catalog_brands (country_code, name, brand_id)
select distinct p.country_code, b.name, b.id
from public.products p
join public.brands b on b.id = p.brand_id
where p.country_code is not null
on conflict (country_code, name) do nothing;

-- Two web brands can share a display name. The second one keeps a slug suffix so the product still links.
insert into public.catalog_brands (country_code, name, brand_id)
select distinct p.country_code, b.name || ' (' || b.slug || ')', b.id
from public.products p
join public.brands b on b.id = p.brand_id
where p.country_code is not null
  and not exists (
    select 1 from public.catalog_brands cb
    where cb.country_code = p.country_code and cb.brand_id = p.brand_id
  )
on conflict (country_code, name) do nothing;

update public.products p
set catalog_brand_id = cb.id
from public.catalog_brands cb
where p.catalog_brand_id is null
  and cb.country_code = p.country_code
  and cb.brand_id = p.brand_id;

-- Effective price (active sale of highest priority, otherwise base) becomes the single sale price.
insert into public.variant_prices (variant_id, currency, price)
select vs.variant_id, coalesce(eff.currency, c.currency), eff.amount
from (
  select v.id as variant_id, v.id as price_variant_id, p.country_code
  from public.product_variants v
  join public.products p on p.id = v.product_id
  where not exists (select 1 from variant_clones vc where vc.new_variant = v.id)
  union all
  select vc.new_variant, vc.source_variant, vc.country_code
  from variant_clones vc
) vs
join public.countries c on c.code = vs.country_code
left join lateral (
  select i.amount, l.currency
  from public.price_list_items i
  join public.price_lists l on l.id = i.price_list_id
  where l.country_code = vs.country_code
    and i.variant_id = vs.price_variant_id
    and l.is_active
    and (l.starts_at is null or l.starts_at <= now())
    and (l.ends_at is null or l.ends_at > now())
  order by (l.kind = 'sale') desc, l.priority desc, l.starts_at desc nulls last
  limit 1
) eff on true
on conflict (variant_id) do update
set currency = excluded.currency,
    price = excluded.price;

alter table public.products
  alter column country_code set not null,
  alter column catalog_brand_id set not null;

alter table public.products
  add constraint products_country_code_fkey foreign key (country_code) references public.countries (code) on delete cascade,
  add constraint products_catalog_brand_id_fkey foreign key (catalog_brand_id) references public.catalog_brands (id) on delete restrict,
  add constraint products_country_slug_key unique (country_code, slug),
  add constraint products_country_slug_en_key unique (country_code, slug_en);

create index products_country_idx on public.products (country_code, status);
create index products_catalog_brand_idx on public.products (catalog_brand_id);

-- Drop the global catalog overlay, price lists and local inventory.
drop view public.v_country_catalog;
drop function public.get_effective_price(text, uuid, timestamptz);
drop function public.get_available_stock(text, uuid);

drop table public.inventory_levels;
drop table public.warehouses;
drop table public.price_list_items;
drop table public.price_lists;
drop table public.country_products;
drop type public.price_list_kind;

drop index public.products_brand_idx;
alter table public.products drop column brand_id;

-- Public price: never the cost, and only when the product is on sale on the site.
-- Draft preview (service role) and country staff still receive it for purchasable products.
create function public.get_public_price(p_variant_id uuid)
returns table (
  amount numeric(12, 2),
  currency char(3)
)
language sql
stable
security definer
set search_path = ''
as $$
  select vp.price, vp.currency
  from public.variant_prices vp
  join public.product_variants v on v.id = vp.variant_id
  join public.products p on p.id = v.product_id
  where vp.variant_id = p_variant_id
    and vp.price is not null
    and v.is_active
    and p.is_visible
    and p.is_purchasable
    and (
      p.status = 'published'
      or (select auth.role()) = 'service_role'
      or private.has_country_role(p.country_code, 'viewer')
    );
$$;

revoke all on function public.get_public_price(uuid) from public;
grant execute on function public.get_public_price(uuid) to anon, authenticated, service_role;

create view public.v_country_catalog
with (security_invoker = true)
as
select
  p.country_code,
  p.id as product_id,
  p.slug,
  p.slug_en,
  p.catalog_brand_id,
  cb.name as catalog_brand_name,
  cb.brand_id,
  p.business_line_id,
  p.name_es,
  p.name_en,
  p.cover_media_id,
  p.status,
  p.is_visible,
  p.is_purchasable,
  p.is_featured,
  p.lead_time_days,
  p.sort,
  v.id as variant_id,
  v.sku,
  v.name_es as variant_name_es,
  v.name_en as variant_name_en,
  v.options,
  v.sort as variant_sort,
  price.amount,
  price.currency
from public.products p
join public.catalog_brands cb on cb.id = p.catalog_brand_id
join public.product_variants v on v.product_id = p.id and v.is_active
left join lateral public.get_public_price(v.id) price on true;

grant select on public.v_country_catalog to anon, authenticated;

-- An event can only feature products from its own country.
create function private.event_product_same_country()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.events e
    join public.products p on p.id = new.product_id
    where e.id = new.event_id and e.country_code = p.country_code
  ) then
    raise exception 'An event can only feature products from its own country' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger event_product_same_country before insert or update on public.event_products
  for each row execute function private.event_product_same_country();

revoke all on function private.event_product_same_country() from public;

-- RLS -----------------------------------------------------------------------
alter table public.catalog_brands enable row level security;
alter table public.variant_prices enable row level security;

drop policy "Anyone can read published products" on public.products;
drop policy "Staff can read products" on public.products;
drop policy "Catalog admins can insert products" on public.products;
drop policy "Catalog admins can update products" on public.products;
drop policy "Catalog admins can delete products" on public.products;

create policy "Anyone can read published products" on public.products
  for select to anon using (status = 'published' and is_visible);
create policy "Staff can read products" on public.products
  for select to authenticated using (
    (status = 'published' and is_visible) or private.has_country_role(country_code, 'viewer')
  );
create policy "Country admins can insert products" on public.products
  for insert to authenticated with check (private.has_country_role(country_code, 'admin'));
create policy "Country admins can update products" on public.products
  for update to authenticated
  using (private.has_country_role(country_code, 'admin'))
  with check (private.has_country_role(country_code, 'admin'));
create policy "Country admins can delete products" on public.products
  for delete to authenticated using (private.has_country_role(country_code, 'admin'));

drop policy "Anyone can read active variants of published products" on public.product_variants;
drop policy "Staff can read variants" on public.product_variants;
drop policy "Catalog admins can insert variants" on public.product_variants;
drop policy "Catalog admins can update variants" on public.product_variants;
drop policy "Catalog admins can delete variants" on public.product_variants;

create policy "Anyone can read active variants of published products" on public.product_variants
  for select to anon using (
    is_active and exists (
      select 1 from public.products p
      where p.id = product_id and p.status = 'published' and p.is_visible
    )
  );
create policy "Staff can read variants" on public.product_variants
  for select to authenticated using (
    exists (
      select 1 from public.products p
      where p.id = product_id
        and (
          (p.status = 'published' and p.is_visible)
          or private.has_country_role(p.country_code, 'viewer')
        )
    )
  );
create policy "Country admins can insert variants" on public.product_variants
  for insert to authenticated with check (
    exists (select 1 from public.products p where p.id = product_id and private.has_country_role(p.country_code, 'admin'))
  );
create policy "Country admins can update variants" on public.product_variants
  for update to authenticated
  using (exists (select 1 from public.products p where p.id = product_id and private.has_country_role(p.country_code, 'admin')))
  with check (exists (select 1 from public.products p where p.id = product_id and private.has_country_role(p.country_code, 'admin')));
create policy "Country admins can delete variants" on public.product_variants
  for delete to authenticated using (
    exists (select 1 from public.products p where p.id = product_id and private.has_country_role(p.country_code, 'admin'))
  );

do $$
declare
  t text;
begin
  foreach t in array array['product_sectors', 'product_media'] loop
    execute format('drop policy "Anyone can read %1$s" on public.%1$I', t);
    execute format('drop policy "Catalog admins can insert %1$s" on public.%1$I', t);
    execute format('drop policy "Catalog admins can update %1$s" on public.%1$I', t);
    execute format('drop policy "Catalog admins can delete %1$s" on public.%1$I', t);
    execute format('create policy "Anyone can read %1$s" on public.%1$I for select to anon, authenticated using (true)', t);
    execute format($f$
      create policy "Country admins can insert %1$s" on public.%1$I
      for insert to authenticated with check (
        exists (select 1 from public.products p where p.id = product_id and private.has_country_role(p.country_code, 'admin'))
      )
    $f$, t);
    execute format($f$
      create policy "Country admins can delete %1$s" on public.%1$I
      for delete to authenticated using (
        exists (select 1 from public.products p where p.id = product_id and private.has_country_role(p.country_code, 'admin'))
      )
    $f$, t);
  end loop;
end;
$$;

-- product_media has a sort column that editors update.
create policy "Country admins can update product_media" on public.product_media
  for update to authenticated
  using (exists (select 1 from public.products p where p.id = product_id and private.has_country_role(p.country_code, 'admin')))
  with check (exists (select 1 from public.products p where p.id = product_id and private.has_country_role(p.country_code, 'admin')));

drop policy "Anyone can read product designers" on public.product_designers;
drop policy "Catalog admins can insert product designers" on public.product_designers;
drop policy "Catalog admins can delete product designers" on public.product_designers;

create policy "Anyone can read product designers" on public.product_designers
  for select to anon, authenticated using (true);
create policy "Country admins can insert product designers" on public.product_designers
  for insert to authenticated with check (
    exists (select 1 from public.products p where p.id = product_id and private.has_country_role(p.country_code, 'admin'))
  );
create policy "Country admins can delete product designers" on public.product_designers
  for delete to authenticated using (
    exists (select 1 from public.products p where p.id = product_id and private.has_country_role(p.country_code, 'admin'))
  );

create policy "Anyone can read public catalog brands" on public.catalog_brands
  for select to anon using (
    exists (
      select 1 from public.products p
      where p.catalog_brand_id = catalog_brands.id and p.status = 'published' and p.is_visible
    )
  );
create policy "Staff can read catalog brands" on public.catalog_brands
  for select to authenticated using (
    private.has_country_role(country_code, 'viewer')
    or exists (
      select 1 from public.products p
      where p.catalog_brand_id = catalog_brands.id and p.status = 'published' and p.is_visible
    )
  );
create policy "Country admins can insert catalog brands" on public.catalog_brands
  for insert to authenticated with check (private.has_country_role(country_code, 'admin'));
create policy "Country admins can update catalog brands" on public.catalog_brands
  for update to authenticated
  using (private.has_country_role(country_code, 'admin'))
  with check (private.has_country_role(country_code, 'admin'));
create policy "Country admins can delete catalog brands" on public.catalog_brands
  for delete to authenticated using (private.has_country_role(country_code, 'admin'));

-- Cost and price are staff-only. The site reads the sale price through get_public_price.
create policy "Country staff can read variant prices" on public.variant_prices
  for select to authenticated using (
    exists (
      select 1
      from public.product_variants v
      join public.products p on p.id = v.product_id
      where v.id = variant_id and private.has_country_role(p.country_code, 'viewer')
    )
  );
create policy "Country admins can insert variant prices" on public.variant_prices
  for insert to authenticated with check (
    exists (
      select 1
      from public.product_variants v
      join public.products p on p.id = v.product_id
      where v.id = variant_id and private.has_country_role(p.country_code, 'admin')
    )
  );
create policy "Country admins can update variant prices" on public.variant_prices
  for update to authenticated
  using (
    exists (
      select 1
      from public.product_variants v
      join public.products p on p.id = v.product_id
      where v.id = variant_id and private.has_country_role(p.country_code, 'admin')
    )
  )
  with check (
    exists (
      select 1
      from public.product_variants v
      join public.products p on p.id = v.product_id
      where v.id = variant_id and private.has_country_role(p.country_code, 'admin')
    )
  );
create policy "Country admins can delete variant prices" on public.variant_prices
  for delete to authenticated using (
    exists (
      select 1
      from public.product_variants v
      join public.products p on p.id = v.product_id
      where v.id = variant_id and private.has_country_role(p.country_code, 'admin')
    )
  );

do $$
declare
  t text;
begin
  foreach t in array array['catalog_brands', 'variant_prices'] loop
    execute format(
      'create trigger audit_row after insert or update or delete on public.%I for each row execute function private.audit_row()',
      t
    );
  end loop;
end;
$$;

-- Attribute price rows to the product's country so country admins see them in their audit log.
create or replace function private.audit_row()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old jsonb := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end;
  v_new jsonb := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end;
  v_row jsonb := coalesce(v_new, v_old);
  v_diff jsonb;
  v_row_id text;
  v_country text;
begin
  if tg_op = 'UPDATE' then
    select
      jsonb_build_object(
        'old', coalesce(jsonb_object_agg(o.key, o.value) filter (where o.key is not null), '{}'::jsonb),
        'new', coalesce(jsonb_object_agg(o.key, v_new -> o.key) filter (where o.key is not null), '{}'::jsonb)
      )
    into v_diff
    from jsonb_each(v_old) o
    where o.value is distinct from v_new -> o.key and o.key <> 'updated_at';
    if v_diff = '{"old": {}, "new": {}}'::jsonb then
      return null;
    end if;
  elsif tg_op = 'INSERT' then
    v_diff := jsonb_build_object('new', v_new);
  else
    v_diff := jsonb_build_object('old', v_old);
  end if;

  v_row_id := coalesce(
    v_row ->> 'id',
    v_row ->> 'code',
    nullif(concat_ws(':', v_row ->> 'country_code', v_row ->> 'project_id', v_row ->> 'event_id',
                     v_row ->> 'product_id', v_row ->> 'variant_id',
                     v_row ->> 'brand_id', v_row ->> 'media_id', v_row ->> 'user_id', v_row ->> 'business_line_id',
                     v_row ->> 'sector_id'), '')
  );
  v_country := coalesce(
    v_row ->> 'country_code',
    case tg_table_name
      when 'countries' then v_row ->> 'code'
      when 'variant_prices' then (
        select p.country_code
        from public.product_variants v
        join public.products p on p.id = v.product_id
        where v.id = (v_row ->> 'variant_id')::uuid
      )
      when 'product_variants' then (
        select p.country_code from public.products p where p.id = (v_row ->> 'product_id')::uuid
      )
      when 'product_media' then (
        select p.country_code from public.products p where p.id = (v_row ->> 'product_id')::uuid
      )
      when 'product_sectors' then (
        select p.country_code from public.products p where p.id = (v_row ->> 'product_id')::uuid
      )
      when 'product_designers' then (
        select p.country_code from public.products p where p.id = (v_row ->> 'product_id')::uuid
      )
      when 'event_products' then (
        select e.country_code from public.events e where e.id = (v_row ->> 'event_id')::uuid
      )
    end
  );

  insert into public.audit_log (user_id, country_code, table_name, row_id, action, diff)
  values ((select auth.uid()), v_country, tg_table_name, v_row_id, lower(tg_op), v_diff);
  return null;
end;
$$;

revoke all on function private.audit_row() from public;
