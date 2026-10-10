'use client'
import { useLocale, useTranslations } from 'next-intl'
import { COUNTRIES, COUNTRY_PREF_COOKIE, crossCountryUrl, sortByCountry, type AppLocale, type CountryCode } from '@/config/countries'
import { SubnavBar, useSubnav } from './SubnavBar'

const ONE_YEAR = 60 * 60 * 24 * 365

export function CountrySwitcher({ current, countries }: {
  current: CountryCode
  countries: CountryCode[]
}) {
  const t = useTranslations('switchers')
  const locale = useLocale() as AppLocale
  const { open, toggle } = useSubnav()
  const isOpen = open === 'country'

  const go = (code: CountryCode) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    document.cookie = `${COUNTRY_PREF_COOKIE}=${code}; path=/; max-age=${ONE_YEAR}; samesite=lax`
    window.location.href = crossCountryUrl(code, window.location, '/?ref=selector')
  }

  const sorted = sortByCountry(countries, locale, code => code)

  return (
    <div className={`iho-switcher${isOpen ? ' is-open' : ''}`}>
      <button
        type="button"
        className="iho-switcher-toggle"
        aria-label={t('country')}
        aria-expanded={isOpen}
        aria-controls="iho-subnav-country"
        onClick={() => toggle('country')}
      >
        {current.toUpperCase()}
      </button>
      {isOpen && (
        <SubnavBar
          id="iho-subnav-country"
          label={t('selectCountry')}
          items={sorted.map(code => ({
            href: `https://${COUNTRIES[code].domain}/?ref=selector`,
            label: COUNTRIES[code].name[locale],
            current: code === current,
            onClick: go(code),
          }))}
        />
      )}
    </div>
  )
}
