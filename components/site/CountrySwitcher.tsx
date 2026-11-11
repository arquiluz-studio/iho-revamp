'use client'
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { useLocale, useTranslations } from 'next-intl'
import { COUNTRIES, COUNTRY_PREF_COOKIE, LOCALES, crossCountryUrl, sortByCountry, type AppLocale, type CountryCode } from '@/config/countries'
import { switchLocalePath } from '@/i18n/locale-path'
import { getPathname } from '@/i18n/navigation'
import { CountryFlag } from './CountryFlag'
import { SubnavBar, useSubnav } from './SubnavBar'

const noopSubscribe = () => () => {}
const ONE_YEAR = 60 * 60 * 24 * 365

export function CountrySwitcher({ current, countries, localeHrefs }: {
  current: CountryCode
  countries: CountryCode[]
  /** Overrides the target per locale on pages whose slug is localized. */
  localeHrefs?: Partial<Record<AppLocale, string>>
}) {
  const t = useTranslations('switchers')
  const locale = useLocale() as AppLocale
  const { open, toggle, setPinned } = useSubnav()
  const isOpen = open === 'country'
  const rootRef = useRef<HTMLDivElement>(null)
  const [headerEl, setHeaderEl] = useState<HTMLElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [shown, setShown] = useState(false)
  // Read from the browser: on the server the pathname is the internal rewritten route, not the visible URL.
  const location = useSyncExternalStore(noopSubscribe, () => window.location.pathname + window.location.search, () => null)

  useLayoutEffect(() => {
    setHeaderEl(rootRef.current?.closest('header') ?? null)
  }, [])

  useEffect(() => {
    if (isOpen) setMounted(true)
  }, [isOpen])

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 1024px)').matches
    setPinned(mounted && mobile)
    return () => setPinned(false)
  }, [mounted, setPinned])

  useEffect(() => {
    if (!mounted) return
    let cancelled = false
    if (isOpen) {
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!cancelled) setShown(true)
        })
      })
      return () => {
        cancelled = true
        cancelAnimationFrame(frame)
      }
    }
    const mobile = window.matchMedia('(max-width: 1024px)').matches
    if (!mobile) {
      setShown(false)
      setMounted(false)
      return
    }
    setShown(false)
    const panel = document.getElementById('iho-subnav-country')
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      setMounted(false)
    }
    const onEnd = (event: TransitionEvent) => {
      if (event.target !== panel || event.propertyName !== 'transform') return
      finish()
    }
    panel?.addEventListener('transitionend', onEnd)
    const timeout = window.setTimeout(finish, 700)
    return () => {
      cancelled = true
      panel?.removeEventListener('transitionend', onEnd)
      window.clearTimeout(timeout)
    }
  }, [isOpen, mounted])

  const go = (code: CountryCode) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    document.cookie = `${COUNTRY_PREF_COOKIE}=${code}; path=/; max-age=${ONE_YEAR}; samesite=lax`
    window.location.href = crossCountryUrl(code, window.location, '/?ref=selector')
  }

  const hrefFor = (l: AppLocale) => {
    if (localeHrefs?.[l]) return localeHrefs[l]
    if (location === null) return getPathname({ href: '/', locale: l })
    const [path, search = ''] = location.split('?')
    return switchLocalePath(path, l) + (search ? `?${search}` : '')
  }

  const sorted = sortByCountry(countries, code => code)

  const panel = mounted ? (
    <SubnavBar
      id="iho-subnav-country"
      className={`iho-subnav-switcher${shown ? ' iho-nav-open' : ''}`}
      label={t('selectCountry')}
      items={sorted.map(code => ({
        href: `https://${COUNTRIES[code].domain}/?ref=selector`,
        label: COUNTRIES[code].name[locale],
        current: code === current,
        onClick: go(code),
      }))}
      aside={{
        label: t('language'),
        items: LOCALES.map(l => ({
          href: hrefFor(l),
          label: l.toUpperCase(),
          current: l === locale,
          hrefLang: l,
        })),
      }}
    />
  ) : null

  return (
    <div ref={rootRef} className={`iho-switcher${isOpen ? ' is-open' : ''}`}>
      <button
        type="button"
        className="iho-switcher-toggle"
        aria-label={`${t('country')} ${current.toUpperCase()}, ${t('language')} ${locale.toUpperCase()}`}
        aria-expanded={isOpen}
        aria-controls="iho-subnav-country"
        onClick={() => toggle('country')}
      >
        <span className="iho-switcher-code">
          {current.toUpperCase()}
          <CountryFlag code={current} />
        </span>
        <span className="iho-switcher-locale">{locale.toUpperCase()}</span>
      </button>
      {panel && headerEl ? createPortal(panel, headerEl) : panel}
    </div>
  )
}
