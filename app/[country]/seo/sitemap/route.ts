import { notFound } from 'next/navigation'
import { COUNTRY_CODES, LOCALES, isCountryCode, type AppLocale, type CountryCode } from '@/config/countries'
import { getPathname } from '@/i18n/navigation'
import { getCountryBrands } from '@/lib/queries/brands'
import { getCatalog } from '@/lib/queries/catalog'
import { localSlug } from '@/lib/i18n-fields'
import { getEvents } from '@/lib/queries/events'
import { getProjects } from '@/lib/queries/projects'
import { getBusinessLines, getSectors } from '@/lib/queries/site'
import { buildAlternates } from '@/lib/seo'

export const revalidate = 3600

export function generateStaticParams() {
  return COUNTRY_CODES.map(country => ({ country }))
}

type Href = Parameters<typeof getPathname>[0]['href']
/** A function when the slug differs per locale. */
type PageHref = Href | ((locale: AppLocale) => Href)

function entry(country: CountryCode, href: PageHref, availableIn?: readonly CountryCode[]): string {
  return LOCALES.map(locale => {
    const { canonical, languages } = buildAlternates({ href, country, locale, ...(availableIn ? { availableIn } : {}) })
    const links = Object.entries(languages ?? {})
      .map(([hreflang, url]) => `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${url}"/>`)
      .join('')
    return `<url><loc>${canonical}</loc>${links}</url>`
  }).join('')
}

export async function GET(_request: Request, { params }: { params: Promise<{ country: string }> }) {
  const { country } = await params
  if (!isCountryCode(country)) notFound()
  const [events, projects, brands, lines, sectors, products] = await Promise.all([
    getEvents(country),
    getProjects(country),
    getCountryBrands(country),
    getBusinessLines(),
    getSectors(),
    getCatalog(country),
  ])
  const shared: PageHref[] = [
    '/',
    '/group',
    '/solutions',
    '/spaces',
    '/events',
    '/projects',
    '/brands',
    '/products',
    '/contact',
    '/privacy',
    ...lines.map(line => (l: AppLocale) => ({ pathname: '/solutions/[businessLine]' as const, params: { businessLine: localSlug(line, l) } })),
    ...sectors.map(s => (l: AppLocale) => ({ pathname: '/spaces/[sector]' as const, params: { sector: localSlug(s, l) } })),
  ]
  const local: PageHref[] = [
    ...events.map(e => (l: AppLocale) => ({ pathname: '/events/[slug]' as const, params: { slug: localSlug(e, l) } })),
    ...projects.map(p => (l: AppLocale) => ({ pathname: '/projects/[slug]' as const, params: { slug: localSlug(p, l) } })),
    ...brands.map(b => ({ pathname: '/brands/[slug]' as const, params: { slug: b.slug } })),
    ...products.map(p => (l: AppLocale) => ({ pathname: '/products/[slug]' as const, params: { slug: localSlug(p, l) } })),
  ]
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' +
    shared.map(href => entry(country, href)).join('') +
    local.map(href => entry(country, href, [country])).join('') +
    '</urlset>'
  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } })
}
