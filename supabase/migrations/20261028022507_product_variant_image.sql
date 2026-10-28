-- A product photo belongs to each variant. Usage photos stay in product_media;
-- the first of those remains products.cover_media_id, shown when a card is hovered.

alter table public.product_variants
  add column image_media_id uuid references public.media_assets (id) on delete set null;

create index product_variants_image_idx on public.product_variants (image_media_id);

comment on column public.product_variants.image_media_id is
  'Foto de producto de esta variante. Las fotos de uso siguen en product_media; la primera es la portada del hover.';

-- Keep every photo the site shows today: the cover, or the first gallery shot when the cover is empty.
with shot as (
  select
    p.id as product_id,
    coalesce(
      p.cover_media_id,
      (
        select pm.media_id
        from public.product_media pm
        where pm.product_id = p.id
        order by pm.sort, pm.media_id
        limit 1
      )
    ) as media_id
  from public.products p
)
update public.product_variants v
set image_media_id = shot.media_id
from shot
where v.product_id = shot.product_id
  and shot.media_id is not null
  and v.image_media_id is null;

-- That shot leaves the usage gallery so it is not repeated as the hover cover.
delete from public.product_media pm
where exists (
  select 1
  from public.product_variants v
  where v.product_id = pm.product_id
    and v.image_media_id = pm.media_id
);

-- The hover cover is the first usage photo that remains.
update public.products p
set cover_media_id = (
  select pm.media_id
  from public.product_media pm
  where pm.product_id = p.id
  order by pm.sort, pm.media_id
  limit 1
);
