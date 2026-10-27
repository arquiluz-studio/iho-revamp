import type { CountrySection } from '@/lib/cache-tags'
import { COUNTRY_PAGE_KEYS } from '@/lib/content/static-pages'
import { Constants, type Database } from '@/lib/supabase/database.types'
import type { CountryRole } from './roles'

/**
 * Declarative description of the admin CRUD screens. Shared by server pages (loading), server actions
 * (validation + persistence) and the client form, so it must stay plain data (no functions).
 */
export type TableName = keyof Database['public']['Tables']
export type MediaKind = Database['public']['Enums']['media_kind']
export type Option = { value: string; label: string }
export type ReferenceSource = 'brands' | 'designers' | 'business_lines' | 'sectors' | 'products' | 'catalog_brands'
export type Bridge = { table: TableName; selfKey: string; otherKey: string }

type FieldBase = { name: string; label: string; required?: boolean; help?: string; wide?: boolean }
export type Field =
  | (FieldBase & { type: 'text' | 'textarea' | 'url' | 'email' | 'slug'; i18n?: boolean; max?: number; rows?: number })
  | (FieldBase & { type: 'number'; min?: number; max?: number; decimals?: boolean })
  | (FieldBase & { type: 'boolean' })
  | (FieldBase & { type: 'select'; options: Option[] })
  | (FieldBase & { type: 'datetime' })
  | (FieldBase & { type: 'reference'; source: ReferenceSource })
  | (FieldBase & { type: 'multi'; source: ReferenceSource; through: Bridge; checklist?: boolean })
  | (FieldBase & { type: 'media'; kind: MediaKind; video?: boolean })
  | (FieldBase & { type: 'stats' })
  | (FieldBase & { type: 'specs' })
  | (FieldBase & { type: 'ctas' })

export type ColumnFormat = 'text' | 'datetime' | 'status' | 'boolean' | 'number' | 'enum'
export type Column = { key: string; label: string; format?: ColumnFormat; options?: Option[] }

export type ResourceConfig = {
  key: string
  table: TableName
  scope: 'country' | 'global'
  pk: string
  title: string
  singular: string
  description?: string
  /** Minimum country role to write (country scope). */
  writeRole?: CountryRole
  /** Who may write global resources. */
  globalWrite?: 'catalog' | 'super'
  fields: Field[]
  columns: Column[]
  order: { column: string; ascending: boolean }[]
  section?: CountrySection
  globalTag?: 'countries' | 'taxonomies' | 'brands' | 'designers' | 'products' | 'site'
  /** A single row: one per country keyed by country_code (country scope), or `SITE_SETTINGS_ID` (global scope). */
  singleton?: boolean
  /** Update creates the row when it does not exist yet (static page heroes). */
  upsert?: boolean
  /** Save rejects any id outside this list. */
  fixedIds?: readonly string[]
  /** The primary key is typed by the user on creation (countries.code). */
  pkInput?: boolean
  /** Localized public route used by "Ver en el sitio" / preview. */
  publicPath?: '/events/[slug]' | '/projects/[slug]' | '/brands/[slug]' | '/designers/[slug]' | '/products/[slug]' | '/team/[slug]' | '/solutions/[businessLine]' | '/spaces/[sector]' | '/'
  /** Datetime fields are entered in this row field's timezone (falls back to the country timezone). */
  timezoneField?: string
}

const enumOptions = <T extends string>(values: readonly T[], labels: Record<T, string>): Option[] =>
  values.map(value => ({ value, label: labels[value] }))

export const STATUS_OPTIONS = enumOptions(Constants.public.Enums.content_status, {
  draft: 'Borrador',
  published: 'Publicado',
  archived: 'Archivado',
})

export const EVENT_TYPE_OPTIONS = enumOptions(Constants.public.Enums.event_type, {
  event: 'Evento',
  launch: 'Lanzamiento',
  fair: 'Feria',
  webinar: 'Webinar',
  lunch_and_learn: 'Lunch & Learn',
  workshop: 'Taller',
  showroom: 'Showroom',
})

export const EVENT_ACCESS_OPTIONS = enumOptions(Constants.public.Enums.event_access, {
  open: 'Abierto',
  registration_required: 'Requiere registro',
  invite_only: 'Solo por invitación',
})

