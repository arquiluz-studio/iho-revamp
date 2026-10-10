'use server'

import { z } from 'zod'
import { parseCsv } from '@/lib/admin/csv'
import { revalidateCountry, revalidateTags } from '@/lib/admin/revalidate'
import { getAdminSession, hasRole, type AdminSession } from '@/lib/admin/session'
import { cacheTags } from '@/lib/cache-tags'
import type { Json } from '@/lib/supabase/database.types'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { EXPIRED, FORBIDDEN, dbError, type ActionResult } from './result'

type Supabase = Awaited<ReturnType<typeof createSupabaseServerClient>>

/** Every country's catalog shows global product data, so product edits purge all of them via the `products` tag. */
function revalidateProduct(productId: string) {
  revalidateTags([cacheTags.products, cacheTags.product(productId)])
}

// --- variants (catalog admins) ---------------------------------------------------------------------------

const variantSchema = z.object({
  id: z.uuid().optional(),
  sku: z.string().trim().max(80),
  nameEs: z.string().trim().min(1, 'Requerido').max(160),
  nameEn: z.string().trim().max(160),
  /** One "key: value" pair per line. */
  options: z.string().max(2000),
  isActive: z.boolean(),
})

export type VariantInput = z.input<typeof variantSchema>

function parseOptions(text: string): Record<string, string> {
  const options: Record<string, string> = {}
  for (const line of text.split('\n')) {
    const [key, ...rest] = line.split(':')
    if (key?.trim() && rest.join(':').trim()) options[key.trim()] = rest.join(':').trim()
  }
  return options
}

/** Replaces the variant list of a product: updates kept rows, inserts new ones, deletes the rest. */
export async function saveVariants(productId: string, raw: VariantInput[]): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return EXPIRED
  if (!session.canManageCatalog) return FORBIDDEN
  const parsed = z.array(variantSchema).min(1, 'El producto necesita al menos una variante.').max(200).safeParse(raw)
  if (!parsed.success || !z.uuid().safeParse(productId).success) {
    return { ok: false, error: parsed.error?.issues[0]?.message ?? 'Datos inválidos.' }
  }
  const skus = parsed.data.map(v => v.sku).filter(Boolean)
  if (new Set(skus).size !== skus.length) return { ok: false, error: 'Hay SKUs repetidos.' }

  const supabase = await createSupabaseServerClient()
  const { data: existing, error } = await supabase.from('product_variants').select('id').eq('product_id', productId)
  if (error) return dbError(error)
  const keep = new Set(parsed.data.flatMap(v => (v.id ? [v.id] : [])))

  const rows = parsed.data.map((v, sort) => ({
    product_id: productId,
    sku: v.sku || null,
    name_es: v.nameEs,
    name_en: v.nameEn || null,
    options: parseOptions(v.options) as Json,
    is_active: v.isActive,
    sort,
  }))
  // Insert/update first so the "at least one variant" trigger never sees an empty product.
  for (const [i, v] of parsed.data.entries()) {
    const result = v.id
      ? await supabase.from('product_variants').update(rows[i]).eq('id', v.id).eq('product_id', productId)
      : await supabase.from('product_variants').insert(rows[i])
    if (result.error) return dbError(result.error)
  }
  const removed = (existing ?? []).map(r => r.id).filter(id => !keep.has(id))
  if (removed.length) {
    const result = await supabase.from('product_variants').delete().in('id', removed)
    if (result.error) return dbError(result.error)
  }
  revalidateProduct(productId)
  return { ok: true }
}

// --- product gallery (catalog admins) ----------------------------------------------------------------------

export async function saveProductGallery(productId: string, mediaIds: string[], coverId: string | null): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return EXPIRED
  if (!session.canManageCatalog) return FORBIDDEN
  const ids = z.array(z.uuid()).max(100).safeParse(mediaIds)
  if (!ids.success || !z.uuid().safeParse(productId).success) return { ok: false, error: 'Datos inválidos.' }

  const supabase = await createSupabaseServerClient()
  const removed = await supabase.from('product_media').delete().eq('product_id', productId)
  if (removed.error) return dbError(removed.error)
  if (ids.data.length) {
    const added = await supabase.from('product_media').insert(ids.data.map((media_id, sort) => ({ product_id: productId, media_id, sort })))
    if (added.error) return dbError(added.error)
  }
  const cover = coverId && z.uuid().safeParse(coverId).success ? coverId : null
  const updated = await supabase.from('products').update({ cover_media_id: cover }).eq('id', productId)
  if (updated.error) return dbError(updated.error)
  revalidateProduct(productId)
  return { ok: true }
}

