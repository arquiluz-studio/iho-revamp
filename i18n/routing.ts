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
    '/about': { es: '/nosotros', en: '/about' },
    '/areas': '/areas',
    '/areas/[businessLine]': '/areas/[businessLine]',
    '/verticals': { es: '/verticales', en: '/verticals' },
    '/spaces/[sector]': { es: '/espacios/[sector]', en: '/spaces/[sector]' },
    '/products': { es: '/productos', en: '/products' },
    '/products/[slug]': { es: '/productos/[slug]', en: '/products/[slug]' },
    '/contact': { es: '/contacto', en: '/contact' },
    '/privacy': { es: '/privacidad', en: '/privacy' },
  },
})

export type AppPathname = keyof typeof routing.pathnames
