'use client'
import { useParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { LOCALES } from '@/config/countries'
import { getPathname, usePathname } from '@/i18n/navigation'

export function LocaleSwitcher() {
  const t = useTranslations('switchers')
  const locale = useLocale()
  const pathname = usePathname()
  const params = useParams()

  return (
    <span className="iho-locale-switcher" aria-label={t('language')}>
      {LOCALES.map((l, i) => (
        <span key={l}>
          {i > 0 && <span aria-hidden="true"> / </span>}
          {l === locale ? (
            <span aria-current="true">{l.toUpperCase()}</span>
          ) : (
            <a
              // Slugs are shared between locales, so the current route params are reused as-is.
              // @ts-expect-error -- pathname and params come from the current route and always match.
              href={getPathname({ href: { pathname, params }, locale: l })}
              hrefLang={l}
            >
              {l.toUpperCase()}
            </a>
          )}
        </span>
      ))}
    </span>
  )
}
