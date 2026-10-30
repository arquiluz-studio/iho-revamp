-- Home hero slideshow. Each slide is a photo or a video, with its own copy and buttons.
-- Photo slides store duration_seconds (3–30). Video slides omit it and play to the end.
-- Legacy hero columns stay in place. This copies a slide only when a photo or video already exists.

create function private.hero_slide_valid(item jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  seconds int;
begin
  if pg_catalog.jsonb_typeof(item) is distinct from 'object' then
    return false;
  end if;
  if item->>'kind' not in ('image', 'video') then
    return false;
  end if;
  if pg_catalog.lower(coalesce(item->>'media_id', '')) !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return false;
  end if;
  if pg_catalog.length(coalesce(item->>'eyebrow_es', '')) > 120
    or pg_catalog.length(coalesce(item->>'eyebrow_en', '')) > 120
    or pg_catalog.length(coalesce(item->>'title_es', '')) > 200
    or pg_catalog.length(coalesce(item->>'title_en', '')) > 200
    or pg_catalog.length(coalesce(item->>'subtitle_es', '')) > 400
    or pg_catalog.length(coalesce(item->>'subtitle_en', '')) > 400
  then
    return false;
  end if;
  if item->>'kind' = 'image' then
    if pg_catalog.jsonb_typeof(item->'duration_seconds') is distinct from 'number' then
      return false;
    end if;
    if (item->>'duration_seconds') !~ '^[0-9]+$' then
      return false;
    end if;
    seconds := (item->>'duration_seconds')::int;
    if seconds < 3 or seconds > 30 then
      return false;
    end if;
  elsif item ? 'duration_seconds' and pg_catalog.jsonb_typeof(item->'duration_seconds') is distinct from 'null' then
    return false;
  end if;
  return private.hero_ctas_valid(coalesce(item->'ctas', '[]'::jsonb));
end;
$$;

create function private.hero_slides_valid(value jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  i int;
  n int;
begin
  if pg_catalog.jsonb_typeof(value) is distinct from 'array' then
    return false;
  end if;
  n := pg_catalog.jsonb_array_length(value);
  if n > 20 then
    return false;
  end if;
  for i in 0 .. n - 1 loop
    if not private.hero_slide_valid(value -> i) then
      return false;
    end if;
  end loop;
  return true;
end;
$$;

revoke all on function private.hero_slide_valid(jsonb) from public;
revoke all on function private.hero_slides_valid(jsonb) from public;
grant execute on function private.hero_slide_valid(jsonb), private.hero_slides_valid(jsonb) to anon, authenticated, service_role;

alter table public.site_pages
  add column if not exists hero_slides jsonb not null default '[]'::jsonb;

alter table public.site_pages drop constraint if exists site_pages_hero_slides_check;
alter table public.site_pages
  add constraint site_pages_hero_slides_check check (private.hero_slides_valid(hero_slides));

alter table public.country_settings
  add column if not exists hero_slides jsonb not null default '[]'::jsonb;

alter table public.country_settings drop constraint if exists country_settings_hero_slides_check;
alter table public.country_settings
  add constraint country_settings_hero_slides_check check (private.hero_slides_valid(hero_slides));

update public.site_pages
set hero_slides = jsonb_build_array(
  jsonb_strip_nulls(jsonb_build_object(
    'kind', case when hero_video_media_id is not null then 'video' else 'image' end,
    'media_id', coalesce(hero_video_media_id, hero_image_media_id),
    'duration_seconds', case when hero_video_media_id is null then to_jsonb(6) else null end,
    'eyebrow_es', hero_eyebrow_es,
    'eyebrow_en', hero_eyebrow_en,
    'title_es', hero_title_es,
    'title_en', hero_title_en,
    'subtitle_es', hero_subtitle_es,
    'subtitle_en', hero_subtitle_en,
    'ctas', coalesce(hero_ctas, '[]'::jsonb)
  ))
)
where page_key = 'home'
  and hero_slides = '[]'::jsonb
  and (hero_video_media_id is not null or hero_image_media_id is not null);

update public.country_settings
set hero_slides = jsonb_build_array(
  jsonb_strip_nulls(jsonb_build_object(
    'kind', case when hero_video_media_id is not null then 'video' else 'image' end,
    'media_id', coalesce(hero_video_media_id, hero_image_media_id),
    'duration_seconds', case when hero_video_media_id is null then to_jsonb(6) else null end,
    'eyebrow_es', hero_eyebrow_es,
    'eyebrow_en', hero_eyebrow_en,
    'title_es', hero_title_es,
    'title_en', hero_title_en,
    'subtitle_es', hero_subtitle_es,
    'subtitle_en', hero_subtitle_en,
    'ctas', coalesce(hero_ctas, '[]'::jsonb)
  ))
)
where hero_slides = '[]'::jsonb
  and (hero_video_media_id is not null or hero_image_media_id is not null);
