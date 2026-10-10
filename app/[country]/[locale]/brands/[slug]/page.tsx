import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Chips, Facts, PageHero, PageShell, ProjectCards, Prose, SectionHeading } from '@/components/site/pages/PageParts'
import { innerChrome } from '@/components/site/SiteChrome'
import { MediaImage } from '@/components/ui/MediaImage'
import { sitePaths } from '@/lib/content/paths'
import { toBrandVM, toProjectCardVM } from '@/lib/content/site'
import { localSlug, paragraphs, t } from '@/lib/i18n-fields'
import { getCountryBrand, getCountryBrands } from '@/lib/queries/brands'
import { getProjects } from '@/lib/queries/projects'
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
  const [brand, tp, chrome] = await Promise.all([
    getCountryBrand(country, slug),
    getTranslations({ locale, namespace: 'pages.brands' }),
    innerChrome(country, locale, paths),
  ])
  if (!brand) notFound()
  const projects = await getProjects(country, { brandId: brand.id })
  const vm = toBrandVM(brand, locale)
  const lines = brand.business_lines.flatMap(b => (b.business_line ? [b.business_line] : []))

  return (
    <PageShell chrome={chrome}>
      <PageHero label={tp('label')} title={brand.name}>
        {lines.length > 0 && (
          <div style={{ marginTop: 28 }} className="iho-chips-dark">
            <Chips links={lines.map(l => ({ href: paths.area(localSlug(l, locale)), label: t(l, 'name', locale) }))} />
          </div>
        )}
      </PageHero>
      <section className="iho-page-section">
        <div className="iho-detail-grid">
          <div>
            <div style={{ height: 160, display: 'flex', alignItems: 'center', marginBottom: 36 }}>
              <MediaImage image={vm.logo} alt={brand.name} style={{ maxHeight: vm.thin ? 150 : 90, maxWidth: 360, width: 'auto', height: 'auto', objectFit: 'contain' }} />
            </div>
            <Prose paragraphs={paragraphs(t(brand, 'description', locale))} />
          </div>
          <Facts
            items={[
              { label: tp('website'), value: brand.website_url && <a href={brand.website_url} target="_blank" rel="noopener noreferrer" style={{ color: '#ef483d', textDecoration: 'none' }}>{hostOf(brand.website_url)}</a> },
              { label: tp('exclusive'), value: brand.is_exclusive ? '✓' : null },
              { label: tp('origin'), value: brand.origin_country },
            ]}
          />
        </div>
      </section>
      {projects.length > 0 && (
        <section className="iho-page-section" style={{ paddingTop: 0 }}>
          <SectionHeading label={`— ${tp('projects').toUpperCase()}`} />
          <ProjectCards projects={projects.map(p => toProjectCardVM(p, locale, paths))} />
        </section>
      )}
    </PageShell>
  )
}
