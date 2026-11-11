-- Copy Mexico's catalog into Venezuela so the shop is not empty.
-- Photos stay on the existing media rows. SKUs gain a -VE suffix because they are unique worldwide.
-- Sale prices keep their amount and are stored in VES. Venezuela does not sell in Mexican pesos.

insert into public.catalog_brands (country_code, name, brand_id, erp_ref)
select 've', name, brand_id, erp_ref
from public.catalog_brands
where country_code = 'mx'
on conflict (country_code, name) do nothing;

insert into public.products (
  country_code, catalog_brand_id, business_line_id, slug, slug_en,
  name_es, name_en, description_es, description_en, specs, cover_media_id,
  status, erp_ref, is_visible, is_purchasable, is_featured, lead_time_days, sort
)
select
  've', ve_brand.id, p.business_line_id, p.slug, p.slug_en,
  p.name_es, p.name_en, p.description_es, p.description_en, p.specs, p.cover_media_id,
  p.status, p.erp_ref, p.is_visible, p.is_purchasable, p.is_featured, p.lead_time_days, p.sort
from public.products p
join public.catalog_brands mx_brand on mx_brand.id = p.catalog_brand_id
join public.catalog_brands ve_brand on ve_brand.country_code = 've' and ve_brand.name = mx_brand.name
where p.country_code = 'mx'
on conflict (country_code, slug) do nothing;

update public.product_variants dst
set
  sku = case
    when src.sku is null then null
    when src.sku ~ '-MX$' then regexp_replace(src.sku, '-MX$', '-VE')
    else src.sku || '-VE'
  end,
  name_es = src.name_es,
  name_en = src.name_en,
  options = src.options,
  weight_kg = src.weight_kg,
  dimensions = src.dimensions,
  erp_ref = src.erp_ref,
  is_active = src.is_active,
  sort = src.sort,
  image_media_id = src.image_media_id
from public.products p_ve
join public.products p_mx on p_mx.country_code = 'mx' and p_mx.slug = p_ve.slug
join lateral (
  select *
  from public.product_variants v
  where v.product_id = p_mx.id
  order by v.sort, v.created_at
  limit 1
) src on true
where dst.product_id = p_ve.id
  and p_ve.country_code = 've'
  and (select count(*) from public.product_variants v where v.product_id = p_ve.id) = 1;

update public.variant_prices dst
set
  cost = src.cost,
  price = src.price,
  currency = 'VES'
from public.product_variants ve_variant
join public.products p_ve on p_ve.id = ve_variant.product_id and p_ve.country_code = 've'
join public.products p_mx on p_mx.country_code = 'mx' and p_mx.slug = p_ve.slug
join lateral (
  select vp.cost, vp.price
  from public.product_variants v
  join public.variant_prices vp on vp.variant_id = v.id
  where v.product_id = p_mx.id
  order by v.sort, v.created_at
  limit 1
) src on true
where dst.variant_id = ve_variant.id
  and (select count(*) from public.product_variants v where v.product_id = p_ve.id) = 1;

insert into public.product_media (product_id, media_id, sort)
select p_ve.id, pm.media_id, pm.sort
from public.product_media pm
join public.products p_mx on p_mx.id = pm.product_id and p_mx.country_code = 'mx'
join public.products p_ve on p_ve.country_code = 've' and p_ve.slug = p_mx.slug
on conflict (product_id, media_id) do nothing;

insert into public.product_designers (product_id, designer_id)
select p_ve.id, pd.designer_id
from public.product_designers pd
join public.products p_mx on p_mx.id = pd.product_id and p_mx.country_code = 'mx'
join public.products p_ve on p_ve.country_code = 've' and p_ve.slug = p_mx.slug
on conflict (product_id, designer_id) do nothing;