// --- country availability (country admins) -----------------------------------------------------------------

const countryProductSchema = z.object({
  productId: z.uuid(),
  isVisible: z.boolean(),
  isPurchasable: z.boolean(),
  isFeatured: z.boolean(),
  leadTimeDays: z.number().int().min(0).max(3650).nullable(),
  sort: z.number().int().min(0).max(10000),
})

export async function saveCountryProducts(countryCode: string, raw: z.input<typeof countryProductSchema>[]): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return EXPIRED
  if (!hasRole(session, countryCode, 'admin')) return FORBIDDEN
  const parsed = z.array(countryProductSchema).max(5000).safeParse(raw)
  if (!parsed.success) return { ok: false, error: 'Datos inválidos.' }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('country_products').upsert(
    parsed.data.map(r => ({
      country_code: countryCode,
      product_id: r.productId,
      is_visible: r.isVisible,
      is_purchasable: r.isPurchasable,
      is_featured: r.isFeatured,
      lead_time_days: r.leadTimeDays,
      sort: r.sort,
    })),
    { onConflict: 'country_code,product_id' },
  )
  if (error) return dbError(error)
  revalidateCountry(countryCode, 'catalog')
  return { ok: true }
}

// --- prices and inventory (country admins) -----------------------------------------------------------------

async function ownerCountry(supabase: Supabase, table: 'price_lists' | 'warehouses', id: string) {
  const { data } = await supabase.from(table).select('country_code').eq('id', id).maybeSingle()
  return data?.country_code ?? null
}

async function authorizeCountryAdmin(table: 'price_lists' | 'warehouses', id: string) {
  const session = await getAdminSession()
  if (!session) return { error: EXPIRED }
  if (!z.uuid().safeParse(id).success) return { error: { ok: false, error: 'Datos inválidos.' } as const }
  const supabase = await createSupabaseServerClient()
  const country = await ownerCountry(supabase, table, id)
  if (!country || !hasRole(session as AdminSession, country, 'admin')) return { error: FORBIDDEN }
  return { supabase, country }
}

const amount = z.number().min(0).max(1e10)
const priceItemSchema = z.object({ variantId: z.uuid(), amount: amount.nullable(), compareAt: amount.nullable() })
export type PriceItemInput = z.input<typeof priceItemSchema>

/** Upserts the given variant prices; `amount: null` removes the variant from the list. */
export async function savePriceItems(priceListId: string, raw: PriceItemInput[]): Promise<ActionResult<{ saved: number }>> {
  const auth = await authorizeCountryAdmin('price_lists', priceListId)
  if ('error' in auth) return auth.error!
  const parsed = z.array(priceItemSchema).max(20000).safeParse(raw)
  if (!parsed.success) return { ok: false, error: 'Revisa los montos: deben ser números positivos.' }
  const { supabase, country } = auth

  const removed = parsed.data.filter(i => i.amount === null).map(i => i.variantId)
  const kept = parsed.data.filter(i => i.amount !== null)
  if (removed.length) {
    const result = await supabase.from('price_list_items').delete().eq('price_list_id', priceListId).in('variant_id', removed)
    if (result.error) return dbError(result.error)
  }
  if (kept.length) {
    const result = await supabase.from('price_list_items').upsert(
      kept.map(i => ({ price_list_id: priceListId, variant_id: i.variantId, amount: i.amount!, compare_at_amount: i.compareAt })),
      {
        onConflict: 'price_list_id,variant_id',
      },
    )
    if (result.error) return dbError(result.error)
  }
  revalidateCountry(country, 'catalog')
  return { ok: true, saved: kept.length }
}

const inventorySchema = z.object({ variantId: z.uuid(), onHand: z.number().int().min(-1e6).max(1e9), reserved: z.number().int().min(0).max(1e9) })
export type InventoryInput = z.input<typeof inventorySchema>

export async function saveInventory(warehouseId: string, raw: InventoryInput[]): Promise<ActionResult<{ saved: number }>> {
  const auth = await authorizeCountryAdmin('warehouses', warehouseId)
  if ('error' in auth) return auth.error!
  const parsed = z.array(inventorySchema).max(20000).safeParse(raw)
  if (!parsed.success) return { ok: false, error: 'Revisa las cantidades: deben ser números enteros.' }
  const { supabase, country } = auth
  if (parsed.data.length) {
    const result = await supabase.from('inventory_levels').upsert(
      parsed.data.map(i => ({
        warehouse_id: warehouseId,
        variant_id: i.variantId,
        on_hand: i.onHand,
        reserved: i.reserved,
        source: 'manual',
        updated_at: new Date().toISOString(),
      })),
      { onConflict: 'warehouse_id,variant_id' },
    )
    if (result.error) return dbError(result.error)
  }
  revalidateCountry(country, 'catalog')
  return { ok: true, saved: parsed.data.length }
}

