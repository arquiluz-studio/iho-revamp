import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { BrandLogos, Chips, PageHero, PageShell, ProjectCards, Prose, SectionHeading } from '@/components/site/pages/PageParts'
import { innerChrome } from '@/components/site/SiteChrome'
import { legacyMedia } from '@/lib/content/legacy-media'
import { sitePaths } from '@/lib/content/paths'
import { imageOf, toBrandVM, toProjectCardVM } from '@/lib/content/site'
import { paragraphs, t } from '@/lib/i18n-fields'
import { getCountryBrands } from '@/lib/queries/brands'
import { getProjects } from '@/lib/queries/projects'
import { getBusinessLines } from '@/lib/queries/site'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, siteStaticParams, type SiteParams } from '@/lib/site-params'

type Params = SiteParams & { businessLine: string }

export async function generateStaticParams() {
  const lines = await getBusinessLines()
  return siteStaticParams().flatMap(p => lines.map(l => ({ ...p, businessLine: l.slug })))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const { businessLine } = await params
  const line = (await getBusinessLines()).find(l => l.slug === businessLine)
  if (!line) return {}
  return {
    title: `${t(line, 'name', locale)} — IHO`,
    description: t(line, 'description', locale) || undefined,
    alternates: buildAlternates({ href: { pathname: '/areas/[businessLine]', params: { businessLine } }, country, locale }),
  }
}

export default async function AreaPage({ params }: { params: Promise<Params> }) {
  const { country, locale } = await resolveSiteParams(params)
  const { businessLine } = await params
  const paths = sitePaths(locale)
  const [lines, tp, chrome] = await Promise.all([getBusinessLines(), getTranslations({ locale, namespace: 'pages.areas' }), innerChrome(country, locale, paths)])
  const line = lines.find(l => l.slug === businessLine)
  if (!line) notFound()

  const [brands, projects] = await Promise.all([getCountryBrands(country), getProjects(country, { businessLine })])
  const areaBrands = brands.filter(b => b.business_lines.some(l => l.business_line?.slug === businessLine))
  const name = t(line, 'name', locale)

  return (
    <PageShell chrome={chrome}>
      <PageHero label={tp('label')} title={name} image={imageOf(line.cover, locale, name, legacyMedia.businessLineCover(line.slug))}>
        <div style={{ marginTop: 32 }} className="iho-chips-dark">
          <Chips links={lines.map(l => ({ href: paths.area(l.slug), label: t(l, 'name', locale) }))} current={paths.area(line.slug)} />
        </div>
      </PageHero>
      {t(line, 'description', locale) && (
        <section className="iho-page-section" style={{ maxWidth: 900 }}>
          <Prose paragraphs={paragraphs(t(line, 'description', locale))} />
        </section>
      )}
      {areaBrands.length > 0 && (
        <section className="iho-page-section" style={{ paddingTop: 0 }}>
          <SectionHeading label={`— ${tp('brands').toUpperCase()}`} />
          <BrandLogos brands={areaBrands.map(b => toBrandVM(b, locale, paths))} />
        </section>
      )}
      {projects.length > 0 && (
        <section className="iho-page-section" style={{ paddingTop: 0 }}>
          <SectionHeading label={`— ${tp('projects').toUpperCase()}`} />
          <ProjectCards projects={projects.map(p => toProjectCardVM(p, locale, paths))} />
        </section>
      )}
    </PageShell>
  )
}
