export const SHOP_SORTS = ['featured', 'name', 'price-asc', 'price-desc'] as const

export type ShopSort = (typeof SHOP_SORTS)[number]

export type ShopQuery = {
  q: string
  lines: string[]
  spaces: string[]
  brands: string[]
  designers: string[]
  priced: boolean
  sort: ShopSort
}

const SHOP_KEYS = ['q', 'line', 'space', 'brand', 'designer', 'priced', 'sort'] as const

type SearchParams = Record<string, string | string[] | undefined>

function list(value: string | string[] | undefined): string[] {
  const raw = Array.isArray(value) ? value.join(',') : (value ?? '')
  return raw
    .split(',')
    .map(part => part.trim())
    .filter(Boolean)
}

function isSort(value: string): value is ShopSort {
  return (SHOP_SORTS as readonly string[]).includes(value)
}

/** Stable URL key for a commercial brand name. Names are unique inside one country. */
export function facetSlug(name: string): string {
  const slug = name
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return slug || 'marca'
}

export function parseShopQuery(params: SearchParams): ShopQuery {
  const sort = list(params.sort)[0]
  return {
    q: list(params.q).join(' '),
    lines: list(params.line),
    spaces: list(params.space),
    brands: list(params.brand),
    designers: list(params.designer),
    priced: params.priced === '1' || (Array.isArray(params.priced) && params.priced.includes('1')),
    sort: sort && isSort(sort) ? sort : 'featured',
  }
}

/** Query string for a shop state, keeping params that are not shop filters (the country override, for example). */
export function shopHref(pathname: string, query: ShopQuery, params: SearchParams): string {
  const next = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if ((SHOP_KEYS as readonly string[]).includes(key) || value == null) continue
    for (const part of Array.isArray(value) ? value : [value]) next.append(key, part)
  }
  if (query.q) next.set('q', query.q)
  if (query.lines.length) next.set('line', query.lines.join(','))
  if (query.spaces.length) next.set('space', query.spaces.join(','))
  if (query.brands.length) next.set('brand', query.brands.join(','))
  if (query.designers.length) next.set('designer', query.designers.join(','))
  if (query.priced) next.set('priced', '1')
  if (query.sort !== 'featured') next.set('sort', query.sort)
  const qs = next.toString()
  return qs ? `${pathname}?${qs}` : pathname
}