export const SOCIAL_OPTIONS = enumOptions(Constants.public.Enums.social_platform, {
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  pinterest: 'Pinterest',
  x: 'X',
  whatsapp: 'WhatsApp',
})

export const TIMEZONE_OPTIONS: Option[] = [
  'America/Mexico_City',
  'America/Monterrey',
  'America/Cancun',
  'America/Tijuana',
  'America/Panama',
  'America/Costa_Rica',
  'America/Guatemala',
  'America/Bogota',
  'America/New_York',
  'Europe/Madrid',
].map(value => ({ value, label: value.replace('America/', '').replace('_', ' ') }))

export const LOCALE_OPTIONS: Option[] = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
]

const STATUS_COLUMN: Column = { key: 'status', label: 'Estado', format: 'status', options: STATUS_OPTIONS }
const SORT_FIELD: Field = { name: 'sort', label: 'Orden', type: 'number', help: 'Menor número aparece primero.' }

const events: ResourceConfig = {
  key: 'events',
  table: 'events',
  scope: 'country',
  pk: 'id',
  title: 'Eventos',
  singular: 'evento',
  writeRole: 'editor',
  section: 'events',
  publicPath: '/events/[slug]',
  timezoneField: 'timezone',
  fields: [
    { name: 'title', label: 'Título', type: 'text', i18n: true, required: true, max: 200 },
    { name: 'slug', label: 'Slug en español (URL)', type: 'slug', required: true },
    { name: 'slug_en', label: 'Slug en inglés (URL)', type: 'slug', help: 'Opcional. Si queda vacío, la versión en inglés usa el slug en español.' },
    { name: 'status', label: 'Estado', type: 'select', options: STATUS_OPTIONS, required: true },
    { name: 'type', label: 'Tipo', type: 'select', options: EVENT_TYPE_OPTIONS, required: true },
    { name: 'starts_at', label: 'Inicio', type: 'datetime', required: true },
    { name: 'ends_at', label: 'Fin', type: 'datetime' },
    { name: 'timezone', label: 'Zona horaria', type: 'select', options: TIMEZONE_OPTIONS, help: 'Las fechas se capturan en esta zona.' },
    { name: 'city', label: 'Ciudad', type: 'text', max: 120 },
    { name: 'venue_name', label: 'Lugar', type: 'text', max: 200 },
    { name: 'address', label: 'Dirección', type: 'text', max: 300, wide: true },
    { name: 'is_online', label: 'Evento en línea', type: 'boolean' },
    { name: 'online_url', label: 'URL de transmisión', type: 'url' },
    { name: 'access_type', label: 'Acceso', type: 'select', options: EVENT_ACCESS_OPTIONS, required: true },
    { name: 'registration_enabled', label: 'Registro habilitado', type: 'boolean' },
    { name: 'capacity', label: 'Cupo', type: 'number', min: 0, help: 'Vacío = sin límite. Al llenarse, los registros pasan a lista de espera.' },
    { name: 'registration_closes_at', label: 'Cierre de registro', type: 'datetime' },
    { name: 'cover_media_id', label: 'Portada', type: 'media', kind: 'event_photo' },
    { name: 'summary', label: 'Resumen', type: 'textarea', i18n: true, max: 600, rows: 3 },
    { name: 'body', label: 'Descripción', type: 'textarea', i18n: true, max: 20000, rows: 10 },
    {
      name: 'brands',
      label: 'Marcas participantes',
      type: 'multi',
      source: 'brands',
      through: { table: 'event_brands', selfKey: 'event_id', otherKey: 'brand_id' },
      wide: true,
    },
    {
      name: 'designers',
      label: 'Diseñadores',
      help: 'Sus productos se suman a los productos en exhibición, y el evento aparece en la página del diseñador.',
      type: 'multi',
      source: 'designers',
      through: { table: 'event_designers', selfKey: 'event_id', otherKey: 'designer_id' },
      wide: true,
    },
    {
      name: 'products',
      label: 'Productos en exhibición',
      help: 'Se muestran primero en la página del evento; se completa con productos de las marcas participantes.',
      type: 'multi',
      source: 'products',
      through: { table: 'event_products', selfKey: 'event_id', otherKey: 'product_id' },
      wide: true,
    },
  ],
  columns: [
    { key: 'title_es', label: 'Título' },
    { key: 'starts_at', label: 'Fecha', format: 'datetime' },
    { key: 'city', label: 'Ciudad' },
    { key: 'type', label: 'Tipo', format: 'enum', options: EVENT_TYPE_OPTIONS },
    STATUS_COLUMN,
  ],
  order: [{ column: 'starts_at', ascending: false }],
}

