import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Footer } from '@/components/site/Footer'
import { Header } from '@/components/site/Header'
import { HomeView, homeNav } from '@/components/site/HomeView'
import { SiteTools } from '@/components/site/SiteTools'
import { getPathname } from '@/i18n/navigation'
import { getStaticHome } from '@/lib/content/static'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, type SiteParams } from '@/lib/site-params'

export async function generateMetadata({ params }: { params: Promise<SiteParams> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  return { alternates: buildAlternates({ href: '/', country, locale }) }
}

export default async function HomePage({ params }: { params: Promise<SiteParams> }) {
  const { country, locale } = await resolveSiteParams(params)
  const t = await getTranslations('nav')
  const nav = homeNav(t)
  const home = getPathname({ href: '/', locale })
  const data = getStaticHome(
    { event: slug => getPathname({ href: { pathname: '/events/[slug]', params: { slug } }, locale }), products: '#productos' },
    country,
  )
  return (
    <HomeView
      data={data}
      countryCode={country}
      areasHref="#areas"
      chrome={{
        header: <Header logoHref={home} links={nav.links} cta={nav.cta} tools={<SiteTools country={country} />} />,
        footer: <Footer homeHref={home} contactHref="#contacto" tools={<SiteTools country={country} placement="footer" />} />,
      }}
    />
  )
}
