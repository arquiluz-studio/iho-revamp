import { LOCALES, type AppLocale } from '@/config/countries'
import { getPathname } from './navigation'
import { routing, type AppPathname } from './routing'

type Pattern = { pathname: AppPathname; regex: RegExp; params: string[] }

const patternsFor = (locale: AppLocale): Pattern[] =>
  (Object.entries(routing.pathnames) as [AppPathname, string | Record<AppLocale, string>][]).map(([pathname, localized]) => {
    const pattern = typeof localized === 'string' ? localized : localized[locale]
    const params = [...pattern.matchAll(/\[(\w+)\]/g)].map(m => m[1])
    const source = pattern.replace(/[.*+?^${}()|\\]/g, '\\$&').replace(/\\?\[\w+\\?\]/g, '([^/]+)')
    return { pathname, regex: new RegExp(`^${source}/?$`), params }
  })

/**
 * Translates a visible (browser) pathname into the same page in another locale, e.g. `/grupo-iho` → `/en/iho-group`.
 * Dynamic segments are kept as-is; pages whose slug differs per locale pass explicit hrefs instead.
 * Falls back to the target locale's home when the path is not a known route.
 */
export function switchLocalePath(visiblePath: string, to: AppLocale): string {
  const prefixed = LOCALES.find(l => l !== routing.defaultLocale && (visiblePath === `/${l}` || visiblePath.startsWith(`/${l}/`)))
  const from = prefixed ?? routing.defaultLocale
  const path = prefixed ? visiblePath.slice(prefixed.length + 1) || '/' : visiblePath

  for (const { pathname, regex, params } of patternsFor(from)) {
    const match = path.match(regex)
    if (!match) continue
    const values = Object.fromEntries(params.map((name, i) => [name, decodeURIComponent(match[i + 1])]))
    // @ts-expect-error -- params are taken from the matched pattern, so they fit `pathname`.
    return getPathname({ href: params.length ? { pathname, params: values } : pathname, locale: to })
  }
  return getPathname({ href: '/', locale: to })
}
