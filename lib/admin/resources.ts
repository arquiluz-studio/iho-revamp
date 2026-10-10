import type { CountrySection } from '@/lib/cache-tags'
import { Constants, type Database } from '@/lib/supabase/database.types'
import type { CountryRole } from './roles'

/**
 * Declarative description of the admin CRUD screens. Shared by server pages (loading), server actions
 * (validation + persistence) and the client form, so it must stay plain data (no functions).
 */
export type TableName = keyof Database['public']['Tables']
export type MediaKind = Database['public']['Enums']['media_kind']
export type Option = { value: string; label: string }
export type ReferenceSource = 'brands' | 'business_lines' | 'sectors' | 'products'
export type Bridge = { table: TableName; selfKey: string; otherKey: string }

type FieldBase = { name: string; label: string; required?: boolean; help?: string; wide?: boolean }
export type Field =
  | (FieldBase & { type: 'text' | 'textarea' | 'url' | 'email' | 'slug'; i18n?: boolean; max?: number; rows?: number })
  | (FieldBase & { type: 'number'; min?: number; max?: number })
  | (FieldBase & { type: 'boolean' })
  | (FieldBase & { type: 'select'; options: Option[] })
  | (FieldBase & { type: 'datetime' })
  | (FieldBase & { type: 'reference'; source: ReferenceSource })
  | (FieldBase & { type: 'multi'; source: ReferenceSource; through: Bridge })
  | (FieldBase & { type: 'media'; kind: MediaKind; video?: boolean })
  | (FieldBase & { type: 'stats' })
  | (FieldBase & { type: 'specs' })

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
  globalTag?: 'countries' | 'taxonomies' | 'brands' | 'products'
  /** One row per country keyed by country_code (home settings). */
  singleton?: boolean
  /** The primary key is typed by the user on creation (countries.code). */
  pkInput?: boolean
  /** Localized public route used by "Ver en el sitio" / preview. */
  publicPath?: '/events/[slug]' | '/projects/[slug]' | '/brands/[slug]' | '/products/[slug]' | '/areas/[businessLine]' | '/spaces/[sector]' | '/'
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
    { name: 'is_featured', label: 'Destacado en home', type: 'boolean' },
    { name: 'client_name', label: 'Cliente', type: 'text', max: 200 },
    { name: 'city', label: 'Ciudad', type: 'text', max: 120 },
    { name: 'year', label: 'Año', type: 'number', min: 1950, max: 2100 },
    { name: 'sector_id', label: 'Espacio', type: 'reference', source: 'sectors' },
    SORT_FIELD,
    { name: 'summary', label: 'Resumen', type: 'textarea', i18n: true, max: 600, rows: 3 },
    { name: 'body', label: 'Descripción', type: 'textarea', i18n: true, max: 20000, rows: 10 },
    {
      name: 'business_lines',
      label: 'Áreas',
      type: 'multi',
      source: 'business_lines',
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
    { name: 'city', label: 'Ciudad', type: 'text', required: true, max: 120 },
    { name: 'is_main', label: 'Oficina principal', type: 'boolean' },
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
  fields: [
    { name: 'full_name', label: 'Nombre', type: 'text', required: true, max: 160 },
    { name: 'role', label: 'Puesto', type: 'text', i18n: true, required: true, max: 160 },
    { name: 'photo_media_id', label: 'Foto', type: 'media', kind: 'team_photo' },
    { name: 'photo_position', label: 'Encuadre de la foto', type: 'text', max: 40, help: 'object-position CSS, ej. "50% 20%".' },
    { name: 'linkedin_url', label: 'LinkedIn', type: 'url' },
    SORT_FIELD,
    { name: 'is_published', label: 'Visible en el sitio', type: 'boolean' },
  ],
  columns: [
    { key: 'full_name', label: 'Nombre' },
    { key: 'role_es', label: 'Puesto' },
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
  title: 'Home del país',
  singular: 'home',
  description: 'Hero, estadísticas, imagen de contacto y SEO del sitio del país.',
  writeRole: 'admin',
  section: 'settings',
  publicPath: '/',
  fields: [
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
    { name: 'stats', label: 'Estadísticas', type: 'stats', wide: true },
    { name: 'seo_title', label: 'SEO · título', type: 'text', i18n: true, max: 120 },
    { name: 'seo_description', label: 'SEO · descripción', type: 'textarea', i18n: true, max: 300, rows: 3 },
  ],
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
    { name: 'website_url', label: 'Sitio web', type: 'url' },
    { name: 'origin_country', label: 'País de origen', type: 'text', max: 80 },
    { name: 'is_active', label: 'Activa', type: 'boolean' },
    { name: 'description', label: 'Descripción', type: 'textarea', i18n: true, max: 4000, rows: 6 },
    {
      name: 'business_lines',
      label: 'Áreas',
      type: 'multi',
      source: 'business_lines',
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

const businessLines: ResourceConfig = {
  key: 'business-lines',
  table: 'business_lines',
  scope: 'global',
  pk: 'id',
  title: 'Áreas de negocio',
  singular: 'área',
  globalWrite: 'catalog',
  globalTag: 'taxonomies',
  publicPath: '/areas/[businessLine]',
  fields: taxonomyFields('Portada del área'),
  columns: taxonomyColumns,
  order: [{ column: 'sort', ascending: true }],
}

const sectors: ResourceConfig = {
  key: 'sectors',
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

export const PRICE_KIND_OPTIONS = enumOptions(Constants.public.Enums.price_list_kind, { base: 'Base', sale: 'Promoción' })

const products: ResourceConfig = {
  key: 'products',
  table: 'products',
  scope: 'global',
  pk: 'id',
  title: 'Productos (catálogo global)',
  singular: 'producto',
  description: 'Ficha global del producto. Visibilidad, precios e inventario se definen en cada país.',
  globalWrite: 'catalog',
  globalTag: 'products',
  publicPath: '/products/[slug]',
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', i18n: true, required: true, max: 200 },
    { name: 'slug', label: 'Slug en español (URL)', type: 'slug', required: true },
    { name: 'slug_en', label: 'Slug en inglés (URL)', type: 'slug', help: 'Opcional. Si queda vacío, la versión en inglés usa el slug en español.' },
    { name: 'status', label: 'Estado', type: 'select', options: STATUS_OPTIONS, required: true },
    { name: 'brand_id', label: 'Marca', type: 'reference', source: 'brands', required: true },
    { name: 'business_line_id', label: 'Área', type: 'reference', source: 'business_lines' },
    { name: 'designer', label: 'Diseñador', type: 'text', max: 160 },
    { name: 'erp_ref', label: 'Referencia ERP', type: 'text', max: 120 },
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
    { key: 'designer', label: 'Diseñador' },
    STATUS_COLUMN,
  ],
  order: [{ column: 'name_es', ascending: true }],
}

const priceLists: ResourceConfig = {
  key: 'price-lists',
  table: 'price_lists',
  scope: 'country',
  pk: 'id',
  title: 'Listas de precios',
  singular: 'lista de precios',
  description: 'Rige el precio vigente de mayor prioridad; una promoción activa reemplaza al precio base y lo muestra tachado.',
  writeRole: 'admin',
  section: 'catalog',
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', required: true, max: 160 },
    { name: 'kind', label: 'Tipo', type: 'select', options: PRICE_KIND_OPTIONS, required: true },
    { name: 'currency', label: 'Moneda (ISO 4217)', type: 'text', required: true, max: 3, help: 'Ej. MXN, USD.' },
    { name: 'priority', label: 'Prioridad', type: 'number', min: 0, max: 1000, help: 'Mayor número gana si dos listas del mismo tipo coinciden.' },
    { name: 'starts_at', label: 'Vigente desde', type: 'datetime' },
    { name: 'ends_at', label: 'Vigente hasta', type: 'datetime' },
    { name: 'is_active', label: 'Activa', type: 'boolean' },
  ],
  columns: [
    { key: 'name', label: 'Nombre' },
    { key: 'kind', label: 'Tipo', format: 'enum', options: PRICE_KIND_OPTIONS },
    { key: 'currency', label: 'Moneda' },
    { key: 'starts_at', label: 'Desde', format: 'datetime' },
    { key: 'ends_at', label: 'Hasta', format: 'datetime' },
    { key: 'is_active', label: 'Activa', format: 'boolean' },
  ],
  order: [
    { column: 'kind', ascending: true },
    { column: 'priority', ascending: false },
  ],
}

const warehouses: ResourceConfig = {
  key: 'warehouses',
  table: 'warehouses',
  scope: 'country',
  pk: 'id',
  title: 'Almacenes e inventario',
  singular: 'almacén',
  description: 'El inventario disponible (existencia − apartado) de todos los almacenes activos se suma por variante.',
  writeRole: 'admin',
  section: 'catalog',
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', required: true, max: 160 },
    { name: 'erp_ref', label: 'Referencia ERP', type: 'text', max: 120 },
    { name: 'is_active', label: 'Activo', type: 'boolean' },
  ],
  columns: [
    { key: 'name', label: 'Nombre' },
    { key: 'erp_ref', label: 'ERP' },
    { key: 'is_active', label: 'Activo', format: 'boolean' },
  ],
  order: [{ column: 'name', ascending: true }],
}

export const RESOURCES = {
  events,
  projects,
  socials,
  offices,
  team,
  home,
  'price-lists': priceLists,
  warehouses,
  countries,
  brands,
  products,
  'business-lines': businessLines,
  sectors,
}
export type ResourceKey = keyof typeof RESOURCES

export const COUNTRY_RESOURCES: ResourceKey[] = ['events', 'projects', 'socials', 'offices', 'team', 'price-lists', 'warehouses']
export const GLOBAL_RESOURCES: ResourceKey[] = ['countries', 'brands', 'products', 'business-lines', 'sectors']

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
    if (field.type === 'boolean') values[field.name] = ['is_active', 'is_published', 'registration_enabled'].includes(field.name)
    else if (field.type === 'multi' || field.type === 'stats' || field.type === 'specs') values[field.name] = []
    else if (field.type === 'select') values[field.name] = field.required ? field.options[0]?.value ?? '' : ''
    else for (const column of fieldColumns(field)) values[column] = ''
  }
  if ('sort' in values) values.sort = '0'
  if ('priority' in values) values.priority = '0'
  return values
}
