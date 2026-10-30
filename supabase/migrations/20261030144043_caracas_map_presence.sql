alter table public.offices alter column address drop not null;

comment on column public.offices.address is
  'Dirección pública. Vacía: la ciudad sale en el mapa de Grupo IHO, sin dirección.';

insert into public.countries (code, name_es, name_en, domain, is_hq, is_active, currency, timezone, sort)
values ('ve', 'Venezuela', 'Venezuela', null, false, true, 'VES', 'America/Caracas', 5)
on conflict (code) do nothing;

insert into public.offices (country_code, city, address, is_main, sort, latitude, longitude)
select 've', 'CARACAS', null, true, 1, 10.48, -66.9
where not exists (
  select 1 from public.offices o where o.country_code = 've' and upper(o.city) = 'CARACAS'
);
