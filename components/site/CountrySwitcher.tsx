'use client'
import { useLocale, useTranslations } from 'next-intl'
import { COUNTRIES, COUNTRY_PREF_COOKIE, crossCountryUrl, type AppLocale, type CountryCode } from '@/config/countries'

const ONE_YEAR = 60 * 60 * 24 * 365

export function CountrySwitcher({ current, countries, placement = 'header' }: {
  current: CountryCode
  countries: CountryCode[]
  placement?: 'header' | 'footer'
}) {
  const t = useTranslations('switchers')
  const locale = useLocale() as AppLocale

  const go = (code: CountryCode) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    document.cookie = `${COUNTRY_PREF_COOKIE}=${code}; path=/; max-age=${ONE_YEAR}; samesite=lax`
    window.location.href = crossCountryUrl(code, window.location, '/?ref=selector')
  }

  return (
    <details className={`iho-switcher iho-switcher--${placement}`}>
      <summary aria-label={t('country')}>{current.toUpperCase()}</summary>
      <ul role="list">
        {countries.map(code => (
          <li key={code}>
            <a
              href={`https://${COUNTRIES[code].domain}/?ref=selector`}
              onClick={go(code)}
              aria-current={code === current ? 'true' : undefined}
            >
              {COUNTRIES[code].name[locale]}
            </a>
          </li>
        ))}
      </ul>
    </details>
  )
}
