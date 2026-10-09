import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { EventView } from '@/components/site/event/EventView'
import { Footer } from '@/components/site/Footer'
import { Header } from '@/components/site/Header'
import { getStaticEvent, getStaticEventSlugs } from '@/lib/content/static'

export function generateStaticParams() {
  return getStaticEventSlugs().map(slug => ({ slug }))
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = getStaticEvent(slug, { event: s => `/evento/${s}`, products: '#productos' })
  if (!event) notFound()
  const t = await getTranslations('nav')
  return (
    <EventView
      event={event}
      contactHref="/#contacto"
      chrome={{
        header: (
          <Header
            logoHref="/"
            threshold={0.6}
            links={[
              { href: '/#eventos', label: t('events') },
              { href: '#productos', label: t('products') },
              { href: '#galeria', label: t('gallery') },
            ]}
            cta={{ href: '#registro', label: t('requestPass') }}
          />
        ),
        footer: <Footer homeHref="/" contactHref="/#contacto" />,
      }}
    />
  )
}
