alter table public.events
  add column about_title_es text,
  add column about_title_en text,
  add column agenda_heading_es text,
  add column agenda_heading_en text;

comment on column public.events.about_title_es is
  'Título de la sección Sobre el evento. Salto de línea y *resaltado*. Vacío: el sitio usa el título genérico.';
comment on column public.events.about_title_en is
  'Título en inglés de Sobre el evento. Vacío: se usa el español.';
comment on column public.events.agenda_heading_es is
  'Encabezado de la columna de agenda. Vacío: el sitio usa el texto genérico.';
comment on column public.events.agenda_heading_en is
  'Encabezado en inglés de la agenda. Vacío: se usa el español.';

update public.events
set
  about_title_es = E'Una noche para\nrecorrer el showroom.',
  about_title_en = E'An evening to\nexplore the showroom.',
  agenda_heading_es = 'En el recorrido',
  agenda_heading_en = 'Agenda'
where about_title_es is null;
