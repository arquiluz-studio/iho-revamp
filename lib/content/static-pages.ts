import type { AppPathname } from '@/i18n/routing'

const home = { key: 'home', label: 'Home', href: '/' } as const
const group = { key: 'group', label: 'Grupo IHO', href: '/group' } as const
const projects = { key: 'projects', label: 'Proyectos', href: '/projects' } as const
const brands = { key: 'brands', label: 'Marcas', href: '/brands' } as const
const designers = { key: 'designers', label: 'Diseñadores', href: '/designers' } as const
const solutions = { key: 'solutions', label: 'Soluciones', href: '/solutions' } as const
const spaces = { key: 'spaces', label: 'Espacios', href: '/spaces' } as const
const events = { key: 'events', label: 'Eventos', href: '/events' } as const
const products = { key: 'products', label: 'Comprar', href: '/products' } as const
const contact = { key: 'contact', label: 'Contacto', href: '/contact' } as const
const privacy = { key: 'privacy', label: 'Aviso de privacidad', href: '/privacy' } as const

/** Static pages a hero button can open. */
const SITE_PAGES = [home, group, projects, brands, designers, solutions, spaces, events, products, contact, privacy] as const satisfies readonly {
  key: string
  label: string
  href: AppPathname
}[]

/** Heroes edited under Contenido. Brand and designer directories have no hero. */
export const CONTENT_PAGES = [home, group, projects, solutions, spaces, events, products, contact, privacy] as const satisfies readonly {
  key: string
  label: string
  href: AppPathname
}[]

export type SitePageKey = (typeof SITE_PAGES)[number]['key']
export type ContentPageKey = (typeof CONTENT_PAGES)[number]['key']
export type CountryPageKey = Exclude<SitePageKey, 'home'>
export type EditableCountryPageKey = Exclude<ContentPageKey, 'home'>

export const SITE_PAGE_KEYS: readonly SitePageKey[] = SITE_PAGES.map(page => page.key)
export const CONTENT_PAGE_KEYS: readonly ContentPageKey[] = CONTENT_PAGES.map(page => page.key)

export const COUNTRY_PAGE_KEYS: readonly EditableCountryPageKey[] = CONTENT_PAGES.flatMap(page =>
  page.key === 'home' ? [] : [page.key],
)

export function sitePage(key: string) {
  return SITE_PAGES.find(page => page.key === key) ?? null
}

export function contentPage(key: string) {
  return CONTENT_PAGES.find(page => page.key === key) ?? null
}

export function isSitePageKey(key: string): key is SitePageKey {
  return SITE_PAGE_KEYS.some(page => page === key)
}

export function isContentPageKey(key: string): key is ContentPageKey {
  return CONTENT_PAGE_KEYS.some(page => page === key)
}

export function isCountryPageKey(key: string): key is EditableCountryPageKey {
  return COUNTRY_PAGE_KEYS.some(page => page === key)
}
