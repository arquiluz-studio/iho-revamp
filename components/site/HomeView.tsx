import type { HomeVM } from '@/lib/types/site'
import { SolutionsGrid } from './SolutionsGrid'
import { BrandsWall } from './BrandsWall'
import { ContactSection } from './ContactSection'
import { EventsTimeline } from './EventsTimeline'
import { Hero } from './Hero'
import { ProductsSlider } from './ProductsSlider'
import { ProjectsGrid } from './ProjectsGrid'
import { SectorStrip } from './SectorStrip'
import { solidHeader } from './solid-header'

export type SiteChrome = {
  header: React.ReactNode
  footer: React.ReactNode
  banner?: React.ReactNode
}

export function HomeView({ data, chrome, countryCode, solutionsHref }: { data: HomeVM; chrome: SiteChrome; countryCode: string; solutionsHref: string }) {
  return (
    <div style={{ width: '100%', overflowX: 'hidden' }}>
      {chrome.banner}
      {data.hero.enabled ? chrome.header : solidHeader(chrome.header)}
      {data.hero.enabled ? (
        <Hero slides={data.hero.slides} />
      ) : (
        <div style={{ height: 88 }} />
      )}
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
