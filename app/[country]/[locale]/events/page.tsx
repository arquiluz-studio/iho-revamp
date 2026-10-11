import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { EmptyNote, EventRow, HeroExtra, PageHero, PageShell, SectionHeading } from '@/components/site/pages/PageParts'
import { innerChrome } from '@/components/site/SiteChrome'
import { resolvePageHero } from '@/lib/content/page-hero'
import { sitePaths } from '@/lib/content/paths'
import { getEventsVM } from '@/lib/content/site'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, type SiteParams } from '@/lib/site-params'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<SiteParams> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const tp = await getTranslations({ locale, namespace: 'pages.events' })
  const hero = await resolvePageHero(country, 'events', locale, { label: tp('label'), title: tp('title') })
  return { title: `${hero.title.replace(/\n/g, ' ')} — IHO`, alternates: buildAlternates({ href: '/events', country, locale }) }
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
  const hero = await resolvePageHero(country, 'events', locale, { label: tp('label'), title: tp('title') }, upcoming[0]?.image ?? past[0]?.image)
  return (
    <PageShell chrome={chrome}>
      <PageHero label={hero.label} title={hero.title} intro={hero.intro} image={hero.image}>
        {hero.extra && <HeroExtra>{hero.extra}</HeroExtra>}
      </PageHero>
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
