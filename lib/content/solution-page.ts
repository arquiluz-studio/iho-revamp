/** Bilingual copy for one slot of a solution page. English falls back to Spanish when it is empty. */
export type Copy = { es: string; en: string }

export type SolutionCard = { title: Copy; text: Copy; imageId: string | null }
export type SolutionStep = { title: Copy; text: Copy }
export type SolutionLabel = { label: Copy }
export type SolutionShot = { caption: Copy; text: Copy; imageId: string | null }
export type SolutionLogo = { label: Copy; imageId: string | null }

/** Fixed layout of a solution page. Empty sections are omitted on the site. */
export type SolutionPageContent = {
  hero: { eyebrow: Copy; intro: Copy; ctaLabel: Copy }
  intro: { eyebrow: Copy; title: Copy; body: Copy; ctaLabel: Copy; imageId: string | null }
  banner: { text: Copy }
  elements: { eyebrow: Copy; title: Copy; intro: Copy; items: SolutionCard[] }
  categories: SolutionLabel[]
  spaces: { eyebrow: Copy; title: Copy; body: Copy; imageId: string | null }
  process: { eyebrow: Copy; title: Copy; intro: Copy; steps: SolutionStep[] }
  quote: { text: Copy; attribution: Copy }
  brands: { eyebrow: Copy; items: SolutionLogo[] }
  gallery: { eyebrow: Copy; items: SolutionShot[] }
  close: { eyebrow: Copy; title: Copy; body: Copy; ctaLabel: Copy }
}

export const EMPTY_COPY: Copy = { es: '', en: '' }

export const emptySolutionPage = (): SolutionPageContent => ({
  hero: { eyebrow: { ...EMPTY_COPY }, intro: { ...EMPTY_COPY }, ctaLabel: { ...EMPTY_COPY } },
  intro: { eyebrow: { ...EMPTY_COPY }, title: { ...EMPTY_COPY }, body: { ...EMPTY_COPY }, ctaLabel: { ...EMPTY_COPY }, imageId: null },
  banner: { text: { ...EMPTY_COPY } },
  elements: { eyebrow: { ...EMPTY_COPY }, title: { ...EMPTY_COPY }, intro: { ...EMPTY_COPY }, items: [] },
  categories: [],
  spaces: { eyebrow: { ...EMPTY_COPY }, title: { ...EMPTY_COPY }, body: { ...EMPTY_COPY }, imageId: null },
  process: { eyebrow: { ...EMPTY_COPY }, title: { ...EMPTY_COPY }, intro: { ...EMPTY_COPY }, steps: [] },
  quote: { text: { ...EMPTY_COPY }, attribution: { ...EMPTY_COPY } },
  brands: { eyebrow: { ...EMPTY_COPY }, items: [] },
  gallery: { eyebrow: { ...EMPTY_COPY }, items: [] },
  close: { eyebrow: { ...EMPTY_COPY }, title: { ...EMPTY_COPY }, body: { ...EMPTY_COPY }, ctaLabel: { ...EMPTY_COPY } },
})

export function emptyCard(): SolutionCard {
  return { title: { ...EMPTY_COPY }, text: { ...EMPTY_COPY }, imageId: null }
}

export function emptyStep(): SolutionStep {
  return { title: { ...EMPTY_COPY }, text: { ...EMPTY_COPY } }
}

export function emptyLabel(): SolutionLabel {
  return { label: { ...EMPTY_COPY } }
}

export function emptyShot(): SolutionShot {
  return { caption: { ...EMPTY_COPY }, text: { ...EMPTY_COPY }, imageId: null }
}

export function emptyLogo(): SolutionLogo {
  return { label: { ...EMPTY_COPY }, imageId: null }
}

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

function asLabels(value: unknown): SolutionLabel[] {
  if (!Array.isArray(value)) return []
  return value.flatMap(item => {
    if (!item || typeof item !== 'object') return []
    const row = item as { label?: unknown }
    return [{ label: asCopy(row.label) }]
  })
}

