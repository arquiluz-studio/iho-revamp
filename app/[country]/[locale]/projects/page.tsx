import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { ContentHero } from '@/components/site/pages/ContentHero'
import { PageShell } from '@/components/site/pages/PageParts'
import { ProjectBrowser, type BrowserProject } from '@/components/site/ProjectBrowser'
import { innerChrome } from '@/components/site/SiteChrome'
import { COUNTRIES, COUNTRY_CODES, crossCountryUrl, sortByCountry } from '@/config/countries'
import { heroDocumentTitle, resolvePageHero } from '@/lib/content/page-hero'
import { sitePaths } from '@/lib/content/paths'
import { toProjectCardVM } from '@/lib/content/site'
import { localSlug, t } from '@/lib/i18n-fields'
import { getProjects } from '@/lib/queries/projects'
import { getBusinessLines, getSectors } from '@/lib/queries/site'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, type SiteParams } from '@/lib/site-params'

export async function generateMetadata({ params }: { params: Promise<SiteParams> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const hero = await resolvePageHero(country, 'projects', locale)
  return { title: heroDocumentTitle(hero.title), alternates: buildAlternates({ href: '/projects', country, locale }) }
}

export default async function ProjectsPage({ params }: { params: Promise<SiteParams> }) {
  const { country, locale } = await resolveSiteParams(params)
  const paths = sitePaths(locale)
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost'
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const protocol = proto.endsWith(':') ? proto : `${proto}:`
  const [grouped, sectors, lines, chrome] = await Promise.all([
    Promise.all(COUNTRY_CODES.map(async code => ({ code, rows: await getProjects(code) }))),
    getSectors(),
    getBusinessLines(),
    innerChrome(country, locale, paths),
  ])

  const projects: BrowserProject[] = grouped.flatMap(({ code, rows }) =>
    rows.map(project => {
      const card = toProjectCardVM(project, locale, paths)
      const path = paths.project(localSlug(project, locale))
      const space = project.sector ? t(project.sector, 'name', locale) : ''
      return {
        ...card,
        href: code === country ? path : crossCountryUrl(code, { protocol, host }, path),
        meta: [COUNTRIES[code].name[locale], space].filter(Boolean).join(' · '),
        country: code,
        spaceId: project.sector?.id ?? null,
        solutionIds: project.business_lines.flatMap(link => (link.business_line ? [link.business_line.id] : [])),
      }
    }),
  )
  const countries = sortByCountry(COUNTRY_CODES, code => code).map(code => ({ id: code, label: COUNTRIES[code].name[locale] }))
  const spaces = sectors.map(sector => ({ id: sector.id, label: t(sector, 'name', locale) }))
  const solutions = lines.map(line => ({ id: line.id, label: t(line, 'name', locale) }))
  const hero = await resolvePageHero(country, 'projects', locale, projects.find(project => project.country === country)?.image ?? projects[0]?.image)

  return (
    <PageShell chrome={chrome} hero={hero.enabled}>
      <ContentHero hero={hero} />
      <ProjectBrowser projects={projects} countries={countries} spaces={spaces} solutions={solutions} />
    </PageShell>
  )
}
