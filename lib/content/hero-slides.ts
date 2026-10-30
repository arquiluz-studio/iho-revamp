import 'server-only'
import type { AppLocale, CountryCode } from '@/config/countries'
import { cacheTags } from '@/lib/cache-tags'
import { t } from '@/lib/i18n-fields'
import { MEDIA_SELECT, toImageVM, videoUrl, type MediaRef } from '@/lib/media'
import { cachedQuery, must } from '@/lib/queries/core'
import type { HeroCtaVM, HeroSlideVM } from '@/lib/types/site'
import { resolveHeroCtas } from './hero-ctas'

type HeroSource = {
  hero_slides?: unknown
  hero_ctas?: unknown
  hero_video?: MediaRef | null
  hero_image?: MediaRef | null
} | null | undefined

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function loadMedia(ids: string[], country: CountryCode) {
  return cachedQuery(
    ['hero-slide-media', country, ...[...ids].sort()],
    [cacheTags.site, cacheTags.country(country, 'settings'), ...ids.map(id => cacheTags.media(id))],
    async ({ db }) => must(await db.from('media_assets').select(MEDIA_SELECT).in('id', ids), 'hero slide media'),
  )
}

function legacySlides(row: HeroSource, locale: AppLocale): HeroSlideVM[] {
  if (!row) return []
  const source = row as Record<string, unknown>
  const eyebrow = t(source, 'hero_eyebrow', locale)
  const title = t(source, 'hero_title', locale)
  const subtitle = t(source, 'hero_subtitle', locale)
  const actions = resolveHeroCtas(row.hero_ctas, locale)
  const video = videoUrl(row.hero_video)
  const image = row.hero_image ? toImageVM(row.hero_image, locale, 'lg') : null
  if (!video && !image?.src && !eyebrow && !title && !subtitle && actions.length === 0) return []
  return [
    video
      ? { kind: 'video', src: video, poster: image?.src || null, eyebrow, title, subtitle, actions, durationSeconds: null }
      : { kind: 'image', src: image?.src ?? '', poster: null, eyebrow, title, subtitle, actions, durationSeconds: 6 },
  ]
}

function slideOf(item: Record<string, unknown>, asset: MediaRef, locale: AppLocale): HeroSlideVM | null {
  const kind = item.kind === 'video' ? 'video' : 'image'
  const video = videoUrl(asset)
  const image = toImageVM(asset, locale, 'lg')
  const copy = {
    eyebrow: t(item, 'eyebrow', locale),
    title: t(item, 'title', locale),
    subtitle: t(item, 'subtitle', locale),
    actions: resolveHeroCtas(item.ctas, locale) satisfies HeroCtaVM[],
  }
  if (kind === 'video') {
    if (!video) return null
    return { kind: 'video', src: video, poster: image.src || null, ...copy, durationSeconds: null }
  }
  if (!image.src) return null
  const seconds = typeof item.duration_seconds === 'number' ? item.duration_seconds : 6
  return { kind: 'image', src: image.src, poster: null, ...copy, durationSeconds: seconds >= 3 && seconds <= 30 ? seconds : 6 }
}

/** Slides of the home the country publishes. An empty list falls back to the previous single hero. */
export async function resolveHomeSlides(row: HeroSource, locale: AppLocale, country: CountryCode): Promise<HeroSlideVM[]> {
  const parsed = Array.isArray(row?.hero_slides) ? row.hero_slides.filter(isRecord) : []
  if (!parsed.length) return legacySlides(row, locale)

  const ids = [...new Set(parsed.flatMap(item => (typeof item.media_id === 'string' ? [item.media_id] : [])))]
  const media = ids.length ? await loadMedia(ids, country) : []
  const byId = new Map(media.map(item => [item.id, item]))
  const slides = parsed.flatMap(item => {
    const asset = typeof item.media_id === 'string' ? byId.get(item.media_id) : undefined
    if (!asset) return []
    const slide = slideOf(item, asset, locale)
    return slide ? [slide] : []
  })
  return slides.length ? slides : legacySlides(row, locale)
}
