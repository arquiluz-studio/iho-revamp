import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AreasGrid } from '@/components/site/AreasGrid'
import { EmptyNote, PageHero, PageShell } from '@/components/site/pages/PageParts'
import { innerChrome } from '@/components/site/SiteChrome'
import { legacyMedia } from '@/lib/content/legacy-media'
import { sitePaths } from '@/lib/content/paths'
import { imageOf } from '@/lib/content/site'
import { localSlug, t } from '@/lib/i18n-fields'
import { getBusinessLines } from '@/lib/queries/site'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, type SiteParams } from '@/lib/site-params'

export async function generateMetadata({ params }: { params: Promise<SiteParams> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const th = await getTranslations({ locale, namespace: 'home.areas' })
  return { title: `${th('title').replace(/\n/g, ' ')} — IHO`, alternates: buildAlternates({ href: '/areas', country, locale }) }
}

export default async function AreasPage({ params }: { params: Promise<SiteParams> }) {
  const { country, locale } = await resolveSiteParams(params)
  const paths = sitePaths(locale)
  const [tp, th, lines, chrome] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.areas' }),
    getTranslations({ locale, namespace: 'home.areas' }),
    getBusinessLines(),
    innerChrome(country, locale, paths),
  ])
  const cards = lines.map((line, i) => ({
    num: String(i + 1).padStart(2, '0'),
    title: t(line, 'name', locale),
    description: t(line, 'description', locale),
    image: imageOf(line.cover, locale, t(line, 'name', locale), legacyMedia.businessLineCover(line.slug), 'md'),
    href: paths.area(localSlug(line, locale)),
  }))
  return (
    <PageShell chrome={chrome}>
      <PageHero label={tp('label')} title={th('title')} />
      {cards.length ? <AreasGrid areas={cards} heading={false} /> : <section className="iho-page-section"><EmptyNote>{tp('empty')}</EmptyNote></section>}
    </PageShell>
  )
}
