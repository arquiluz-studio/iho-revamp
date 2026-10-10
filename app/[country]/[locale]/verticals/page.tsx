import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AreasGrid } from '@/components/site/AreasGrid'
import { EmptyNote, PageHero, PageShell } from '@/components/site/pages/PageParts'
import { innerChrome } from '@/components/site/SiteChrome'
import { legacyMedia } from '@/lib/content/legacy-media'
import { sitePaths } from '@/lib/content/paths'
import { imageOf } from '@/lib/content/site'
import { localSlug, t } from '@/lib/i18n-fields'
import { getSectors } from '@/lib/queries/site'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, type SiteParams } from '@/lib/site-params'

export async function generateMetadata({ params }: { params: Promise<SiteParams> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const tp = await getTranslations({ locale, namespace: 'pages.verticals' })
  return { title: `${tp('title').replace(/\n/g, ' ')} — IHO`, alternates: buildAlternates({ href: '/verticals', country, locale }) }
}

export default async function VerticalsPage({ params }: { params: Promise<SiteParams> }) {
  const { country, locale } = await resolveSiteParams(params)
  const paths = sitePaths(locale)
  const [tp, sectors, chrome] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.verticals' }),
    getSectors(),
    innerChrome(country, locale, paths),
  ])
  const cards = sectors.map((sector, i) => ({
    num: String(i + 1).padStart(2, '0'),
    title: t(sector, 'name', locale),
    description: t(sector, 'description', locale),
    image: imageOf(sector.cover, locale, t(sector, 'name', locale), legacyMedia.sectorCover(sector.slug), 'md'),
    href: paths.space(localSlug(sector, locale)),
  }))
  return (
    <PageShell chrome={chrome}>
      <PageHero label={tp('label')} title={tp('title')} />
      {cards.length ? <AreasGrid areas={cards} heading={false} /> : <section className="iho-page-section"><EmptyNote>{tp('empty')}</EmptyNote></section>}
    </PageShell>
  )
}
