import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { BrandProfile } from '@/components/site/BrandProfile'
import { PageShell } from '@/components/site/pages/PageParts'
import { innerChrome } from '@/components/site/SiteChrome'
import { sitePaths } from '@/lib/content/paths'
import { imageOf, imageOrNull, priceLabels, productShot, usageHover } from '@/lib/content/site'
import { localSlug, paragraphs, t } from '@/lib/i18n-fields'
import { getBrandMedia, getCountryBrand, getCountryBrands } from '@/lib/queries/brands'
import { getCatalog } from '@/lib/queries/catalog'
import { getDesigners } from '@/lib/queries/designers'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, siteStaticParams, type SiteParams } from '@/lib/site-params'

type Params = SiteParams & { slug: string }

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export async function generateStaticParams() {
  const params = siteStaticParams()
  const slugs = new Map(await Promise.all([...new Set(params.map(p => p.country))].map(async c => [c, (await getCountryBrands(c)).map(b => b.slug)] as const)))
  return params.flatMap(p => (slugs.get(p.country) ?? []).map(slug => ({ ...p, slug })))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const { slug } = await params
  const brand = await getCountryBrand(country, slug)
  if (!brand) return {}
  return {
    title: `${brand.name} — IHO`,
    description: t(brand, 'description', locale).slice(0, 160) || undefined,
    alternates: buildAlternates({ href: { pathname: '/brands/[slug]', params: { slug } }, country, locale, availableIn: [country] }),
  }
}

export default async function BrandPage({ params }: { params: Promise<Params> }) {
  const { country, locale } = await resolveSiteParams(params)
  const { slug } = await params
  const paths = sitePaths(locale)
  const brand = await getCountryBrand(country, slug)
  if (!brand) notFound()
  const [catalog, designers, inspiration, tp, td, tc, chrome] = await Promise.all([
    getCatalog(country),
    getDesigners(),
    getBrandMedia(brand.id),
    getTranslations({ locale, namespace: 'pages.brands' }),
    getTranslations({ locale, namespace: 'pages.designers' }),
    getTranslations({ locale, namespace: 'common' }),
    innerChrome(country, locale, paths),
  ])
  const products = catalog.filter(product => product.brand?.id === brand.id)
  const designerIds = new Set(products.flatMap(product => product.designers.map(designer => designer.id)))
  const related = designers.filter(designer => designerIds.has(designer.id))
  const lines = brand.business_lines.flatMap(link => (link.business_line ? [link.business_line] : []))
  const cover = imageOrNull(brand.cover, locale, brand.name, null, 'lg')
  const pieces = products.map(product => {
    const name = t(product, 'name', locale)
    const labels = product.is_purchasable ? priceLabels(product.price, locale, country) : null
    const image = productShot(product, locale, name, 'md')
    const hover = usageHover(product, locale, name, 'md')
    return {
      key: product.id,
      name,
      href: paths.product(localSlug(product, locale)),
      price: labels?.price ?? null,
      image: image ? { ...image, color: null, placeholder: null } : null,
      hover: hover ? { ...hover, color: null, placeholder: null } : null,
    }
  })
  const photos = inspiration.flatMap(item => {
    if (!item.media) return []
    const caption = t(item, 'caption', locale)
    return [{ key: item.media.id, image: imageOf(item.media, locale, caption || brand.name, null, 'lg'), caption: caption || undefined }]
  })
  return (
    <PageShell chrome={chrome}>
      <BrandProfile
        brandsLabel={tp('label')}
        name={brand.name}
        description={paragraphs(t(brand, 'description', locale))}
        website={brand.website_url ? { href: brand.website_url, label: hostOf(brand.website_url) } : null}
        websiteLabel={tp('website')}
        exclusive={brand.is_exclusive ? tp('exclusive') : null}
        solutions={lines.map(line => ({ href: paths.solution(localSlug(line, locale)), label: t(line, 'name', locale) }))}
        cover={cover ? { ...cover, color: null, placeholder: null } : null}
        originLabel={tp('origin')}
        origin={t(brand, 'origin_country', locale) || undefined}
        collaboratorsLabel={tp('collaborators')}
        designers={related.map(designer => ({
          slug: designer.slug,
          name: designer.name,
          href: paths.designer(designer.slug),
        }))}
        photos={photos}
        previousLabel={tc('previous')}
        nextLabel={tc('next')}
        inspirationLabel={tp('inspiration')}
        productsTitle={tp('products')}
        pricePending={td('pricePending')}
        imagePending={td('imagePending')}
        detailLabel={td('detail')}
        pieces={pieces}
      />
    </PageShell>
  )
}
