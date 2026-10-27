import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { BrandDirectory } from '@/components/site/BrandDirectory'
import { PageShell } from '@/components/site/pages/PageParts'
import { innerChrome } from '@/components/site/SiteChrome'
import { legacyMedia } from '@/lib/content/legacy-media'
import { heroDocumentTitle, resolvePageHero } from '@/lib/content/page-hero'
import { sitePaths } from '@/lib/content/paths'
import { imageOrNull } from '@/lib/content/site'
import { t } from '@/lib/i18n-fields'
import { getCountryBrands } from '@/lib/queries/brands'
import { getBusinessLines } from '@/lib/queries/site'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, type SiteParams } from '@/lib/site-params'

export async function generateMetadata({ params }: { params: Promise<SiteParams> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const hero = await resolvePageHero(country, 'brands', locale)
  return { title: heroDocumentTitle(hero.title), alternates: buildAlternates({ href: '/brands', country, locale }) }
}

export default async function BrandsPage({ params }: { params: Promise<SiteParams> }) {
  const { country, locale } = await resolveSiteParams(params)
  const paths = sitePaths(locale)
  const [tp, brands, lines, chrome] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.brands' }),
    getCountryBrands(country),
    getBusinessLines(),
    innerChrome(country, locale, paths),
  ])
  const directory = brands.map(brand => {
    const logo = imageOrNull(brand.logo, locale, brand.name, legacyMedia.brandLogo(brand.slug), 'md')
    return {
      slug: brand.slug,
      name: brand.name,
      href: paths.brand(brand.slug),
      thin: brand.logo_is_thin,
      logo: logo ? { ...logo, color: null, placeholder: null } : null,
      lines: brand.business_lines.flatMap(link => (link.business_line?.slug ? [link.business_line.slug] : [])),
    }
  })
  const filters = lines.flatMap(line =>
    directory.some(brand => brand.lines.includes(line.slug)) ? [{ slug: line.slug, label: t(line, 'name', locale) }] : [],
  )

  return (
    <PageShell chrome={chrome} hero={false}>
      <BrandDirectory
        label={tp('label')}
        title={tp('heading')}
        intro={tp('intro')}
        brands={directory}
        filters={filters}
        locale={locale}
        lettersLabel={tp('letters')}
        searchLabel={tp('search')}
        allLabel={tp('all')}
        emptyLabel={tp('empty')}
        noMatchLabel={tp('noMatch')}
      />
    </PageShell>
  )
}
