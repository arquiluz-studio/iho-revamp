import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Chips, EmptyNote, PageHero, PageShell, ProjectCards, Prose, SectionHeading } from '@/components/site/pages/PageParts'
import { innerChrome } from '@/components/site/SiteChrome'
import { legacyMedia } from '@/lib/content/legacy-media'
import { sitePaths } from '@/lib/content/paths'
import { imageOf, toProjectCardVM } from '@/lib/content/site'
import { paragraphs, t } from '@/lib/i18n-fields'
import { getProjects } from '@/lib/queries/projects'
import { getSectors } from '@/lib/queries/site'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, siteStaticParams, type SiteParams } from '@/lib/site-params'

type Params = SiteParams & { sector: string }

export async function generateStaticParams() {
  const sectors = await getSectors()
  return siteStaticParams().flatMap(p => sectors.map(s => ({ ...p, sector: s.slug })))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const { sector } = await params
  const row = (await getSectors()).find(s => s.slug === sector)
  if (!row) return {}
  return {
    title: `${t(row, 'name', locale)} — IHO`,
    description: t(row, 'description', locale) || undefined,
    alternates: buildAlternates({ href: { pathname: '/spaces/[sector]', params: { sector } }, country, locale }),
  }
}

export default async function SpacePage({ params }: { params: Promise<Params> }) {
  const { country, locale } = await resolveSiteParams(params)
  const { sector } = await params
  const paths = sitePaths(locale)
  const [sectors, tp, tpp, chrome] = await Promise.all([
    getSectors(),
    getTranslations({ locale, namespace: 'pages.spaces' }),
    getTranslations({ locale, namespace: 'pages.projects' }),
    innerChrome(country, locale, paths),
  ])
  const row = sectors.find(s => s.slug === sector)
  if (!row) notFound()
  const projects = await getProjects(country, { sector })
  const name = t(row, 'name', locale)

  return (
    <PageShell chrome={chrome}>
      <PageHero label={tp('label')} title={name} image={imageOf(row.cover, locale, name, legacyMedia.sectorCover(row.slug))}>
        <div style={{ marginTop: 32 }} className="iho-chips-dark">
          <Chips links={sectors.map(s => ({ href: paths.space(s.slug), label: t(s, 'name', locale) }))} current={paths.space(row.slug)} />
        </div>
      </PageHero>
      {t(row, 'description', locale) && (
        <section className="iho-page-section" style={{ maxWidth: 900 }}>
          <Prose paragraphs={paragraphs(t(row, 'description', locale))} />
        </section>
      )}
      <section className="iho-page-section" style={{ paddingTop: t(row, 'description', locale) ? 0 : undefined }}>
        <SectionHeading label={`— ${tp('projects').toUpperCase()}`} />
        {projects.length ? <ProjectCards projects={projects.map(p => toProjectCardVM(p, locale, paths))} /> : <EmptyNote>{tpp('empty')}</EmptyNote>}
      </section>
    </PageShell>
  )
}
