import 'server-only'
import { headers } from 'next/headers'
import { countryOrigin, isCountryCode, stripPort, type AppLocale } from '@/config/countries'
import { getPathname } from '@/i18n/navigation'
import { createSignedValue } from '@/lib/security/signed-cookie'

type Href = Parameters<typeof getPathname>[0]['href']

/**
 * Public URL of a page on a country site, as reachable from the admin host:
 * production → country domain, local dev → `<code>.localhost`, previews → same host with `?country=`.
 */
export async function publicUrl(countryCode: string, href: Href, locale: AppLocale = 'es'): Promise<string> {
  const path = getPathname({ href, locale })
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? ''
  const protocol = h.get('x-forwarded-proto') ?? (host.includes('localhost') ? 'http' : 'https')
  const [hostname, port] = host.split(':')

  if (hostname.endsWith('localhost')) return `${protocol}://${countryCode}.localhost${port ? `:${port}` : ''}${path}`
  const adminHost = stripPort(process.env.ADMIN_HOST)
  if (isCountryCode(countryCode) && adminHost && stripPort(host) === adminHost) return `${countryOrigin(countryCode)}${path}`
  return `${protocol}://${host}${path}${path.includes('?') ? '&' : '?'}country=${countryCode}`
}

/** Link that enables Draft Mode on the public site and lands on `href`, valid for 10 minutes. */
export async function previewUrl(countryCode: string, href: Href, locale: AppLocale = 'es'): Promise<string> {
  const target = new URL(await publicUrl(countryCode, href, locale))
  const token = createSignedValue({ purpose: 'draft', path: `${target.pathname}${target.search}` }, 600)
  return `${target.origin}/api/draft?token=${encodeURIComponent(token)}`
}
