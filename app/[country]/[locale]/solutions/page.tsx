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
import { getBusinessLines } from '@/lib/queries/site'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, type SiteParams } from '@/lib/site-params'

export async function generateMetadata({ params }: { params: Promise<SiteParams> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const [tp, th] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.solutions' }),
    getTranslations({ locale, namespace: 'home.solutions' }),
  ])
  const hero = await resolvePageHero(country, 'solutions', locale, { label: tp('label'), title: th('title') })
  return { title: `${hero.title.replace(/\n/g, ' ')} — IHO`, alternates: buildAlternates({ href: '/solutions', country, locale }) }
}

export default async function SolutionsPage({ params }: { params: Promise<SiteParams> }) {
  const { country, locale } = await resolveSiteParams(params)
  const paths = sitePaths(locale)
  const [tp, th, lines, chrome] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.solutions' }),
    getTranslations({ locale, namespace: 'home.solutions' }),
    getBusinessLines(),
    innerChrome(country, locale, paths),
  ])
  const cards = lines.map((line, i) => ({
    num: String(i + 1).padStart(2, '0'),
    title: t(line, 'name', locale),
    description: t(line, 'description', locale),
    image: imageOf(line.cover, locale, t(line, 'name', locale), legacyMedia.businessLineCover(line.slug), 'md'),
    href: paths.solution(localSlug(line, locale)),
  }))
  const hero = await resolvePageHero(country, 'solutions', locale, { label: tp('label'), title: th('title') })
  return (
    <PageShell chrome={chrome}>
      <PageHero label={hero.label} title={hero.title} intro={hero.intro} image={hero.image}>
        {hero.extra && <HeroExtra>{hero.extra}</HeroExtra>}
      </PageHero>
      {cards.length ? <SolutionsGrid solutions={cards} heading={false} /> : <section className="iho-page-section"><EmptyNote>{tp('empty')}</EmptyNote></section>}
    </PageShell>
  )
}
