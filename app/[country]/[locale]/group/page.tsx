import type { Metadata } from 'next'
import { BrandsWall } from '@/components/site/BrandsWall'
import { GroupSection } from '@/components/site/GroupSection'
import { HeroExtra, PageHero, PageShell } from '@/components/site/pages/PageParts'
import { ProjectsGrid } from '@/components/site/ProjectsGrid'
import { innerChrome } from '@/components/site/SiteChrome'
import { Team } from '@/components/site/Team'
import { heroDocumentTitle, resolvePageHero } from '@/lib/content/page-hero'
import { sitePaths } from '@/lib/content/paths'
import { getGroupVM } from '@/lib/content/site'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, type SiteParams } from '@/lib/site-params'

export async function generateMetadata({ params }: { params: Promise<SiteParams> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const hero = await resolvePageHero(country, 'group', locale)
  return { title: heroDocumentTitle(hero.title), alternates: buildAlternates({ href: '/group', country, locale }) }
}

export default async function GroupPage({ params }: { params: Promise<SiteParams> }) {
  const { country, locale } = await resolveSiteParams(params)
  const paths = sitePaths(locale)
  const [group, chrome] = await Promise.all([getGroupVM(country, locale, paths), innerChrome(country, locale, paths)])
  const hero = await resolvePageHero(country, 'group', locale)
  return (
    <PageShell chrome={chrome}>
      <PageHero label={hero.label} title={hero.title} intro={hero.intro} image={hero.image}>
        {hero.extra && <HeroExtra>{hero.extra}</HeroExtra>}
      </PageHero>
      <Team members={group.team} />
      <GroupSection stats={group.stats} mapCountries={group.mapCountries} showIntro={false} />
      <BrandsWall brands={group.brands} />
      <ProjectsGrid projects={group.projects} background="#ffffff" />
    </PageShell>
  )
}
