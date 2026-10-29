import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { FitSection } from '@/components/site/SolutionView'
import { SpaceView, type SpaceStory } from '@/components/site/SpaceView'
import { Chips, EmptyNote, PageHero, PageShell, ProjectCards, Prose, SectionHeading } from '@/components/site/pages/PageParts'
import { innerChrome } from '@/components/site/SiteChrome'
import { legacyMedia } from '@/lib/content/legacy-media'
import { copyText, parseSpacePage, spacePageMediaIds, type Copy, type SpacePageContent } from '@/lib/content/space-page'
import { solutionsForSpace } from '@/lib/content/solution-fits'
import { localeHrefs, sitePaths } from '@/lib/content/paths'
import { imageOf, imageOrNull, toBrandVM, toProjectCardVM } from '@/lib/content/site'
import { localSlug, paragraphs, pickBySlug, t } from '@/lib/i18n-fields'
import { toImageVM, type MediaRef } from '@/lib/media'
import { getCountryBrands } from '@/lib/queries/brands'
import { getProjects } from '@/lib/queries/projects'
import { getBusinessLines, getSectors, getSolutionMedia, getSolutionSpaceFits } from '@/lib/queries/site'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, siteStaticParams, type SiteParams } from '@/lib/site-params'

type Params = SiteParams & { sector: string }

export async function generateStaticParams() {
  const sectors = await getSectors()
  return siteStaticParams().flatMap(p => sectors.map(s => ({ ...p, sector: localSlug(s, p.locale) })))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const { sector } = await params
  const row = pickBySlug(await getSectors(), sector, locale)
  if (!row) return {}
  return {
    title: `${t(row, 'name', locale)} — IHO`,
    description: t(row, 'description', locale) || undefined,
    alternates: buildAlternates({ href: l => ({ pathname: '/spaces/[sector]', params: { sector: localSlug(row, l) } }), country, locale }),
  }
}

export default async function SpacePage({ params }: { params: Promise<Params> }) {
  const { country, locale } = await resolveSiteParams(params)
  const { sector } = await params
  const paths = sitePaths(locale)
  const sectors = await getSectors()
  const row = pickBySlug(sectors, sector, locale)
  if (!row) notFound()
  if (localSlug(row, locale) !== sector) permanentRedirect(paths.space(localSlug(row, locale)))
  const chrome = await innerChrome(country, locale, paths, localeHrefs(l => ({ pathname: '/spaces/[sector]', params: { sector: localSlug(row, l) } })))
  const name = t(row, 'name', locale)
  if (row.slug === 'workspace' || row.slug === 'hospitality') {
    const content = parseSpacePage(row.page_content)
    const [media, projects, countryBrands, lines, fits] = await Promise.all([
      getSolutionMedia(spacePageMediaIds(content)),
      getProjects(country, { sector: row.slug }),
      getCountryBrands(country),
      getBusinessLines(),
      getSolutionSpaceFits(),
    ])
    const images = new Map(media.map(item => [item.id, item]))
    const brandIds = new Set(projects.flatMap(project => project.brands.map(link => link.brand_id)))
    const linkedLines = new Set(fits.filter(fit => fit.sector_id === row.id).map(fit => fit.business_line_id))
    const featured = projects.filter(project => project.is_featured).slice(0, 4)
    return (
      <PageShell chrome={chrome} hero={false}>
        <SpaceView
          story={spaceStory(
            content,
            locale,
            name,
            imageOf(row.cover, locale, name, legacyMedia.sectorCover(row.slug), 'lg'),
            images,
            paths.contact,
            sectors.map(item => ({ href: paths.space(localSlug(item, locale)), label: t(item, 'name', locale) })),
            paths.space(localSlug(row, locale)),
            solutionsForSpace(row, lines, fits, locale, paths)
              .filter(item => linkedLines.has(item.key))
              .map(item => ({ label: item.title, href: item.href })),
            countryBrands.flatMap(brand => {
              if (!brand.is_featured || !brandIds.has(brand.id)) return []
              const card = toBrandVM(brand, locale, paths)
              return [{ name: card.name, href: card.href ?? paths.brand(brand.slug), image: card.logo }]
            }),
            featured.map(project => {
              const title = t(project, 'title', locale)
              const summary = t(project, 'summary', locale).trim()
              return {
                href: paths.project(localSlug(project, locale)),
                caption: title,
                text: summary || project.city || '',
                image: imageOrNull(project.cover, locale, title, legacyMedia.projectCover(project.slug), 'lg'),
              }
            }),
            paths.solutions,
            paths.projects,
          )}
        />
      </PageShell>
    )
  }

  const [tp, tpp, projects, lines, fits] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.spaces' }),
    getTranslations({ locale, namespace: 'pages.projects' }),
    getProjects(country, { sector: row.slug }),
    getBusinessLines(),
    getSolutionSpaceFits(),
  ])

  return (
    <PageShell chrome={chrome}>
      <PageHero label={tp('label')} title={name} image={imageOf(row.cover, locale, name, legacyMedia.sectorCover(row.slug))}>
        <div style={{ marginTop: 32 }} className="iho-chips-dark">
          <Chips links={sectors.map(s => ({ href: paths.space(localSlug(s, locale)), label: t(s, 'name', locale) }))} current={paths.space(localSlug(row, locale))} />
        </div>
      </PageHero>
      {t(row, 'description', locale) && (
        <section className="iho-page-section" style={{ maxWidth: 900 }}>
          <Prose paragraphs={paragraphs(t(row, 'description', locale))} />
        </section>
      )}
      <FitSection
        id="space-solutions"
        label={tp('solutionsLabel')}
        title={tp('solutionsTitle')}
        items={solutionsForSpace(row, lines, fits, locale, paths)}
      />
      <section className="iho-page-section" style={{ paddingTop: 28 }}>
        <SectionHeading label={`— ${tp('projects').toUpperCase()}`} />
        {projects.length ? <ProjectCards projects={projects.map(p => toProjectCardVM(p, locale, paths))} /> : <EmptyNote>{tpp('empty')}</EmptyNote>}
      </section>
    </PageShell>
  )
}

