'use client'
import { useParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { LOCALES, type AppLocale } from '@/config/countries'
import { getPathname, usePathname } from '@/i18n/navigation'

/** `hrefs` overrides the target per locale on pages whose slug is localized. */
export function LocaleSwitcher({ hrefs }: { hrefs?: Partial<Record<AppLocale, string>> }) {
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
              href={
                hrefs?.[l] ??
                // @ts-expect-error -- pathname and params come from the current route and always match.
                getPathname({ href: { pathname, params }, locale: l })
              }
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
