import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { DownloadButton } from '@/components/site/DownloadButton'
import { BrandLogos, Facts, PageHero, PageShell, ProjectCards, Prose, SectionHeading } from '@/components/site/pages/PageParts'
import { innerChrome } from '@/components/site/SiteChrome'
import { MediaImage } from '@/components/ui/MediaImage'
import { SANS } from '@/components/ui/tokens'
import { localeHrefs, sitePaths } from '@/lib/content/paths'
import { legacyMedia } from '@/lib/content/legacy-media'
import { imageOf, toBrandVM, toProjectCardVM } from '@/lib/content/site'
import { localSlug, paragraphs, t } from '@/lib/i18n-fields'
import { getProjectBySlug, getProjects } from '@/lib/queries/projects'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, siteStaticParams, type SiteParams } from '@/lib/site-params'

type Params = SiteParams & { slug: string }

export async function generateStaticParams() {
  const params = siteStaticParams()
  const projects = new Map(await Promise.all([...new Set(params.map(p => p.country))].map(async c => [c, await getProjects(c)] as const)))
  return params.flatMap(p => (projects.get(p.country) ?? []).map(project => ({ ...p, slug: localSlug(project, p.locale) })))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const { slug } = await params
  const project = await getProjectBySlug(country, slug, locale)
  if (!project) return {}
  return {
    title: `${t(project, 'title', locale)} — IHO`,
    description: t(project, 'summary', locale) || undefined,
    alternates: buildAlternates({ href: l => ({ pathname: '/projects/[slug]', params: { slug: localSlug(project, l) } }), country, locale, availableIn: [country] }),
  }
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { country, locale } = await resolveSiteParams(params)
  const { slug } = await params
  const paths = sitePaths(locale)
  const project = await getProjectBySlug(country, slug, locale)
  if (!project) notFound()
  if (localSlug(project, locale) !== slug) permanentRedirect(paths.project(localSlug(project, locale)))
  const [tp, chrome] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.projects' }),
    innerChrome(country, locale, paths, localeHrefs(l => ({ pathname: '/projects/[slug]', params: { slug: localSlug(project, l) } }))),
  ])

  const title = t(project, 'title', locale)
  const cover = imageOf(project.cover, locale, title, legacyMedia.projectCover(project.slug))
  const brands = project.brands.flatMap(b => (b.brand?.is_active ? [toBrandVM(b.brand, locale, paths)] : []))
  const lines = project.business_lines.flatMap(b => (b.business_line ? [b.business_line] : []))
  const related = project.sector ? (await getProjects(country, { sector: project.sector.slug })).filter(p => p.id !== project.id).slice(0, 3) : []
  const link = (href: string, label: string) => <a href={href} style={{ color: '#ef483d', textDecoration: 'none' }}>{label}</a>

  return (
    <PageShell chrome={chrome}>
      <PageHero label={tp('label')} title={title} intro={t(project, 'summary', locale)} image={cover} />
      <section className="iho-page-section">
        <div className="iho-detail-grid">
          <Prose paragraphs={paragraphs(t(project, 'body', locale))} />
          <Facts
            items={[
              { label: tp('client'), value: project.client_name },
              { label: tp('year'), value: project.year },
              { label: tp('city'), value: project.city },
              { label: tp('sector'), value: project.sector && link(paths.space(localSlug(project.sector, locale)), t(project.sector, 'name', locale)) },
              {
                label: tp('solutions'),
                value: lines.length > 0 && lines.map((l, i) => <span key={l.id}>{i > 0 && ', '}{link(paths.solution(localSlug(l, locale)), t(l, 'name', locale))}</span>),
              },
            ]}
          />
        </div>
      </section>

      {project.gallery.length > 0 && (
        <section className="iho-page-section" style={{ paddingTop: 0 }}>
          <SectionHeading label={`— ${tp('gallery').toUpperCase()}`} />
          <div className="iho-gallery-grid">
            {project.gallery.flatMap(g => {
              if (!g.media) return []
              const caption = t(g, 'caption', locale)
              return [
                <figure key={g.media.id} style={{ margin: 0 }}>
                  <div style={{ borderRadius: 4, overflow: 'hidden', aspectRatio: '4 / 3', background: '#e9e4da' }}>
                    <MediaImage image={imageOf(g.media, locale, caption || title, null, 'lg')} sizes="(max-width: 768px) 100vw, 50vw" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                  <figcaption style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 10, fontFamily: SANS, fontSize: 14, color: '#5a554b' }}>
                    <span>{caption}</span>
                    {g.media.is_downloadable && <DownloadButton mediaId={g.media.id} countryCode={country} label={tp('download')} />}
                  </figcaption>
                </figure>,
              ]
            })}
          </div>
        </section>
      )}

      {brands.length > 0 && (
        <section className="iho-page-section" style={{ paddingTop: 0 }}>
          <SectionHeading label={`— ${tp('brandsUsed').toUpperCase()}`} />
          <BrandLogos brands={brands} />
        </section>
      )}

      {related.length > 0 && (
        <section className="iho-page-section" style={{ paddingTop: 0 }}>
          <SectionHeading label={tp('related')} />
          <ProjectCards projects={related.map(p => toProjectCardVM(p, locale, paths))} />
        </section>
      )}
    </PageShell>
  )
}