const projects: ResourceConfig = {
  key: 'projects',
  table: 'projects',
  scope: 'country',
  pk: 'id',
  title: 'Proyectos',
  singular: 'proyecto',
  writeRole: 'editor',
  section: 'projects',
  publicPath: '/projects/[slug]',
  fields: [
    { name: 'title', label: 'Título', type: 'text', i18n: true, required: true, max: 200 },
    { name: 'slug', label: 'Slug en español (URL)', type: 'slug', required: true },
    { name: 'slug_en', label: 'Slug en inglés (URL)', type: 'slug', help: 'Opcional. Si queda vacío, la versión en inglés usa el slug en español.' },
    { name: 'status', label: 'Estado', type: 'select', options: STATUS_OPTIONS, required: true },
    { name: 'is_featured', label: 'Destacado en home', type: 'boolean', help: 'La portada muestra hasta 6, en el orden de la lista. Las soluciones se marcan en esa misma lista.' },
    { name: 'client_name', label: 'Cliente', type: 'text', max: 200 },
    { name: 'city', label: 'Ciudad', type: 'text', max: 120 },
    { name: 'year', label: 'Año', type: 'number', min: 1950, max: 2100 },
    { name: 'sector_id', label: 'Espacio', type: 'reference', source: 'sectors' },
    SORT_FIELD,
    { name: 'summary', label: 'Resumen', type: 'textarea', i18n: true, max: 600, rows: 3 },
    { name: 'body', label: 'Descripción', type: 'textarea', i18n: true, max: 20000, rows: 10 },
    {
      name: 'facts',
      label: 'Datos del proyecto',
      type: 'specs',
      wide: true,
      help: 'Cada fila es un título y un valor, por ejemplo m² y 1,200. El título en inglés es opcional.',
    },
    {
      name: 'business_lines',
      label: 'Soluciones',
      type: 'multi',
      source: 'business_lines',
      checklist: true,
      through: { table: 'project_business_lines', selfKey: 'project_id', otherKey: 'business_line_id' },
    },
    {
      name: 'brands',
      label: 'Marcas usadas',
      type: 'multi',
      source: 'brands',
      through: { table: 'project_brands', selfKey: 'project_id', otherKey: 'brand_id' },
    },
  ],
  columns: [
    { key: 'title_es', label: 'Título' },
    { key: 'client_name', label: 'Cliente' },
    { key: 'city', label: 'Ciudad' },
    { key: 'year', label: 'Año', format: 'number' },
    { key: 'is_featured', label: 'Destacado', format: 'boolean' },
    STATUS_COLUMN,
  ],
  order: [
    { column: 'sort', ascending: true },
    { column: 'created_at', ascending: false },
  ],
}

const socials: ResourceConfig = {
  key: 'socials',
  table: 'social_accounts',
  scope: 'country',
  pk: 'id',
  title: 'Redes sociales',
  singular: 'red social',
  writeRole: 'editor',
  section: 'socials',
  fields: [
    { name: 'platform', label: 'Plataforma', type: 'select', options: SOCIAL_OPTIONS, required: true },
    { name: 'handle', label: 'Usuario', type: 'text', max: 120, help: 'Ej. @grupoiho' },
    { name: 'url', label: 'URL', type: 'url', required: true, wide: true },
    SORT_FIELD,
    { name: 'is_active', label: 'Visible', type: 'boolean' },
  ],
  columns: [
    { key: 'platform', label: 'Plataforma', format: 'enum', options: SOCIAL_OPTIONS },
    { key: 'handle', label: 'Usuario' },
    { key: 'url', label: 'URL' },
    { key: 'sort', label: 'Orden', format: 'number' },
    { key: 'is_active', label: 'Visible', format: 'boolean' },
  ],
  order: [{ column: 'sort', ascending: true }],
}

