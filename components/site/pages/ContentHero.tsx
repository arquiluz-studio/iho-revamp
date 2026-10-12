import type { ResolvedPageHero } from '@/lib/content/page-hero'
import { HeroExtra, PageHero } from './PageParts'

/** Hero of a Contenido page. An inactive source renders nothing. */
export function ContentHero({ hero, children }: { hero: ResolvedPageHero; children?: React.ReactNode }) {
  if (!hero.enabled) return null
  return (
    <PageHero label={hero.label} title={hero.title} intro={hero.intro} image={hero.image} actions={hero.actions}>
      {hero.extra && <HeroExtra>{hero.extra}</HeroExtra>}
      {children}
    </PageHero>
  )
}
