-- Initial content: countries, taxonomies, brands, offices, team, projects and events (from the original static site).
-- Idempotent: safe to run more than once. Images are linked later by scripts/import-local-media.ts.

-- Countries -------------------------------------------------------------------
insert into public.countries (code, name_es, name_en, domain, is_hq, currency, timezone, sort) values
  ('mx', 'México', 'Mexico', 'iho.com.mx', true, 'MXN', 'America/Mexico_City', 1),
  ('gt', 'Guatemala', 'Guatemala', 'iho.com.gt', false, 'GTQ', 'America/Guatemala', 2),
  ('cr', 'Costa Rica', 'Costa Rica', 'iho.cr', false, 'CRC', 'America/Costa_Rica', 3),
  ('pa', 'Panamá', 'Panama', 'iho.com.pa', false, 'USD', 'America/Panama', 4)
on conflict (code) do nothing;

-- Home and page heroes live in site_pages (filled by migration). A country row stays empty until that country uploads its own.
insert into public.country_settings (country_code)
select c.code from public.countries c
on conflict (country_code) do nothing;

insert into public.site_settings (id, stats) values (
  'global',
  jsonb_build_array(
    jsonb_build_object('value', 35, 'prefix', '+', 'suffix', '', 'label_es', E'Años de\nexperiencia', 'label_en', E'Years of\nexperience'),
    jsonb_build_object('value', 17, 'prefix', '', 'suffix', 'M', 'label_es', E'm²\ninstalados', 'label_en', E'm²\ninstalled'),
    jsonb_build_object('value', 5, 'prefix', '', 'suffix', '', 'label_es', 'Soluciones', 'label_en', 'Solutions'),
    jsonb_build_object('value', 4, 'prefix', '', 'suffix', '', 'label_es', E'Países en\nLATAM', 'label_en', E'Countries in\nLATAM')
  )
)
on conflict (id) do nothing;

-- Taxonomies ------------------------------------------------------------------
insert into public.business_lines (slug, name_es, name_en, description_es, description_en, sort) values
  ('furniture', 'Mobiliario', 'Furniture', 'Mobiliario y diseño integral para oficinas corporativas.', 'Furniture and integral design for corporate offices.', 1),
  ('specialty', 'Architectural', 'Architectural', 'Productos y soluciones especiales para proyectos exigentes.', 'Special products and solutions for demanding projects.', 2),
  ('lighting', 'Lighting', 'Lighting', 'Diseño y soluciones de iluminación arquitectónica para cada espacio.', 'Architectural lighting design and solutions for every space.', 3)
on conflict (slug) do nothing;

insert into public.sectors (slug, name_es, name_en, description_es, description_en, sort) values
  ('workspace', 'Workspace', 'Workspace', 'Oficinas corporativas y espacios de trabajo.', 'Corporate offices and workplaces.', 1),
  ('hospitality', 'Hospitality', 'Hospitality', 'Ambientes para hoteles, restaurantes y espacios de servicio.', 'Environments for hotels, restaurants and service spaces.', 2),
  ('retail', 'Retail', 'Retail', 'Experiencias de marca para espacios comerciales y retail.', 'Brand experiences for commercial and retail spaces.', 3),
  ('healthcare', 'Salud', 'Healthcare', 'Hospitales, clínicas y espacios de bienestar.', 'Hospitals, clinics and wellness spaces.', 4),
  ('cultural', 'Cultural', 'Cultural', 'Museos, auditorios y espacios culturales.', 'Museums, auditoriums and cultural venues.', 5),
  ('residential', 'Residencial', 'Residential', 'Vivienda y desarrollos residenciales.', 'Homes and residential developments.', 6)
on conflict (slug) do nothing;

-- Brands ----------------------------------------------------------------------
insert into public.brands (slug, name, logo_is_thin) values
  ('allermuir', 'Allermuir', false),
  ('allsteel', 'Allsteel', false),
  ('andreu-world', 'Andreu World', true),
  ('bolon', 'BOLON', false),
  ('brokis', 'BROKIS', false),
  ('delta-light', 'DELTA LIGHT', false),
  ('flos', 'FLOS', false),
  ('fritz-hansen', 'FRITZ HANSEN', true),
  ('kriskadecor', 'kriskadecor', true),
  ('luft', 'Luft', false),
  ('occhio', 'Occhio', false),
  ('parachilna', 'PARACHILNA', true),
  ('the-senator-group', 'The Senator Group', true),
  ('targetti', 'TARGETTI', false),
  ('unifor', 'UniFor', false),
  ('vitra', 'Vitra', false)
