'use client'
import { useSyncExternalStore } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { LOCALES, type AppLocale } from '@/config/countries'
import { switchLocalePath } from '@/i18n/locale-path'
import { getPathname } from '@/i18n/navigation'

const noopSubscribe = () => () => {}

/** `hrefs` overrides the target per locale on pages whose slug is localized. */
export function LocaleSwitcher({ hrefs }: { hrefs?: Partial<Record<AppLocale, string>> }) {
  const t = useTranslations('switchers')
  const locale = useLocale()
  // Read from the browser: on the server the pathname is the internal rewritten route, not the visible URL.
  const location = useSyncExternalStore(noopSubscribe, () => window.location.pathname + window.location.search, () => null)

  const hrefFor = (l: AppLocale) => {
    if (hrefs?.[l]) return hrefs[l]
    if (location === null) return getPathname({ href: '/', locale: l })
    const [path, search = ''] = location.split('?')
    return switchLocalePath(path, l) + (search ? `?${search}` : '')
  }

  return (
    <span className="iho-locale-switcher" aria-label={t('language')}>
      {LOCALES.map((l, i) => (
        <span key={l}>
          {i > 0 && <span aria-hidden="true"> / </span>}
          {l === locale ? (
            <span aria-current="true">{l.toUpperCase()}</span>
          ) : (
            <a href={hrefFor(l)} hrefLang={l}>
              {l.toUpperCase()}
            </a>
          )}
        </span>
      ))}
    </span>
  )
}
