import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { EmptyNote, PageHero, PageShell, SectionHeading } from '@/components/site/pages/PageParts'
import { innerChrome } from '@/components/site/SiteChrome'
import { MediaImage } from '@/components/ui/MediaImage'
import { ACUMIN, MONO, SANS } from '@/components/ui/tokens'
import { sitePaths } from '@/lib/content/paths'
import { getEventsVM } from '@/lib/content/site'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, type SiteParams } from '@/lib/site-params'
import type { EventVM } from '@/lib/types/site'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<SiteParams> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const tp = await getTranslations({ locale, namespace: 'pages.events' })
  return { title: `${tp('title').replace(/\n/g, ' ')} — IHO`, alternates: buildAlternates({ href: '/events', country, locale }) }
}

function EventRow({ event }: { event: EventVM }) {
  return (
    <a href={event.href} className="iho-event-row">
      <div style={{ fontFamily: ACUMIN, fontWeight: 800, lineHeight: 0.9, color: event.isPast ? '#8a8478' : '#17150f' }}>
        <div style={{ fontSize: 56 }}>{event.day}</div>
        <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '1.5px', fontWeight: 400, marginTop: 6 }}>{event.month}</div>
      </div>
      <div>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '1.3px', color: '#ef483d', marginBottom: 8 }}>{event.typeLabel}</div>
        <h3 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 32, lineHeight: 1, textTransform: 'uppercase', margin: '0 0 8px', color: '#17150f', transition: 'color 0.3s' }}>{event.title}</h3>
        <div style={{ fontFamily: SANS, fontSize: 14, color: '#7a756a' }}>{event.meta}</div>
      </div>
      <div style={{ height: 130, borderRadius: 4, overflow: 'hidden' }}>
        <MediaImage image={event.image} sizes="220px" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: event.isPast ? 'grayscale(0.4)' : undefined }} />
      </div>
    </a>
  )
}

export default async function EventsPage({ params }: { params: Promise<SiteParams> }) {
  const { country, locale } = await resolveSiteParams(params)
  const paths = sitePaths(locale)
  const [tp, events, chrome] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.events' }),
    getEventsVM(country, locale, paths),
    innerChrome(country, locale, paths),
  ])
  const upcoming = events.filter(e => !e.isPast)
  const past = events.filter(e => e.isPast).reverse()
  return (
    <PageShell chrome={chrome}>
      <PageHero label={tp('label')} title={tp('title')} image={upcoming[0]?.image ?? past[0]?.image} />
      <section className="iho-page-section">
        <SectionHeading label={`— ${tp('upcoming').toUpperCase()}`} />
        {upcoming.length ? upcoming.map(e => <EventRow key={e.slug} event={e} />) : <EmptyNote>{tp('empty')}</EmptyNote>}
      </section>
      {past.length > 0 && (
        <section className="iho-page-section" style={{ paddingTop: 0 }}>
          <SectionHeading label={`— ${tp('past').toUpperCase()}`} />
          {past.map(e => <EventRow key={e.slug} event={e} />)}
        </section>
      )}
    </PageShell>
  )
}
