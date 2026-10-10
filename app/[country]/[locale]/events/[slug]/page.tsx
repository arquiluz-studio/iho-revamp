import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { EventView } from '@/components/site/event/EventView'
import { siteChrome } from '@/components/site/SiteChrome'
import { registerForEvent } from '@/lib/actions/events'
import { sitePaths } from '@/lib/content/paths'
import { getEventDetailVM } from '@/lib/content/site'
import { plainTitle } from '@/lib/events/ics'
import { t } from '@/lib/i18n-fields'
import { getEventBySlug, getEvents } from '@/lib/queries/events'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, siteStaticParams, type SiteParams } from '@/lib/site-params'

type Params = SiteParams & { slug: string }

export const revalidate = 3600

export async function generateStaticParams() {
  const params = siteStaticParams()
  const slugs = new Map(await Promise.all([...new Set(params.map(p => p.country))].map(async c => [c, (await getEvents(c)).map(e => e.slug)] as const)))
  return params.flatMap(p => (slugs.get(p.country) ?? []).map(slug => ({ ...p, slug })))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const { slug } = await params
  const event = await getEventBySlug(country, slug)
  if (!event) return {}
  return {
    title: `${plainTitle(t(event, 'title', locale))} — IHO`,
    description: t(event, 'summary', locale) || undefined,
    alternates: buildAlternates({ href: { pathname: '/events/[slug]', params: { slug } }, country, locale, availableIn: [country] }),
  }
}

export default async function EventPage({ params }: { params: Promise<Params> }) {
  const { country, locale } = await resolveSiteParams(params)
  const { slug } = await params
  const paths = sitePaths(locale)
  const event = await getEventDetailVM(country, locale, slug, paths)
  if (!event) notFound()
  const tn = await getTranslations('nav')
  const showRegistration = !event.isPast && event.registration.enabled
  const chrome = await siteChrome({
    country,
    locale,
    paths,
    threshold: 0.6,
    links: [
      { href: paths.homeSection('eventos'), label: tn('events') },
      ...(event.products.length ? [{ href: '#productos', label: tn('products') }] : []),
      ...(event.gallery.length ? [{ href: '#galeria', label: tn('gallery') }] : []),
    ],
    cta: showRegistration ? { href: '#registro', label: tn('requestPass') } : { href: paths.homeSection('contacto'), label: tn('contact') },
  })
  return <EventView event={event} contactHref={paths.homeSection('contacto')} privacyHref={paths.privacy} chrome={chrome} register={registerForEvent} />
}
