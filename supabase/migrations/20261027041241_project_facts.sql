alter table public.projects
  add column facts jsonb not null default '[]'::jsonb
  check (jsonb_typeof(facts) = 'array');
