/**
 * Cache tags shared by public queries (`unstable_cache`) and admin server actions (`revalidateTag`).
 * Country content is tagged per section so publishing an event doesn't purge the brand pages.
 */
export type CountrySection = 'settings' | 'events' | 'projects' | 'brands' | 'offices' | 'socials' | 'team' | 'catalog'

export const cacheTags = {
  countries: 'countries',
  taxonomies: 'taxonomies',
  brands: 'brands',
  designers: 'designers',
  /** Global product data (names, specs, variants, media) shared by every country's catalog. */
  products: 'products',
  /** Site-wide settings shared by every country (stats). */
  site: 'site',
  country: (code: string, section: CountrySection) => `country:${code}:${section}`,
  event: (id: string) => `event:${id}`,
  project: (id: string) => `project:${id}`,
  brand: (id: string) => `brand:${id}`,
  product: (id: string) => `product:${id}`,
  media: (id: string) => `media:${id}`,
}
