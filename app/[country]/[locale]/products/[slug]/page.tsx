import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { ContactForm } from '@/components/site/ContactForm'
import { Chips, Facts, PageHero, PageShell, Prose, SectionHeading } from '@/components/site/pages/PageParts'
import { ProductCard } from '@/components/site/ProductCard'
import { innerChrome } from '@/components/site/SiteChrome'
import { MediaImage } from '@/components/ui/MediaImage'
import { ACUMIN, MONO } from '@/components/ui/tokens'
import { legacyMedia } from '@/lib/content/legacy-media'
import { localeHrefs, sitePaths } from '@/lib/content/paths'
import { imageOf, priceLabels, toProductCardVM } from '@/lib/content/site'
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
    title: `${t(product, 'name', locale)}${product.brand ? ` · ${product.brand.name}` : ''} — IHO`,
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
  const cover = imageOf(product.cover, locale, name, legacyMedia.productCover(product.slug), 'lg')
  const gallery = product.gallery.flatMap(g => (g.media && g.media.id !== product.cover?.id ? [imageOf(g.media, locale, name, null, 'md')] : []))
  const labels = product.is_purchasable ? priceLabels(product.price, locale, country) : null
  const availability =
    product.stock != null && product.stock > 0
      ? tp('inStock')
      : product.lead_time_days
        ? tp('leadTime', { days: product.lead_time_days })
        : tp('onRequest')
  const variants = product.variants.length > 1 ? product.variants : []
  const related = catalog.filter(p => p.id !== product.id && p.brand?.id === product.brand?.id).slice(0, 4)
  const chips = [
    ...(product.business_line ? [{ href: paths.area(localSlug(product.business_line, locale)), label: t(product.business_line, 'name', locale) }] : []),
    ...product.sectors.map(s => ({ href: paths.space(localSlug(s, locale)), label: t(s, 'name', locale) })),
  ]

  return (
    <PageShell chrome={chrome}>
      <PageHero label={product.brand ? `— ${product.brand.name.toUpperCase()}` : tp('label')} title={name}>
        {chips.length > 0 && (
          <div style={{ marginTop: 28 }} className="iho-chips-dark">
            <Chips links={chips} />
          </div>
        )}
      </PageHero>
      <section className="iho-page-section">
        <div className="iho-product-detail">
          <div>
            <div style={{ aspectRatio: '1/1', background: '#f1ece3', borderRadius: 4, overflow: 'hidden' }}>
              <MediaImage
                image={cover}
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
            {gallery.length > 0 && (
              <div className="iho-gallery-grid" style={{ marginTop: 14 }}>
                {gallery.map((img, i) => (
                  <div key={i} style={{ aspectRatio: '1/1', background: '#f1ece3', borderRadius: 4, overflow: 'hidden' }}>
                    <MediaImage
                      image={img}
                      sizes="(max-width: 768px) 100vw, 28vw"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gap: 30 }}>
            {labels && (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 36, color: '#17150f' }}>
                  {product.multiplePrices ? tp('from', { price: labels.price }) : labels.price}
                </span>
                {labels.compareAt && (
                  <span style={{ fontFamily: MONO, fontSize: 14, color: '#8a8478', textDecoration: 'line-through' }}>{labels.compareAt}</span>
                )}
                {product.price?.priceKind === 'sale' && (
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 11,
                      letterSpacing: '1.2px',
                      color: '#fff',
                      background: '#ef483d',
                      padding: '4px 10px',
                      borderRadius: 20,
                    }}
                  >
                    {tp('sale').toUpperCase()}
                  </span>
                )}
              </div>
            )}
            <Prose paragraphs={paragraphs(t(product, 'description', locale))} />
            <Facts
              items={[
                {
                  label: tp('brand'),
                  value: product.brand && (
                    <a href={paths.brand(product.brand.slug)} style={{ color: '#ef483d', textDecoration: 'none' }}>
                      {product.brand.name}
                    </a>
                  ),
                },
                { label: tp('designer'), value: product.designer },
                { label: tp('availability'), value: availability },
                ...product.specs.map(s => ({ label: t(s, 'label', locale), value: s.value })),
              ]}
            />
            {variants.length > 0 && (
              <div>
                <SectionHeading label={`— ${tp('variants').toUpperCase()}`} />
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
                  {variants.map(v => {
                    const vLabels = product.is_purchasable ? priceLabels(v.offer, locale, country) : null
                    return (
                      <li
                        key={v.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 16,
                          fontFamily: MONO,
                          fontSize: 13,
                          color: '#2c2920',
                          borderBottom: '1px solid rgba(20,18,12,0.12)',
                          paddingBottom: 10,
                        }}
                      >
                        <span>
                          {t(v, 'name', locale)}
                          {v.sku && <span style={{ color: '#8a8478' }}> · {v.sku}</span>}
                        </span>
                        {vLabels && <span>{vLabels.price}</span>}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            <div id="cotizar" style={{ background: '#f1ece3', borderRadius: 4, padding: 28, scrollMarginTop: 96 }}>
              <h2 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 26, textTransform: 'uppercase', margin: '0 0 20px', color: '#17150f' }}>
                {tp('inquiryTitle')}
              </h2>
              <ContactForm
                countryCode={country}
                inquiry={{
                  productId: product.id,
                  message: tp('inquiryMessage', { product: product.brand ? `${name} (${product.brand.name})` : name }),
                  submitLabel: tp('inquiry'),
                  successText: tp('inquirySent'),
                }}
              />
            </div>
          </div>
        </div>
      </section>
      {related.length > 0 && (
        <section className="iho-page-section" style={{ paddingTop: 0 }}>
          <SectionHeading label={`— ${product.brand?.name.toUpperCase() ?? tp('all').toUpperCase()}`} />
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