on conflict (slug) do nothing;

insert into public.brand_business_lines (brand_id, business_line_id)
select b.id, bl.id
from (values
  ('allermuir', 'furniture'), ('allsteel', 'furniture'), ('andreu-world', 'furniture'), ('bolon', 'specialty'),
  ('brokis', 'lighting'), ('delta-light', 'lighting'), ('flos', 'lighting'), ('fritz-hansen', 'furniture'),
  ('kriskadecor', 'specialty'), ('luft', 'lighting'), ('occhio', 'lighting'), ('parachilna', 'lighting'),
  ('the-senator-group', 'furniture'), ('targetti', 'lighting'), ('unifor', 'furniture'), ('vitra', 'furniture')
) as v (brand_slug, line_slug)
join public.brands b on b.slug = v.brand_slug
join public.business_lines bl on bl.slug = v.line_slug
on conflict do nothing;

insert into public.country_brands (country_code, brand_id, sort)
select c.code, b.id, row_number() over (partition by c.code order by b.slug)
from public.countries c cross join public.brands b
on conflict do nothing;

-- Offices ---------------------------------------------------------------------
insert into public.offices (country_code, city, address, is_main, sort)
select v.country_code, v.city, v.address, v.is_main, v.sort
from (values
  ('mx', 'CIUDAD DE MÉXICO', 'Juan Vazquez de Mella 481-Primer Piso, Polanco, Miguel Hidalgo, 11550, CDMX.', true, 1),
  ('mx', 'MONTERREY', 'Calz. del Valle 111, Del Valle, 66220 San Pedro Garza García, Nuevo León.', false, 2),
  ('mx', 'GUADALAJARA', 'Torre Patria Hipódromo. Av. Patria 1721, Planta Baja. Col. Colomos Providencia, C.P. 44660 Guadalajara, Jalisco.', false, 3),
  ('mx', 'CD. JUÁREZ', 'Antonio J. Bermúdez 2151-Local 7, Parque Industrial Antonio J Bermúdez, 32400 Cd Juárez, Chih.', false, 4),
  ('mx', 'TIJUANA', 'Av. Baños de Agua Caliente 3780, 20 de Noviembre, 22100 Tijuana, B.C.', false, 5),
  ('mx', 'CHIHUAHUA', 'Distrito 1, Via Citadela 5701 Edificio Quorum Oficina 301-302, Distrito 1, 31110 Chihuahua, Chih.', false, 6),
  ('pa', 'PANAMÁ', 'Ph Dream Plaza, Av. Centenario, Panamá.', true, 1),
  ('cr', 'COSTA RICA', 'Avenida Escazú, AE 205, Piso 2. Escazú, San José. Costa Rica.', true, 1),
  ('gt', 'GUATEMALA', '3ra. Avenida 10-80 Zona 10, Edificio Forum Zona Viva, Torre 2, Oficina 1004, Guatemala.', true, 1)
) as v (country_code, city, address, is_main, sort)
where not exists (select 1 from public.offices o where o.country_code = v.country_code and o.city = v.city);

-- Team (MX) -------------------------------------------------------------------
insert into public.team_members (country_code, full_name, slug, role_es, role_en, photo_position, sort)
select 'mx', v.full_name, v.slug, v.role, v.role, v.photo_position, v.sort
from (values
  ('Salvador Miranda', 'salvador-miranda', 'CEO', '0% 0%', 1),
  ('Daniela García', 'daniela-garcia', 'Regional Workspace Director', '0% 9.5%', 2),
  ('Lupina Cornejo', 'lupina-cornejo', 'Comercial Director, Ciento Once', '0% 0%', 3),
  ('Manuel Macedo', 'manuel-macedo', 'Lighting Director', '0% 0%', 4),
  ('Estefania Lara', 'estefania-lara', 'Flooring Manager', '0% 9.5%', 5)
) as v (full_name, slug, role, photo_position, sort)
where not exists (select 1 from public.team_members t where t.country_code = 'mx' and t.full_name = v.full_name);

