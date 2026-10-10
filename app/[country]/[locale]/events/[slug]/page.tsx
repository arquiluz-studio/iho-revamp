import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { EventView } from '@/components/site/event/EventView'
import { siteChrome } from '@/components/site/SiteChrome'
import { registerForEvent } from '@/lib/actions/events'
import { localeHrefs, sitePaths } from '@/lib/content/paths'
import { getEventDetailVM } from '@/lib/content/site'
import { plainTitle } from '@/lib/events/ics'
import { localSlug, t } from '@/lib/i18n-fields'
import { getEventBySlug, getEvents } from '@/lib/queries/events'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, siteStaticParams, type SiteParams } from '@/lib/site-params'

type Params = SiteParams & { slug: string }

export const revalidate = 3600

export async function generateStaticParams() {
  const params = siteStaticParams()
  const events = new Map(await Promise.all([...new Set(params.map(p => p.country))].map(async c => [c, await getEvents(c)] as const)))
  return params.flatMap(p => (events.get(p.country) ?? []).map(e => ({ ...p, slug: localSlug(e, p.locale) })))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const { slug } = await params
  const event = await getEventBySlug(country, slug, locale)
  if (!event) return {}
  return {
    title: `${plainTitle(t(event, 'title', locale))} — IHO`,
    description: t(event, 'summary', locale) || undefined,
    alternates: buildAlternates({ href: l => ({ pathname: '/events/[slug]', params: { slug: localSlug(event, l) } }), country, locale, availableIn: [country] }),
  }
}

export default async function EventPage({ params }: { params: Promise<Params> }) {
  const { country, locale } = await resolveSiteParams(params)
  const { slug } = await params
  const paths = sitePaths(locale)
  const row = await getEventBySlug(country, slug, locale)
  if (!row) notFound()
  if (localSlug(row, locale) !== slug) permanentRedirect(paths.event(localSlug(row, locale)))
  const event = await getEventDetailVM(country, locale, slug, paths)
  if (!event) notFound()
  const chrome = await siteChrome({
    country,
    locale,
    paths,
    threshold: 0.6,
    localeHrefs: localeHrefs(l => ({ pathname: '/events/[slug]', params: { slug: localSlug(row, l) } })),
  })
  return <EventView event={event} contactHref={paths.homeSection('contacto')} privacyHref={paths.privacy} chrome={chrome} register={registerForEvent} />
}
