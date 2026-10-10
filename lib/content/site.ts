import 'server-only'
import { getTranslations } from 'next-intl/server'
import type { AppLocale, CountryCode } from '@/config/countries'
import { dayOfMonth, isPastDate, longDate, shortMonth, timeOfDay, timeRange, type Locale } from '@/lib/dates'
import { paragraphs, t } from '@/lib/i18n-fields'
import { toImageVM, videoUrl, type ImageVariant, type MediaRef } from '@/lib/media'
import { getCountryBrands, type CountryBrandRow } from '@/lib/queries/brands'
import { formatPrice, getCatalog, type CatalogRow } from '@/lib/queries/catalog'
import { getEventBySlug, getEvents, type EventListRow } from '@/lib/queries/events'
import { getProjects, type ProjectListRow } from '@/lib/queries/projects'
import { getBusinessLines, getCountries, getCountrySettings, getOffices, getSectors, getTeam } from '@/lib/queries/site'
import type { AreaCardVM, BrandVM, EventDetailVM, EventVM, HomeVM, ImageVM, MapCountryVM, OfficeVM, ProductCardVM, ProjectCardVM, StatVM } from '@/lib/types/site'
import { cityChip, cityDisplay } from './cities'
import { LEGACY_PRODUCTS, legacyMedia } from './legacy-media'
import type { SitePaths } from './paths'

const PLACEHOLDER_COLOR = '#d9d4ca'
const PLACEHOLDER_SRC = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="4" height="3"/>')}`

