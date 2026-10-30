import 'server-only'
import { getTranslations } from 'next-intl/server'
import { countryOrigin, sortByCountry, type AppLocale, type CountryCode } from '@/config/countries'
import { dayOfMonth, isPastDate, longDate, shortMonth, timeOfDay, timeRange, type Locale } from '@/lib/dates'
import { plainTitle } from '@/lib/events/ics'
import { projectCity } from '@/lib/geo/latam-projection'
import { localSlug, paragraphs, t } from '@/lib/i18n-fields'
import { toImageVM, type ImageVariant, type MediaRef } from '@/lib/media'
import { getCountryBrands, type CountryBrandRow } from '@/lib/queries/brands'
import { formatPrice, getCatalog, type CatalogRow } from '@/lib/queries/catalog'
import type { DesignerRow } from '@/lib/queries/designers'
import { getEventBySlug, getEvents, type EventDetailRow, type EventListRow } from '@/lib/queries/events'
import { getProjects, type ProjectListRow } from '@/lib/queries/projects'
import { getBusinessLines, getCountries, getOffices, getSectors, getSiteSettings, getTeam } from '@/lib/queries/site'
import { buildAlternates } from '@/lib/seo'
import type { SolutionCardVM, BrandVM, DesignerCardVM, EventDetailVM, EventVM, HomeVM, ImageVM, MapCountryVM, OfficeVM, ProductCardVM, ProjectCardVM, StatVM } from '@/lib/types/site'
import { cityChip, cityDisplay } from './cities'
import { resolveHomeSlides } from './hero-slides'
import { legacyMedia } from './legacy-media'
import { resolveHomeRecord } from './page-hero'
import type { SitePaths } from './paths'

const PLACEHOLDER_COLOR = '#d9d4ca'
const PLACEHOLDER_SRC = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="4" height="3"/>')}`

/** Media asset when present, else the pre-import file in public/, else a neutral placeholder. */
export function imageOf(media: MediaRef | null | undefined, locale: AppLocale, alt: string, fallback?: string | null, largest: ImageVariant = 'lg'): ImageVM {
  return imageOrNull(media, locale, alt, fallback, largest) ?? { src: PLACEHOLDER_SRC, alt, color: PLACEHOLDER_COLOR }
}

type ShotSource = {
  slug: string
  cover: MediaRef | null | undefined
  gallery?: readonly { sort: number; media: MediaRef | null }[]
  variants?: readonly { sort: number; is_active?: boolean; image: MediaRef | null }[]
}

/** First active variant's product photo. */
function variantMedia(product: ShotSource): MediaRef | null {
  return [...(product.variants ?? [])].filter(variant => variant.is_active !== false && variant.image).sort((a, b) => a.sort - b.sort)[0]?.image ?? null
}

/** First usage photo. That shot is the hover cover. */
function usageMedia(product: ShotSource): MediaRef | null {
  if (product.cover) return product.cover
  return [...(product.gallery ?? [])].sort((a, b) => a.sort - b.sort).find(item => item.media)?.media ?? null
}

/**
 * Product photo: the first active variant, otherwise a usage photo. The old stock photo is only used when the
 * product has no picture of its own, so removing the cover does not bring that placeholder back.
 */
export function productShot(product: ShotSource, locale: AppLocale, name: string, largest: ImageVariant): ImageVM | null {
  const shot = variantMedia(product) ?? usageMedia(product)
  return imageOrNull(shot, locale, name, shot ? null : legacyMedia.productCover(product.slug), largest)
}

/** Usage cover shown on hover, only when it is a different photo from the product shot. */
export function usageHover(product: ShotSource, locale: AppLocale, name: string, largest: ImageVariant): ImageVM | null {
  const photo = variantMedia(product)
  const usage = usageMedia(product)
  if (!photo || !usage || photo.id === usage.id) return null
  return imageOrNull(usage, locale, name, null, largest)
}

/** No media and no fallback means the slot stays empty, instead of a placeholder. */
export function imageOrNull(media: MediaRef | null | undefined, locale: AppLocale, alt: string, fallback?: string | null, largest: ImageVariant = 'md'): ImageVM | null {
  if (media) return toImageVM(media, locale, largest, alt)
  if (fallback) return { src: fallback, alt }
  return null
}