const offices: ResourceConfig = {
  key: 'offices',
  table: 'offices',
  scope: 'country',
  pk: 'id',
  title: 'Oficinas',
  singular: 'oficina',
  writeRole: 'admin',
  section: 'offices',
  fields: [
    { name: 'city', label: 'Ciudad', type: 'text', required: true, max: 120, help: 'Nombre que aparece en el mapa, por ejemplo Ciudad de Guatemala.' },
    { name: 'is_main', label: 'Oficina principal', type: 'boolean' },
    { name: 'latitude', label: 'Latitud', type: 'number', decimals: true, min: -90, max: 90, help: 'Opcional. Si se deja vacía, el mapa usa una ubicación conocida de la ciudad.' },
    { name: 'longitude', label: 'Longitud', type: 'number', decimals: true, min: -180, max: 180 },
    { name: 'address', label: 'Dirección', type: 'textarea', required: true, max: 500, rows: 3, wide: true },
    { name: 'maps_url', label: 'URL de Google Maps', type: 'url', wide: true },
    { name: 'phone', label: 'Teléfono', type: 'text', max: 60 },
    { name: 'email', label: 'Email', type: 'email' },
    SORT_FIELD,
  ],
  columns: [
    { key: 'city', label: 'Ciudad' },
    { key: 'address', label: 'Dirección' },
    { key: 'phone', label: 'Teléfono' },
    { key: 'is_main', label: 'Principal', format: 'boolean' },
    { key: 'sort', label: 'Orden', format: 'number' },
  ],
  order: [{ column: 'sort', ascending: true }],
}

const team: ResourceConfig = {
  key: 'team',
  table: 'team_members',
  scope: 'country',
  pk: 'id',
  title: 'Equipo',
  singular: 'integrante',
  writeRole: 'editor',
  section: 'team',
  publicPath: '/team/[slug]',
  fields: [
    { name: 'full_name', label: 'Nombre', type: 'text', required: true, max: 160 },
    { name: 'slug', label: 'Slug (URL)', type: 'slug', required: true, help: 'Dirección de la ficha, por ejemplo salvador-miranda.' },
    { name: 'role', label: 'Puesto', type: 'text', i18n: true, required: true, max: 160 },
    { name: 'photo_media_id', label: 'Foto', type: 'media', kind: 'team_photo' },
    { name: 'photo_position', label: 'Encuadre de la foto', type: 'text', max: 40, help: 'object-position CSS, ej. "50% 20%".' },
    { name: 'bio', label: 'Biografía', type: 'textarea', i18n: true, max: 4000, rows: 6, wide: true, help: 'Una línea en blanco separa párrafos. Se muestra en la ficha.' },
    { name: 'email', label: 'Correo', type: 'email' },
    { name: 'phone', label: 'Teléfono', type: 'text', max: 60 },
    { name: 'linkedin_url', label: 'LinkedIn', type: 'url', wide: true },
    SORT_FIELD,
    { name: 'is_published', label: 'Visible en el sitio', type: 'boolean' },
  ],
  columns: [
    { key: 'full_name', label: 'Nombre' },
    { key: 'role_es', label: 'Puesto' },
    { key: 'slug', label: 'Slug' },
    { key: 'sort', label: 'Orden', format: 'number' },
    { key: 'is_published', label: 'Visible', format: 'boolean' },
  ],
  order: [{ column: 'sort', ascending: true }],
}

const home: ResourceConfig = {
  key: 'home',
  table: 'country_settings',
  scope: 'country',
  pk: 'country_code',
  singleton: true,
  title: 'Home',
  singular: 'home',
  description: 'Hero, imagen de contacto y SEO de este país. Un campo vacío no se publica y no toma el global.',
  writeRole: 'admin',
  section: 'settings',
  publicPath: '/',
  fields: [
    {
      name: 'hero_enabled',
      label: 'Mostrar hero',
      type: 'boolean',
      help: 'Apagado, la página se publica sin hero. Si este contenido es el global, los países que lo usan quedan igual.',
    },
    { name: 'hero_eyebrow', label: 'Hero · antetítulo', type: 'text', i18n: true, max: 120 },
    {
      name: 'hero_title',
      label: 'Hero · título',
      type: 'textarea',
      i18n: true,
      max: 200,
      rows: 3,
      help: 'Salto de línea = nueva línea. *texto* = resaltado en rojo.',
    },
    { name: 'hero_subtitle', label: 'Hero · subtítulo', type: 'textarea', i18n: true, max: 400, rows: 3 },
    { name: 'hero_video_media_id', label: 'Hero · video (MP4)', type: 'media', kind: 'hero', video: true },
    { name: 'hero_image_media_id', label: 'Hero · imagen (poster / fallback)', type: 'media', kind: 'hero' },
    { name: 'contact_image_media_id', label: 'Imagen de la sección de contacto', type: 'media', kind: 'generic' },
    { name: 'seo_title', label: 'SEO · título', type: 'text', i18n: true, max: 120 },
    { name: 'seo_description', label: 'SEO · descripción', type: 'textarea', i18n: true, max: 300, rows: 3 },
    {
      name: 'hero_ctas',
      label: 'Botones',
      type: 'ctas',
      wide: true,
      help: 'Hasta dos, uno al lado del otro. Si no agregas ninguno, el hero se publica sin botones.',
    },
  ],
  columns: [],
  order: [],
}

