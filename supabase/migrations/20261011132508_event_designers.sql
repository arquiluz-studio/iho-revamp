-- Designers featured in an event (like event_brands). Written by the event's country editors.
create table public.event_designers (
  event_id uuid not null references public.events (id) on delete cascade,
  designer_id uuid not null references public.designers (id) on delete cascade,
  primary key (event_id, designer_id)
);

create index event_designers_designer_idx on public.event_designers (designer_id);

alter table public.event_designers enable row level security;

create trigger audit_row after insert or update or delete on public.event_designers
  for each row execute function private.audit_row();

create policy "Anyone can read event designers" on public.event_designers
  for select to anon, authenticated using (true);
create policy "Editors can insert event designers" on public.event_designers
  for insert to authenticated with check (
    exists (select 1 from public.events e where e.id = event_id and private.has_country_role(e.country_code, 'editor'))
  );
create policy "Editors can delete event designers" on public.event_designers
  for delete to authenticated using (
    exists (select 1 from public.events e where e.id = event_id and private.has_country_role(e.country_code, 'editor'))
  );
