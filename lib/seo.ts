import type { Metadata } from 'next'
import {
  COUNTRY_CODES,
  DEFAULT_LOCALE,
  HEADQUARTERS,
  LOCALES,
  countryOrigin,
  htmlLang,
  type AppLocale,
  type CountryCode,
} from '@/config/countries'
import { getPathname } from '@/i18n/navigation'

type Href = Parameters<typeof getPathname>[0]['href']

export function localizedUrl(country: CountryCode, locale: AppLocale, href: Href): string {
  return `${countryOrigin(country)}${getPathname({ href, locale })}`
}

/**
 * hreflang alternates for every country × locale where the page exists, plus x-default (HQ, Spanish).
 * `canonical` always points to the current country's own domain.
 */
export function buildAlternates({ href, country, locale, availableIn = [...COUNTRY_CODES] }: {
  href: Href
  country: CountryCode
  locale: AppLocale
  availableIn?: readonly CountryCode[]
}): NonNullable<Metadata['alternates']> {
  const languages: Record<string, string> = {}
  for (const c of availableIn) {
    for (const l of LOCALES) languages[htmlLang(l, c)] = localizedUrl(c, l, href)
  }
  const defaultCountry = availableIn.includes(HEADQUARTERS) ? HEADQUARTERS : country
  languages['x-default'] = localizedUrl(defaultCountry, DEFAULT_LOCALE, href)
  return { canonical: localizedUrl(country, locale, href), languages }
}
