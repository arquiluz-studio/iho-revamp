import { notFound } from 'next/navigation'
import { COUNTRY_CODES, countryOrigin, isCountryCode } from '@/config/countries'

export function generateStaticParams() {
  return COUNTRY_CODES.map(country => ({ country }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ country: string }> }) {
  const { country } = await params
  if (!isCountryCode(country)) notFound()
  const body = ['User-agent: *', 'Allow: /', 'Disallow: /api/', '', `Sitemap: ${countryOrigin(country)}/sitemap.xml`, ''].join('\n')
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } })
}
