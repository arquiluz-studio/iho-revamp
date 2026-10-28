import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { ArchitecturalView, type ArchitecturalStory } from '@/components/site/ArchitecturalView'
import { PageShell } from '@/components/site/pages/PageParts'
import { innerChrome } from '@/components/site/SiteChrome'
import { SolutionView, type SolutionInclude } from '@/components/site/SolutionView'
import { spacesForSolution } from '@/lib/content/solution-fits'
import { copyText, parseSolutionPage, solutionPageMediaIds, type Copy, type SolutionPageContent } from '@/lib/content/solution-page'
import { legacyMedia } from '@/lib/content/legacy-media'
import { localeHrefs, sitePaths } from '@/lib/content/paths'
import { imageOf, imageOrNull, toBrandVM } from '@/lib/content/site'
import { toImageVM, type MediaRef } from '@/lib/media'
import { localSlug, paragraphs, pickBySlug, t } from '@/lib/i18n-fields'
import { getCountryBrands } from '@/lib/queries/brands'
import { getProjects } from '@/lib/queries/projects'
import { getBusinessLines, getSectors, getSolutionMedia, getSolutionSpaceFits } from '@/lib/queries/site'
import { buildAlternates } from '@/lib/seo'
import { resolveSiteParams, siteStaticParams, type SiteParams } from '@/lib/site-params'

type Params = SiteParams & { businessLine: string }

export async function generateStaticParams() {
  const lines = await getBusinessLines()
  return siteStaticParams().flatMap(p => lines.map(l => ({ ...p, businessLine: localSlug(l, p.locale) })))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { country, locale } = await resolveSiteParams(params)
  const { businessLine } = await params
  const line = pickBySlug(await getBusinessLines(), businessLine, locale)
  if (!line) return {}
  return {
    title: `${t(line, 'name', locale)} — IHO`,
    description: t(line, 'description', locale) || undefined,
    alternates: buildAlternates({ href: l => ({ pathname: '/solutions/[businessLine]', params: { businessLine: localSlug(line, l) } }), country, locale }),
  }
}

export default async function SolutionPage({ params }: { params: Promise<Params> }) {
  const { country, locale } = await resolveSiteParams(params)
  const { businessLine } = await params
  const paths = sitePaths(locale)
  const lines = await getBusinessLines()
  const line = pickBySlug(lines, businessLine, locale)
  if (!line) notFound()
  if (localSlug(line, locale) !== businessLine) permanentRedirect(paths.solution(localSlug(line, locale)))

  const chrome = await innerChrome(country, locale, paths, localeHrefs(l => ({ pathname: '/solutions/[businessLine]', params: { businessLine: localSlug(line, l) } })))
  const name = t(line, 'name', locale)
  if (line.slug === 'architectural' || line.slug === 'mobiliario' || line.slug === 'lighting') {
    const content = parseSolutionPage(line.page_content)
    const [media, projects, countryBrands, sectors] = await Promise.all([
      getSolutionMedia(solutionPageMediaIds(content)),
      getProjects(country, { businessLine: line.slug }),
      getCountryBrands(country),
      getSectors(),
    ])
    const images = new Map(media.map(item => [item.id, item]))
    const currentHref = paths.solution(localSlug(line, locale))
    const featured = projects
      .filter(project => project.business_lines.some(link => link.business_line?.slug === line.slug && link.is_featured))
      .slice(0, 4)
      .map(project => {
        const title = t(project, 'title', locale)
        const summary = t(project, 'summary', locale).trim()
        return {
          href: paths.project(localSlug(project, locale)),
          caption: title,
          text: summary || project.city || '',
          image: imageOrNull(project.cover, locale, title, legacyMedia.projectCover(project.slug), 'lg'),
        }
      })
    const featuredBrands = countryBrands.flatMap(brand => {
      const onLine = brand.business_lines.some(link => link.business_line?.slug === line.slug)
      if (!brand.is_featured || !onLine) return []
      const card = toBrandVM(brand, locale, paths)
      return [{ name: card.name, href: card.href ?? paths.brand(brand.slug), image: card.logo }]
    })
    const categories = sectors.map(sector => ({
      label: t(sector, 'name', locale),
      href: paths.space(localSlug(sector, locale)),
    }))
    return (
      <PageShell chrome={chrome} hero={false}>
        <ArchitecturalView
          story={architecturalStory(
            content,
            locale,
            name,
            imageOrNull(line.cover, locale, name, legacyMedia.businessLineCover(line.slug), 'lg'),
            images,
            paths.contact,
            lines.map(item => ({ href: paths.solution(localSlug(item, locale)), label: t(item, 'name', locale) })),
            currentHref,
            categories,
            featuredBrands,
            featured,
          )}
        />
      </PageShell>
    )
  }

  const [tp, projects, sectors, fits] = await Promise.all([
    getTranslations({ locale, namespace: 'pages.solutions' }),
    getProjects(country, { businessLine: line.slug }),
    getSectors(),
    getSolutionSpaceFits(),
  ])
  const hero = imageOf(line.cover, locale, name, legacyMedia.businessLineCover(line.slug), 'lg')
  const featured = projects.filter(project => project.business_lines.some(link => link.business_line?.slug === line.slug && link.is_featured))
  const photos = projects.flatMap(project => {
    const title = t(project, 'title', locale)
    const image = imageOrNull(project.cover, locale, title, legacyMedia.projectCover(project.slug), 'lg')
    return image ? [image] : []
  })
  const catalog = readIncludes(tp.raw(`includes.${line.slug}`))
  const includes: SolutionInclude[] = catalog.map((item, index) => ({
    ...item,
    image: photos.length ? photos[index % photos.length] : hero,
  }))

  return (
    <PageShell chrome={chrome}>
      <SolutionView
        name={name}
        description={paragraphs(t(line, 'description', locale))}
        hero={hero}
        statementImage={photos[0] ?? hero}
        includes={includes}
        spaces={spacesForSolution(line, sectors, fits, locale, paths)}
        spacesLabel={tp('spacesLabel')}
        spacesTitle={tp('spacesTitle')}
        projects={featured.slice(0, 4).map(project => {
          const title = t(project, 'title', locale)
          return {
            key: project.id,
            title,
            href: paths.project(localSlug(project, locale)),
            image: imageOrNull(project.cover, locale, title, legacyMedia.projectCover(project.slug), 'lg'),
            meta: project.city || undefined,
          }
        })}
        quoteHref={paths.contact}
        quoteLabel={tp('quote')}
        statementTitle={tp('statementTitle')}
        includesLabel={tp('includesLabel')}
        includesTitle={tp('includesTitle')}
        projectsLabel={tp('projectsLabel')}
        projectsTitle={tp('projectsTitle')}
        allProjectsHref={paths.projects}
        allProjectsLabel={tp('allProjects')}
        closeTitle={tp('closeTitle')}
        closeBody={tp('closeBody')}
      />
    </PageShell>
  )
}

