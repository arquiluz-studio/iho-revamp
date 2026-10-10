import 'server-only'
import type { AppLocale } from '@/config/countries'
import { cacheTags } from '@/lib/cache-tags'
import { pickBySlug, SLUG_PATTERN } from '@/lib/i18n-fields'
import { cachedQuery, media, must, visibleStatuses } from './core'

const EVENT_LIST_SELECT = `id, slug, slug_en, type, title_es, title_en, summary_es, summary_en, starts_at, ends_at, timezone, city, venue_name, is_online, status, cover:${media('events_cover_media_id_fkey')}` as const

/** Every visible event of the country, oldest first (the home timeline shows past and upcoming events). */
export function getEvents(country: string) {
  return cachedQuery(['events', country], [cacheTags.country(country, 'events')], async ({ db, draft }) =>
    must(
      await db
        .from('events')
        .select(EVENT_LIST_SELECT)
        .eq('country_code', country)
        .in('status', visibleStatuses(draft))
        .order('starts_at'),
      'events',
    ),
  )
}

export async function getUpcomingEvents(country: string, now: Date = new Date()) {
  const events = await getEvents(country)
  return events.filter(e => new Date(e.ends_at ?? e.starts_at) >= now)
}

function eventsBySlug(country: string, slug: string) {
  return cachedQuery(['events-by-slug', country, slug], [cacheTags.country(country, 'events')], async ({ db, draft }) => {
    const rows = must(
      await db
        .from('events')
        .select(
          `*, cover:${media('events_cover_media_id_fkey')},
          agenda:event_agenda_items(sort, time_label, text_es, text_en),
          gallery:event_media(sort, media:${media('event_media_media_id_fkey')}),
          brands:event_brands(brand:brands(id, slug, name, logo_is_thin, is_active, logo:${media('brands_logo_media_id_fkey')})),
          products:event_products(sort, product_id)` as const,
        )
        .eq('country_code', country)
        .or(`slug.eq.${slug},slug_en.eq.${slug}`)
        .in('status', visibleStatuses(draft))
        .limit(2),
      'event',
    )
    const bySort = (a: { sort: number }, b: { sort: number }) => a.sort - b.sort
    return rows.map(event => ({
      ...event,
      agenda: [...event.agenda].sort(bySort),
      gallery: [...event.gallery].sort(bySort),
      products: [...event.products].sort(bySort),
    }))
  })
}

/** Event addressed by its Spanish or English slug (see `pickBySlug`). */
export async function getEventBySlug(country: string, slug: string, locale: AppLocale) {
  if (!SLUG_PATTERN.test(slug)) return null
  return pickBySlug(await eventsBySlug(country, slug), slug, locale)
}

export type EventDetailRow = NonNullable<Awaited<ReturnType<typeof getEventBySlug>>>
export type EventListRow = Awaited<ReturnType<typeof getEvents>>[number]
