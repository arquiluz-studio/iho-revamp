import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { SolutionsGrid } from '@/components/site/SolutionsGrid'
import { ContentHero } from '@/components/site/pages/ContentHero'
import { EmptyNote, PageShell } from '@/components/site/pages/PageParts'
import { innerChrome } from '@/components/site/SiteChrome'
import { legacyMedia } from '@/lib/content/legacy-media'
import { heroDocumentTitle, resolvePageHero } from '@/lib/content/page-hero'
import { sitePaths } from '@/lib/content/paths'
import { imageOf } from '@/lib/content/site'
import { localSlug, t } from '@/lib/i18n-fields'
import { getBusinessLines } from '@/lib/queries/site'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, type SiteParams } from '@/lib/site-params'

export async function generateMetadata({ params }: { params: Promise<SiteParams> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const hero = await resolvePageHero(country, 'solutions', locale)
  return { title: heroDocumentTitle(hero.title), alternates: buildAlternates({ href: '/solutions', country, locale }) }
}

export default async function SolutionsPage({ params }: { params: Promise<SiteParams> }) {
  const { country, locale } = await resolveSiteParams(params)
  const paths = sitePaths(locale)
  const [tp, lines, chrome] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.solutions' }),
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
  const hero = await resolvePageHero(country, 'solutions', locale)
  return (
    <PageShell chrome={chrome} hero={hero.enabled}>
      <ContentHero hero={hero} />
      {cards.length ? <SolutionsGrid solutions={cards} heading={false} /> : <section className="iho-page-section"><EmptyNote>{tp('empty')}</EmptyNote></section>}
    </PageShell>
  )
}
