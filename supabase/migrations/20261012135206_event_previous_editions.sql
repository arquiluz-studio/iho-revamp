-- Past events chosen by hand as the "previous editions" of a newer event.
-- Order is not stored: the public page sorts them by the past event's date.
create table public.event_previous_editions (
  event_id uuid not null references public.events (id) on delete cascade,
  previous_event_id uuid not null references public.events (id) on delete cascade,
  primary key (event_id, previous_event_id),
  check (event_id <> previous_event_id)
);

create index event_previous_editions_previous_idx on public.event_previous_editions (previous_event_id);

alter table public.event_previous_editions enable row level security;

-- Both events must belong to the same country. Security definer so a published event from another country is still rejected.
create function private.event_previous_same_country()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.events current
    join public.events previous on previous.id = new.previous_event_id
    where current.id = new.event_id
      and current.country_code = previous.country_code
  ) then
    raise exception 'Previous edition must be an event of the same country';
  end if;
  return new;
end;
$$;

revoke all on function private.event_previous_same_country() from public;
grant execute on function private.event_previous_same_country() to authenticated, service_role;

create trigger event_previous_same_country
  before insert or update on public.event_previous_editions
  for each row execute function private.event_previous_same_country();

create trigger audit_row after insert or update or delete on public.event_previous_editions
  for each row execute function private.audit_row();

create policy "Anyone can read event previous editions" on public.event_previous_editions
  for select to anon, authenticated using (true);
create policy "Editors can insert event previous editions" on public.event_previous_editions
  for insert to authenticated with check (
    exists (select 1 from public.events e where e.id = event_id and private.has_country_role(e.country_code, 'editor'))
  );
create policy "Editors can delete event previous editions" on public.event_previous_editions
  for delete to authenticated using (
    exists (select 1 from public.events e where e.id = event_id and private.has_country_role(e.country_code, 'editor'))
  );
