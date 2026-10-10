import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Chips, EmptyNote, PageHero, PageShell, ProjectCards, Prose, SectionHeading } from '@/components/site/pages/PageParts'
import { innerChrome } from '@/components/site/SiteChrome'
import { legacyMedia } from '@/lib/content/legacy-media'
import { localeHrefs, sitePaths } from '@/lib/content/paths'
import { imageOf, toProjectCardVM } from '@/lib/content/site'
import { localSlug, paragraphs, pickBySlug, t } from '@/lib/i18n-fields'
import { getProjects } from '@/lib/queries/projects'
import { getSectors } from '@/lib/queries/site'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, siteStaticParams, type SiteParams } from '@/lib/site-params'

type Params = SiteParams & { sector: string }

export async function generateStaticParams() {
  const sectors = await getSectors()
  return siteStaticParams().flatMap(p => sectors.map(s => ({ ...p, sector: localSlug(s, p.locale) })))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const { sector } = await params
  const row = pickBySlug(await getSectors(), sector, locale)
  if (!row) return {}
  return {
    title: `${t(row, 'name', locale)} — IHO`,
    description: t(row, 'description', locale) || undefined,
    alternates: buildAlternates({ href: l => ({ pathname: '/spaces/[sector]', params: { sector: localSlug(row, l) } }), country, locale }),
  }
}

export default async function SpacePage({ params }: { params: Promise<Params> }) {
  const { country, locale } = await resolveSiteParams(params)
  const { sector } = await params
  const paths = sitePaths(locale)
  const sectors = await getSectors()
  const row = pickBySlug(sectors, sector, locale)
  if (!row) notFound()
  if (localSlug(row, locale) !== sector) permanentRedirect(paths.space(localSlug(row, locale)))
  const [tp, tpp, chrome, projects] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.spaces' }),
    getTranslations({ locale, namespace: 'pages.projects' }),
    innerChrome(country, locale, paths, localeHrefs(l => ({ pathname: '/spaces/[sector]', params: { sector: localSlug(row, l) } }))),
    getProjects(country, { sector: row.slug }),
  ])
  const name = t(row, 'name', locale)

  return (
    <PageShell chrome={chrome}>
      <PageHero label={tp('label')} title={name} image={imageOf(row.cover, locale, name, legacyMedia.sectorCover(row.slug))}>
        <div style={{ marginTop: 32 }} className="iho-chips-dark">
          <Chips links={sectors.map(s => ({ href: paths.space(localSlug(s, locale)), label: t(s, 'name', locale) }))} current={paths.space(localSlug(row, locale))} />
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
