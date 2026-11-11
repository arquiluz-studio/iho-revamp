-- Venezuela leaves map-only presence and becomes a full country site.

update public.countries
set domain = 'iho.com.ve'
where code = 've' and domain is null;

insert into public.country_settings (country_code)
values ('ve')
on conflict (country_code) do nothing;

update public.offices
set address = E'Urbanización Las Mercedes\nCaracas 1080\nMiranda, Venezuela'
where country_code = 've' and upper(city) = 'CARACAS' and address is null;
