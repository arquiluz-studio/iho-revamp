'use server'

import { z } from 'zod'
import { revalidateTags } from '@/lib/admin/revalidate'
import { getAdminSession, hasRole } from '@/lib/admin/session'
import { cacheTags } from '@/lib/cache-tags'
import type { Json } from '@/lib/supabase/database.types'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { EXPIRED, FORBIDDEN, dbError, type ActionResult } from './result'

type Supabase = Awaited<ReturnType<typeof createSupabaseServerClient>>

const variantSchema = z.object({
  id: z.uuid().optional(),
  sku: z.string().trim().max(80),
  nameEs: z.string().trim().min(1, 'Requerido').max(160),
  nameEn: z.string().trim().max(160),
  /** One "key: value" pair per line. */
  options: z.string().max(2000),
  erpRef: z.string().trim().max(120),
  cost: z.string().trim().max(20),
  price: z.string().trim().max(20),
  isActive: z.boolean(),
  imageMediaId: z.union([z.uuid(), z.literal('')]),
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

/** Empty stays empty. "18,900.50", "18.900,50" and "$18900" become a number. */
function parseMoney(text: string): number | null {
  const raw = text.replace(/[^\d.,-]/g, '')
  if (!raw) return null
  const lastComma = raw.lastIndexOf(',')
  const lastDot = raw.lastIndexOf('.')
  let normalized = raw
  if (lastComma > -1 && lastDot > -1) {
    normalized = lastComma > lastDot ? raw.replace(/\./g, '').replace(',', '.') : raw.replace(/,/g, '')
  } else if (lastComma > -1) {
    normalized = /,\d{1,2}$/.test(raw) ? raw.replace(',', '.') : raw.replace(/,/g, '')
  }
  const value = Number(normalized)
  return Number.isFinite(value) ? value : Number.NaN
}

async function productCountry(supabase: Supabase, productId: string) {
  const { data } = await supabase.from('products').select('country_code, countries(currency)').eq('id', productId).maybeSingle()
  return data ? { country: data.country_code, currency: data.countries?.currency ?? null } : null
}

function revalidateProduct(productId: string, country: string) {
  revalidateTags([cacheTags.product(productId), cacheTags.country(country, 'catalog'), cacheTags.products])
}

/** Replaces the variant list of a product, including each SKU's cost and sale price. */
export async function saveVariants(productId: string, raw: VariantInput[]): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return EXPIRED
  const parsed = z.array(variantSchema).min(1, 'El producto necesita al menos una variante.').max(200).safeParse(raw)
  if (!parsed.success || !z.uuid().safeParse(productId).success) {
    return { ok: false, error: parsed.error?.issues[0]?.message ?? 'Datos inválidos.' }
  }
  const skus = parsed.data.map(v => v.sku).filter(Boolean)
  if (new Set(skus).size !== skus.length) return { ok: false, error: 'Hay SKUs repetidos.' }

  const supabase = await createSupabaseServerClient()
  const owner = await productCountry(supabase, productId)
  if (!owner || !hasRole(session, owner.country, 'admin')) return FORBIDDEN
  if (!owner.currency) return { ok: false, error: 'El país no tiene moneda.' }

  const money = parsed.data.map(v => ({ cost: parseMoney(v.cost), price: parseMoney(v.price) }))
  if (money.some(m => Number.isNaN(m.cost) || Number.isNaN(m.price) || (m.cost ?? 0) < 0 || (m.price ?? 0) < 0)) {
    return { ok: false, error: 'Revisa costo y precio: deben ser números positivos.' }
  }

  const { data: existing, error } = await supabase.from('product_variants').select('id').eq('product_id', productId)
  if (error) return dbError(error)
  const keep = new Set(parsed.data.flatMap(v => (v.id ? [v.id] : [])))

  const rows = parsed.data.map((v, sort) => ({
    product_id: productId,
    sku: v.sku || null,
    name_es: v.nameEs,
    name_en: v.nameEn || null,
    options: parseOptions(v.options) as Json,
    erp_ref: v.erpRef || null,
    is_active: v.isActive,
    image_media_id: v.imageMediaId || null,
    sort,
  }))
  const savedIds: string[] = []
  // Insert/update first so the "at least one variant" trigger never sees an empty product.
  for (const [i, v] of parsed.data.entries()) {
    const result = v.id
      ? await supabase.from('product_variants').update(rows[i]).eq('id', v.id).eq('product_id', productId).select('id').single()
      : await supabase.from('product_variants').insert(rows[i]).select('id').single()
    if (result.error) return dbError(result.error)
    savedIds.push(result.data.id)
  }
  const priced = await supabase.from('variant_prices').upsert(
    savedIds.map((variant_id, i) => ({
      variant_id,
      currency: owner.currency!,
      cost: money[i].cost,
      price: money[i].price,
    })),
    { onConflict: 'variant_id' },
  )
  if (priced.error) return dbError(priced.error)

  const removed = (existing ?? []).map(r => r.id).filter(id => !keep.has(id))
  if (removed.length) {
    const result = await supabase.from('product_variants').delete().in('id', removed)
    if (result.error) return dbError(result.error)
  }
  revalidateProduct(productId, owner.country)
  return { ok: true }
}

export async function saveProductGallery(productId: string, mediaIds: string[]): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return EXPIRED
  const ids = z.array(z.uuid()).max(100).safeParse(mediaIds)
  if (!ids.success || !z.uuid().safeParse(productId).success) return { ok: false, error: 'Datos inválidos.' }

  const supabase = await createSupabaseServerClient()
  const owner = await productCountry(supabase, productId)
  if (!owner || !hasRole(session, owner.country, 'admin')) return FORBIDDEN

  const removed = await supabase.from('product_media').delete().eq('product_id', productId)
  if (removed.error) return dbError(removed.error)
  if (ids.data.length) {
    const added = await supabase.from('product_media').insert(ids.data.map((media_id, sort) => ({ product_id: productId, media_id, sort })))
    if (added.error) return dbError(added.error)
  }
  const cover = ids.data[0] ?? null
  const updated = await supabase.from('products').update({ cover_media_id: cover }).eq('id', productId)
  if (updated.error) return dbError(updated.error)
  revalidateProduct(productId, owner.country)
  return { ok: true }
}
