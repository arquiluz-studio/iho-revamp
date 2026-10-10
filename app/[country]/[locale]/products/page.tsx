import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { EmptyNote, PageHero, PageShell, SectionHeading } from '@/components/site/pages/PageParts'
import { ProductCard } from '@/components/site/ProductCard'
import { innerChrome } from '@/components/site/SiteChrome'
import { sitePaths } from '@/lib/content/paths'
import { toProductCardVM } from '@/lib/content/site'
import { t } from '@/lib/i18n-fields'
import { getCatalog } from '@/lib/queries/catalog'
import { getBusinessLines } from '@/lib/queries/site'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, type SiteParams } from '@/lib/site-params'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<SiteParams> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const tp = await getTranslations({ locale, namespace: 'pages.products' })
  return { title: `${tp('title').replace(/\n/g, ' ')} — IHO`, alternates: buildAlternates({ href: '/products', country, locale }) }
}

export default async function ProductsPage({ params }: { params: Promise<SiteParams> }) {
  const { country, locale } = await resolveSiteParams(params)
  const paths = sitePaths(locale)
  const [tp, catalog, lines, chrome] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.products' }),
    getCatalog(country),
    getBusinessLines(),
    innerChrome(country, locale, paths),
  ])
  const groups = [
    ...lines.map(l => ({ key: l.id, label: t(l, 'name', locale), products: catalog.filter(p => p.business_line?.id === l.id) })),
    { key: 'other', label: tp('all'), products: catalog.filter(p => !p.business_line || !lines.some(l => l.id === p.business_line?.id)) },
  ].filter(g => g.products.length)
  const firstCard = catalog[0] && toProductCardVM(catalog[0], locale, country, paths)

  return (
    <PageShell chrome={chrome}>
      <PageHero label={tp('label')} title={tp('title')} image={firstCard?.image} />
      {groups.length ? (
        groups.map((g, i) => (
          <section key={g.key} className="iho-page-section" style={i ? { paddingTop: 0 } : undefined}>
            <SectionHeading label={`— ${g.label.toUpperCase()}`} />
            <div className="iho-product-grid">
              {g.products.map(p => (
                <ProductCard key={p.id} product={toProductCardVM(p, locale, country, paths)} showCategory />
              ))}
            </div>
          </section>
        ))
      ) : (
        <section className="iho-page-section">
          <EmptyNote>{tp('empty')}</EmptyNote>
        </section>
      )}
    </PageShell>
  )
}
