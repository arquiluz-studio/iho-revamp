import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Chips, EmptyNote, PageHero, PageShell, ProjectCards } from '@/components/site/pages/PageParts'
import { innerChrome } from '@/components/site/SiteChrome'
import { sitePaths } from '@/lib/content/paths'
import { toProjectCardVM } from '@/lib/content/site'
import { localSlug, t } from '@/lib/i18n-fields'
import { getProjects } from '@/lib/queries/projects'
import { getSectors } from '@/lib/queries/site'
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
  const [tp, th, projects, sectors, chrome] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.projects' }),
    getTranslations({ locale, namespace: 'home.projects' }),
    getProjects(country),
    getSectors(),
    innerChrome(country, locale, paths),
  ])
  const usedSectors = sectors.filter(s => projects.some(p => p.sector?.id === s.id))
  const cards = projects.map(p => toProjectCardVM(p, locale, paths))
  return (
    <PageShell chrome={chrome}>
      <PageHero label={tp('label')} title={tp('title')} intro={th('intro')} image={cards[0]?.image}>
        {usedSectors.length > 1 && (
          <div style={{ marginTop: 32 }} className="iho-chips-dark">
            <Chips links={usedSectors.map(s => ({ href: paths.space(localSlug(s, locale)), label: t(s, 'name', locale) }))} />
          </div>
        )}
      </PageHero>
      <section className="iho-page-section">{cards.length ? <ProjectCards projects={cards} /> : <EmptyNote>{tp('empty')}</EmptyNote>}</section>
    </PageShell>
  )
}
