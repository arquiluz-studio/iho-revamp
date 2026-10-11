import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { SolutionsGrid } from '@/components/site/SolutionsGrid'
import { EmptyNote, HeroExtra, PageHero, PageShell } from '@/components/site/pages/PageParts'
import { innerChrome } from '@/components/site/SiteChrome'
import { legacyMedia } from '@/lib/content/legacy-media'
import { resolvePageHero } from '@/lib/content/page-hero'
import { sitePaths } from '@/lib/content/paths'
import { imageOf } from '@/lib/content/site'
import { localSlug, t } from '@/lib/i18n-fields'
import { getSectors } from '@/lib/queries/site'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, type SiteParams } from '@/lib/site-params'

export async function generateMetadata({ params }: { params: Promise<SiteParams> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const tp = await getTranslations({ locale, namespace: 'pages.spaces' })
  const hero = await resolvePageHero(country, 'spaces', locale, { label: tp('label'), title: tp('title') })
  return { title: `${hero.title.replace(/\n/g, ' ')} — IHO`, alternates: buildAlternates({ href: '/spaces', country, locale }) }
}

export default async function SpacesPage({ params }: { params: Promise<SiteParams> }) {
  const { country, locale } = await resolveSiteParams(params)
  const paths = sitePaths(locale)
  const [tp, sectors, chrome] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.spaces' }),
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
  const hero = await resolvePageHero(country, 'spaces', locale, { label: tp('label'), title: tp('title') })
  return (
    <PageShell chrome={chrome}>
      <PageHero label={hero.label} title={hero.title} intro={hero.intro} image={hero.image}>
        {hero.extra && <HeroExtra>{hero.extra}</HeroExtra>}
      </PageHero>
      {cards.length ? <SolutionsGrid solutions={cards} heading={false} /> : <section className="iho-page-section"><EmptyNote>{tp('empty')}</EmptyNote></section>}
    </PageShell>
  )
}