async function eventLabels(locale: AppLocale) {
  const tr = await getTranslations({ locale })
  return {
    type: (type: string) => tr(`eventTypes.${type}` as 'eventTypes.event'),
    access: (access: string) => tr(`eventAccess.${access}` as 'eventAccess.open'),
    online: tr('event.online'),
  }
}

type EventLabels = Awaited<ReturnType<typeof eventLabels>>

/** City as shown in event meta lines: 'GUADALAJARA', 'CDMX, MÉXICO', 'EN LÍNEA'. */
function eventCity(e: Pick<EventListRow, 'city' | 'is_online'>, countryName: string, labels: EventLabels): string {
  if (e.is_online) return labels.online.toUpperCase()
  const city = (e.city ?? '').toUpperCase()
  const country = countryName.toUpperCase()
  if (!city || city === country) return country
  return cityChip(city) === city ? `${city}, ${country}` : city
}

function toEventVM(e: Omit<EventListRow, 'designers'>, locale: AppLocale, countryName: string, labels: EventLabels, paths: SitePaths): EventVM {
  const title = t(e, 'title', locale)
  const city = eventCity(e, countryName, labels)
  return {
    slug: localSlug(e, locale),
    href: paths.event(localSlug(e, locale)),
    startsAt: e.starts_at,
    isPast: isPastDate(e.ends_at ?? e.starts_at),
    day: dayOfMonth(e.starts_at, e.timezone),
    month: shortMonth(e.starts_at, e.timezone, locale as Locale),
    city: e.is_online ? labels.online.toUpperCase() : cityChip(e.city ?? countryName),
    typeLabel: labels.type(e.type),
    title,
    meta: `${dayOfMonth(e.starts_at, e.timezone)} ${shortMonth(e.starts_at, e.timezone, locale as Locale)} · ${city} · ${timeOfDay(e.starts_at, e.timezone)}`,
    image: imageOf(e.cover, locale, title, legacyMedia.eventCover(e.slug), 'md'),
  }
}

export function toBrandVM(b: Pick<CountryBrandRow, 'slug' | 'name' | 'logo_is_thin' | 'logo'>, locale: AppLocale, paths?: SitePaths): BrandVM {
  const logo = imageOf(b.logo, locale, b.name, legacyMedia.brandLogo(b.slug), 'thumb')
  return {
    slug: b.slug,
    name: b.name,
    thin: b.logo_is_thin,
    href: paths?.brand(b.slug),
    // Logos are cutouts. A sampled background (often near-white) would show through the transparent pixels.
    logo: { ...logo, color: null, placeholder: null },
  }
}

/** "1918 – 2002", or "n. 1971" via `born` while the designer is alive. */
export function designerYears(d: Pick<DesignerRow, 'birth_year' | 'death_year'>, born: (year: number) => string): string | null {
  if (d.birth_year && d.death_year) return `${d.birth_year} – ${d.death_year}`
  return d.birth_year ? born(d.birth_year) : null
}

type DesignerCardRow = Pick<DesignerRow, 'id' | 'slug' | 'name' | 'nationality_es' | 'nationality_en' | 'birth_year' | 'death_year' | 'portrait'>

export function toDesignerCardVM(d: DesignerCardRow, locale: AppLocale, paths: SitePaths, born: (year: number) => string): DesignerCardVM {
  const meta = [t(d, 'nationality', locale), designerYears(d, born)].filter(Boolean).join(' · ')
  return { key: d.id, name: d.name, href: paths.designer(d.slug), image: imageOf(d.portrait, locale, d.name, null, 'md'), meta: meta || undefined }
}

export function toProjectCardVM(p: ProjectListRow, locale: AppLocale, paths: SitePaths, largest: ImageVariant = 'md'): ProjectCardVM {
  const title = t(p, 'title', locale)
  return {
    key: p.id,
    title,
    description: t(p, 'summary', locale),
    image: imageOf(p.cover, locale, title, legacyMedia.projectCover(p.slug), largest),
    href: paths.project(localSlug(p, locale)),
  }
}

/** Price label of a catalog row, or null when the product is quote-only in the country. */
export function priceLabels(offer: { amount: number | null; currency: string | null } | null, locale: AppLocale, country: string) {
  if (!offer || offer.amount == null || !offer.currency) return null
  return { price: formatPrice(offer.amount, offer.currency, locale, country) }
}