function shot(id: string | null, images: Map<string, MediaRef>, locale: string, alt: string) {
  if (!id) return null
  const media = images.get(id)
  return media ? toImageVM(media, locale, 'lg', alt) : null
}

function spaceStory(
  content: SpacePageContent,
  locale: string,
  name: string,
  hero: SpaceStory['hero'],
  images: Map<string, MediaRef>,
  contactHref: string,
  spaces: SpaceStory['spaces'],
  currentHref: string,
  solutions: SpaceStory['solutions'],
  brands: NonNullable<SpaceStory['brands']>['items'],
  projects: NonNullable<SpaceStory['projects']>['items'],
  solutionsHref: string,
  projectsHref: string,
): SpaceStory {
  const text = (copy: Copy) => copyText(copy, locale).trim()
  const body = (copy: Copy) => paragraphs(text(copy))
  const cards = content.elements.items.flatMap(item => {
    const title = text(item.title)
    const itemText = text(item.text)
    const image = shot(item.imageId, images, locale, title || name)
    return title || itemText || image ? [{ title, text: itemText, image }] : []
  })
  const elementsTitle = text(content.elements.title)
  const elementsEyebrow = text(content.elements.eyebrow)
  const elementsIntro = body(content.elements.intro)
  const steps = content.process.steps.flatMap(step => {
    const title = text(step.title)
    const stepText = text(step.text)
    return title || stepText ? [{ title, text: stepText }] : []
  })
  const processTitle = text(content.process.title)
  const processEyebrow = text(content.process.eyebrow)
  const processIntro = body(content.process.intro)
  const projectTitle = text(content.projects.title)
  const projectEyebrow = text(content.projects.eyebrow)
  const projectIntro = body(content.projects.intro)
  const bannerTitle = text(content.banner.title)
  const bannerText = body(content.banner.text)
  const quoteText = text(content.quote.text)
  const brandsEyebrow = text(content.brands.eyebrow)
  const closeTitle = text(content.close.title)
  const closeEyebrow = text(content.close.eyebrow)
  const closeBody = body(content.close.body)
  const more = (label: string, href: string) => (label ? { href, label } : null)

  return {
    name,
    hero,
    heroIntro: body(content.hero.intro),
    heroCta: text(content.hero.ctaLabel),
    spaces,
    currentHref,
    contactHref,
    intro:
      text(content.intro.eyebrow) || text(content.intro.title) || body(content.intro.body).length || shot(content.intro.imageId, images, locale, name)
        ? {
            eyebrow: text(content.intro.eyebrow),
            title: text(content.intro.title),
            body: body(content.intro.body),
            cta: text(content.intro.ctaLabel),
            image: shot(content.intro.imageId, images, locale, name),
          }
        : null,
    banner: bannerTitle || bannerText.length ? { title: bannerTitle, text: bannerText } : null,
    elements:
      elementsTitle || elementsEyebrow || elementsIntro.length || cards.length
        ? { eyebrow: elementsEyebrow, title: elementsTitle, intro: elementsIntro, items: cards, more: more(text(content.elements.moreLabel), solutionsHref) }
        : null,
    solutions,
    projects:
      projectTitle || projectEyebrow || projectIntro.length || projects.length
        ? { eyebrow: projectEyebrow, title: projectTitle, intro: projectIntro, items: projects, more: more(text(content.projects.moreLabel), projectsHref) }
        : null,
    quote: quoteText ? { text: quoteText, attribution: text(content.quote.attribution) } : null,
    process: processTitle || processEyebrow || processIntro.length || steps.length ? { eyebrow: processEyebrow, title: processTitle, intro: processIntro, steps } : null,
    brands: brands.length ? { eyebrow: brandsEyebrow, items: brands } : null,
    close: closeTitle || closeEyebrow || closeBody.length ? { eyebrow: closeEyebrow, title: closeTitle, body: closeBody, cta: text(content.close.ctaLabel) } : null,
  }
}