const pages: ResourceConfig = {
  key: 'pages',
  table: 'country_pages',
  scope: 'country',
  pk: 'page_key',
  upsert: true,
  fixedIds: COUNTRY_PAGE_KEYS,
  title: 'Página',
  singular: 'página',
  description: 'Hero de esta página. Un campo vacío no se publica y no toma el global.',
  writeRole: 'admin',
  section: 'pages',
  fields: [
    {
      name: 'hero_enabled',
      label: 'Mostrar hero',
      type: 'boolean',
      help: 'Apagado, la página se publica sin hero. Si este contenido es el global, los países que lo usan quedan igual.',
    },
    { name: 'hero_eyebrow', label: 'Antetítulo', type: 'text', i18n: true, max: 120 },
    {
      name: 'hero_title',
      label: 'Título',
      type: 'textarea',
      i18n: true,
      max: 200,
      rows: 3,
      help: 'Salto de línea = nueva línea. *texto* = resaltado en rojo.',
    },
    { name: 'hero_intro', label: 'Introducción', type: 'textarea', i18n: true, max: 800, rows: 4 },
    {
      name: 'hero_extra',
      label: 'Párrafo extra',
      type: 'textarea',
      i18n: true,
      max: 800,
      rows: 4,
      help: 'Segundo párrafo del hero. En Grupo IHO reemplaza el texto actual.',
    },
    { name: 'hero_image_media_id', label: 'Imagen de fondo', type: 'media', kind: 'hero' },
    {
      name: 'hero_ctas',
      label: 'Botones',
      type: 'ctas',
      wide: true,
      help: 'Hasta dos, uno al lado del otro. Si no agregas ninguno, el hero se publica sin botones.',
    },
  ],
  columns: [],
  order: [],
}

const siteHome: ResourceConfig = {
  key: 'site-home',
  table: 'site_pages',
  scope: 'global',
  pk: 'page_key',
  upsert: true,
  fixedIds: ['home'],
  title: 'Home',
  singular: 'home',
  description: 'Hero, imagen de contacto y SEO para los países que usan el contenido global. Un campo vacío no se publica.',
  globalWrite: 'super',
  globalTag: 'site',
  publicPath: '/',
  fields: home.fields,
  columns: [],
  order: [],
}

const sitePages: ResourceConfig = {
  key: 'site-pages',
  table: 'site_pages',
  scope: 'global',
  pk: 'page_key',
  upsert: true,
  fixedIds: COUNTRY_PAGE_KEYS,
  title: 'Página',
  singular: 'página',
  description: 'Hero para los países que usan el contenido global. Un campo vacío no se publica.',
  globalWrite: 'super',
  globalTag: 'site',
  fields: pages.fields,
  columns: [],
  order: [],
}

/** Primary key of the single `site_settings` row. */
export const SITE_SETTINGS_ID = 'global'

const stats: ResourceConfig = {
  key: 'stats',
  table: 'site_settings',
  scope: 'global',
  pk: 'id',
  singleton: true,
  title: 'Estadísticas',
  singular: 'estadísticas',
  description: 'Contadores de la sección Grupo IHO. Son los mismos en el sitio de todos los países.',
  globalWrite: 'super',
  globalTag: 'site',
  fields: [{ name: 'stats', label: 'Estadísticas', type: 'stats', wide: true }],
  columns: [],
  order: [],
}

