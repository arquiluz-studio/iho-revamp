import 'server-only'
import type { AppLocale, CountryCode } from '@/config/countries'
import { t } from '@/lib/i18n-fields'
import { toImageVM } from '@/lib/media'
import { getCountryPage, getCountrySettings, getPageChoice, getSitePage } from '@/lib/queries/site'
import type { ImageVM } from '@/lib/types/site'
import type { ContentPageKey, CountryPageKey } from './static-pages'

export type ResolvedPageHero = {
  label: string
  title: string
  intro?: string
  extra?: string
  image: ImageVM | null
}

/** No choice row means the country publishes the global page. */
export async function usesGlobalPage(country: CountryCode, page: ContentPageKey) {
  const choice = await getPageChoice(country, page)
  return choice?.uses_global !== false
}

/** Home hero, contact image and SEO from the source this country chose. */
export async function resolveHomeRecord(country: CountryCode) {
  if (await usesGlobalPage(country, 'home')) return getSitePage('home')
  return getCountrySettings(country)
}

/**
 * Hero of a static page from the source this country chose.
 * Empty fields stay empty. Listing pages may still pass an image of their first item.
 */
export async function resolvePageHero(
  country: CountryCode,
  page: CountryPageKey,
  locale: AppLocale,
  fallbackImage?: ImageVM | null,
): Promise<ResolvedPageHero> {
  const row = (await usesGlobalPage(country, page)) ? await getSitePage(page) : await getCountryPage(country, page)
  const intro = t(row, 'hero_intro', locale)
  const extra = t(row, 'hero_extra', locale)
  return {
    label: t(row, 'hero_eyebrow', locale),
    title: t(row, 'hero_title', locale),
    intro: intro || undefined,
    extra: extra || undefined,
    image: row?.hero_image ? toImageVM(row.hero_image, locale, 'lg') : (fallbackImage ?? null),
  }
}

/** Browser title for a CMS hero. No title means the layout default. */
export function heroDocumentTitle(title: string) {
  const flat = title.replace(/\n/g, ' ').trim()
  return flat ? `${flat} — IHO` : undefined
}