-- Projects (MX) ---------------------------------------------------------------
insert into public.projects (country_code, slug, title_es, summary_es, sector_id, status, is_featured, sort)
select 'mx', v.slug, v.title, v.summary, s.id, 'published', true, v.sort
from (values
  ('entretenimiento-digital', 'EMPRESA DE ENTRETENIMIENTO DIGITAL', 'Equipamiento integral de un espacio dinámico y vanguardista.', 'workspace', 1),
  ('ecommerce', 'EMPRESA DE E-COMMERCE', 'Un proyecto con identidad cultural única.', 'workspace', 2),
  ('hyundai', 'HYUNDAI', 'Se transformó el espacio con ingeniería acústica personalizada y acabados premium.', 'workspace', 3),
  ('ios', 'IOS', 'Espacio contemporáneo disruptivo con mobiliario de alta gama.', 'workspace', 4),
  ('isuzu', 'ISUZU', 'Diseño minimalista de estética japonesa y alta funcionalidad.', 'workspace', 5),
  ('technology-center', 'TECHNOLOGY CENTER', 'Un hub funcional y tecnológico diseñado para impulsar la innovación.', 'workspace', 6)
) as v (slug, title, summary, sector_slug, sort)
join public.sectors s on s.slug = v.sector_slug
on conflict (country_code, slug) do nothing;

insert into public.project_business_lines (project_id, business_line_id)
select p.id, bl.id
from public.projects p join public.business_lines bl on bl.slug = 'furniture'
where p.country_code = 'mx'
on conflict do nothing;

-- Events (MX) -----------------------------------------------------------------
insert into public.events (
  country_code, slug, type, title_es, summary_es, body_es, starts_at, ends_at, timezone,
  venue_name, address, city, is_online, access_type, registration_enabled, status
)
select
  'mx', v.slug, v.type::public.event_type, v.title, split_part(v.body, E'\n\n', 1), v.body,
  (v.starts_at::timestamp at time zone 'America/Mexico_City'),
  (v.ends_at::timestamp at time zone 'America/Mexico_City'),
  'America/Mexico_City',
  v.venue_name, v.address, v.city, v.is_online, v.access::public.event_access,
  v.access = 'registration_required', 'published'
