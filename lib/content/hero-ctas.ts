import type { AppLocale } from '@/config/countries'
import { getPathname } from '@/i18n/navigation'
import type { HeroCtaVM } from '@/lib/types/site'
import { isSitePageKey, sitePage } from './static-pages'

const STYLES = new Set<HeroCtaVM['style']>(['red', 'outline', 'black'])
const HREF = /^(https?:\/\/\S+|#\S+)$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function labelOf(row: Record<string, unknown>, locale: AppLocale) {
  const en = typeof row.label_en === 'string' ? row.label_en.trim() : ''
  const es = typeof row.label_es === 'string' ? row.label_es.trim() : ''
  return locale === 'en' && en ? en : es
}

function hrefOf(row: Record<string, unknown>, locale: AppLocale) {
  if (row.kind === 'page' && typeof row.page === 'string' && isSitePageKey(row.page)) {
    const page = sitePage(row.page)
    return page ? getPathname({ href: page.href, locale }) : null
  }
  if (row.kind === 'url' && typeof row.url === 'string' && HREF.test(row.url.trim())) return row.url.trim()
  return null
}

/** Buttons of the chosen content source. An empty list stays empty. */
export function resolveHeroCtas(raw: unknown, locale: AppLocale): HeroCtaVM[] {
  if (!Array.isArray(raw)) return []
  const actions: HeroCtaVM[] = []
  for (const item of raw) {
    if (!isRecord(item) || typeof item.style !== 'string' || !STYLES.has(item.style as HeroCtaVM['style'])) continue
    const label = labelOf(item, locale)
    const href = hrefOf(item, locale)
    if (!label || !href) continue
    actions.push({ label, href, style: item.style as HeroCtaVM['style'], newWindow: item.open_in === 'blank' })
    if (actions.length === 2) break
  }
  return actions
}
