import 'server-only'
import type { AppLocale, CountryCode } from '@/config/countries'
import { t } from '@/lib/i18n-fields'
import { toImageVM } from '@/lib/media'
import { getCountryPage } from '@/lib/queries/site'
import type { ImageVM } from '@/lib/types/site'
import type { CountryPageKey } from './static-pages'

export type PageHeroFallback = {
  label: string
  title: string
  intro?: string
  extra?: string
}

export type ResolvedPageHero = {
  label: string
  title: string
  intro?: string
  extra?: string
  image: ImageVM | null
}

/** Saved hero for a static page, with empty fields falling back to the built-in copy. */
export async function resolvePageHero(
  country: CountryCode,
  page: CountryPageKey,
  locale: AppLocale,
  fallback: PageHeroFallback,
  fallbackImage?: ImageVM | null,
): Promise<ResolvedPageHero> {
  const row = await getCountryPage(country, page)
  const intro = t(row, 'hero_intro', locale) || fallback.intro || ''
  const extra = t(row, 'hero_extra', locale) || fallback.extra || ''
  return {
    label: t(row, 'hero_eyebrow', locale) || fallback.label,
    title: t(row, 'hero_title', locale) || fallback.title,
    intro: intro || undefined,
    extra: extra || undefined,
    image: row?.hero_image ? toImageVM(row.hero_image, locale, 'lg') : (fallbackImage ?? null),
  }
}
