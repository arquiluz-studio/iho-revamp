alter table public.brands
  add column origin_country_es text,
  add column origin_country_en text;

update public.brands
set origin_country_es = origin_country
where origin_country is not null
  and origin_country_es is null;

alter table public.brands drop column origin_country;

comment on column public.brands.origin_country_es is
  'País de origen en español. Si el inglés queda vacío, la ficha usa este texto.';
comment on column public.brands.origin_country_en is
  'País de origen en inglés. Opcional.';
