'use client'
import { useEffect, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { COUNTRIES, COUNTRY_PREF_COOKIE, HEADQUARTERS, crossCountryUrl, type AppLocale, type CountryCode } from '@/config/countries'

const ONE_YEAR = 60 * 60 * 24 * 365

/** Opens a full-width bar under the header (positioned against the fixed `<header>`). */
export function CountrySwitcher({ current, countries }: {
  current: CountryCode
  countries: CountryCode[]
}) {
  const t = useTranslations('switchers')
  const locale = useLocale() as AppLocale
  const [open, setOpen] = useState(false)
  const [start, setStart] = useState<number | null>(null)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const align = () => {
      const firstLink = root.current?.closest('header')?.querySelector('nav a')
      setStart(firstLink ? firstLink.getBoundingClientRect().left : null)
    }
    align()
    window.addEventListener('resize', align)
    return () => window.removeEventListener('resize', align)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const go = (code: CountryCode) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    document.cookie = `${COUNTRY_PREF_COOKIE}=${code}; path=/; max-age=${ONE_YEAR}; samesite=lax`
    window.location.href = crossCountryUrl(code, window.location, '/?ref=selector')
  }

  const sorted = [...countries].sort((a, b) =>
    a === HEADQUARTERS ? -1 : b === HEADQUARTERS ? 1 : COUNTRIES[a].name[locale].localeCompare(COUNTRIES[b].name[locale], locale),
  )

  return (
    <div ref={root} className={`iho-switcher${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="iho-switcher-toggle"
        aria-label={t('country')}
        aria-expanded={open}
        aria-controls="iho-country-bar"
        onClick={() => setOpen(o => !o)}
      >
        {current.toUpperCase()}
      </button>
      {open && (
        <div id="iho-country-bar" className="iho-country-bar">
          <div className="iho-country-bar-inner" style={start === null ? undefined : { '--iho-bar-start': `${start}px` } as React.CSSProperties}>
            <span className="iho-country-bar-label">{t('selectCountry')}</span>
            <ul role="list" aria-label={t('selectCountry')}>
              {sorted.map(code => (
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
            </ul>          </div>
        </div>
      )}
    </div>
  )
}