export function toProductCardVM(p: CatalogRow, locale: AppLocale, country: string, paths: SitePaths): ProductCardVM {
  const name = t(p, 'name', locale)
  const category = p.sectors[0] ?? p.business_line
  const labels = p.is_purchasable ? priceLabels(p.price, locale, country) : null
  return {
    key: p.id,
    name,
    brand: p.catalogBrandName,
    category: category ? t(category, 'name', locale).toUpperCase() : undefined,
    href: labels ? paths.product(localSlug(p, locale)) : `${paths.product(localSlug(p, locale))}#cotizar`,
    image: productShot(p, locale, name, 'md') ?? imageOf(null, locale, name, null, 'md'),
    hover: usageHover(p, locale, name, 'md'),
    price: labels?.price,
    inquiry: !labels,
  }
}

async function featuredProducts(country: CountryCode, locale: AppLocale, paths: SitePaths): Promise<ProductCardVM[]> {
  const catalog = await getCatalog(country)
  const featured = catalog.filter(p => p.is_featured)
  return (featured.length ? featured : catalog.slice(0, 8)).map(p => toProductCardVM(p, locale, country, paths))
}

type StatRow = { value?: number; prefix?: string; suffix?: string; label_es?: string; label_en?: string }

function toStats(value: unknown, locale: AppLocale): StatVM[] {
  if (!Array.isArray(value)) return []
  return (value as StatRow[]).map(s => ({
    value: Number(s.value ?? 0),
    prefix: s.prefix ?? '',
    suffix: s.suffix ?? '',
    label: t(s, 'label', locale),
  }))
}

async function mapCountries(locale: AppLocale): Promise<MapCountryVM[]> {
  const [countries, offices] = await Promise.all([getCountries(), getOffices()])
  return sortByCountry(countries, c => c.code).flatMap(c => {
    const cities = offices
      .filter(o => o.country_code === c.code)
      .sort((a, b) => a.sort - b.sort || a.city.localeCompare(b.city, locale))
      .map(o => {
        const xy = projectCity(o.city, o)
        return { id: o.id, name: cityDisplay(o.city), title: o.city, address: o.address?.trim() ?? '', mapsUrl: o.maps_url, x: xy?.[0] ?? null, y: xy?.[1] ?? null }
      })
    if (!cities.length) return []
    return [{ code: c.code, name: t(c, 'name', locale), cities }]
  })
}

/** Offices grouped by country in site order (see `sortByCountry`), cities alphabetical within each country; other countries muted. */
export async function officesFor(current: CountryCode, locale: AppLocale): Promise<OfficeVM[]> {
  const offices = await getOffices()
  const listed = offices.flatMap(o => {
    const address = o.address?.trim()
    return address ? [{ ...o, address }] : []
  })
  const byCity = [...listed].sort((a, b) => a.city.localeCompare(b.city, locale))
  return sortByCountry(byCity, o => o.country_code).map(o => ({
    city: o.city,
    address: o.address,
    ...(o.country_code === current ? {} : { muted: true }),
  }))
}

/** Group copy, map, brands, team and featured projects for the IHO Group page. */
export async function getGroupVM(country: CountryCode, locale: AppLocale, paths: SitePaths) {
  const [settings, members, countries, brands, projects] = await Promise.all([
    getSiteSettings(),
    getTeam(country),
    mapCountries(locale),
    getCountryBrands(country),
    getProjects(country, { featured: true }),
  ])
  return {
    stats: toStats(settings?.stats, locale),
    mapCountries: countries,
    brands: brands.filter(b => b.is_featured).map(b => toBrandVM(b, locale, paths)),
    projects: projects.map(p => toProjectCardVM(p, locale, paths)),
    team: members.map(m => ({
      name: m.full_name,
      role: t(m, 'role', locale),
      objectPosition: m.photo_position ?? undefined,
      linkedin: m.linkedin_url,
      photo: imageOf(m.photo, locale, m.full_name, legacyMedia.teamPhoto(m.full_name), 'md'),
    })),
  }
}

