import { EMPTY_COPY, copyText, emptyCard, emptyStep, type Copy, type SolutionCard, type SolutionStep } from './solution-page'

export type { Copy, SolutionCard, SolutionStep }

/** Fixed layout of a space page. Solutions, projects and brands are filled from the catalogs. */
export type SpacePageContent = {
  hero: { intro: Copy; ctaLabel: Copy }
  intro: { eyebrow: Copy; title: Copy; body: Copy; ctaLabel: Copy; imageId: string | null }
  banner: { title: Copy; text: Copy }
  elements: { eyebrow: Copy; title: Copy; intro: Copy; moreLabel: Copy; items: SolutionCard[] }
  projects: { eyebrow: Copy; title: Copy; intro: Copy; moreLabel: Copy }
  quote: { text: Copy; attribution: Copy }
  process: { eyebrow: Copy; title: Copy; intro: Copy; steps: SolutionStep[] }
  brands: { eyebrow: Copy }
  close: { eyebrow: Copy; title: Copy; body: Copy; ctaLabel: Copy }
}

export const emptySpacePage = (): SpacePageContent => ({
  hero: { intro: { ...EMPTY_COPY }, ctaLabel: { ...EMPTY_COPY } },
  intro: { eyebrow: { ...EMPTY_COPY }, title: { ...EMPTY_COPY }, body: { ...EMPTY_COPY }, ctaLabel: { ...EMPTY_COPY }, imageId: null },
  banner: { title: { ...EMPTY_COPY }, text: { ...EMPTY_COPY } },
  elements: { eyebrow: { ...EMPTY_COPY }, title: { ...EMPTY_COPY }, intro: { ...EMPTY_COPY }, moreLabel: { ...EMPTY_COPY }, items: [] },
  projects: { eyebrow: { ...EMPTY_COPY }, title: { ...EMPTY_COPY }, intro: { ...EMPTY_COPY }, moreLabel: { ...EMPTY_COPY } },
  quote: { text: { ...EMPTY_COPY }, attribution: { ...EMPTY_COPY } },
  process: { eyebrow: { ...EMPTY_COPY }, title: { ...EMPTY_COPY }, intro: { ...EMPTY_COPY }, steps: [] },
  brands: { eyebrow: { ...EMPTY_COPY } },
  close: { eyebrow: { ...EMPTY_COPY }, title: { ...EMPTY_COPY }, body: { ...EMPTY_COPY }, ctaLabel: { ...EMPTY_COPY } },
})

function asCopy(value: unknown): Copy {
  if (!value || typeof value !== 'object') return { ...EMPTY_COPY }
  const row = value as { es?: unknown; en?: unknown }
  return { es: typeof row.es === 'string' ? row.es : '', en: typeof row.en === 'string' ? row.en : '' }
}

function asId(value: unknown): string | null {
  return typeof value === 'string' && value ? value : null
}

function asCards(value: unknown): SolutionCard[] {
  if (!Array.isArray(value)) return []
  return value.flatMap(item => {
    if (!item || typeof item !== 'object') return []
    const row = item as { title?: unknown; text?: unknown; imageId?: unknown }
    return [{ title: asCopy(row.title), text: asCopy(row.text), imageId: asId(row.imageId) }]
  })
}

function asSteps(value: unknown): SolutionStep[] {
  if (!Array.isArray(value)) return []
  return value.flatMap(item => {
    if (!item || typeof item !== 'object') return []
    const row = item as { title?: unknown; text?: unknown }
    return [{ title: asCopy(row.title), text: asCopy(row.text) }]
  })
}

export function parseSpacePage(value: unknown): SpacePageContent {
  const empty = emptySpacePage()
  if (!value || typeof value !== 'object') return empty
  const row = value as Partial<SpacePageContent>
  const hero = (row.hero ?? {}) as Partial<SpacePageContent['hero']>
  const intro = (row.intro ?? {}) as Partial<SpacePageContent['intro']>
  const banner = (row.banner ?? {}) as Partial<SpacePageContent['banner']>
  const elements = (row.elements ?? {}) as Partial<SpacePageContent['elements']>
  const projects = (row.projects ?? {}) as Partial<SpacePageContent['projects']>
  const quote = (row.quote ?? {}) as Partial<SpacePageContent['quote']>
  const process = (row.process ?? {}) as Partial<SpacePageContent['process']>
  const brands = (row.brands ?? {}) as Partial<SpacePageContent['brands']>
  const close = (row.close ?? {}) as Partial<SpacePageContent['close']>
  return {
    hero: { intro: asCopy(hero.intro), ctaLabel: asCopy(hero.ctaLabel) },
    intro: {
      eyebrow: asCopy(intro.eyebrow),
      title: asCopy(intro.title),
      body: asCopy(intro.body),
      ctaLabel: asCopy(intro.ctaLabel),
      imageId: asId(intro.imageId),
    },
    banner: { title: asCopy(banner.title), text: asCopy(banner.text) },
    elements: {
      eyebrow: asCopy(elements.eyebrow),
      title: asCopy(elements.title),
      intro: asCopy(elements.intro),
      moreLabel: asCopy(elements.moreLabel),
      items: asCards(elements.items),
    },
    projects: {
      eyebrow: asCopy(projects.eyebrow),
      title: asCopy(projects.title),
      intro: asCopy(projects.intro),
      moreLabel: asCopy(projects.moreLabel),
    },
    quote: { text: asCopy(quote.text), attribution: asCopy(quote.attribution) },
    process: {
      eyebrow: asCopy(process.eyebrow),
      title: asCopy(process.title),
      intro: asCopy(process.intro),
      steps: asSteps(process.steps),
    },
    brands: { eyebrow: asCopy(brands.eyebrow) },
    close: { eyebrow: asCopy(close.eyebrow), title: asCopy(close.title), body: asCopy(close.body), ctaLabel: asCopy(close.ctaLabel) },
  }
}

export function spacePageMediaIds(content: SpacePageContent): string[] {
  return [content.intro.imageId, ...content.elements.items.map(item => item.imageId)].flatMap(id => (id ? [id] : []))
}

export { copyText, emptyCard, emptyStep }
