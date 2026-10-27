/** Brands with a position come first, in that order. Unnumbered ones follow by name. Visibility never moves a row. */
export function compareCountryBrands(a: { name: string; sort: number }, b: { name: string; sort: number }) {
  const aUnset = a.sort <= 0
  const bUnset = b.sort <= 0
  if (aUnset !== bUnset) return aUnset ? 1 : -1
  if (a.sort !== b.sort) return a.sort - b.sort
  return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
}
