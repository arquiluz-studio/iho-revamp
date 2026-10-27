import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { PageShell } from '@/components/site/pages/PageParts'
import { innerChrome } from '@/components/site/SiteChrome'
import { SolutionView, type SolutionInclude } from '@/components/site/SolutionView'
import { spacesForSolution } from '@/lib/content/solution-fits'
import { legacyMedia } from '@/lib/content/legacy-media'
import { localeHrefs, sitePaths } from '@/lib/content/paths'
import { imageOf, imageOrNull } from '@/lib/content/site'
import { localSlug, paragraphs, pickBySlug, t } from '@/lib/i18n-fields'
import { getProjects } from '@/lib/queries/projects'
import { getBusinessLines, getSectors, getSolutionSpaceFits } from '@/lib/queries/site'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, siteStaticParams, type SiteParams } from '@/lib/site-params'

type Params = SiteParams & { businessLine: string }

export async function generateStaticParams() {
  const lines = await getBusinessLines()
  return siteStaticParams().flatMap(p => lines.map(l => ({ ...p, businessLine: localSlug(l, p.locale) })))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const { businessLine } = await params
  const line = pickBySlug(await getBusinessLines(), businessLine, locale)
  if (!line) return {}
  return {
    title: `${t(line, 'name', locale)} — IHO`,
    description: t(line, 'description', locale) || undefined,
    alternates: buildAlternates({ href: l => ({ pathname: '/solutions/[businessLine]', params: { businessLine: localSlug(line, l) } }), country, locale }),
  }
}

export default async function SolutionPage({ params }: { params: Promise<Params> }) {
  const { country, locale } = await resolveSiteParams(params)
  const { businessLine } = await params
  const paths = sitePaths(locale)
  const lines = await getBusinessLines()
  const line = pickBySlug(lines, businessLine, locale)
  if (!line) notFound()
  if (localSlug(line, locale) !== businessLine) permanentRedirect(paths.solution(localSlug(line, locale)))

  const [tp, chrome, projects, sectors, fits] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.solutions' }),
    innerChrome(country, locale, paths, localeHrefs(l => ({ pathname: '/solutions/[businessLine]', params: { businessLine: localSlug(line, l) } }))),
    getProjects(country, { businessLine: line.slug }),
    getSectors(),
    getSolutionSpaceFits(),
  ])
  const name = t(line, 'name', locale)
  const hero = imageOf(line.cover, locale, name, legacyMedia.businessLineCover(line.slug), 'lg')
  const featured = projects.filter(project => project.business_lines.some(link => link.business_line?.slug === line.slug && link.is_featured))
  const photos = projects.flatMap(project => {
    const title = t(project, 'title', locale)
    const image = imageOrNull(project.cover, locale, title, legacyMedia.projectCover(project.slug), 'lg')
    return image ? [image] : []
  })
  const catalog = readIncludes(tp.raw(`includes.${line.slug}`))
  const includes: SolutionInclude[] = catalog.map((item, index) => ({
    ...item,
    image: photos.length ? photos[index % photos.length] : hero,
  }))

  return (
    <PageShell chrome={chrome}>
      <SolutionView
        name={name}
        description={paragraphs(t(line, 'description', locale))}
        hero={hero}
        statementImage={photos[0] ?? hero}
        includes={includes}
        spaces={spacesForSolution(line, sectors, fits, locale, paths)}
        spacesLabel={tp('spacesLabel')}
        spacesTitle={tp('spacesTitle')}
        projects={featured.slice(0, 4).map(project => {
          const title = t(project, 'title', locale)
          return {
            key: project.id,
            title,
            href: paths.project(localSlug(project, locale)),
            image: imageOrNull(project.cover, locale, title, legacyMedia.projectCover(project.slug), 'lg'),
            meta: project.city || undefined,
          }
        })}
        quoteHref={paths.contact}
        quoteLabel={tp('quote')}
        statementTitle={tp('statementTitle')}
        includesLabel={tp('includesLabel')}
        includesTitle={tp('includesTitle')}
        projectsLabel={tp('projectsLabel')}
        projectsTitle={tp('projectsTitle')}
        allProjectsHref={paths.projects}
        allProjectsLabel={tp('allProjects')}
        closeTitle={tp('closeTitle')}
        closeBody={tp('closeBody')}
      />
    </PageShell>
  )
}

function readIncludes(value: unknown): { title: string; text: string }[] {
  if (!Array.isArray(value)) return []
  return value.flatMap(item => {
    if (!item || typeof item !== 'object') return []
    const row = item as { title?: unknown; text?: unknown }
    return typeof row.title === 'string' ? [{ title: row.title, text: typeof row.text === 'string' ? row.text : '' }] : []
  })
}
