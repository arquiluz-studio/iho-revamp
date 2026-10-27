import 'server-only'
import type { AppLocale } from '@/config/countries'
import { cacheTags } from '@/lib/cache-tags'
import { pickBySlug } from '@/lib/i18n-fields'
import { MEDIA_SELECT } from '@/lib/media'
import { cachedQuery, maybe, media, must, visibleStatuses, type Db } from './core'

const catalogTags = (country: string) => [
  cacheTags.country(country, 'catalog'),
  cacheTags.brands,
  cacheTags.designers,
  cacheTags.taxonomies,
]

const CATALOG_SELECT = `id, slug, slug_en, name_es, name_en, status, is_purchasable, is_featured, lead_time_days, sort,
  cover:${media('products_cover_media_id_fkey')},
  gallery:product_media(sort, media:${media('product_media_media_id_fkey')}),
  catalog_brand:catalog_brands!inner(id, name, brand:brands(id, slug, name, is_active)),
  designers:product_designers(designer:designers(id, slug, name, is_active)),
  business_line:business_lines(id, slug, slug_en, name_es, name_en),
  sectors:product_sectors(sector:sectors(id, slug, slug_en, name_es, name_en))` as const

export type VariantOffer = {
  variantId: string
  amount: number | null
  currency: string | null
}

/** Sale price per variant. Quote-only products come back without an amount. Cost is never selected. */
async function offers(db: Db, country: string, productIds?: string[]): Promise<Map<string, VariantOffer[]>> {
  let query = db
    .from('v_country_catalog')
    .select('product_id, variant_id, variant_sort, amount, currency')
    .eq('country_code', country)
    .order('variant_sort')
  if (productIds) query = query.in('product_id', productIds)
  const rows = must(await query, 'v_country_catalog')
  const byProduct = new Map<string, VariantOffer[]>()
  for (const r of rows) {
    if (!r.product_id || !r.variant_id) continue
    const list = byProduct.get(r.product_id) ?? []
    list.push({
      variantId: r.variant_id,
      amount: r.amount,
      currency: r.currency,
    })
    byProduct.set(r.product_id, list)
  }
  return byProduct
}

/** Lowest current price across variants ("from" price). */
function summarize(list: VariantOffer[] = []) {
  const priced = list.filter(o => o.amount != null).sort((a, b) => a.amount! - b.amount!)
  return {
    price: priced[0] ?? null,
    multiplePrices: new Set(priced.map(o => o.amount)).size > 1,
  }
}

/** Products visible in the country, with their current sale price. */
export function getCatalog(country: string) {
  return cachedQuery(['catalog', country, 'gallery'], catalogTags(country), async ({ db, draft }) => {
    const [rows, prices] = await Promise.all([
      db
        .from('products')
        .select(CATALOG_SELECT)
        .eq('country_code', country)
        .eq('is_visible', true)
        .in('status', visibleStatuses(draft))
        .order('sort')
        .then(r => must(r, 'products')),
      offers(db, country),
    ])
    return rows
      .filter(r => r.catalog_brand.brand?.is_active !== false)
      .map(({ catalog_brand, ...product }) => ({
        ...product,
        brand: catalog_brand.brand,
        catalogBrandId: catalog_brand.id,
        catalogBrandName: catalog_brand.name,
        sectors: product.sectors.flatMap(s => (s.sector ? [s.sector] : [])),
        designers: product.designers
          .flatMap(d => (d.designer?.is_active ? [d.designer] : []))
          .sort((a, b) => a.name.localeCompare(b.name)),
        ...summarize(prices.get(product.id)),
      }))
  })
}

export type CatalogRow = Awaited<ReturnType<typeof getCatalog>>[number]

/** Product addressed by its Spanish or English slug (see `pickBySlug`). */
export async function getProductBySlug(country: string, slug: string, locale: AppLocale) {
  const listed = pickBySlug(await getCatalog(country), slug, locale)
  if (!listed) return null
  // `listed` is merged outside the cached detail so one cache entry never freezes a stale copy of the other.
  const detail = await cachedQuery(
    ['product', country, listed.id],
    [...catalogTags(country), cacheTags.product(listed.id)],
    async ({ db }) => {
      const [row, prices] = await Promise.all([
        db
          .from('products')
          .select(
            `description_es, description_en, specs,
            gallery:product_media(sort, media:media_assets!product_media_media_id_fkey(${MEDIA_SELECT})),
            variants:product_variants(id, sku, name_es, name_en, options, is_active, sort)` as const,
          )
          .eq('id', listed.id)
          .maybeSingle()
          .then(r => maybe(r, 'product')),
        offers(db, country, [listed.id]),
      ])
      if (!row) return null
      const variantOffers = prices.get(listed.id) ?? []
      return {
        ...row,
        specs: toSpecs(row.specs),
        gallery: [...row.gallery].sort((a, b) => a.sort - b.sort),
        variants: row.variants
          .filter(v => v.is_active)
          .sort((a, b) => a.sort - b.sort)
          .map(v => ({ ...v, offer: variantOffers.find(o => o.variantId === v.id) ?? null })),
      }
    },
  )
  return detail ? { ...listed, ...detail } : null
}

export type ProductDetailRow = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>

export type ProductSpec = { label_es: string; label_en?: string | null; value: string }

function toSpecs(value: unknown): ProductSpec[] {
  if (!Array.isArray(value)) return []
  return value.filter((s): s is ProductSpec => !!s && typeof s === 'object' && typeof s.value === 'string' && typeof s.label_es === 'string')
}

/** Price as shown on the site: whole amounts without decimals ("$18,900 MXN"). */
export function formatPrice(amount: number, currency: string, locale: string, country: string): string {
  const whole = Number.isInteger(amount)
  const formatted = new Intl.NumberFormat(`${locale}-${country.toUpperCase()}`, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(amount)
  return `${formatted} ${currency}`
}
