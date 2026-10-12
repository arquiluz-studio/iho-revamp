import type { Metadata } from 'next'
import { ContentHero } from '@/components/site/pages/ContentHero'
import { PageShell } from '@/components/site/pages/PageParts'
import { ShopBrowser, type ShopProduct } from '@/components/site/ShopBrowser'
import { innerChrome } from '@/components/site/SiteChrome'
import { heroDocumentTitle, resolvePageHero } from '@/lib/content/page-hero'
import { sitePaths } from '@/lib/content/paths'
import { facetSlug, parseShopQuery } from '@/lib/content/shop-query'
import { toProductCardVM } from '@/lib/content/site'
import { localSlug, t } from '@/lib/i18n-fields'
import { getCatalog } from '@/lib/queries/catalog'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, type SiteParams } from '@/lib/site-params'

export const revalidate = 3600

type SearchParams = Record<string, string | string[] | undefined>

export async function generateMetadata({ params }: { params: Promise<SiteParams> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const hero = await resolvePageHero(country, 'products', locale)
  return { title: heroDocumentTitle(hero.title), alternates: buildAlternates({ href: '/products', country, locale }) }
}

export default async function ProductsPage({ params, searchParams }: { params: Promise<SiteParams>; searchParams: Promise<SearchParams> }) {
  const { country, locale } = await resolveSiteParams(params)
  const queryParams = await searchParams
  const paths = sitePaths(locale)
  const [catalog, chrome] = await Promise.all([
    getCatalog(country),
    innerChrome(country, locale, paths),
  ])
  const products: ShopProduct[] = catalog.map((product, order) => ({
    card: toProductCardVM(product, locale, country, paths),
    name: t(product, 'name', locale),
    brandName: product.catalogBrandName,
    brandKey: facetSlug(product.catalogBrandName),
    designers: product.designers.map(designer => ({ key: designer.slug, label: designer.name })),
    line: product.business_line ? { key: localSlug(product.business_line, locale), label: t(product.business_line, 'name', locale) } : null,
    spaces: product.sectors.map(space => ({ key: localSlug(space, locale), label: t(space, 'name', locale) })),
    priceAmount: product.is_purchasable && product.price?.amount != null ? product.price.amount : null,
    order,
  }))

  const hero = await resolvePageHero(country, 'products', locale)
  return (
    <PageShell chrome={chrome} hero={hero.enabled}>
      <ContentHero hero={hero} />
      <ShopBrowser products={products} query={parseShopQuery(queryParams)} params={queryParams} />
    </PageShell>
  )
}
