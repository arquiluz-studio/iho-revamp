import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { HomeView, homeNav } from '@/components/site/HomeView'
import { siteChrome } from '@/components/site/SiteChrome'
import { sitePaths } from '@/lib/content/paths'
import { getHomeVM } from '@/lib/content/site'
import { t } from '@/lib/i18n-fields'
import { getCountrySettings } from '@/lib/queries/site'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, type SiteParams } from '@/lib/site-params'

/** Hourly so the timeline's past/upcoming split follows the clock even without content changes. */
export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<SiteParams> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const settings = await getCountrySettings(country)
  return {
    title: t(settings, 'seo_title', locale) || undefined,
    description: t(settings, 'seo_description', locale) || undefined,
    alternates: buildAlternates({ href: '/', country, locale }),
  }
}

export default async function HomePage({ params }: { params: Promise<SiteParams> }) {
  const { country, locale } = await resolveSiteParams(params)
  const tn = await getTranslations('nav')
  const nav = homeNav(tn)
  const paths = sitePaths(locale)
  const [data, chrome] = await Promise.all([
    getHomeVM(country, locale, paths),
    siteChrome({ country, locale, paths, links: nav.links, cta: nav.cta, contactHref: '#contacto' }),
  ])
  return <HomeView data={data} countryCode={country} areasHref="#areas" chrome={chrome} />
}
