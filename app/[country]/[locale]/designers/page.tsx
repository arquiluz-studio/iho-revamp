import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { DesignerCards, EmptyNote, PageHero, PageShell } from '@/components/site/pages/PageParts'
import { innerChrome } from '@/components/site/SiteChrome'
import { sitePaths } from '@/lib/content/paths'
import { toDesignerCardVM } from '@/lib/content/site'
import { getDesigners } from '@/lib/queries/designers'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, type SiteParams } from '@/lib/site-params'

export async function generateMetadata({ params }: { params: Promise<SiteParams> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const tp = await getTranslations({ locale, namespace: 'pages.designers' })
  return { title: `${tp('title').replace(/\n/g, ' ')} — IHO`, alternates: buildAlternates({ href: '/designers', country, locale }) }
}

export default async function DesignersPage({ params }: { params: Promise<SiteParams> }) {
  const { country, locale } = await resolveSiteParams(params)
  const paths = sitePaths(locale)
  const [tp, designers, chrome] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.designers' }),
    getDesigners(),
    innerChrome(country, locale, paths),
  ])
  const born = (year: number) => tp('born', { year })
  return (
    <PageShell chrome={chrome}>
      <PageHero label={tp('label')} title={tp('title')} intro={tp('intro')} />
      <section className="iho-page-section">
        {designers.length > 0 ? (
          <DesignerCards designers={designers.map(d => toDesignerCardVM(d, locale, paths, born))} />
        ) : (
          <EmptyNote>{tp('empty')}</EmptyNote>
        )}
      </section>
    </PageShell>
  )
}