// --- CSV import (by SKU) -----------------------------------------------------------------------------------

/** "18,900.50", "18.900,50", "$18900" → 18900.5; empty → null; garbage → NaN. */
function parseNumber(text: string | undefined): number | null {
  const raw = (text ?? '').replace(/[^\d.,-]/g, '')
  if (!raw) return null
  const lastComma = raw.lastIndexOf(',')
  const lastDot = raw.lastIndexOf('.')
  let normalized = raw
  if (lastComma > -1 && lastDot > -1) {
    normalized = lastComma > lastDot ? raw.replace(/\./g, '').replace(',', '.') : raw.replace(/,/g, '')
  } else if (lastComma > -1) {
    normalized = /,\d{1,2}$/.test(raw) ? raw.replace(',', '.') : raw.replace(/,/g, '')
  }
  return Number(normalized)
}

export type CsvImportResult = ActionResult<{ saved: number; unknownSkus: string[]; invalidRows: number[] }>

async function variantsBySku(supabase: Supabase, skus: string[]) {
  const map = new Map<string, string>()
  for (let i = 0; i < skus.length; i += 500) {
    const { data } = await supabase
      .from('product_variants')
      .select('id, sku')
      .in('sku', skus.slice(i, i + 500))
    for (const v of data ?? []) if (v.sku) map.set(v.sku.toLowerCase(), v.id)
  }
  return map
}

/** CSV columns: `sku, amount, compare_at_amount` (compare-at optional). */
export async function importPricesCsv(priceListId: string, csv: string): Promise<CsvImportResult> {
  const auth = await authorizeCountryAdmin('price_lists', priceListId)
  if ('error' in auth) return auth.error!
  const rows = parseCsv(csv.slice(0, 2_000_000))
  if (!rows.length || !('sku' in rows[0]) || !('amount' in rows[0])) {
    return { ok: false, error: 'El CSV debe tener encabezados "sku" y "amount" (y opcionalmente "compare_at_amount").' }
  }
  const variants = await variantsBySku(auth.supabase, [...new Set(rows.map(r => r.sku).filter(Boolean))])
  const unknownSkus: string[] = []
  const invalidRows: number[] = []
  const items: PriceItemInput[] = []
  rows.forEach((r, i) => {
    const variantId = variants.get(r.sku.toLowerCase())
    if (!variantId) return void (r.sku && unknownSkus.push(r.sku))
    const value = parseNumber(r.amount)
    const compareAt = parseNumber(r.compare_at_amount)
    if (value === null || Number.isNaN(value) || Number.isNaN(compareAt)) return void invalidRows.push(i + 2)
    items.push({ variantId, amount: value, compareAt })
  })
  const saved = await savePriceItems(priceListId, items)
  if (!saved.ok) return saved
  return { ok: true, saved: saved.saved, unknownSkus, invalidRows }
}

/** CSV columns: `sku, on_hand, reserved` (reserved optional). */
export async function importInventoryCsv(warehouseId: string, csv: string): Promise<CsvImportResult> {
  const auth = await authorizeCountryAdmin('warehouses', warehouseId)
  if ('error' in auth) return auth.error!
  const rows = parseCsv(csv.slice(0, 2_000_000))
  if (!rows.length || !('sku' in rows[0]) || !('on_hand' in rows[0])) {
    return { ok: false, error: 'El CSV debe tener encabezados "sku" y "on_hand" (y opcionalmente "reserved").' }
  }
  const variants = await variantsBySku(auth.supabase, [...new Set(rows.map(r => r.sku).filter(Boolean))])
  const unknownSkus: string[] = []
  const invalidRows: number[] = []
  const items: InventoryInput[] = []
  rows.forEach((r, i) => {
    const variantId = variants.get(r.sku.toLowerCase())
    if (!variantId) return void (r.sku && unknownSkus.push(r.sku))
    const onHand = parseNumber(r.on_hand)
    const reserved = parseNumber(r.reserved) ?? 0
    if (onHand === null || !Number.isInteger(onHand) || !Number.isInteger(reserved) || reserved < 0) return void invalidRows.push(i + 2)
    items.push({ variantId, onHand, reserved })
  })
  const saved = await saveInventory(warehouseId, items)
  if (!saved.ok) return saved
  return { ok: true, saved: saved.saved, unknownSkus, invalidRows }
}
