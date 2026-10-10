-- Global product catalog with per-country availability, price lists and inventory.
-- A product is global (one record, one translation, same photos); each country decides whether it is
-- visible, purchasable, at which price and with how much stock.

create type public.price_list_kind as enum ('base', 'sale');

-- products ------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  brand_id uuid not null references public.brands (id) on delete restrict,
  business_line_id uuid references public.business_lines (id) on delete set null,
  name_es text not null,
  name_en text,
  description_es text,
  description_en text,
  designer text,
  -- [{"label_es": "Dimensiones", "label_en": "Dimensions", "value": "60 × 55 × 80 cm"}, ...]
  specs jsonb not null default '[]'::jsonb check (jsonb_typeof(specs) = 'array'),
  cover_media_id uuid references public.media_assets (id) on delete set null,
  status public.content_status not null default 'draft',
  erp_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_brand_idx on public.products (brand_id);
create index products_business_line_idx on public.products (business_line_id);
create index products_cover_idx on public.products (cover_media_id);
create index products_status_idx on public.products (status);

create table public.product_sectors (
  product_id uuid not null references public.products (id) on delete cascade,
  sector_id uuid not null references public.sectors (id) on delete cascade,
  primary key (product_id, sector_id)
);

create index product_sectors_sector_idx on public.product_sectors (sector_id);

create table public.product_media (
  product_id uuid not null references public.products (id) on delete cascade,
  media_id uuid not null references public.media_assets (id) on delete cascade,
  sort int not null default 0,
  primary key (product_id, media_id)
);

create index product_media_media_idx on public.product_media (media_id);

-- variants (every product has at least one) ---------------------------------
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  sku text unique,
  name_es text not null default 'Estándar',
  name_en text,
  -- {"finish": "black", "cct": "3000K"}
  options jsonb not null default '{}'::jsonb check (jsonb_typeof(options) = 'object'),
  weight_kg numeric(10, 3) check (weight_kg is null or weight_kg >= 0),
  dimensions jsonb,
  erp_ref text,
  is_active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index product_variants_product_idx on public.product_variants (product_id, sort);

create function private.create_default_variant()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.product_variants (product_id, name_es, name_en) values (new.id, 'Estándar', 'Standard');
  return null;
end;
$$;

create trigger create_default_variant after insert on public.products
  for each row execute function private.create_default_variant();

create function private.keep_one_variant()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Deleting the product cascades to its variants: allowed. Removing the last variant of a live product: not.
  if exists (select 1 from public.products p where p.id = old.product_id)
     and not exists (select 1 from public.product_variants v where v.product_id = old.product_id and v.id <> old.id) then
    raise exception 'A product must keep at least one variant' using errcode = 'check_violation';
  end if;
  return old;
end;
$$;

create trigger keep_one_variant before delete on public.product_variants
  for each row execute function private.keep_one_variant();

-- per-country availability --------------------------------------------------
create table public.country_products (
  country_code text not null references public.countries (code) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  is_visible boolean not null default true,
  -- Future checkout. Today it decides between showing the price and the "Quote" CTA.
  is_purchasable boolean not null default false,
  is_featured boolean not null default false,
  -- Shown as "on request" lead time when there is no stock.
  lead_time_days int check (lead_time_days is null or lead_time_days >= 0),
  sort int not null default 0,
  primary key (country_code, product_id)
);

create index country_products_product_idx on public.country_products (product_id);

-- price lists ---------------------------------------------------------------
create table public.price_lists (
  id uuid primary key default gen_random_uuid(),
  country_code text not null references public.countries (code) on delete cascade,
  currency char(3) not null,
  name text not null,
  kind public.price_list_kind not null default 'base',
  -- Higher wins when lists of the same kind overlap.
  priority int not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at is null or ends_at is null or ends_at > starts_at)
);

create index price_lists_country_idx on public.price_lists (country_code, kind, is_active);

create table public.price_list_items (
  price_list_id uuid not null references public.price_lists (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0),
  compare_at_amount numeric(12, 2) check (compare_at_amount is null or compare_at_amount >= 0),
  primary key (price_list_id, variant_id)
);

create index price_list_items_variant_idx on public.price_list_items (variant_id);

