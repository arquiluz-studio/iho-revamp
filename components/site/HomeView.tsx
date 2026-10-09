import type { HomeVM, NavLink } from '@/lib/types/site'
import { AreasGrid } from './AreasGrid'
import { BrandsWall } from './BrandsWall'
import { ContactSection } from './ContactSection'
import { EventsTimeline } from './EventsTimeline'
import { GroupSection } from './GroupSection'
import { Hero } from './Hero'
import { ProductsSlider } from './ProductsSlider'
import { ProjectsGrid } from './ProjectsGrid'
import { SectorStrip } from './SectorStrip'
import { Team } from './Team'

export type SiteChrome = {
  header: React.ReactNode
  footer: React.ReactNode
  banner?: React.ReactNode
}

export function HomeView({ data, chrome, countryCode, areasHref }: { data: HomeVM; chrome: SiteChrome; countryCode: string; areasHref: string }) {
  return (
    <div style={{ width: '100%', overflowX: 'hidden' }}>
      {chrome.banner}
      {chrome.header}
      <Hero eyebrow={data.hero.eyebrow} title={data.hero.title} videoSrc={data.hero.videoSrc} poster={data.hero.poster} ctaHref="#contacto" />
      <SectorStrip items={data.sectors} />
      <ProductsSlider products={data.products} />
      <EventsTimeline events={data.events} />
      <GroupSection stats={data.group.stats} mapCountries={data.group.mapCountries} />
      <AreasGrid areas={data.areas} ctaHref={areasHref} />
      <ProjectsGrid projects={data.projects} />
      <BrandsWall brands={data.brands} />
      <Team members={data.team} />
      <ContactSection offices={data.offices} image={data.contactImage} countryCode={countryCode} />
      {chrome.footer}
    </div>
  )
}

export function homeNav(t: (key: string) => string): { links: NavLink[]; cta: NavLink } {
  return {
    links: [
      { href: '#eventos', label: t('events') },
      { href: '#productos', label: t('products') },
      { href: '#grupo', label: t('group') },
      { href: '#marcas', label: t('brands') },
    ],
    cta: { href: '#contacto', label: t('contact') },
  }
}
