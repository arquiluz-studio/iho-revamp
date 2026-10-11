import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Chips, EventRow, Facts, PageHero, PageShell, Prose, SectionHeading } from '@/components/site/pages/PageParts'
import { ProductCard } from '@/components/site/ProductCard'
import { innerChrome } from '@/components/site/SiteChrome'
import { MediaImage } from '@/components/ui/MediaImage'
import { MONO } from '@/components/ui/tokens'
import { sitePaths } from '@/lib/content/paths'
import { designerYears, getDesignerEventsVM, imageOf, toProductCardVM } from '@/lib/content/site'
import { paragraphs, t } from '@/lib/i18n-fields'
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
  const [designer, catalog, tp, chrome] = await Promise.all([
    getDesigner(slug),
    getCatalog(country),
    getTranslations({ locale, namespace: 'pages.designers' }),
    innerChrome(country, locale, paths),
  ])
  if (!designer) notFound()

  const events = await getDesignerEventsVM(country, locale, paths, designer.id)
  const upcoming = events.filter(e => !e.isPast)
  const past = events.filter(e => e.isPast).reverse()
  const products = catalog.filter(p => p.designers.some(d => d.id === designer.id))
  const brands = [...new Map(products.flatMap(p => (p.brand ? [[p.brand.id, p.brand] as const] : []))).values()]
  const years = designerYears(designer, year => tp('born', { year }))
  const nationality = t(designer, 'nationality', locale)
  const portrait = designer.portrait ? imageOf(designer.portrait, locale, designer.name, null, 'md') : null
  const cover = designer.cover ? imageOf(designer.cover, locale, designer.name, null, 'lg') : null

  return (
    <PageShell chrome={chrome}>
      <PageHero label={tp('single')} title={designer.name} intro={[nationality, years].filter(Boolean).join(' · ') || undefined} image={cover}>
        {brands.length > 0 && (
          <div style={{ marginTop: 28 }} className="iho-chips-dark">
            <Chips links={brands.map(b => ({ href: paths.brand(b.slug), label: b.name }))} />
          </div>
        )}
      </PageHero>
      <section className="iho-page-section">
        <div className="iho-detail-grid">
          <Prose paragraphs={paragraphs(t(designer, 'bio', locale))} />
          <div style={{ display: 'grid', gap: 28 }}>
            {portrait && (
              <div style={{ aspectRatio: '3/4', background: '#f1ece3', borderRadius: 4, overflow: 'hidden' }}>
                <MediaImage image={portrait} sizes="(max-width: 1024px) 100vw, 30vw" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            )}
            <Facts
              items={[
                { label: tp('nationality'), value: nationality },
                { label: tp('years'), value: years },
                {
                  label: tp('website'),
                  value: designer.website_url && (
                    <a href={designer.website_url} target="_blank" rel="noopener noreferrer" style={{ color: '#ef483d', textDecoration: 'none' }}>
                      {hostOf(designer.website_url)}
                    </a>
                  ),
                },
              ]}
            />
            <a href={paths.designers} style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '1.2px', color: '#8a8478', textDecoration: 'none' }}>
              ← {tp('all').toUpperCase()}
            </a>
          </div>
        </div>
      </section>
      {products.length > 0 && (
        <section className="iho-page-section" style={{ paddingTop: 0 }}>
          <SectionHeading label={`— ${tp('products', { name: designer.name }).toUpperCase()}`} />
          <div className="iho-product-grid">
            {products.map(p => (
              <ProductCard key={p.id} product={toProductCardVM(p, locale, country, paths)} showCategory />
            ))}
          </div>
        </section>
      )}
      {events.length > 0 && (
        <section className="iho-page-section" style={{ paddingTop: 0 }}>
          <SectionHeading label={`— ${tp('events').toUpperCase()}`} />
          {[...upcoming, ...past].map(e => (
            <EventRow key={e.slug} event={e} />
          ))}
        </section>
      )}
    </PageShell>
  )
}