function asShots(value: unknown): SolutionShot[] {
  if (!Array.isArray(value)) return []
  return value.flatMap(item => {
    if (!item || typeof item !== 'object') return []
    const row = item as { caption?: unknown; text?: unknown; imageId?: unknown }
    return [{ caption: asCopy(row.caption), text: asCopy(row.text), imageId: asId(row.imageId) }]
  })
}

function asLogos(value: unknown): SolutionLogo[] {
  if (!Array.isArray(value)) return []
  return value.flatMap(item => {
    if (!item || typeof item !== 'object') return []
    const row = item as { label?: unknown; imageId?: unknown }
    return [{ label: asCopy(row.label), imageId: asId(row.imageId) }]
  })
}

/** Reads stored JSON into the editor shape. Missing pieces stay empty instead of throwing. */
export function parseSolutionPage(value: unknown): SolutionPageContent {
  const blank = emptySolutionPage()
  if (!value || typeof value !== 'object') return blank
  const row = value as Partial<Record<keyof SolutionPageContent, unknown>>
  const hero = (row.hero ?? {}) as Partial<SolutionPageContent['hero']>
  const intro = (row.intro ?? {}) as Partial<SolutionPageContent['intro']>
  const banner = (row.banner ?? {}) as Partial<SolutionPageContent['banner']>
  const elements = (row.elements ?? {}) as Partial<SolutionPageContent['elements']>
  const spaces = (row.spaces ?? {}) as Partial<SolutionPageContent['spaces']>
  const process = (row.process ?? {}) as Partial<SolutionPageContent['process']>
  const quote = (row.quote ?? {}) as Partial<SolutionPageContent['quote']>
  const brands = (row.brands ?? {}) as Partial<SolutionPageContent['brands']>
  const gallery = (row.gallery ?? {}) as Partial<SolutionPageContent['gallery']>
  const close = (row.close ?? {}) as Partial<SolutionPageContent['close']>
  return {
    hero: { eyebrow: asCopy(hero.eyebrow), intro: asCopy(hero.intro), ctaLabel: asCopy(hero.ctaLabel) },
    intro: {
      eyebrow: asCopy(intro.eyebrow),
      title: asCopy(intro.title),
      body: asCopy(intro.body),
      ctaLabel: asCopy(intro.ctaLabel),
      imageId: asId(intro.imageId),
    },
    banner: { text: asCopy(banner.text) },
    elements: { eyebrow: asCopy(elements.eyebrow), title: asCopy(elements.title), intro: asCopy(elements.intro), items: asCards(elements.items) },
    categories: asLabels(row.categories),
    spaces: { eyebrow: asCopy(spaces.eyebrow), title: asCopy(spaces.title), body: asCopy(spaces.body), imageId: asId(spaces.imageId) },
    process: { eyebrow: asCopy(process.eyebrow), title: asCopy(process.title), intro: asCopy(process.intro), steps: asSteps(process.steps) },
    quote: { text: asCopy(quote.text), attribution: asCopy(quote.attribution) },
    brands: { eyebrow: asCopy(brands.eyebrow), items: asLogos(brands.items) },
    gallery: { eyebrow: asCopy(gallery.eyebrow), items: asShots(gallery.items) },
    close: { eyebrow: asCopy(close.eyebrow), title: asCopy(close.title), body: asCopy(close.body), ctaLabel: asCopy(close.ctaLabel) },
  }
}

/** Spanish, or English when that locale has text. */
export function copyText(copy: Copy, locale: string): string {
  if (locale === 'en' && copy.en.trim()) return copy.en
  return copy.es
}

export function hasCopy(copy: Copy): boolean {
  return Boolean(copy.es.trim() || copy.en.trim())
}

export function solutionPageMediaIds(content: SolutionPageContent): string[] {
  return [
    content.intro.imageId,
    content.spaces.imageId,
    ...content.elements.items.map(item => item.imageId),
    ...content.brands.items.map(item => item.imageId),
    ...content.gallery.items.map(item => item.imageId),
  ].flatMap(id => (id ? [id] : []))
}
