import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { BrandLogos, Chips, HeroExtra, PageHero, PageShell } from '@/components/site/pages/PageParts'
import { innerChrome } from '@/components/site/SiteChrome'
import { resolvePageHero } from '@/lib/content/page-hero'
import { sitePaths } from '@/lib/content/paths'
import { toBrandVM } from '@/lib/content/site'
import { localSlug, t } from '@/lib/i18n-fields'
import { getCountryBrands } from '@/lib/queries/brands'
import { getBusinessLines } from '@/lib/queries/site'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, type SiteParams } from '@/lib/site-params'

export async function generateMetadata({ params }: { params: Promise<SiteParams> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const [tp, th] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.brands' }),
    getTranslations({ locale, namespace: 'home.brands' }),
  ])
  const hero = await resolvePageHero(country, 'brands', locale, { label: tp('label'), title: tp('title'), intro: th('intro') })
  return { title: `${hero.title.replace(/\n/g, ' ')} — IHO`, alternates: buildAlternates({ href: '/brands', country, locale }) }
}

export default async function BrandsPage({ params }: { params: Promise<SiteParams> }) {
  const { country, locale } = await resolveSiteParams(params)
  const paths = sitePaths(locale)
  const [tp, th, brands, lines, chrome] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.brands' }),
    getTranslations({ locale, namespace: 'home.brands' }),
    getCountryBrands(country),
    getBusinessLines(),
    innerChrome(country, locale, paths),
  ])
  const hero = await resolvePageHero(country, 'brands', locale, { label: tp('label'), title: tp('title'), intro: th('intro') })
  return (
    <PageShell chrome={chrome}>
      <PageHero label={hero.label} title={hero.title} intro={hero.intro} image={hero.image}>
        {hero.extra && <HeroExtra>{hero.extra}</HeroExtra>}
        <div style={{ marginTop: 32 }} className="iho-chips-dark">
          <Chips links={lines.map(l => ({ href: paths.solution(localSlug(l, locale)), label: t(l, 'name', locale) }))} />
        </div>
      </PageHero>
      <section className="iho-page-section">
        <BrandLogos brands={brands.map(b => toBrandVM(b, locale, paths))} />
      </section>
    </PageShell>
  )
}