export async function getHomeVM(country: CountryCode, locale: AppLocale, paths: SitePaths): Promise<HomeVM> {
  const [tr, labels, home, events, sectors, businessLines, brands, projects, offices, countryRow, products] = await Promise.all([
    getTranslations({ locale }),
    eventLabels(locale),
    resolveHomeRecord(country),
    getEvents(country),
    getSectors(),
    getBusinessLines(),
    getCountryBrands(country),
    getProjects(country, { featured: true }),
    officesFor(country, locale),
    getCountries().then(rows => rows.find(c => c.code === country)),
    featuredProducts(country, locale, paths),
  ])
  const countryName = countryRow ? t(countryRow, 'name', locale) : country.toUpperCase()

  const homeSource = home

  return {
    hero: {
      enabled: homeSource?.hero_enabled !== false,
      slides: await resolveHomeSlides(homeSource, locale, country),
    },
    sectors: sectors.map(s => t(s, 'name', locale).toUpperCase()),
    products,
    events: events.map(e => toEventVM(e, locale, countryName, labels, paths)),
    solutions: businessLines.map(
      (b, i): SolutionCardVM => ({
        num: String(i + 1).padStart(2, '0'),
        title: t(b, 'name', locale),
        description: t(b, 'description', locale),
        image: imageOf(b.cover, locale, t(b, 'name', locale), legacyMedia.businessLineCover(b.slug), 'md'),
        href: paths.solution(localSlug(b, locale)),
      }),
    ),
    brands: brands.filter(b => b.is_featured).map(b => toBrandVM(b, locale, paths)),
    projects: projects.map(p => toProjectCardVM(p, locale, paths)),
    offices,
    contactImage: imageOrNull(homeSource?.contact_image, locale, tr('contact.imageAlt'), null, 'md'),
  }
}

export async function getEventsVM(country: CountryCode, locale: AppLocale, paths: SitePaths): Promise<EventVM[]> {
  const [labels, events, countryRow] = await Promise.all([eventLabels(locale), getEvents(country), getCountries().then(r => r.find(c => c.code === country))])
  const countryName = countryRow ? t(countryRow, 'name', locale) : country.toUpperCase()
  return events.map(e => toEventVM(e, locale, countryName, labels, paths))
}

/** Events of the country that feature the designer, oldest first. */
export async function getDesignerEventsVM(country: CountryCode, locale: AppLocale, paths: SitePaths, designerId: string): Promise<EventVM[]> {
  const [labels, events, countryRow] = await Promise.all([eventLabels(locale), getEvents(country), getCountries().then(r => r.find(c => c.code === country))])
  const countryName = countryRow ? t(countryRow, 'name', locale) : country.toUpperCase()
  return events.filter(e => e.designers.some(d => d.designer_id === designerId)).map(e => toEventVM(e, locale, countryName, labels, paths))
}

const EVENT_PRODUCT_LIMIT = 8

/**
 * Curated `event_products` first, then products of the linked designers, then of the linked brands; only those
 * visible in the country.
 */
function eventProducts(event: EventDetailRow, catalog: CatalogRow[]): CatalogRow[] {
  const byId = new Map(catalog.map(p => [p.id, p]))
  const picked = new Map<string, CatalogRow>()
  for (const { product_id } of event.products) {
    const p = byId.get(product_id)
    if (p) picked.set(p.id, p)
  }
  const designerIds = new Set(event.designers.map(d => d.id))
  const brandIds = new Set(event.brands.flatMap(b => (b.brand ? [b.brand.id] : [])))
  const fillers = [(p: CatalogRow) => p.designers.some(d => designerIds.has(d.id)), (p: CatalogRow) => Boolean(p.brand && brandIds.has(p.brand.id))]
  for (const matches of fillers) {
    for (const p of catalog) {
      if (picked.size >= EVENT_PRODUCT_LIMIT) break
      if (matches(p)) picked.set(p.id, p)
    }
  }
  return [...picked.values()].slice(0, EVENT_PRODUCT_LIMIT)
}

const absoluteUrl = (src: string, origin: string) => (src.startsWith('/') ? `${origin}${src}` : src)

