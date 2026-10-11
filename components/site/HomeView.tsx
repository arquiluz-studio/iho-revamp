import type { HomeVM } from '@/lib/types/site'
import { SolutionsGrid } from './SolutionsGrid'
import { BrandsWall } from './BrandsWall'
import { ContactSection } from './ContactSection'
import { EventsTimeline } from './EventsTimeline'
import { Hero } from './Hero'
import { ProductsSlider } from './ProductsSlider'
import { ProjectsGrid } from './ProjectsGrid'
import { SectorStrip } from './SectorStrip'

export type SiteChrome = {
  header: React.ReactNode
  footer: React.ReactNode
  banner?: React.ReactNode
}

export function HomeView({ data, chrome, countryCode, solutionsHref, contactHref }: { data: HomeVM; chrome: SiteChrome; countryCode: string; solutionsHref: string; contactHref: string }) {
  return (
    <div style={{ width: '100%', overflowX: 'hidden' }}>
      {chrome.banner}
      {chrome.header}
      <Hero eyebrow={data.hero.eyebrow} title={data.hero.title} subtitle={data.hero.subtitle} videoSrc={data.hero.videoSrc} poster={data.hero.poster} ctaHref={contactHref} />
      <SectorStrip items={data.sectors} />
      <SolutionsGrid solutions={data.solutions} ctaHref={solutionsHref} background="#ffffff" />
      <BrandsWall brands={data.brands} />
      <ProductsSlider products={data.products} />
      <EventsTimeline events={data.events} />
      <ProjectsGrid projects={data.projects} />
      <ContactSection offices={data.offices} image={data.contactImage} countryCode={countryCode} />
      {chrome.footer}
    </div>
  )
}