function shot(id: string | null, images: Map<string, MediaRef>, locale: string, alt: string) {
  if (!id) return null
  const row = images.get(id)
  return row ? toImageVM(row, locale, 'lg', alt) : null
}

function architecturalStory(
  content: SolutionPageContent,
  locale: string,
  name: string,
  hero: ArchitecturalStory['hero'],
  images: Map<string, MediaRef>,
  contactHref: string,
  lines: ArchitecturalStory['lines'],
  currentHref: string,
  categories: ArchitecturalStory['categories'],
  brands: NonNullable<ArchitecturalStory['brands']>['items'],
  projects: ArchitecturalStory['gallery']['items'],
): ArchitecturalStory {
  const text = (copy: Copy) => copyText(copy, locale).trim()
  const body = (copy: Copy) => paragraphs(text(copy))
  const introImage = shot(content.intro.imageId, images, locale, name)
  const intro = {
    eyebrow: text(content.intro.eyebrow),
    title: text(content.intro.title),
    body: body(content.intro.body),
    cta: text(content.intro.ctaLabel),
    image: introImage,
  }
  const cards = content.elements.items.flatMap(item => {
    const title = text(item.title)
    const itemText = text(item.text)
    const image = shot(item.imageId, images, locale, title || name)
    return title || itemText || image ? [{ title, text: itemText, image }] : []
  })
  const elementsTitle = text(content.elements.title)
  const elementsEyebrow = text(content.elements.eyebrow)
  const elementsIntro = body(content.elements.intro)
  const spacesImage = shot(content.spaces.imageId, images, locale, name)
  const spaces = {
    eyebrow: text(content.spaces.eyebrow),
    title: text(content.spaces.title),
    body: body(content.spaces.body),
    image: spacesImage,
  }
  const steps = content.process.steps.flatMap(step => {
    const title = text(step.title)
    const stepText = text(step.text)
    return title || stepText ? [{ title, text: stepText }] : []
  })
  const processTitle = text(content.process.title)
  const processEyebrow = text(content.process.eyebrow)
  const processIntro = body(content.process.intro)
  const quoteText = text(content.quote.text)
  const brandsEyebrow = text(content.brands.eyebrow)
  const galleryEyebrow = text(content.gallery.eyebrow)
  const closeTitle = text(content.close.title)
  const closeEyebrow = text(content.close.eyebrow)
  const closeBody = body(content.close.body)
  const closeCta = text(content.close.ctaLabel)
  return {
    name,
    hero,
    heroEyebrow: text(content.hero.eyebrow),
    heroIntro: body(content.hero.intro),
    heroCta: text(content.hero.ctaLabel),
    lines,
    currentHref,
    contactHref,
    intro: intro.eyebrow || intro.title || intro.body.length || intro.cta || intro.image ? intro : null,
    banner: text(content.banner.text),
    elements: elementsEyebrow || elementsTitle || elementsIntro.length || cards.length ? { eyebrow: elementsEyebrow, title: elementsTitle, intro: elementsIntro, items: cards } : null,
    categories,
    spaces: spaces.eyebrow || spaces.title || spaces.body.length || spaces.image ? spaces : null,
    process: processEyebrow || processTitle || processIntro.length || steps.length ? { eyebrow: processEyebrow, title: processTitle, intro: processIntro, steps } : null,
    quote: quoteText ? { text: quoteText, attribution: text(content.quote.attribution) } : null,
    brands: brands.length ? { eyebrow: brandsEyebrow, items: brands } : null,
    gallery: { eyebrow: galleryEyebrow, items: projects },
    close: closeEyebrow || closeTitle || closeBody.length || closeCta ? { eyebrow: closeEyebrow, title: closeTitle, body: closeBody, cta: closeCta } : null,
  }
}

function readIncludes(value: unknown): { title: string; text: string }[] {
  if (!Array.isArray(value)) return []
  return value.flatMap(item => {
    if (!item || typeof item !== 'object') return []
    const row = item as { title?: unknown; text?: unknown }
    return typeof row.title === 'string' ? [{ title: row.title, text: typeof row.text === 'string' ? row.text : '' }] : []
  })
}