-- inventory -----------------------------------------------------------------
create table public.warehouses (
  id uuid primary key default gen_random_uuid(),
  country_code text not null references public.countries (code) on delete cascade,
  name text not null,
  erp_ref text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index warehouses_country_idx on public.warehouses (country_code);

create table public.inventory_levels (
  warehouse_id uuid not null references public.warehouses (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  on_hand int not null default 0,
  reserved int not null default 0 check (reserved >= 0),
  source text not null default 'manual' check (source in ('manual', 'erp')),
  synced_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (warehouse_id, variant_id)
);

create index inventory_levels_variant_idx on public.inventory_levels (variant_id);

-- events ↔ products (curated "products on display") -------------------------
create table public.event_products (
  event_id uuid not null references public.events (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  sort int not null default 0,
  primary key (event_id, product_id)
);

create index event_products_product_idx on public.event_products (product_id);

-- triggers ------------------------------------------------------------------
create trigger set_updated_at before update on public.products
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.product_variants
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.price_lists
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.warehouses
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.inventory_levels
  for each row execute function private.set_updated_at();

do $$
declare
  t text;
begin
  foreach t in array array[
    'products', 'product_sectors', 'product_media', 'product_variants', 'country_products',
    'price_lists', 'price_list_items', 'warehouses', 'inventory_levels', 'event_products'
  ] loop
    execute format(
      'create trigger audit_row after insert or update or delete on public.%I for each row execute function private.audit_row()',
      t
    );
  end loop;
end;
$$;

-- RLS -----------------------------------------------------------------------
alter table public.products enable row level security;
alter table public.product_sectors enable row level security;
alter table public.product_media enable row level security;
alter table public.product_variants enable row level security;
alter table public.country_products enable row level security;
alter table public.price_lists enable row level security;
alter table public.price_list_items enable row level security;
alter table public.warehouses enable row level security;
alter table public.inventory_levels enable row level security;
alter table public.event_products enable row level security;

-- Global catalog: anon reads published products; catalog/super admins write.
create policy "Anyone can read published products" on public.products
  for select to anon using (status = 'published');
create policy "Staff can read products" on public.products
  for select to authenticated using (status = 'published' or (select private.is_staff()));
create policy "Catalog admins can insert products" on public.products
  for insert to authenticated with check ((select private.can_manage_catalog()));
create policy "Catalog admins can update products" on public.products
  for update to authenticated using ((select private.can_manage_catalog())) with check ((select private.can_manage_catalog()));
create policy "Catalog admins can delete products" on public.products
  for delete to authenticated using ((select private.can_manage_catalog()));

create policy "Anyone can read active variants of published products" on public.product_variants
  for select to anon using (
    is_active and exists (select 1 from public.products p where p.id = product_id and p.status = 'published')
  );
create policy "Staff can read variants" on public.product_variants
  for select to authenticated using (
    (select private.is_staff())
    or (is_active and exists (select 1 from public.products p where p.id = product_id and p.status = 'published'))
  );
create policy "Catalog admins can insert variants" on public.product_variants
  for insert to authenticated with check ((select private.can_manage_catalog()));
create policy "Catalog admins can update variants" on public.product_variants
  for update to authenticated using ((select private.can_manage_catalog())) with check ((select private.can_manage_catalog()));
create policy "Catalog admins can delete variants" on public.product_variants
  for delete to authenticated using ((select private.can_manage_catalog()));

do $$
declare
  t text;
begin
  foreach t in array array['product_sectors', 'product_media'] loop
    execute format('create policy "Anyone can read %1$s" on public.%1$I for select to anon, authenticated using (true)', t);
    execute format('create policy "Catalog admins can insert %1$s" on public.%1$I for insert to authenticated with check ((select private.can_manage_catalog()))', t);
    execute format('create policy "Catalog admins can update %1$s" on public.%1$I for update to authenticated using ((select private.can_manage_catalog())) with check ((select private.can_manage_catalog()))', t);
    execute format('create policy "Catalog admins can delete %1$s" on public.%1$I for delete to authenticated using ((select private.can_manage_catalog()))', t);
  end loop;
end;
$$;

-- Country availability, prices and inventory: country admins write.
create policy "Anyone can read visible country products" on public.country_products
  for select to anon using (is_visible);
create policy "Staff can read country products" on public.country_products
  for select to authenticated using (is_visible or private.has_country_role(country_code, 'viewer'));
create policy "Country admins can insert country products" on public.country_products
  for insert to authenticated with check (private.has_country_role(country_code, 'admin'));
create policy "Country admins can update country products" on public.country_products
  for update to authenticated
  using (private.has_country_role(country_code, 'admin'))
  with check (private.has_country_role(country_code, 'admin'));
create policy "Country admins can delete country products" on public.country_products
  for delete to authenticated using (private.has_country_role(country_code, 'admin'));

-- Prices and stock are not readable by anon: the public site gets them through get_effective_price /
-- v_country_catalog, which only reveal prices of purchasable products.
create policy "Country staff can read price lists" on public.price_lists
  for select to authenticated using (private.has_country_role(country_code, 'viewer'));
create policy "Country admins can insert price lists" on public.price_lists
  for insert to authenticated with check (private.has_country_role(country_code, 'admin'));
create policy "Country admins can update price lists" on public.price_lists
  for update to authenticated
  using (private.has_country_role(country_code, 'admin'))
  with check (private.has_country_role(country_code, 'admin'));
create policy "Country admins can delete price lists" on public.price_lists
  for delete to authenticated using (private.has_country_role(country_code, 'admin'));

create policy "Country staff can read price list items" on public.price_list_items
  for select to authenticated using (
    exists (select 1 from public.price_lists l where l.id = price_list_id and private.has_country_role(l.country_code, 'viewer'))
  );
create policy "Country admins can insert price list items" on public.price_list_items
  for insert to authenticated with check (
    exists (select 1 from public.price_lists l where l.id = price_list_id and private.has_country_role(l.country_code, 'admin'))
  );
create policy "Country admins can update price list items" on public.price_list_items
  for update to authenticated
  using (exists (select 1 from public.price_lists l where l.id = price_list_id and private.has_country_role(l.country_code, 'admin')))
  with check (exists (select 1 from public.price_lists l where l.id = price_list_id and private.has_country_role(l.country_code, 'admin')));
create policy "Country admins can delete price list items" on public.price_list_items
  for delete to authenticated using (
    exists (select 1 from public.price_lists l where l.id = price_list_id and private.has_country_role(l.country_code, 'admin'))
  );

create policy "Country staff can read warehouses" on public.warehouses
  for select to authenticated using (private.has_country_role(country_code, 'viewer'));
create policy "Country admins can insert warehouses" on public.warehouses
  for insert to authenticated with check (private.has_country_role(country_code, 'admin'));
create policy "Country admins can update warehouses" on public.warehouses
  for update to authenticated
  using (private.has_country_role(country_code, 'admin'))
  with check (private.has_country_role(country_code, 'admin'));
create policy "Country admins can delete warehouses" on public.warehouses
  for delete to authenticated using (private.has_country_role(country_code, 'admin'));

create policy "Country staff can read inventory" on public.inventory_levels
  for select to authenticated using (
    exists (select 1 from public.warehouses w where w.id = warehouse_id and private.has_country_role(w.country_code, 'viewer'))
  );
create policy "Country admins can insert inventory" on public.inventory_levels
  for insert to authenticated with check (
    exists (select 1 from public.warehouses w where w.id = warehouse_id and private.has_country_role(w.country_code, 'admin'))
  );
create policy "Country admins can update inventory" on public.inventory_levels
  for update to authenticated
  using (exists (select 1 from public.warehouses w where w.id = warehouse_id and private.has_country_role(w.country_code, 'admin')))
  with check (exists (select 1 from public.warehouses w where w.id = warehouse_id and private.has_country_role(w.country_code, 'admin')));
create policy "Country admins can delete inventory" on public.inventory_levels
  for delete to authenticated using (
    exists (select 1 from public.warehouses w where w.id = warehouse_id and private.has_country_role(w.country_code, 'admin'))
  );

create policy "Anyone can read event products" on public.event_products
  for select to anon, authenticated using (true);
create policy "Event editors can insert event products" on public.event_products
  for insert to authenticated with check (
    exists (select 1 from public.events e where e.id = event_id and private.has_country_role(e.country_code, 'editor'))
  );
create policy "Event editors can update event products" on public.event_products
  for update to authenticated
  using (exists (select 1 from public.events e where e.id = event_id and private.has_country_role(e.country_code, 'editor')))
  with check (exists (select 1 from public.events e where e.id = event_id and private.has_country_role(e.country_code, 'editor')));
create policy "Event editors can delete event products" on public.event_products
  for delete to authenticated using (
    exists (select 1 from public.events e where e.id = event_id and private.has_country_role(e.country_code, 'editor'))
  );

-- Effective price -----------------------------------------------------------
-- Active `sale` list of highest priority within its dates that contains the variant; otherwise the active
-- `base` list. compare_at falls back to the base price while a sale applies. Prices are only revealed for
-- products purchasable in that country, or to the country's staff.
create function public.get_effective_price(p_country_code text, p_variant_id uuid, p_at timestamptz default now())
returns table (
  amount numeric(12, 2),
  compare_at_amount numeric(12, 2),
  currency char(3),
  price_list_id uuid,
  kind public.price_list_kind
)
language sql
stable
security definer
set search_path = ''
as $$
  with allowed as (
    select 1
    where private.has_country_role(p_country_code, 'viewer')
       or exists (
         select 1
         from public.product_variants v
         join public.country_products cp on cp.product_id = v.product_id
         where v.id = p_variant_id and cp.country_code = p_country_code and cp.is_visible and cp.is_purchasable
       )
  ),
  candidates as (
    select i.amount, i.compare_at_amount, l.currency, l.id as price_list_id, l.kind, l.priority, l.starts_at
    from public.price_list_items i
    join public.price_lists l on l.id = i.price_list_id
    where l.country_code = p_country_code
      and i.variant_id = p_variant_id
      and l.is_active
      and (l.starts_at is null or l.starts_at <= p_at)
      and (l.ends_at is null or l.ends_at > p_at)
  ),
  base as (
    select c.amount from candidates c where c.kind = 'base' order by c.priority desc, c.starts_at desc nulls last limit 1
  )
  select
    c.amount,
    coalesce(c.compare_at_amount, case when c.kind = 'sale' then (select b.amount from base b where b.amount > c.amount) end),
    c.currency,
    c.price_list_id,
    c.kind
  from candidates c
  where exists (select 1 from allowed)
  order by (c.kind = 'sale') desc, c.priority desc, c.starts_at desc nulls last
  limit 1;
$$;

revoke all on function public.get_effective_price(text, uuid, timestamptz) from public;
grant execute on function public.get_effective_price(text, uuid, timestamptz) to anon, authenticated, service_role;

-- Available stock = sum(on_hand - reserved) over the country's active warehouses.
create function public.get_available_stock(p_country_code text, p_variant_id uuid)
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(sum(greatest(il.on_hand - il.reserved, 0)), 0)::int
  from public.inventory_levels il
  join public.warehouses w on w.id = il.warehouse_id
  where w.country_code = p_country_code and w.is_active and il.variant_id = p_variant_id;
$$;

revoke all on function public.get_available_stock(text, uuid) from public;
grant execute on function public.get_available_stock(text, uuid) to anon, authenticated, service_role;

-- One row per (country, visible product, active variant) with effective price and stock. security_invoker:
-- the caller's RLS applies to products / variants / country_products (anon: published + visible only).
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
  p.designer,
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

-- Audit: identify catalog rows by their keys and attribute prices / inventory to the list's or warehouse's
-- country, so country admins see those changes in their audit log.
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
                     v_row ->> 'product_id', v_row ->> 'price_list_id', v_row ->> 'warehouse_id', v_row ->> 'variant_id',
                     v_row ->> 'brand_id', v_row ->> 'media_id', v_row ->> 'user_id', v_row ->> 'business_line_id',
                     v_row ->> 'sector_id'), '')
  );
  v_country := coalesce(
    v_row ->> 'country_code',
    case tg_table_name
      when 'countries' then v_row ->> 'code'
      when 'price_list_items' then (select l.country_code from public.price_lists l where l.id = (v_row ->> 'price_list_id')::uuid)
      when 'inventory_levels' then (select w.country_code from public.warehouses w where w.id = (v_row ->> 'warehouse_id')::uuid)
    end
  );

  insert into public.audit_log (user_id, country_code, table_name, row_id, action, diff)
  values ((select auth.uid()), v_country, tg_table_name, v_row_id, lower(tg_op), v_diff);
  return null;
end;
$$;

revoke all on function private.audit_row() from public;