function eventJsonLd(event: EventDetailRow, vm: { title: string; description: string; url: string; image: ImageVM }, country: CountryCode, currency: string, open: boolean) {
  const origin = countryOrigin(country)
  const location = event.is_online
    ? { '@type': 'VirtualLocation', url: event.online_url ?? vm.url }
    : {
        '@type': 'Place',
        name: event.venue_name ?? event.city ?? undefined,
        address: { '@type': 'PostalAddress', streetAddress: event.address ?? undefined, addressLocality: event.city ?? undefined, addressCountry: country.toUpperCase() },
      }
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: plainTitle(vm.title),
    description: vm.description || undefined,
    startDate: event.starts_at,
    endDate: event.ends_at ?? undefined,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: event.is_online ? 'https://schema.org/OnlineEventAttendanceMode' : 'https://schema.org/OfflineEventAttendanceMode',
    location,
    image: vm.image.src.startsWith('data:') ? undefined : [absoluteUrl(vm.image.src, origin)],
    url: vm.url,
    organizer: { '@type': 'Organization', name: 'Grupo IHO', url: origin },
    ...(open && {
      offers: { '@type': 'Offer', price: 0, priceCurrency: currency, availability: 'https://schema.org/InStock', url: `${vm.url}#registro`, validFrom: event.created_at },
    }),
  }
}

export async function getEventDetailVM(country: CountryCode, locale: AppLocale, slug: string, paths: SitePaths): Promise<EventDetailVM | null> {
  const [labels, event, countryRow, catalog, td] = await Promise.all([
    eventLabels(locale),
    getEventBySlug(country, slug, locale),
    getCountries().then(r => r.find(c => c.code === country)),
    getCatalog(country),
    getTranslations({ locale, namespace: 'pages.designers' }),
  ])
  if (!event) return null
  const countryName = countryRow ? t(countryRow, 'name', locale) : country.toUpperCase()
  const base = toEventVM(event, locale, countryName, labels, paths)
  const tz = event.timezone
  const fullDate = longDate(event.starts_at, tz, locale as Locale)
  const body = t(event, 'body', locale) || t(event, 'summary', locale)
  const venueParts = event.is_online ? [labels.online, event.venue_name] : [event.venue_name, event.address]
  const place = event.is_online ? labels.online.toUpperCase() : `${(event.city ?? '').toUpperCase() || countryName.toUpperCase()}, ${countryName.toUpperCase()}`
  const gallery = event.gallery.flatMap(g => (g.media ? [imageOf(g.media, locale, base.title, null, 'lg')] : []))
  const previousEditions = base.isPast
    ? []
    : event.previousEditions.map(previous => {
        const title = t(previous, 'title', locale)
        return {
          href: paths.event(localSlug(previous, locale)),
          title,
          image: imageOf(previous.cover, locale, title, legacyMedia.eventCover(previous.slug), 'md'),
          meta: `${dayOfMonth(previous.starts_at, previous.timezone)} ${shortMonth(previous.starts_at, previous.timezone, locale as Locale)}`,
        }
      })
  const enabled = event.registration_enabled && event.access_type !== 'invite_only'
  const closed = new Date(event.registration_closes_at ?? event.starts_at) < new Date()
  const url = String(buildAlternates({ href: { pathname: '/events/[slug]', params: { slug: localSlug(event, locale) } }, country, locale, availableIn: [country] }).canonical)

  return {
    ...base,
    id: event.id,
    fullDate,
    timeRange: timeRange(event.starts_at, event.ends_at, tz),
    venue: venueParts.filter(Boolean).join(' · '),
    access: labels.access(event.access_type),
    locationLine: `${fullDate.toUpperCase()} · ${place} · ${timeOfDay(event.starts_at, tz)}`,
    aboutTitle: t(event, 'about_title', locale),
    description: paragraphs(body),
    agendaHeading: t(event, 'agenda_heading', locale),
    agenda: event.agenda.map((a, i) => ({ num: a.time_label || String(i + 1).padStart(2, '0'), text: t(a, 'text', locale) })),
    gallery,
    previousEditions,
    brands: event.brands.flatMap(b => (b.brand && b.brand.is_active ? [toBrandVM(b.brand, locale, paths)] : [])),
    designers: event.designers.map(d => toDesignerCardVM(d, locale, paths, year => td('born', { year }))),
    products: eventProducts(event, catalog).map(p => toProductCardVM(p, locale, country, paths)),
    registration: { enabled, closed },
    icsHref: `/api/events/${event.id}/ics?lang=${locale}`,
    jsonLd: eventJsonLd(event, { title: base.title, description: t(event, 'summary', locale) || body.slice(0, 300), url, image: base.image }, country, countryRow?.currency ?? 'USD', enabled && !closed && !base.isPast),
  }
}
