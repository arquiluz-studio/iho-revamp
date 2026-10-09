import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { EventView } from '@/components/site/event/EventView'
import { Footer } from '@/components/site/Footer'
import { Header } from '@/components/site/Header'
import { SiteTools } from '@/components/site/SiteTools'
import { getPathname } from '@/i18n/navigation'
import { getStaticEvent, getStaticEventSlugs } from '@/lib/content/static'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, siteStaticParams, type SiteParams } from '@/lib/site-params'

type Params = SiteParams & { slug: string }

export function generateStaticParams() {
  return siteStaticParams().flatMap(p => getStaticEventSlugs().map(slug => ({ ...p, slug })))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const { slug } = await params
  const event = getStaticEvent(slug, { event: s => s, products: '#productos' })
  if (!event) return {}
  return {
    title: `${event.title.replace(/[\n*]/g, ' ').replace(/\s+/g, ' ').trim()} — IHO`,
    alternates: buildAlternates({ href: { pathname: '/events/[slug]', params: { slug } }, country, locale }),
  }
}

export default async function EventPage({ params }: { params: Promise<Params> }) {
  const { country, locale } = await resolveSiteParams(params)
  const { slug } = await params
  const eventHref = (s: string) => getPathname({ href: { pathname: '/events/[slug]', params: { slug: s } }, locale })
  const event = getStaticEvent(slug, { event: eventHref, products: '#productos' })
  if (!event) notFound()
  const t = await getTranslations('nav')
  const home = getPathname({ href: '/', locale })
  const homeSection = (id: string) => `${home === '/' ? '' : home}/#${id}`
  const showRegistration = !event.isPast && event.registration.enabled
  return (
    <EventView
      event={event}
      contactHref={homeSection('contacto')}
      chrome={{
        header: (
          <Header
            logoHref={home}
            threshold={0.6}
            links={[
              { href: homeSection('eventos'), label: t('events') },
              { href: '#productos', label: t('products') },
              { href: '#galeria', label: t('gallery') },
            ]}
            cta={showRegistration ? { href: '#registro', label: t('requestPass') } : { href: homeSection('contacto'), label: t('contact') }}
            tools={<SiteTools country={country} />}
          />
        ),
        footer: <Footer homeHref={home} contactHref={homeSection('contacto')} tools={<SiteTools country={country} placement="footer" />} />,
      }}
    />
  )
}
