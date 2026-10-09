import { getTranslations } from 'next-intl/server'
import { Footer } from '@/components/site/Footer'
import { Header } from '@/components/site/Header'
import { HomeView, homeNav } from '@/components/site/HomeView'
import { getStaticHome } from '@/lib/content/static'

export default async function Home() {
  const t = await getTranslations('nav')
  const nav = homeNav(t)
  const data = getStaticHome({ event: slug => `/evento/${slug}`, products: '#productos' })
  return (
    <HomeView
      data={data}
      countryCode="mx"
      areasHref="#areas"
      chrome={{
        header: <Header logoHref="/" links={nav.links} cta={nav.cta} />,
        footer: <Footer homeHref="/" contactHref="#contacto" />,
      }}
    />
  )
}
