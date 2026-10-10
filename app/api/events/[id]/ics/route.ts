import { z } from 'zod'
import { isCountryCode, isLocale } from '@/config/countries'
import { buildIcs } from '@/lib/events/ics'
import { localSlug, t } from '@/lib/i18n-fields'
import { buildAlternates } from '@/lib/seo'
import { createSupabasePublicClient } from '@/lib/supabase/server'

/** "Add to calendar" file for a published event. `?lang=en` returns the English title and description. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!z.uuid().safeParse(id).success) return new Response('Not found', { status: 404 })
  const lang = new URL(request.url).searchParams.get('lang')
  const locale = lang && isLocale(lang) ? lang : 'es'

  const { data: event } = await createSupabasePublicClient()
    .from('events')
    .select('id, slug, slug_en, country_code, title_es, title_en, summary_es, summary_en, starts_at, ends_at, is_online, online_url, venue_name, address, city')
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle()
  if (!event || !isCountryCode(event.country_code)) return new Response('Not found', { status: 404 })

  const url = String(
    buildAlternates({ href: { pathname: '/events/[slug]', params: { slug: localSlug(event, locale) } }, country: event.country_code, locale, availableIn: [event.country_code] })
      .canonical,
  )
  const location = event.is_online ? event.online_url : [event.venue_name, event.address, event.city].filter(Boolean).join(', ')
  const ics = buildIcs({
    id: event.id,
    title: t(event, 'title', locale),
    description: [t(event, 'summary', locale), url].filter(Boolean).join('\n\n'),
    location,
    url,
    startsAt: event.starts_at,
    endsAt: event.ends_at,
  })
  return new Response(ics, {
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': `attachment; filename="${event.slug}.ics"`,
      'cache-control': 'public, max-age=300, s-maxage=3600',
    },
  })
}