const countries: ResourceConfig = {
  key: 'countries',
  table: 'countries',
  scope: 'global',
  pk: 'code',
  pkInput: true,
  title: 'Países',
  singular: 'país',
  globalWrite: 'super',
  globalTag: 'countries',
  fields: [
    { name: 'code', label: 'Código ISO (2 letras)', type: 'text', required: true, max: 2 },
    { name: 'name', label: 'Nombre', type: 'text', i18n: true, required: true, max: 80 },
    { name: 'domain', label: 'Dominio', type: 'text', max: 120, help: 'Sin protocolo, ej. iho.com.mx' },
    { name: 'is_hq', label: 'Casa matriz', type: 'boolean' },
    { name: 'is_active', label: 'Activo', type: 'boolean' },
    { name: 'currency', label: 'Moneda (ISO 4217)', type: 'text', required: true, max: 3 },
    { name: 'default_locale', label: 'Idioma por defecto', type: 'select', options: LOCALE_OPTIONS, required: true },
    { name: 'timezone', label: 'Zona horaria', type: 'select', options: TIMEZONE_OPTIONS, required: true },
    { name: 'phone', label: 'Teléfono', type: 'text', max: 60 },
    { name: 'whatsapp', label: 'WhatsApp', type: 'text', max: 60 },
    { name: 'email', label: 'Email de contacto', type: 'email', help: 'Recibe las notificaciones de leads y registros.' },
    SORT_FIELD,
  ],
  columns: [
    { key: 'code', label: 'Código' },
    { key: 'name_es', label: 'Nombre' },
    { key: 'domain', label: 'Dominio' },
    { key: 'currency', label: 'Moneda' },
    { key: 'is_active', label: 'Activo', format: 'boolean' },
  ],
  order: [{ column: 'sort', ascending: true }],
}

const brands: ResourceConfig = {
  key: 'brands',
  table: 'brands',
  scope: 'global',
  pk: 'id',
  title: 'Marcas (catálogo global)',
  singular: 'marca',
  globalWrite: 'catalog',
  globalTag: 'brands',
  publicPath: '/brands/[slug]',
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', required: true, max: 120 },
    { name: 'slug', label: 'Slug (URL)', type: 'slug', required: true },
    { name: 'logo_media_id', label: 'Logo', type: 'media', kind: 'brand_logo' },
    { name: 'logo_is_thin', label: 'Logo delgado (se muestra más grande)', type: 'boolean' },
    {
      name: 'cover_media_id',
      label: 'Portada',
      type: 'media',
      kind: 'generic',
      help: 'Foto de la marca en el directorio y en la ficha. Puede ser un producto, un espacio o el logo sobre una foto. Si queda vacía, se usa el logo.',
    },
    { name: 'website_url', label: 'Sitio web', type: 'url' },
    { name: 'origin_country', label: 'País de origen', type: 'text', max: 80 },
    { name: 'is_active', label: 'Activa', type: 'boolean' },
    { name: 'description', label: 'Descripción', type: 'textarea', i18n: true, max: 4000, rows: 6 },
    {
      name: 'business_lines',
      label: 'Soluciones',
      type: 'multi',
      source: 'business_lines',
      checklist: true,
      through: { table: 'brand_business_lines', selfKey: 'brand_id', otherKey: 'business_line_id' },
    },
  ],
  columns: [
    { key: 'name', label: 'Nombre' },
    { key: 'slug', label: 'Slug' },
    { key: 'origin_country', label: 'Origen' },
    { key: 'is_active', label: 'Activa', format: 'boolean' },
  ],
  order: [{ column: 'name', ascending: true }],
}

