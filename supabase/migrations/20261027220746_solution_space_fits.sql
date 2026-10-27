-- How each solution is told for each space. One row feeds both public pages.

create table public.solution_space_fits (
  business_line_id uuid not null references public.business_lines (id) on delete cascade,
  sector_id uuid not null references public.sectors (id) on delete cascade,
  body_es text check (body_es is null or char_length(body_es) <= 600),
  body_en text check (body_en is null or char_length(body_en) <= 600),
  image_media_id uuid references public.media_assets (id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (business_line_id, sector_id)
);

create index solution_space_fits_sector_idx on public.solution_space_fits (sector_id);
create index solution_space_fits_image_idx on public.solution_space_fits (image_media_id);

alter table public.solution_space_fits enable row level security;

create trigger set_updated_at before update on public.solution_space_fits
  for each row execute function private.set_updated_at();
create trigger audit_row after insert or update or delete on public.solution_space_fits
  for each row execute function private.audit_row();

create policy "Anyone can read solution space fits" on public.solution_space_fits
  for select to anon, authenticated using (true);
create policy "Catalog admins can insert solution space fits" on public.solution_space_fits
  for insert to authenticated with check ((select private.can_manage_catalog()));
create policy "Catalog admins can update solution space fits" on public.solution_space_fits
  for update to authenticated using ((select private.can_manage_catalog())) with check ((select private.can_manage_catalog()));
create policy "Catalog admins can delete solution space fits" on public.solution_space_fits
  for delete to authenticated using ((select private.can_manage_catalog()));

insert into public.solution_space_fits (business_line_id, sector_id, body_es, body_en)
select bl.id, s.id, v.body_es, v.body_en
from (
  values
    ('mobiliario', 'workspace', 'Sillería, escritorios y lounge para la jornada, la junta y el encuentro.', 'Seating, desks and lounge for the working day, the meeting and the gathering.'),
    ('mobiliario', 'hospitality', 'Piezas de sala, comedor y terraza para la estadía y el servicio.', 'Lounge, dining and terrace pieces for the stay and the service.'),
    ('mobiliario', 'retail', 'Mobiliario de exhibición, espera y apoyo que acompaña la marca.', 'Display, waiting and support furniture that carries the brand.'),
    ('mobiliario', 'salud', 'Espera, sillería y equipamiento para el cuidado y la circulación.', 'Waiting, seating and equipment for care and circulation.'),
    ('mobiliario', 'cultural', 'Butacas, lounge y apoyo para la visita y el evento.', 'Seating, lounge and support for the visit and the event.'),
    ('mobiliario', 'residencial', 'Estar, comedor y exterior para la vida en casa.', 'Living, dining and outdoor pieces for life at home.'),
    ('mobiliario', 'educacion', 'Puestos, mesas y almacenamiento para el aula y las áreas comunes.', 'Desks, tables and storage for the classroom and shared areas.'),
    ('architectural', 'workspace', 'Pisos, plafones y acústica para el puesto, la sala y la circulación.', 'Floors, ceilings and acoustics for the workstation, the room and circulation.'),
    ('architectural', 'hospitality', 'Acabados y cielos para lobby, habitación y comedor.', 'Finishes and ceilings for the lobby, the room and the dining room.'),
    ('architectural', 'retail', 'Pisos y recubrimientos que arman el recorrido de la tienda.', 'Floors and coverings that shape the path through the store.'),
    ('architectural', 'salud', 'Superficies y acústica para higiene, calma y continuidad.', 'Surfaces and acoustics for hygiene, calm and continuity.'),
    ('architectural', 'cultural', 'Materiales y acústica para sala, galería y foyer.', 'Materials and acoustics for the hall, the gallery and the foyer.'),
    ('architectural', 'residencial', 'Pisos y recubrimientos que dan carácter a la vivienda.', 'Floors and coverings that give the home its character.'),
    ('architectural', 'educacion', 'Pisos, muros y acústica para aulas y espacios compartidos.', 'Floors, walls and acoustics for classrooms and shared spaces.'),
    ('lighting', 'workspace', 'Luz de trabajo y de ambiente según la tarea y la hora.', 'Task and ambient light for the work and the hour.'),
    ('lighting', 'hospitality', 'Atmósferas para lobby, habitación, comedor y fachada.', 'Atmospheres for the lobby, the room, dining and the facade.'),
    ('lighting', 'retail', 'Acentos que destacan el producto y recorren la tienda.', 'Accents that highlight the product and lead through the store.'),
    ('lighting', 'salud', 'Luz técnica y cálida para consulta, circulación y espera.', 'Technical and warm light for the consult, circulation and waiting.'),
    ('lighting', 'cultural', 'Iluminación de obra, sala y recorrido.', 'Light for the work, the hall and the route.'),
    ('lighting', 'residencial', 'Luz arquitectónica y decorativa para habitar la casa.', 'Architectural and decorative light for living at home.'),
    ('lighting', 'educacion', 'Iluminación de aula, circulación y encuentro.', 'Light for the classroom, circulation and gathering.')
) as v(line_slug, sector_slug, body_es, body_en)
join public.business_lines bl on bl.slug = v.line_slug
join public.sectors s on s.slug = v.sector_slug
on conflict (business_line_id, sector_id) do nothing;
