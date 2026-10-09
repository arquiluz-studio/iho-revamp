import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { COUNTRY_CODES, LOCALES, isCountryCode, isLocale, type AppLocale, type CountryCode } from '@/config/countries'

export type SiteParams = { country: string; locale: string }

export function siteStaticParams(): SiteParams[] {
  return COUNTRY_CODES.flatMap(country => LOCALES.map(locale => ({ country, locale })))
}

/** Validates the `[country]/[locale]` segments and enables static rendering for the locale. */
export async function resolveSiteParams(params: Promise<SiteParams>): Promise<{ country: CountryCode; locale: AppLocale }> {
  const { country, locale } = await params
  if (!isCountryCode(country) || !isLocale(locale)) notFound()
  setRequestLocale(locale)
  return { country, locale }
}