const designers: ResourceConfig = {
  key: 'designers',
  table: 'designers',
  scope: 'global',
  pk: 'id',
  title: 'Diseñadores',
  singular: 'diseñador',
  description: 'Página de homenaje del diseñador. Sus productos se ligan desde la ficha de cada producto.',
  globalWrite: 'catalog',
  globalTag: 'designers',
  publicPath: '/designers/[slug]',
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', required: true, max: 160, help: 'Ej. Achille Castiglioni, Patricia Urquiola o un estudio.' },
    { name: 'slug', label: 'Slug (URL)', type: 'slug', required: true },
    { name: 'portrait_media_id', label: 'Retrato', type: 'media', kind: 'designer_photo' },
    { name: 'cover_media_id', label: 'Imagen de portada (homenaje)', type: 'media', kind: 'hero' },
    { name: 'nationality', label: 'Nacionalidad', type: 'text', i18n: true, max: 80 },
    { name: 'birth_year', label: 'Año de nacimiento', type: 'number', min: 1700, max: 2100 },
    { name: 'death_year', label: 'Año de fallecimiento', type: 'number', min: 1700, max: 2100 },
    { name: 'website_url', label: 'Sitio web', type: 'url' },
    { name: 'is_active', label: 'Publicado', type: 'boolean' },
    { name: 'bio', label: 'Biografía', type: 'textarea', i18n: true, max: 8000, rows: 8, help: 'Una línea en blanco separa párrafos.' },
  ],
  columns: [
    { key: 'name', label: 'Nombre' },
    { key: 'slug', label: 'Slug' },
    { key: 'nationality_es', label: 'Nacionalidad' },
    { key: 'is_active', label: 'Publicado', format: 'boolean' },
  ],
  order: [{ column: 'name', ascending: true }],
}

const taxonomyFields = (coverLabel: string): Field[] => [
  { name: 'name', label: 'Nombre', type: 'text', i18n: true, required: true, max: 120 },
  { name: 'slug', label: 'Slug en español (URL)', type: 'slug', required: true },
  { name: 'slug_en', label: 'Slug en inglés (URL)', type: 'slug', help: 'Opcional. Si queda vacío, la versión en inglés usa el slug en español.' },
  SORT_FIELD,
  { name: 'cover_media_id', label: coverLabel, type: 'media', kind: 'generic' },
  { name: 'description', label: 'Descripción', type: 'textarea', i18n: true, max: 2000, rows: 4 },
]

const taxonomyColumns: Column[] = [
  { key: 'name_es', label: 'Nombre' },
  { key: 'slug', label: 'Slug' },
  { key: 'sort', label: 'Orden', format: 'number' },
]

const solutions: ResourceConfig = {
  key: 'solutions',
  table: 'business_lines',
  scope: 'global',
  pk: 'id',
  title: 'Soluciones',
  singular: 'solución',
  globalWrite: 'catalog',
  globalTag: 'taxonomies',
  publicPath: '/solutions/[businessLine]',
  fields: taxonomyFields('Portada de la solución'),
  columns: taxonomyColumns,
  order: [{ column: 'sort', ascending: true }],
}

const spaces: ResourceConfig = {
  key: 'spaces',
  table: 'sectors',
  scope: 'global',
  pk: 'id',
  title: 'Espacios',
  singular: 'espacio',
  globalWrite: 'catalog',
  globalTag: 'taxonomies',
  publicPath: '/spaces/[sector]',
  fields: taxonomyFields('Portada del espacio'),
  columns: taxonomyColumns,
  order: [{ column: 'sort', ascending: true }],
}

const catalogBrands: ResourceConfig = {
  key: 'catalog-brands',
  table: 'catalog_brands',
  scope: 'country',
  pk: 'id',
  title: 'Marcas comerciales',
  singular: 'marca comercial',
  description: 'Marcas que este país vende. Enlaza una marca global solo si también se anuncia en el sitio.',
  writeRole: 'admin',
  section: 'catalog',
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', required: true, max: 160 },
    {
      name: 'brand_id',
      label: 'Marca del sitio',
      type: 'reference',
      source: 'brands',
      help: 'Opcional. Si se elige, los productos heredan el logo y la página de esa marca.',
    },
    { name: 'erp_ref', label: 'Referencia ERP', type: 'text', max: 120 },
  ],
  columns: [
    { key: 'name', label: 'Nombre' },
    { key: 'erp_ref', label: 'ERP' },
  ],
  order: [{ column: 'name', ascending: true }],
}

