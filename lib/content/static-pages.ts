import type { AppPathname } from '@/i18n/routing'

/** Static pages whose hero is edited under Contenido. Home stays on country_settings. */
export const CONTENT_PAGES = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'group', label: 'Grupo IHO', href: '/group' },
  { key: 'projects', label: 'Proyectos', href: '/projects' },
  { key: 'brands', label: 'Marcas', href: '/brands' },
  { key: 'designers', label: 'Diseñadores', href: '/designers' },
  { key: 'solutions', label: 'Soluciones', href: '/solutions' },
  { key: 'spaces', label: 'Espacios', href: '/spaces' },
  { key: 'events', label: 'Eventos', href: '/events' },
  { key: 'products', label: 'Comprar', href: '/products' },
  { key: 'contact', label: 'Contacto', href: '/contact' },
  { key: 'privacy', label: 'Aviso de privacidad', href: '/privacy' },
] as const satisfies readonly { key: string; label: string; href: AppPathname }[]

export type ContentPageKey = (typeof CONTENT_PAGES)[number]['key']
export type CountryPageKey = Exclude<ContentPageKey, 'home'>

export const CONTENT_PAGE_KEYS: readonly ContentPageKey[] = CONTENT_PAGES.map(page => page.key)

export const COUNTRY_PAGE_KEYS: readonly CountryPageKey[] = CONTENT_PAGES.flatMap(page =>
  page.key === 'home' ? [] : [page.key],
)

export function contentPage(key: string) {
  return CONTENT_PAGES.find(page => page.key === key) ?? null
}

export function isContentPageKey(key: string): key is ContentPageKey {
  return CONTENT_PAGE_KEYS.some(page => page === key)
}

export function isCountryPageKey(key: string): key is CountryPageKey {
  return COUNTRY_PAGE_KEYS.some(page => page === key)
}
