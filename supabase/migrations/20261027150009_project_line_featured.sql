alter table public.project_business_lines
  add column is_featured boolean not null default false;

create policy "Editors can update project business lines" on public.project_business_lines
  for update to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and private.has_country_role(p.country_code, 'editor')
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and private.has_country_role(p.country_code, 'editor')
    )
  );

-- Keep the four projects each solution page already shows, so the pages stay filled.
with ranked as (
  select
    pbl.project_id,
    pbl.business_line_id,
    row_number() over (
      partition by p.country_code, pbl.business_line_id
      order by p.is_featured desc, p.sort asc, p.published_at desc nulls last, p.title_es asc
    ) as n
  from public.project_business_lines pbl
  join public.projects p on p.id = pbl.project_id
  where p.status = 'published'
)
update public.project_business_lines pbl
set is_featured = true
from ranked r
where pbl.project_id = r.project_id
  and pbl.business_line_id = r.business_line_id
  and r.n <= 4;
