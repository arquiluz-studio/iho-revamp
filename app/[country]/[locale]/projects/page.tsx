import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { PageHero, PageShell } from '@/components/site/pages/PageParts'
import { ProjectBrowser, type BrowserProject } from '@/components/site/ProjectBrowser'
import { innerChrome } from '@/components/site/SiteChrome'
import { COUNTRIES, COUNTRY_CODES, crossCountryUrl, sortByCountry } from '@/config/countries'
import { sitePaths } from '@/lib/content/paths'
import { toProjectCardVM } from '@/lib/content/site'
import { localSlug, t } from '@/lib/i18n-fields'
import { getProjects } from '@/lib/queries/projects'
import { getBusinessLines, getSectors } from '@/lib/queries/site'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, type SiteParams } from '@/lib/site-params'

export async function generateMetadata({ params }: { params: Promise<SiteParams> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const tp = await getTranslations({ locale, namespace: 'pages.projects' })
  return { title: `${tp('title').replace(/\n/g, ' ')} — IHO`, alternates: buildAlternates({ href: '/projects', country, locale }) }
}

export default async function ProjectsPage({ params }: { params: Promise<SiteParams> }) {
  const { country, locale } = await resolveSiteParams(params)
  const paths = sitePaths(locale)
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost'
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const protocol = proto.endsWith(':') ? proto : `${proto}:`
  const [tp, th, grouped, sectors, lines, chrome] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.projects' }),
    getTranslations({ locale, namespace: 'home.projects' }),
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
  const countries = sortByCountry(COUNTRY_CODES, country, locale, code => code).map(code => ({ id: code, label: COUNTRIES[code].name[locale] }))
  const spaces = sectors.map(sector => ({ id: sector.id, label: t(sector, 'name', locale) }))
  const solutions = lines.map(line => ({ id: line.id, label: t(line, 'name', locale) }))

  return (
    <PageShell chrome={chrome}>
      <PageHero label={tp('label')} title={tp('title')} intro={th('intro')} image={projects.find(project => project.country === country)?.image ?? projects[0]?.image} />
      <ProjectBrowser projects={projects} countries={countries} spaces={spaces} solutions={solutions} />
    </PageShell>
  )
}
