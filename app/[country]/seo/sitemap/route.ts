import { notFound } from 'next/navigation'
import { COUNTRY_CODES, LOCALES, htmlLang, isCountryCode, type CountryCode } from '@/config/countries'
import { getPathname } from '@/i18n/navigation'
import { getStaticEventSlugs } from '@/lib/content/static'
import { buildAlternates } from '@/lib/seo'

export const revalidate = 3600

export function generateStaticParams() {
  return COUNTRY_CODES.map(country => ({ country }))
}

type Href = Parameters<typeof getPathname>[0]['href']

function entry(country: CountryCode, href: Href): string {
  return LOCALES.map(locale => {
    const { canonical, languages } = buildAlternates({ href, country, locale, availableIn: [country] })
    const links = LOCALES.map(l => {
      const key = htmlLang(l, country)
      return `<xhtml:link rel="alternate" hreflang="${key}" href="${(languages as Record<string, string>)[key]}"/>`
    }).join('')
    return `<url><loc>${canonical}</loc>${links}</url>`
  }).join('')
}

export async function GET(_request: Request, { params }: { params: Promise<{ country: string }> }) {
  const { country } = await params
  if (!isCountryCode(country)) notFound()
  const hrefs: Href[] = ['/', ...getStaticEventSlugs().map(slug => ({ pathname: '/events/[slug]' as const, params: { slug } }))]
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' +
    hrefs.map(href => entry(country, href)).join('') +
    '</urlset>'
  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } })
}