from (values
  ('feria-contract', 'fair', 'Contract Fair 2026',
   E'El Contract Fair 2026 reúne a los principales proveedores de mobiliario e interiorismo para proyectos corporativos, hoteleros y de retail en México y Latinoamérica.\n\nIHO presenta en este espacio sus más recientes colecciones y el catálogo de marcas internacionales que distribuye en la región.',
   '2026-05-20 10:00', '2026-05-20 18:00', 'Expo Guadalajara', 'Guadalajara, Jalisco', 'Guadalajara', false, 'registration_required'),
  ('webinar-iluminacion', 'webinar', 'Webinar Iluminación',
   E'Un webinar técnico sobre tendencias en iluminación arquitectónica, con foco en eficiencia energética y diseño de experiencias lumínicas para espacios corporativos y comerciales.\n\nPresentado por especialistas de IHO Lighting y representantes de marcas como FLOS, Occhio y Delta Light.',
   '2026-06-11 17:00', '2026-06-11 18:30', 'Plataforma Zoom', null, 'En línea', true, 'registration_required'),
  ('lanzamiento-collection', 'launch', 'Collection IHO',
   E'El lanzamiento de la Collection IHO 2026 presentó las piezas que definirán el interiorismo de alta gama en la región durante los próximos meses.\n\nUna noche íntima para clientes, arquitectos y diseñadores con acceso anticipado al catálogo completo.',
   '2026-07-28 19:00', '2026-07-28 22:00', 'Showroom IHO', 'Polanco, CDMX', 'CDMX', false, 'invite_only'),
  ('showroom-abierto', 'event', 'Showroom abierto',
   E'Una noche pensada para conocer de cerca las últimas piezas y colecciones disponibles en el showroom de IHO. Recorre los espacios con guías especializados y descubre las marcas que definen el diseño de interiores en LATAM.\n\nEl acceso es sin costo con registro previo. Los lugares son limitados. La confirmación llega por correo en un máximo de 48 horas.',
   '2026-08-14 18:00', '2026-08-14 22:00', 'Showroom IHO', 'Polanco, CDMX', 'CDMX', false, 'registration_required'),
  ('feria-industrial', 'fair', 'Feria Industrial',
   E'La Feria Industrial de Monterrey es el punto de encuentro del sector corporativo e industrial del norte del país, donde IHO presentará soluciones integrales para oficinas, plantas y centros de distribución.\n\nVisita el stand de IHO para conocer el portafolio completo de marcas y servicios disponibles en la región.',
   '2026-09-02 10:00', '2026-09-02 18:00', 'Cintermex', 'Monterrey, Nuevo León', 'Monterrey', false, 'registration_required'),
  ('webinar-disenio', 'webinar', 'Diseño de interiores',
   E'Un recorrido por las principales tendencias en diseño de interiores para espacios de trabajo, con énfasis en bienestar, sustentabilidad y tecnología integrada.\n\nPonentes de IHO Workspace comparten casos reales de proyectos en México y Centroamérica.',
   '2026-09-21 17:00', '2026-09-21 18:30', 'Plataforma Zoom', null, 'En línea', true, 'registration_required'),
  ('lanzamiento-premium', 'launch', 'Lanzamiento Premium',
   E'El evento premium de cierre de año de IHO, donde se presentarán las piezas más exclusivas del catálogo 2027 ante un selecto grupo de arquitectos, diseñadores y clientes de alto nivel.\n\nUna noche de diseño, exclusividad y networking en el showroom de Polanco.',
   '2026-10-15 19:00', '2026-10-15 22:00', 'Showroom IHO', 'Polanco, CDMX', 'CDMX', false, 'invite_only')
) as v (slug, type, title, body, starts_at, ends_at, venue_name, address, city, is_online, access)
on conflict (country_code, slug) do nothing;

insert into public.event_agenda_items (event_id, sort, text_es)
select e.id, v.sort, v.text
from (values
  ('feria-contract', 1, 'Apertura del pabellón IHO y presentación de novedades'),
  ('feria-contract', 2, 'Demostración de sistemas de mobiliario corporativo'),
  ('feria-contract', 3, 'Sesión con especialistas de producto'),
  ('feria-contract', 4, 'Cierre y networking'),
  ('webinar-iluminacion', 1, 'Introducción y tendencias globales de iluminación'),
  ('webinar-iluminacion', 2, 'Casos de estudio: proyectos recientes de IHO'),
  ('webinar-iluminacion', 3, 'Presentación de nuevas colecciones'),
  ('webinar-iluminacion', 4, 'Ronda de preguntas'),
  ('lanzamiento-collection', 1, 'Coctel de bienvenida'),
  ('lanzamiento-collection', 2, 'Presentación de la Collection IHO 2026'),
  ('lanzamiento-collection', 3, 'Recorrido por el showroom'),
  ('lanzamiento-collection', 4, 'Networking y cierre'),
  ('showroom-abierto', 1, 'Bienvenida y presentación del showroom'),
  ('showroom-abierto', 2, 'Recorrido guiado por las colecciones destacadas'),
  ('showroom-abierto', 3, 'Sesión con especialistas de producto'),
  ('showroom-abierto', 4, 'Networking y cierre'),
  ('feria-industrial', 1, 'Apertura y presentación del stand IHO'),
  ('feria-industrial', 2, 'Demostración de productos para espacios industriales'),
  ('feria-industrial', 3, 'Reuniones one-to-one con especialistas'),
  ('feria-industrial', 4, 'Cierre y networking'),
  ('webinar-disenio', 1, 'Tendencias globales en workplace design'),
  ('webinar-disenio', 2, 'Casos de estudio: bienestar en la oficina'),
  ('webinar-disenio', 3, 'Novedades del catálogo IHO 2026'),
  ('webinar-disenio', 4, 'Ronda de preguntas'),
  ('lanzamiento-premium', 1, 'Coctel de bienvenida con música en vivo'),
  ('lanzamiento-premium', 2, 'Presentación de la colección premium 2027'),
  ('lanzamiento-premium', 3, 'Recorrido guiado con los directores de IHO'),
  ('lanzamiento-premium', 4, 'Cena y cierre')
) as v (event_slug, sort, text)
join public.events e on e.country_code = 'mx' and e.slug = v.event_slug
where not exists (select 1 from public.event_agenda_items a where a.event_id = e.id and a.sort = v.sort);

