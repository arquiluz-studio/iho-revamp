import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { DesignerProfile } from '@/components/site/DesignerProfile'
import { EventRow, PageShell, SectionHeading } from '@/components/site/pages/PageParts'
import { innerChrome } from '@/components/site/SiteChrome'
import { legacyMedia } from '@/lib/content/legacy-media'
import { sitePaths } from '@/lib/content/paths'
import { designerYears, getDesignerEventsVM, imageOrNull, priceLabels } from '@/lib/content/site'
import { localSlug, paragraphs, t } from '@/lib/i18n-fields'
import { getCountryBrands } from '@/lib/queries/brands'
import { getCatalog } from '@/lib/queries/catalog'
import { getDesigner, getDesigners } from '@/lib/queries/designers'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, siteStaticParams, type SiteParams } from '@/lib/site-params'

type Params = SiteParams & { slug: string }

export const revalidate = 3600

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export async function generateStaticParams() {
  const designers = await getDesigners()
  return siteStaticParams().flatMap(p => designers.map(d => ({ ...p, slug: d.slug })))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const { slug } = await params
  const designer = await getDesigner(slug)
  if (!designer) return {}
  return {
    title: `${designer.name} — IHO`,
    description: t(designer, 'bio', locale).slice(0, 160) || undefined,
    alternates: buildAlternates({ href: { pathname: '/designers/[slug]', params: { slug } }, country, locale }),
  }
}

export default async function DesignerPage({ params }: { params: Promise<Params> }) {
  const { country, locale } = await resolveSiteParams(params)
  const { slug } = await params
  const paths = sitePaths(locale)
  const [designer, catalog, countryBrands, tp, chrome] = await Promise.all([
    getDesigner(slug),
    getCatalog(country),
    getCountryBrands(country),
    getTranslations({ locale, namespace: 'pages.designers' }),
    innerChrome(country, locale, paths),
  ])
  if (!designer) notFound()

  const events = await getDesignerEventsVM(country, locale, paths, designer.id)
  const upcoming = events.filter(e => !e.isPast)
  const past = events.filter(e => e.isPast).reverse()
  const products = catalog.filter(p => p.designers.some(d => d.id === designer.id))
  const brandRows = new Map(countryBrands.map(brand => [brand.id, brand]))
  const brands = [...new Map(products.flatMap(product => (product.brand ? [[product.brand.id, product.brand] as const] : []))).values()].map(brand => {
    const row = brandRows.get(brand.id)
    const logo = row ? imageOrNull(row.logo, locale, brand.name, legacyMedia.brandLogo(brand.slug), 'md') : imageOrNull(null, locale, brand.name, legacyMedia.brandLogo(brand.slug), 'md')
    return {
      slug: brand.slug,
      name: brand.name,
      href: paths.brand(brand.slug),
      thin: row?.logo_is_thin,
      logo: logo ? { ...logo, color: null, placeholder: null } : null,
    }
  })
  const pieces = products.map(product => {
    const name = t(product, 'name', locale)
    const labels = product.is_purchasable ? priceLabels(product.price, locale, country) : null
    const image = imageOrNull(product.cover, locale, name, legacyMedia.productCover(product.slug), 'md')
    return {
      key: product.id,
      name,
      href: paths.product(localSlug(product, locale)),
      price: labels?.price ?? null,
      image: image ? { ...image, color: null, placeholder: null } : null,
    }
  })
  const years = designerYears(designer, year => tp('born', { year }))
  const nationality = t(designer, 'nationality', locale)
  const portrait = imageOrNull(designer.portrait ?? designer.cover, locale, designer.name, null, 'lg')

  return (
    <PageShell chrome={chrome} hero={false}>
      <DesignerProfile
        designersHref={paths.designers}
        designersLabel={tp('heading')}
        name={designer.name}
        kicker={[nationality, years].filter(Boolean).join(' · ') || tp('role')}
        bio={paragraphs(t(designer, 'bio', locale))}
        website={designer.website_url ? { href: designer.website_url, label: hostOf(designer.website_url) } : null}
        portrait={portrait ? { ...portrait, color: null, placeholder: null } : null}
        photoPending={tp('photoPending')}
        exploreLabel={tp('explore')}
        brandsLabel={tp('brandsLabel')}
        collaborationsTitle={tp('collaborations')}
        collaborationsIntro={tp('collaborationsIntro', { name: designer.name })}
        piecesLabel={tp('piecesLabel')}
        piecesTitle={tp('pieces')}
        piecesIntro={tp('piecesIntro')}
        pricePending={tp('pricePending')}
        imagePending={tp('imagePending')}
        detailLabel={tp('detail')}
        brands={brands}
        pieces={pieces}
      />
      {events.length > 0 && (
        <section className="iho-page-section" style={{ paddingTop: 0 }}>
          <SectionHeading label={`— ${tp('events').toUpperCase()}`} />
          {[...upcoming, ...past].map(event => (
            <EventRow key={event.slug} event={event} />
          ))}
        </section>
      )}
    </PageShell>
  )
}
