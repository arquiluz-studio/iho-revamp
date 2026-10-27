import 'server-only'
import { cacheTags } from '@/lib/cache-tags'
import { cachedQuery, media, must } from './core'

/** Brands distributed in the country (visible in `country_brands` and globally active), in the country's order. */
export async function getCountryBrands(country: string) {
  const rows = await cachedQuery(['country-brands', country], [cacheTags.country(country, 'brands'), cacheTags.brands], async ({ db }) =>
    must(
      await db
        .from('country_brands')
        .select(
          `is_exclusive, is_featured, sort, brand:brands!inner(id, slug, name, logo_is_thin, website_url, origin_country, description_es, description_en, is_active,
          logo:${media('brands_logo_media_id_fkey')},
          business_lines:brand_business_lines(business_line:business_lines(id, slug, slug_en, name_es, name_en)))` as const,
        )
        .eq('country_code', country)
        .eq('is_visible', true)
        .eq('brand.is_active', true)
        .order('sort'),
      'country_brands',
    ),
  )
  return rows.map(({ brand, ...link }) => ({ ...brand, ...link }))
}

export async function getCountryBrand(country: string, slug: string) {
  const brands = await getCountryBrands(country)
  return brands.find(b => b.slug === slug) ?? null
}

export type CountryBrandRow = Awaited<ReturnType<typeof getCountryBrands>>[number]