/** Media asset when present, else the pre-import file in public/, else a neutral placeholder. */
export function imageOf(media: MediaRef | null | undefined, locale: AppLocale, alt: string, fallback?: string | null, largest: ImageVariant = 'lg'): ImageVM {
  if (media) return toImageVM(media, locale, largest, alt)
  if (fallback) return { src: fallback, alt }
  return { src: PLACEHOLDER_SRC, alt, color: PLACEHOLDER_COLOR }
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

function toEventVM(e: EventListRow, locale: AppLocale, countryName: string, labels: EventLabels, paths: SitePaths): EventVM {
  const title = t(e, 'title', locale)
  const city = eventCity(e, countryName, labels)
  return {
    slug: e.slug,
    href: paths.event(e.slug),
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
  return {
    slug: b.slug,
    name: b.name,
    thin: b.logo_is_thin,
    href: paths?.brand(b.slug),
    logo: imageOf(b.logo, locale, b.name, legacyMedia.brandLogo(b.slug), 'thumb'),
  }
}

export function toProjectCardVM(p: ProjectListRow, locale: AppLocale, paths: SitePaths, largest: ImageVariant = 'md'): ProjectCardVM {
  const title = t(p, 'title', locale)
  return {
    key: p.id,
    title,
    description: t(p, 'summary', locale),
    image: imageOf(p.cover, locale, title, legacyMedia.projectCover(p.slug), largest),
    href: paths.project(p.slug),
  }
}

function placeholderProducts(href: string): ProductCardVM[] {
  return LEGACY_PRODUCTS.map((p, i) => ({ key: `p${i}`, name: p.name, category: p.category, href, image: { src: `/${p.image}`, alt: p.name } }))
}

/** Price label of a catalog row, or null when the product is quote-only in the country. */
export function priceLabels(offer: { amount: number | null; compareAt: number | null; currency: string | null } | null, locale: AppLocale, country: string) {
  if (!offer || offer.amount == null || !offer.currency) return null
  return {
    price: formatPrice(offer.amount, offer.currency, locale, country),
    compareAt: offer.compareAt != null && offer.compareAt > offer.amount ? formatPrice(offer.compareAt, offer.currency, locale, country) : undefined,
  }
}

export function toProductCardVM(p: CatalogRow, locale: AppLocale, country: string, paths: SitePaths): ProductCardVM {
  const name = t(p, 'name', locale)
  const category = p.sectors[0] ?? p.business_line
  const labels = p.is_purchasable ? priceLabels(p.price, locale, country) : null
  return {
    key: p.id,
    name,
    category: category ? t(category, 'name', locale).toUpperCase() : undefined,
    href: paths.product(p.slug),
    image: imageOf(p.cover, locale, name, legacyMedia.productCover(p.slug), 'md'),
    price: labels?.price,
    compareAt: labels?.compareAt,
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

async function mapCountries(current: CountryCode, locale: AppLocale): Promise<MapCountryVM[]> {
  const [countries, offices] = await Promise.all([getCountries(), getOffices()])
  return countries
    .map(c => {
      const own = offices.filter(o => o.country_code === c.code)
      const main = own.filter(o => o.is_main).map(o => cityDisplay(o.city))
      const rest = own
        .filter(o => !o.is_main)
        .map(o => cityDisplay(o.city))
        .sort((a, b) => a.localeCompare(b, 'es'))
      const name = t(c, 'name', locale)
      const cities = [...main, ...rest]
      // Single-office countries are labelled with the country name, as on the map legend.
      return { code: c.code, name, cities: cities.length > 1 ? cities : [name], isCurrent: c.code === current, hasSite: true }
    })
    .sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent))
}

async function officesFor(current: CountryCode): Promise<OfficeVM[]> {
  const offices = await getOffices()
  const own = offices.filter(o => o.country_code === current)
  const others = offices.filter(o => o.country_code !== current)
  return [...own.map(o => ({ city: o.city, address: o.address })), ...others.map(o => ({ city: o.city, address: o.address, muted: true }))]
}

export async function getHomeVM(country: CountryCode, locale: AppLocale, paths: SitePaths): Promise<HomeVM> {
  const [tr, labels, settings, events, sectors, businessLines, projects, brands, team, map, offices, countryRow, products] = await Promise.all([
    getTranslations({ locale }),
    eventLabels(locale),
    getCountrySettings(country),
    getEvents(country),
    getSectors(),
    getBusinessLines(),
    getProjects(country, { featured: true }),
    getCountryBrands(country),
    getTeam(country),
    mapCountries(country, locale),
    officesFor(country),
    getCountries().then(rows => rows.find(c => c.code === country)),
    featuredProducts(country, locale, paths),
  ])
  const countryName = countryRow ? t(countryRow, 'name', locale) : country.toUpperCase()

  return {
    hero: {
      eyebrow: t(settings, 'hero_eyebrow', locale) || tr('hero.eyebrow'),
      title: t(settings, 'hero_title', locale) || tr('hero.title'),
      videoSrc: videoUrl(settings?.hero_video) ?? legacyMedia.heroVideo(),
      poster: settings?.hero_image ? toImageVM(settings.hero_image, locale, 'lg').src : null,
    },
    sectors: sectors.map(s => t(s, 'name', locale).toUpperCase()),
    products,
    events: events.map(e => toEventVM(e, locale, countryName, labels, paths)),
    group: { stats: toStats(settings?.stats, locale), mapCountries: map },
    areas: businessLines.map(
      (b, i): AreaCardVM => ({
        num: String(i + 1).padStart(2, '0'),
        title: t(b, 'name', locale),
        description: t(b, 'description', locale),
        image: imageOf(b.cover, locale, t(b, 'name', locale), legacyMedia.businessLineCover(b.slug), 'md'),
        href: paths.area(b.slug),
      }),
    ),
    projects: projects.map(p => toProjectCardVM(p, locale, paths)),
    brands: brands.map(b => toBrandVM(b, locale, paths)),
    team: team.map(m => ({
      name: m.full_name,
      role: t(m, 'role', locale),
      objectPosition: m.photo_position ?? undefined,
      linkedinUrl: m.linkedin_url,
      photo: imageOf(m.photo, locale, m.full_name, legacyMedia.teamPhoto(m.full_name), 'md'),
    })),
    offices,
    contactImage: imageOf(settings?.contact_image, locale, tr('contact.imageAlt'), legacyMedia.contactImage(), 'md'),
  }
}

export async function getEventsVM(country: CountryCode, locale: AppLocale, paths: SitePaths): Promise<EventVM[]> {
  const [labels, events, countryRow] = await Promise.all([eventLabels(locale), getEvents(country), getCountries().then(r => r.find(c => c.code === country))])
  const countryName = countryRow ? t(countryRow, 'name', locale) : country.toUpperCase()
  return events.map(e => toEventVM(e, locale, countryName, labels, paths))
}

export async function getEventDetailVM(country: CountryCode, locale: AppLocale, slug: string, paths: SitePaths): Promise<EventDetailVM | null> {
  const [labels, event, countryRow] = await Promise.all([eventLabels(locale), getEventBySlug(country, slug), getCountries().then(r => r.find(c => c.code === country))])
  if (!event) return null
  const countryName = countryRow ? t(countryRow, 'name', locale) : country.toUpperCase()
  const base = toEventVM(event, locale, countryName, labels, paths)
  const tz = event.timezone
  const fullDate = longDate(event.starts_at, tz, locale as Locale)
  const body = t(event, 'body', locale) || t(event, 'summary', locale)
  const venueParts = event.is_online ? [labels.online, event.venue_name] : [event.venue_name, event.address]
  const place = event.is_online ? labels.online.toUpperCase() : `${(event.city ?? '').toUpperCase() || countryName.toUpperCase()}, ${countryName.toUpperCase()}`
  const legacyGallery = legacyMedia.eventCover(event.slug) ? legacyMedia.eventGallery() : []
  const gallery = event.gallery.length
    ? event.gallery.flatMap(g => (g.media ? [imageOf(g.media, locale, base.title, null, 'lg')] : []))
    : legacyGallery.map((src, i) => ({ src, alt: `${base.title} ${i + 1}` }))
  const closesAt = event.registration_closes_at ? new Date(event.registration_closes_at) : null

  return {
    ...base,
    id: event.id,
    fullDate,
    timeRange: timeRange(event.starts_at, event.ends_at, tz),
    venue: venueParts.filter(Boolean).join(' · '),
    access: labels.access(event.access_type),
    locationLine: `${fullDate.toUpperCase()} · ${place} · ${timeOfDay(event.starts_at, tz)}`,
    description: paragraphs(body),
    agenda: event.agenda.map((a, i) => ({ num: a.time_label || String(i + 1).padStart(2, '0'), text: t(a, 'text', locale) })),
    gallery,
    brands: event.brands.flatMap(b => (b.brand && b.brand.is_active ? [toBrandVM(b.brand, locale, paths)] : [])),
    products: legacyGallery.length ? placeholderProducts(paths.products) : [],
    registration: { enabled: event.registration_enabled, closed: closesAt ? closesAt < new Date() : false },
  }
}
