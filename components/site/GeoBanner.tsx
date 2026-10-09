'use client'
import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import {
  COUNTRIES,
  COUNTRY_PREF_COOKIE,
  GEO_COOKIE,
  crossCountryUrl,
  isCountryCode,
  type AppLocale,
  type CountryCode,
} from '@/config/countries'

const DISMISS_KEY = 'iho_geo_banner_dismissed'

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

/** Suggests the visitor's own country site. The detected country comes from the `iho_geo` cookie set by the proxy, so pages stay static. */
export function GeoBanner({ current, countries }: { current: CountryCode; countries: CountryCode[] }) {
  const t = useTranslations('switchers')
  const locale = useLocale() as AppLocale
  const [target, setTarget] = useState<CountryCode | null>(null)

  useEffect(() => {
    const geo = readCookie(GEO_COOKIE)
    const pref = readCookie(COUNTRY_PREF_COOKIE)
    const dismissed = sessionStorage.getItem(DISMISS_KEY) === '1'
    if (dismissed || pref === current || !isCountryCode(geo) || geo === current || !countries.includes(geo)) return
    setTarget(geo)
  }, [current, countries])

  if (!target) return null
  const name = COUNTRIES[target].name[locale]

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setTarget(null)
  }

  return (
    <div className="iho-geo-banner" role="region" aria-label={t('country')}>
      <span>{t('geoBanner', { country: name })}</span>
      <a href={crossCountryUrl(target, window.location, '/?ref=selector')}>{t('geoBannerCta', { country: name })}</a>
      <button type="button" onClick={dismiss} aria-label={t('dismiss')}>×</button>
    </div>
  )
}
