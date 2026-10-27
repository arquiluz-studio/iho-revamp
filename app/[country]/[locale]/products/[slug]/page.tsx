import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { ContactForm } from '@/components/site/ContactForm'
import { Chips, Facts, PageShell, Prose, SectionHeading } from '@/components/site/pages/PageParts'
import { ProductCard } from '@/components/site/ProductCard'
import { innerChrome } from '@/components/site/SiteChrome'
import { MediaImage } from '@/components/ui/MediaImage'
import { localeHrefs, sitePaths } from '@/lib/content/paths'
import { imageOf, priceLabels, productShot, toProductCardVM } from '@/lib/content/site'
import { localSlug, paragraphs, t } from '@/lib/i18n-fields'
import { getCatalog, getProductBySlug } from '@/lib/queries/catalog'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, siteStaticParams, type SiteParams } from '@/lib/site-params'

type Params = SiteParams & { slug: string }

export const revalidate = 3600

export async function generateStaticParams() {
  const params = siteStaticParams()
  const catalogs = new Map(await Promise.all([...new Set(params.map(p => p.country))].map(async c => [c, await getCatalog(c)] as const)))
  return params.flatMap(p => (catalogs.get(p.country) ?? []).map(product => ({ ...p, slug: localSlug(product, p.locale) })))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const { slug } = await params
  const product = await getProductBySlug(country, slug, locale)
  if (!product) return {}
  return {
    title: `${t(product, 'name', locale)} · ${product.brand?.name ?? product.catalogBrandName} — IHO`,
    description: t(product, 'description', locale).slice(0, 160) || undefined,
    alternates: buildAlternates({ href: l => ({ pathname: '/products/[slug]', params: { slug: localSlug(product, l) } }), country, locale, availableIn: [country] }),
  }
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { country, locale } = await resolveSiteParams(params)
  const { slug } = await params
  const paths = sitePaths(locale)
  const product = await getProductBySlug(country, slug, locale)
  if (!product) notFound()
  if (localSlug(product, locale) !== slug) permanentRedirect(paths.product(localSlug(product, locale)))
  const [catalog, tp, chrome] = await Promise.all([
    getCatalog(country),
    getTranslations({ locale, namespace: 'pages.products' }),
    innerChrome(country, locale, paths, localeHrefs(l => ({ pathname: '/products/[slug]', params: { slug: localSlug(product, l) } }))),
  ])

  const name = t(product, 'name', locale)
  const brandName = product.brand?.name ?? product.catalogBrandName
  const cover = productShot(product, locale, name, 'lg') ?? imageOf(null, locale, name, null, 'lg')
  const mainId = product.cover?.id ?? [...product.gallery].sort((a, b) => a.sort - b.sort).find(item => item.media)?.media?.id
  const gallery = product.gallery.flatMap(item => (item.media && item.media.id !== mainId ? [imageOf(item.media, locale, name, null, 'md')] : []))
  const labels = product.is_purchasable ? priceLabels(product.price, locale, country) : null
  const availability = product.lead_time_days ? tp('leadTime', { days: product.lead_time_days }) : tp('onRequest')
  const variants = product.variants.length > 1 ? product.variants : []
  const related = catalog.filter(p => p.id !== product.id && p.catalogBrandId === product.catalogBrandId).slice(0, 4)
  const chips = [
    ...(product.business_line ? [{ href: paths.solution(localSlug(product.business_line, locale)), label: t(product.business_line, 'name', locale) }] : []),
    ...product.sectors.map(s => ({ href: paths.space(localSlug(s, locale)), label: t(s, 'name', locale) })),
  ]

  return (
    <PageShell chrome={chrome} hero={false}>
      <section className="iho-product-buy">
        <div className="iho-product-detail">
          <div>
            <div className="iho-product-photo">
              <MediaImage image={cover} priority sizes="(max-width: 1024px) 100vw, 55vw" />
            </div>
            {gallery.length > 0 && (
              <div className="iho-gallery-grid iho-product-gallery">
                {gallery.map(img => (
                  <div key={img.src} className="iho-product-photo">
                    <MediaImage image={img} sizes="(max-width: 768px) 100vw, 28vw" />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="iho-product-buy-col">
            <div className="iho-product-intro">
              {product.brand ? (
                <a className="iho-product-brand" href={paths.brand(product.brand.slug)}>
                  {product.brand.name}
                </a>
              ) : (
                <p className="iho-product-brand">{brandName}</p>
              )}
              <h1>{name}</h1>
              {product.designers.length > 0 && (
                <p className="iho-product-designer">
                  {tp('designedBy')}{' '}
                  {product.designers.map((designer, index) => (
                    <span key={designer.id}>
                      {index > 0 && ', '}
                      <a href={paths.designer(designer.slug)}>{designer.name}</a>
                    </span>
                  ))}
                </p>
              )}
              {chips.length > 0 && <Chips links={chips} />}
            </div>
            <div className="iho-product-offer">
              {labels && <p className="iho-product-price">{product.multiplePrices ? tp('from', { price: labels.price }) : labels.price}</p>}
              <p className="iho-product-availability">{availability}</p>
            </div>
            <div id="cotizar" className="iho-product-inquiry">
              <h2>{tp('inquiryTitle')}</h2>
              <ContactForm
                countryCode={country}
                inquiry={{
                  productId: product.id,
                  message: tp('inquiryMessage', { product: `${name} (${brandName})` }),
                  submitLabel: tp('inquiry'),
                  successText: tp('inquirySent'),
                }}
              />
            </div>
            <Prose paragraphs={paragraphs(t(product, 'description', locale))} />
            <Facts items={product.specs.map(spec => ({ label: t(spec, 'label', locale), value: spec.value }))} />
            {variants.length > 0 && (
              <div>
                <SectionHeading label={`— ${tp('variants').toUpperCase()}`} />
                <ul className="iho-product-variants">
                  {variants.map(variant => {
                    const variantLabels = product.is_purchasable ? priceLabels(variant.offer, locale, country) : null
                    return (
                      <li key={variant.id}>
                        <span>
                          {t(variant, 'name', locale)}
                          {variant.sku && <span className="is-sku"> · {variant.sku}</span>}
                        </span>
                        {variantLabels && <span>{variantLabels.price}</span>}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
      {related.length > 0 && (
        <section className="iho-page-section" style={{ paddingTop: 0 }}>
          <SectionHeading label={`— ${brandName.toUpperCase()}`} />
          <div className="iho-product-grid">
            {related.map(p => (
              <ProductCard key={p.id} product={toProductCardVM(p, locale, country, paths)} showCategory />
            ))}
          </div>
        </section>
      )}
    </PageShell>
  )
}
