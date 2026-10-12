import type { Metadata } from 'next'
import { HomeView } from '@/components/site/HomeView'
import { siteChrome } from '@/components/site/SiteChrome'
import { sitePaths } from '@/lib/content/paths'
import { getHomeVM } from '@/lib/content/site'
import { resolveHomeRecord } from '@/lib/content/page-hero'
import { t } from '@/lib/i18n-fields'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, type SiteParams } from '@/lib/site-params'

/** Hourly so the timeline's past/upcoming split follows the clock even without content changes. */
export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<SiteParams> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const home = await resolveHomeRecord(country)
  return {
    title: t(home, 'seo_title', locale) || undefined,
    description: t(home, 'seo_description', locale) || undefined,
    alternates: buildAlternates({ href: '/', country, locale }),
  }
}

export default async function HomePage({ params }: { params: Promise<SiteParams> }) {
  const { country, locale } = await resolveSiteParams(params)
  const paths = sitePaths(locale)
  const [data, chrome] = await Promise.all([
    getHomeVM(country, locale, paths),
    siteChrome({ country, locale, paths, contactHref: '#contacto' }),
  ])
  return <HomeView data={data} countryCode={country} solutionsHref={paths.solutions} chrome={chrome} />
}
