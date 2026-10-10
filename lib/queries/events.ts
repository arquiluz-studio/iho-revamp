import 'server-only'
import { cacheTags } from '@/lib/cache-tags'
import { cachedQuery, maybe, media, must, visibleStatuses } from './core'

const EVENT_LIST_SELECT = `id, slug, type, title_es, title_en, summary_es, summary_en, starts_at, ends_at, timezone, city, venue_name, is_online, status, cover:${media('events_cover_media_id_fkey')}` as const

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

export function getEventBySlug(country: string, slug: string) {
  return cachedQuery(['event-detail', country, slug], [cacheTags.country(country, 'events')], async ({ db, draft }) => {
    const event = maybe(
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
        .eq('slug', slug)
        .in('status', visibleStatuses(draft))
        .maybeSingle(),
      'event',
    )
    if (!event) return null
    return {
      ...event,
      agenda: [...event.agenda].sort((a, b) => a.sort - b.sort),
      gallery: [...event.gallery].sort((a, b) => a.sort - b.sort),
      products: [...event.products].sort((a, b) => a.sort - b.sort),
    }
  })
}

export type EventDetailRow = NonNullable<Awaited<ReturnType<typeof getEventBySlug>>>
export type EventListRow = Awaited<ReturnType<typeof getEvents>>[number]