insert into public.event_brands (event_id, brand_id)
select e.id, b.id
from (values
  ('webinar-iluminacion', 'flos'), ('webinar-iluminacion', 'occhio'), ('webinar-iluminacion', 'delta-light'),
  ('showroom-abierto', 'vitra'), ('showroom-abierto', 'fritz-hansen'), ('showroom-abierto', 'andreu-world'), ('showroom-abierto', 'occhio')
) as v (event_slug, brand_slug)
join public.events e on e.country_code = 'mx' and e.slug = v.event_slug
join public.brands b on b.slug = v.brand_slug
on conflict do nothing;

-- Catalog: one product row per country, with that country's cost and sale price.
insert into public.catalog_brands (country_code, name, brand_id)
select c.code, b.name, b.id
from public.countries c
join public.brands b on b.slug in (
  'allsteel', 'the-senator-group', 'bolon', 'andreu-world', 'fritz-hansen', 'occhio', 'kriskadecor',
  'vitra', 'allermuir', 'brokis', 'delta-light', 'unifor', 'parachilna', 'targetti'
)
on conflict (country_code, name) do nothing;

insert into public.products (
  country_code, catalog_brand_id, business_line_id, slug, name_es, name_en, description_es, description_en, specs, status,
  is_visible, is_featured, is_purchasable, lead_time_days, sort
)
select
  c.code, cb.id, bl.id, v.slug, v.name, coalesce(v.name_en_override, v.name), v.desc_es, v.desc_en, v.specs::jsonb, 'published',
  true, c.code = 'mx', c.code = 'mx' and bl.slug = 'lighting',
  case when bl.slug = 'lighting' then 21 else 45 end,
  row_number() over (partition by c.code order by v.slug)
