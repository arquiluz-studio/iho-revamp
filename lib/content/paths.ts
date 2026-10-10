import type { AppLocale } from '@/config/countries'
import { getPathname } from '@/i18n/navigation'

/** Localized pathnames of the public site for one locale (the country comes from the host). */
export function sitePaths(locale: AppLocale) {
  const home = getPathname({ href: '/', locale })
  return {
    home,
    homeSection: (id: string) => `${home === '/' ? '' : home}/#${id}`,
    events: getPathname({ href: '/events', locale }),
    event: (slug: string) => getPathname({ href: { pathname: '/events/[slug]', params: { slug } }, locale }),
    projects: getPathname({ href: '/projects', locale }),
    project: (slug: string) => getPathname({ href: { pathname: '/projects/[slug]', params: { slug } }, locale }),
    brands: getPathname({ href: '/brands', locale }),
    brand: (slug: string) => getPathname({ href: { pathname: '/brands/[slug]', params: { slug } }, locale }),
    area: (slug: string) => getPathname({ href: { pathname: '/areas/[businessLine]', params: { businessLine: slug } }, locale }),
    space: (slug: string) => getPathname({ href: { pathname: '/spaces/[sector]', params: { sector: slug } }, locale }),
    products: getPathname({ href: '/products', locale }),
    product: (slug: string) => getPathname({ href: { pathname: '/products/[slug]', params: { slug } }, locale }),
    contact: getPathname({ href: '/contact', locale }),
    privacy: getPathname({ href: '/privacy', locale }),
  }
}

export type SitePaths = ReturnType<typeof sitePaths>
