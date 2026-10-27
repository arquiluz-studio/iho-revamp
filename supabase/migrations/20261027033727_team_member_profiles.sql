alter table public.team_members
  add column slug text,
  add column bio_es text,
  add column bio_en text,
  add column email text,
  add column phone text;

with ranked as (
  select
    id,
    coalesce(
      nullif(
        trim(both '-' from lower(regexp_replace(
          translate(full_name, 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun'),
          '[^a-zA-Z0-9]+',
          '-',
          'g'
        ))),
        ''
      ),
      'integrante'
    ) as base,
    row_number() over (
      partition by
        country_code,
        coalesce(
          nullif(
            trim(both '-' from lower(regexp_replace(
              translate(full_name, 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun'),
              '[^a-zA-Z0-9]+',
              '-',
              'g'
            ))),
            ''
          ),
          'integrante'
        )
      order by sort, id
    ) as n
  from public.team_members
)
update public.team_members as member
set slug = case when ranked.n = 1 then ranked.base else ranked.base || '-' || ranked.n::text end
from ranked
where member.id = ranked.id;

alter table public.team_members
  alter column slug set not null,
  add constraint team_members_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  add constraint team_members_country_slug_key unique (country_code, slug);
