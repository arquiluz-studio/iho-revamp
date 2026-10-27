import { defineRouting } from 'next-intl/routing'
import { DEFAULT_LOCALE, LOCALES } from '@/config/countries'

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'as-needed',
  localeDetection: false,
  localeCookie: false,
  alternateLinks: false,
  pathnames: {
    '/': '/',
    '/events': { es: '/eventos', en: '/events' },
    '/events/[slug]': { es: '/eventos/[slug]', en: '/events/[slug]' },
    '/projects': { es: '/proyectos', en: '/projects' },
    '/projects/[slug]': { es: '/proyectos/[slug]', en: '/projects/[slug]' },
    '/brands': { es: '/marcas', en: '/brands' },
    '/brands/[slug]': { es: '/marcas/[slug]', en: '/brands/[slug]' },
    '/designers': { es: '/disenadores', en: '/designers' },
    '/designers/[slug]': { es: '/disenadores/[slug]', en: '/designers/[slug]' },
    '/group': { es: '/grupo-iho', en: '/iho-group' },
    '/team/[slug]': { es: '/equipo/[slug]', en: '/team/[slug]' },
    '/solutions': { es: '/soluciones', en: '/solutions' },
    '/solutions/[businessLine]': { es: '/soluciones/[businessLine]', en: '/solutions/[businessLine]' },
    '/spaces': { es: '/espacios', en: '/spaces' },
    '/spaces/[sector]': { es: '/espacios/[sector]', en: '/spaces/[sector]' },
    '/products': { es: '/productos', en: '/products' },
    '/products/[slug]': { es: '/productos/[slug]', en: '/products/[slug]' },
    '/contact': { es: '/contacto', en: '/contact' },
    '/privacy': { es: '/privacidad', en: '/privacy' },
  },
})

export type AppPathname = keyof typeof routing.pathnames
