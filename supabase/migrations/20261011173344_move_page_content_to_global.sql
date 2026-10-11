-- Move the shared page copy into site_pages and stop duplicating it on every country.
-- Countries with no choice row publish the global page. Their own hero stays empty until they upload one.

insert into public.site_pages (
  page_key,
  hero_eyebrow_es, hero_eyebrow_en,
  hero_title_es, hero_title_en,
  hero_intro_es, hero_intro_en,
  hero_extra_es, hero_extra_en,
  seo_title_es, seo_title_en,
  seo_description_es, seo_description_en
) values
  (
    'home',
    'EST. 1992 · LATINOAMÉRICA', 'EST. 1992 · LATIN AMERICA',
    E'TODO EL PROYECTO,\n*UN SOLO* PROVEEDOR.', E'THE WHOLE PROJECT,\n*ONE SINGLE* SUPPLIER.',
    null, null, null, null,
    'Grupo IHO — Todo el proyecto, un solo proveedor',
    'IHO Group — The whole project, one single supplier',
    'Grupo empresarial latinoamericano de interiorismo corporativo, industrial, comercial y residencial. Soluciones arquitectónicas y de iluminación en LATAM.',
    'Latin American group for corporate, industrial, commercial and residential interiors. Architectural and lighting solutions across LATAM.'
  ),
  (
    'group',
    '— GRUPO IHO', '— IHO GROUP',
    E'UN GRUPO,\nTODAS LAS\nESCALAS.', E'ONE GROUP,\nEVERY\nSCALE.',
    'Somos un grupo empresarial latinoamericano que ofrece productos y servicios desde el interiorismo corporativo, industrial, comercial y residencial hasta soluciones arquitectónicas y de iluminación.',
    'We are a Latin American business group offering products and services from corporate, industrial, commercial and residential interiors to architectural and lighting solutions.',
    'Una fortaleza logística que permite que tu proyecto, sin importar su tamaño, se resuelva con un solo proveedor.',
    'A logistics powerhouse that lets your project, whatever its size, be solved by a single supplier.',
    null, null, null, null
  ),
  (
    'projects',
    '— PROYECTOS', '— PROJECTS',
    E'Proyectos\nIHO.', E'IHO\nprojects.',
    'Estos son algunos de los proyectos emblemáticos donde IHO ha materializado el diseño interior, transformando la arquitectura en atmósferas con identidad y propósito.',
    'These are some of the landmark projects where IHO has brought interior design to life, turning architecture into spaces with identity and purpose.',
    null, null, null, null, null, null
  ),
  (
    'brands',
    '— MARCAS', '— BRANDS',
    E'Nuestras\nmarcas.', E'Our\nbrands.',
    'Curaduría y distribución de más de 150 marcas líderes a nivel mundial que transforman el espacio corporativo en atmósferas únicas, innovadoras y personalizadas.',
    'Curation and distribution of more than 150 leading global brands that turn corporate spaces into unique, innovative and personalized environments.',
    null, null, null, null, null, null
  ),
  (
    'designers',
    '— DISEÑADORES', '— DESIGNERS',
    'Diseñadores.', 'Designers.',
    'Los creadores detrás de las piezas que llevamos a cada proyecto.',
    'The creators behind the pieces we bring to every project.',
    null, null, null, null, null, null
  ),
  (
    'solutions',
    '— SOLUCIONES', '— SOLUTIONS',
    E'UNA PUERTA\nPOR INDUSTRIA.', E'ONE DOOR\nPER INDUSTRY.',
    null, null, null, null, null, null, null, null
  ),
  (
    'spaces',
    '— ESPACIOS', '— SPACES',
    E'Espacios\nIHO.', E'IHO\nspaces.',
    null, null, null, null, null, null, null, null
  ),
  (
    'events',
    '— EVENTOS', '— EVENTS',
    E'Eventos y\nlanzamientos.', E'Events and\nlaunches.',
    null, null, null, null, null, null, null, null
  ),
  (
    'products',
    '— COMPRAR', '— SHOP',
    'Comprar.', 'Shop.',
    null, null, null, null, null, null, null, null
  ),
  (
    'contact',
    '— CONTACTO', '— CONTACT',
    'CONTACTA CON IHO', 'CONTACT IHO',
    null, null, null, null, null, null, null, null
  ),
  (
    'privacy',
    '— LEGAL', '— LEGAL',
    E'Aviso de\nprivacidad.', E'Privacy\nnotice.',
    'Grupo IHO y sus filiales en cada país (en adelante, "IHO") son responsables del tratamiento de los datos personales que nos proporcionas a través de este sitio.',
    'Grupo IHO and its subsidiaries in each country ("IHO") are responsible for the personal data you provide through this website.',
    null, null, null, null, null, null
  )
on conflict (page_key) do update set
  hero_eyebrow_es = coalesce(public.site_pages.hero_eyebrow_es, excluded.hero_eyebrow_es),
  hero_eyebrow_en = coalesce(public.site_pages.hero_eyebrow_en, excluded.hero_eyebrow_en),
  hero_title_es = coalesce(public.site_pages.hero_title_es, excluded.hero_title_es),
  hero_title_en = coalesce(public.site_pages.hero_title_en, excluded.hero_title_en),
  hero_intro_es = coalesce(public.site_pages.hero_intro_es, excluded.hero_intro_es),
  hero_intro_en = coalesce(public.site_pages.hero_intro_en, excluded.hero_intro_en),
  hero_extra_es = coalesce(public.site_pages.hero_extra_es, excluded.hero_extra_es),
  hero_extra_en = coalesce(public.site_pages.hero_extra_en, excluded.hero_extra_en),
  seo_title_es = coalesce(public.site_pages.seo_title_es, excluded.seo_title_es),
  seo_title_en = coalesce(public.site_pages.seo_title_en, excluded.seo_title_en),
  seo_description_es = coalesce(public.site_pages.seo_description_es, excluded.seo_description_es),
  seo_description_en = coalesce(public.site_pages.seo_description_en, excluded.seo_description_en);

-- The four countries share one video and one contact image. Keep that on the global home.
update public.site_pages sp
set
  hero_video_media_id = coalesce(sp.hero_video_media_id, src.hero_video_media_id),
  hero_image_media_id = coalesce(sp.hero_image_media_id, src.hero_image_media_id),
  contact_image_media_id = coalesce(sp.contact_image_media_id, src.contact_image_media_id)
from (
  select hero_video_media_id, hero_image_media_id, contact_image_media_id
  from public.country_settings
  where hero_video_media_id is not null
     or hero_image_media_id is not null
     or contact_image_media_id is not null
  order by (country_code = 'mx') desc, country_code
  limit 1
) src
where sp.page_key = 'home';

update public.country_settings set
  hero_eyebrow_es = null,
  hero_eyebrow_en = null,
  hero_title_es = null,
  hero_title_en = null,
  hero_subtitle_es = null,
  hero_subtitle_en = null,
  hero_video_media_id = null,
  hero_image_media_id = null,
  contact_image_media_id = null,
  seo_title_es = null,
  seo_title_en = null,
  seo_description_es = null,
  seo_description_en = null;

delete from public.country_page_choices;