const products: ResourceConfig = {
  key: 'products',
  table: 'products',
  scope: 'country',
  pk: 'id',
  title: 'Catálogo',
  singular: 'producto',
  description: 'Ficha comercial de este país. El costo y el precio de venta se capturan en cada variante. Las existencias viven en el ERP.',
  writeRole: 'admin',
  section: 'catalog',
  publicPath: '/products/[slug]',
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', i18n: true, required: true, max: 200 },
    { name: 'slug', label: 'Slug en español (URL)', type: 'slug', required: true },
    { name: 'slug_en', label: 'Slug en inglés (URL)', type: 'slug', help: 'Opcional. Si queda vacío, la versión en inglés usa el slug en español.' },
    { name: 'status', label: 'Estado', type: 'select', options: STATUS_OPTIONS, required: true },
    { name: 'catalog_brand_id', label: 'Marca comercial', type: 'reference', source: 'catalog_brands', required: true },
    { name: 'business_line_id', label: 'Solución', type: 'reference', source: 'business_lines' },
    {
      name: 'designers',
      label: 'Diseñadores',
      type: 'multi',
      source: 'designers',
      through: { table: 'product_designers', selfKey: 'product_id', otherKey: 'designer_id' },
    },
    { name: 'is_visible', label: 'Visible en el sitio', type: 'boolean' },
    { name: 'is_purchasable', label: 'Mostrar precio', type: 'boolean', help: 'Sin esto, el sitio ofrece cotizar. El precio igual se guarda en la variante.' },
    { name: 'is_featured', label: 'Destacado en el home', type: 'boolean' },
    { name: 'lead_time_days', label: 'Días de entrega', type: 'number', min: 0, max: 3650, help: 'Se muestra cuando no hay una fecha del ERP.' },
    SORT_FIELD,
    { name: 'erp_ref', label: 'Referencia ERP (familia)', type: 'text', max: 120 },
    { name: 'description', label: 'Descripción', type: 'textarea', i18n: true, max: 8000, rows: 6 },
    { name: 'specs', label: 'Especificaciones', type: 'specs', wide: true },
    {
      name: 'sectors',
      label: 'Espacios',
      type: 'multi',
      source: 'sectors',
      through: { table: 'product_sectors', selfKey: 'product_id', otherKey: 'sector_id' },
    },
  ],
  columns: [
    { key: 'name_es', label: 'Nombre' },
    { key: 'slug', label: 'Slug' },
    { key: 'is_visible', label: 'Visible', format: 'boolean' },
    { key: 'is_purchasable', label: 'Con precio', format: 'boolean' },
    STATUS_COLUMN,
  ],
  order: [{ column: 'name_es', ascending: true }],
}

export const RESOURCES = {
  events,
  projects,
  socials,
  offices,
  team,
  home,
  pages,
  'site-home': siteHome,
  'site-pages': sitePages,
  'catalog-brands': catalogBrands,
  products,
  countries,
  stats,
  brands,
  designers,
  solutions,
  spaces,
}
export type ResourceKey = keyof typeof RESOURCES

export const COUNTRY_RESOURCES: ResourceKey[] = ['events', 'projects', 'socials', 'offices', 'team', 'catalog-brands', 'products']
export const GLOBAL_RESOURCES: ResourceKey[] = ['countries', 'stats', 'brands', 'designers', 'solutions', 'spaces']

/** Row key of a singleton resource. */
export function singletonId(config: ResourceConfig, countryCode: string | null): string | null {
  return config.scope === 'global' ? SITE_SETTINGS_ID : countryCode
}

export function getResource(key: string): ResourceConfig | null {
  return key in RESOURCES ? RESOURCES[key as ResourceKey] : null
}

/** Database columns written by a field (i18n fields expand to `_es` / `_en`). */
export function fieldColumns(field: Field): string[] {
  if (field.type === 'multi') return []
  if ('i18n' in field && field.i18n) return [`${field.name}_es`, `${field.name}_en`]
  return [field.name]
}

/** Default values for a new record. */
export function emptyValues(config: ResourceConfig): Record<string, unknown> {
  const values: Record<string, unknown> = {}
  for (const field of config.fields) {
    if (field.type === 'boolean') values[field.name] = ['is_active', 'is_published', 'registration_enabled', 'is_visible', 'hero_enabled'].includes(field.name)
    else if (field.type === 'multi' || field.type === 'stats' || field.type === 'specs' || field.type === 'ctas') values[field.name] = []
    else if (field.type === 'select') values[field.name] = field.required ? field.options[0]?.value ?? '' : ''
    else for (const column of fieldColumns(field)) values[column] = ''
  }
  if ('sort' in values) values.sort = '0'
  if ('priority' in values) values.priority = '0'
  return values
}
