import 'server-only'
import type { AppLocale } from '@/config/countries'
import { cacheTags } from '@/lib/cache-tags'
import { pickBySlug } from '@/lib/i18n-fields'
import { MEDIA_SELECT } from '@/lib/media'
import { cachedQuery, maybe, media, must, visibleStatuses, type Db } from './core'

/** Prices depend on sale windows (`starts_at`/`ends_at`), so catalog reads expire hourly on top of tag purges. */
const CATALOG_REVALIDATE_SECONDS = 60 * 60

const catalogTags = (country: string) => [cacheTags.country(country, 'catalog'), cacheTags.products, cacheTags.brands, cacheTags.taxonomies]

const CATALOG_SELECT = `is_purchasable, is_featured, lead_time_days, sort,
  product:products!inner(id, slug, slug_en, name_es, name_en, designer, status,
    cover:${media('products_cover_media_id_fkey')},
    brand:brands(id, slug, name, is_active),
    business_line:business_lines(id, slug, slug_en, name_es, name_en),
    sectors:product_sectors(sector:sectors(id, slug, slug_en, name_es, name_en)))` as const

export type VariantOffer = {
  variantId: string
  amount: number | null
  compareAt: number | null
  currency: string | null
  priceKind: 'base' | 'sale' | null
  stock: number | null
}

/** Effective price and stock per variant (from `v_country_catalog`, which hides prices of quote-only products). */
async function offers(db: Db, country: string, productIds?: string[]): Promise<Map<string, VariantOffer[]>> {
  let query = db
    .from('v_country_catalog')
    .select('product_id, variant_id, variant_sort, amount, compare_at_amount, currency, price_kind, available_stock')
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
      compareAt: r.compare_at_amount,
      currency: r.currency,
      priceKind: r.price_kind,
      stock: r.available_stock,
    })
    byProduct.set(r.product_id, list)
  }
  return byProduct
}

/** Lowest current price across variants ("from" price) and total stock, if tracked. */
function summarize(list: VariantOffer[] = []) {
  const priced = list.filter(o => o.amount != null).sort((a, b) => a.amount! - b.amount!)
  const tracked = list.filter(o => o.stock != null)
  return {
    price: priced[0] ?? null,
    multiplePrices: new Set(priced.map(o => o.amount)).size > 1,
    stock: tracked.length ? tracked.reduce((sum, o) => sum + o.stock!, 0) : null,
  }
}

/** Products available in the country (visible in `country_products`), with their current price summary. */
export function getCatalog(country: string) {
  return cachedQuery(
    ['catalog', country],
    catalogTags(country),
    async ({ db, draft }) => {
      const [rows, prices] = await Promise.all([
        db
          .from('country_products')
          .select(CATALOG_SELECT)
          .eq('country_code', country)
          .eq('is_visible', true)
          .in('product.status', visibleStatuses(draft))
          .order('sort')
          .then(r => must(r, 'country_products')),
        offers(db, country),
      ])
      return rows
        .filter(r => r.product.brand?.is_active !== false)
        .map(({ product, ...availability }) => ({
          ...product,
          ...availability,
          sectors: product.sectors.flatMap(s => (s.sector ? [s.sector] : [])),
          ...summarize(prices.get(product.id)),
        }))
    },
    CATALOG_REVALIDATE_SECONDS,
  )
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
    CATALOG_REVALIDATE_SECONDS,
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
