-- Up to two hero buttons per content page. Each button is its own style, label and destination.
-- A country row starts empty: publishing that source shows no buttons until they are added.

create function private.hero_cta_valid(item jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select
    pg_catalog.jsonb_typeof(item) = 'object'
    and item->>'style' in ('red', 'outline', 'black')
    and item->>'open_in' in ('self', 'blank')
    and item->>'kind' in ('page', 'url')
    and pg_catalog.length(pg_catalog.btrim(coalesce(item->>'label_es', ''))) between 1 and 80
    and pg_catalog.length(coalesce(item->>'label_en', '')) <= 80
    and (
      (
        item->>'kind' = 'page'
        and item->>'page' in (
          'home', 'group', 'projects', 'brands', 'designers',
          'solutions', 'spaces', 'events', 'products', 'contact', 'privacy'
        )
      )
      or (
        item->>'kind' = 'url'
        and pg_catalog.length(pg_catalog.btrim(coalesce(item->>'url', ''))) between 1 and 500
        and item->>'url' ~ '^(https://|http://|#)'
      )
    );
$$;

create function private.hero_ctas_valid(value jsonb)
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
  if n > 2 then
    return false;
  end if;
  for i in 0 .. n - 1 loop
    if not private.hero_cta_valid(value -> i) then
      return false;
    end if;
  end loop;
  return true;
end;
$$;

revoke all on function private.hero_cta_valid(jsonb) from public;
revoke all on function private.hero_ctas_valid(jsonb) from public;
grant execute on function private.hero_cta_valid(jsonb), private.hero_ctas_valid(jsonb) to anon, authenticated, service_role;

alter table public.site_pages
  add column hero_ctas jsonb not null default '[]'::jsonb,
  add constraint site_pages_hero_ctas_check check (private.hero_ctas_valid(hero_ctas));

alter table public.country_settings
  add column hero_ctas jsonb not null default '[]'::jsonb,
  add constraint country_settings_hero_ctas_check check (private.hero_ctas_valid(hero_ctas));

alter table public.country_pages
  add column hero_ctas jsonb not null default '[]'::jsonb,
  add constraint country_pages_hero_ctas_check check (private.hero_ctas_valid(hero_ctas));

-- The home button that used to be fixed in the page.
update public.site_pages
set hero_ctas = '[
  {
    "style": "red",
    "label_es": "Cuéntanos tu proyecto",
    "label_en": "Tell us about your project",
    "open_in": "self",
    "kind": "url",
    "url": "#contacto"
  }
]'::jsonb
where page_key = 'home';
