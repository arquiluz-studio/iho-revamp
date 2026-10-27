export const PROJECT_LINES = [
  { slug: 'mobiliario', label: 'Mobiliario' },
  { slug: 'architectural', label: 'Architectural' },
  { slug: 'lighting', label: 'Lighting' },
] as const

export type ProjectLineSlug = (typeof PROJECT_LINES)[number]['slug']

/** Numbered projects come first, in that order. Unnumbered ones follow by name. */
export function compareProjectOrder(a: { title: string; sort: number }, b: { title: string; sort: number }) {
  const aUnset = a.sort <= 0
  const bUnset = b.sort <= 0
  if (aUnset !== bUnset) return aUnset ? 1 : -1
  if (a.sort !== b.sort) return a.sort - b.sort
  return a.title.localeCompare(b.title, 'es', { sensitivity: 'base' })
}