from (values
  ('smart-conference', 'allsteel', 'furniture', 'Smart Conference', null, 'Mesa de juntas modular con electrificación integrada.', 'Modular conference table with built-in power.', '[{"label_es":"Dimensiones","label_en":"Dimensions","value":"360 × 120 × 74 cm"}]'),
  ('float-gather', 'the-senator-group', 'furniture', 'Float Gather', null, 'Sistema de mesas colaborativas para espacios abiertos.', 'Collaborative table system for open spaces.', '[]'),
  ('float-micro', 'bolon', 'specialty', 'Float Micro', null, 'Recubrimiento tejido de alto tráfico.', 'High-traffic woven flooring.', '[{"label_es":"Formato","label_en":"Format","value":"Rollo 2 m"}]'),
  ('silla-path-alta', 'andreu-world', 'furniture', 'Silla Path Alta', 'Path High Chair', 'Silla de respaldo alto en madera maciza.', 'High-back chair in solid wood.', '[]'),
  ('lounge-soft', 'fritz-hansen', 'furniture', 'Lounge Soft', null, 'Sillón lounge tapizado para hospitality.', 'Upholstered lounge chair for hospitality.', '[]'),
  ('occhio-sento', 'occhio', 'lighting', 'Occhio Sento', null, 'Luminaria de suspensión con control gestual.', 'Pendant luminaire with gesture control.', '[{"label_es":"Temperatura","label_en":"Color temperature","value":"2700–4000 K"},{"label_es":"Potencia","label_en":"Power","value":"30 W"}]'),
  ('kris-cadena', 'kriskadecor', 'specialty', 'Kris Cadena', 'Kris Chain', 'Cortina decorativa de eslabones de aluminio.', 'Decorative aluminium link curtain.', '[]'),
  ('vitra-eames-chair', 'vitra', 'furniture', 'Vitra Eames Chair', null, 'Silla icónica de carcasa de plástico.', 'Iconic plastic shell chair.', '[]'),
  ('fritz-chair', 'fritz-hansen', 'furniture', 'Fritz Chair', null, 'Silla apilable de madera laminada.', 'Stackable laminated wood chair.', '[]'),
  ('allermuir-loop', 'allermuir', 'furniture', 'Allermuir Loop', null, 'Sofá modular para áreas de espera.', 'Modular sofa for waiting areas.', '[]'),
  ('brokis-globe', 'brokis', 'lighting', 'Brokis Globe', null, 'Lámpara de vidrio soplado artesanal.', 'Hand-blown glass lamp.', '[]'),
  ('delta-focus', 'delta-light', 'lighting', 'Delta Focus', null, 'Proyector de riel de alta precisión.', 'High-precision track spotlight.', '[{"label_es":"Haz","label_en":"Beam","value":"15° / 30° / 50°"}]'),
  ('unifor-system', 'unifor', 'furniture', 'Unifor System', null, 'Sistema de mobiliario operativo.', 'Office furniture system.', '[]'),
  ('andreu-world-stool', 'andreu-world', 'furniture', 'Andreu World Stool', null, 'Taburete alto de madera.', 'Wooden bar stool.', '[]'),
  ('parachilna-aro', 'parachilna', 'lighting', 'Parachilna Aro', null, 'Luminaria circular de suspensión.', 'Circular pendant luminaire.', '[]'),
  ('targetti-slim', 'targetti', 'lighting', 'Targetti Slim', null, 'Perfil lineal LED empotrable.', 'Recessed linear LED profile.', '[]')
) as v (slug, brand_slug, line_slug, name, name_en_override, desc_es, desc_en, specs)
join public.brands b on b.slug = v.brand_slug
join public.catalog_brands cb on cb.brand_id = b.id
join public.countries c on c.code = cb.country_code
join public.business_lines bl on bl.slug = v.line_slug
on conflict (country_code, slug) do nothing;

update public.products set slug_en = 'path-high-chair' where slug = 'silla-path-alta' and slug_en is null;

insert into public.designers (slug, name) values
  ('lievore-altherr', 'Lievore Altherr'),
  ('axel-meise', 'Axel Meise'),
  ('charles-ray-eames', 'Charles & Ray Eames')
on conflict (slug) do nothing;

insert into public.product_designers (product_id, designer_id)
select p.id, d.id
from (values
  ('silla-path-alta', 'lievore-altherr'),
  ('occhio-sento', 'axel-meise'),
  ('vitra-eames-chair', 'charles-ray-eames')
) as v (product_slug, designer_slug)
join public.products p on p.slug = v.product_slug
join public.designers d on d.slug = v.designer_slug
on conflict do nothing;

update public.product_variants v
set sku = upper(replace(p.slug, '-', '')) || '-' || upper(p.country_code)
from public.products p
where p.id = v.product_id and v.sku is null;

-- Mexico lighting sale prices. Occhio keeps the autumn price (15,900), not the old list price.
insert into public.variant_prices (variant_id, currency, price)
select v.id, c.currency, x.amount
from (values
  ('occhio-sento', 15900),
  ('brokis-globe', 24500),
  ('delta-focus', 6800),
  ('parachilna-aro', 32400),
  ('targetti-slim', 4200)
) as x (slug, amount)
join public.products p on p.country_code = 'mx' and p.slug = x.slug
join public.product_variants v on v.product_id = p.id
join public.countries c on c.code = p.country_code
on conflict (variant_id) do update set price = excluded.price, currency = excluded.currency
where variant_prices.price is null;

-- Products on display at the showroom night.
insert into public.event_products (event_id, product_id, sort)
select e.id, p.id, x.sort
from (values ('vitra-eames-chair', 1), ('lounge-soft', 2), ('silla-path-alta', 3), ('occhio-sento', 4)) as x (slug, sort)
join public.products p on p.country_code = 'mx' and p.slug = x.slug
join public.events e on e.country_code = 'mx' and e.slug = 'showroom-abierto'
on conflict do nothing;
