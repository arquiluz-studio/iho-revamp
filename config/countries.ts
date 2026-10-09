export const LOCALES = ['es', 'en'] as const
export type AppLocale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: AppLocale = 'es'

export const COUNTRY_CODES = ['mx', 'pa', 'cr', 'gt'] as const
export type CountryCode = (typeof COUNTRY_CODES)[number]

export type CountryConfig = {
  code: CountryCode
  domain: string
  name: Record<AppLocale, string>
  isHeadquarters: boolean
  timezone: string
  currency: string
  /** BCP 47 region used for hreflang / <html lang>. */
  region: string
}

export const COUNTRIES: Record<CountryCode, CountryConfig> = {
  mx: {
    code: 'mx',
    domain: 'iho.com.mx',
    name: { es: 'México', en: 'Mexico' },
    isHeadquarters: true,
    timezone: 'America/Mexico_City',
    currency: 'MXN',
    region: 'MX',
  },
  pa: {
    code: 'pa',
    domain: 'iho.com.pa',
    name: { es: 'Panamá', en: 'Panama' },
    isHeadquarters: false,
    timezone: 'America/Panama',
    currency: 'USD',
    region: 'PA',
  },
  cr: {
    code: 'cr',
    domain: 'iho.cr',
    name: { es: 'Costa Rica', en: 'Costa Rica' },
    isHeadquarters: false,
    timezone: 'America/Costa_Rica',
    currency: 'CRC',
    region: 'CR',
  },
  gt: {
    code: 'gt',
    domain: 'iho.com.gt',
    name: { es: 'Guatemala', en: 'Guatemala' },
    isHeadquarters: false,
    timezone: 'America/Guatemala',
    currency: 'GTQ',
    region: 'GT',
  },
}

export const HEADQUARTERS: CountryCode = 'mx'

export const COUNTRY_PREF_COOKIE = 'iho_country_pref'
export const COUNTRY_OVERRIDE_COOKIE = 'iho_country_override'
export const GEO_COOKIE = 'iho_geo'

export function isCountryCode(value: unknown): value is CountryCode {
  return typeof value === 'string' && (COUNTRY_CODES as readonly string[]).includes(value)
}

export function isLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

export function defaultCountry(): CountryCode {
  const env = process.env.DEFAULT_COUNTRY
  return isCountryCode(env) ? env : HEADQUARTERS
}

export function stripPort(host: string | null | undefined): string {
  return (host ?? '').toLowerCase().split(':')[0]
}

/** Resolves a country from a production domain (with or without www) or a `<code>.localhost` dev host. */
export function countryFromHost(host: string | null | undefined): CountryCode | null {
  const hostname = stripPort(host).replace(/^www\./, '')
  for (const country of Object.values(COUNTRIES)) {
    if (hostname === country.domain) return country.code
  }
  const devMatch = hostname.match(/^([a-z]{2})\.localhost$/)
  if (devMatch && isCountryCode(devMatch[1])) return devMatch[1]
  return null
}

export function isProductionDomain(host: string | null | undefined): boolean {
  const hostname = stripPort(host).replace(/^www\./, '')
  return Object.values(COUNTRIES).some(c => c.domain === hostname)
}

/** Canonical public origin of a country site. */
export function countryOrigin(code: CountryCode): string {
  return `https://${COUNTRIES[code].domain}`
}

/**
 * URL to another country's site as seen from the current host: real domains in production,
 * `<code>.localhost` in local dev, and a `?country=` override on previews / plain localhost.
 */
export function crossCountryUrl(code: CountryCode, current: { protocol: string; host: string }, path = '/'): string {
  const [hostname, port] = current.host.split(':')
  const separator = path.includes('?') ? '&' : '?'
  if (isProductionDomain(hostname)) return `${countryOrigin(code)}${path}`
  if (countryFromHost(hostname)) return `${current.protocol}//${code}.localhost${port ? `:${port}` : ''}${path}`
  return `${current.protocol}//${current.host}${path}${separator}country=${code}`
}

export function htmlLang(locale: AppLocale, country: CountryCode): string {
  return `${locale}-${COUNTRIES[country].region}`
}
