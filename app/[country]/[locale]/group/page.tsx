import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { BrandsWall } from '@/components/site/BrandsWall'
import { GroupSection } from '@/components/site/GroupSection'
import { PageHero, PageShell } from '@/components/site/pages/PageParts'
import { ProjectsGrid } from '@/components/site/ProjectsGrid'
import { innerChrome } from '@/components/site/SiteChrome'
import { Team } from '@/components/site/Team'
import { SANS } from '@/components/ui/tokens'
import { sitePaths } from '@/lib/content/paths'
import { getGroupVM } from '@/lib/content/site'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, type SiteParams } from '@/lib/site-params'

export async function generateMetadata({ params }: { params: Promise<SiteParams> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const tg = await getTranslations({ locale, namespace: 'home.group' })
  return { title: `${tg('title').replace(/\n/g, ' ')} — IHO`, alternates: buildAlternates({ href: '/group', country, locale }) }
}

export default async function GroupPage({ params }: { params: Promise<SiteParams> }) {
  const { country, locale } = await resolveSiteParams(params)
  const paths = sitePaths(locale)
  const [tp, tg, group, chrome] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.group' }),
    getTranslations({ locale, namespace: 'home.group' }),
    getGroupVM(country, locale, paths),
    innerChrome(country, locale, paths),
  ])
  return (
    <PageShell chrome={chrome}>
      <PageHero label={tp('label')} title={tg('title')} intro={tg('p1')}>
        <p style={{ fontFamily: SANS, fontSize: 17, lineHeight: 1.6, color: 'rgba(255,255,255,0.82)', maxWidth: 620, margin: '16px 0 0' }}>{tg('p2')}</p>
      </PageHero>
      <Team members={group.team} />
      <GroupSection stats={group.stats} mapCountries={group.mapCountries} showIntro={false} />
      <BrandsWall brands={group.brands} />
      <ProjectsGrid projects={group.projects} background="#ffffff" />
    </PageShell>
  )
}
