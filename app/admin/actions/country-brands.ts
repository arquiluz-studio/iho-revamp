'use server'

import { z } from 'zod'
import { revalidateCountry } from '@/lib/admin/revalidate'
import { getAdminSession, hasRole } from '@/lib/admin/session'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { EXPIRED, FORBIDDEN, dbError, type ActionResult } from './result'

const rowSchema = z.object({
  brandId: z.uuid(),
  isVisible: z.boolean(),
  isExclusive: z.boolean(),
  isFeatured: z.boolean(),
  sort: z.number().int().min(0).max(10000),
})

/** Upserts the country's brand selection. Hidden brands keep their row (sort/exclusivity) with is_visible = false. */
export async function saveCountryBrands(countryCode: string, rows: z.input<typeof rowSchema>[]): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return EXPIRED
  if (!hasRole(session, countryCode, 'admin')) return FORBIDDEN
  const parsed = z.array(rowSchema).max(500).safeParse(rows)
  if (!parsed.success) return { ok: false, error: 'Datos inválidos.' }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('country_brands').upsert(
    parsed.data.map(r => ({
      country_code: countryCode,
      brand_id: r.brandId,
      is_visible: r.isVisible,
      is_exclusive: r.isExclusive,
      is_featured: r.isVisible && r.isFeatured,
      sort: r.sort,
    })),
    { onConflict: 'country_code,brand_id' },
  )
  if (error) return dbError(error)
  revalidateCountry(countryCode, 'brands', 'catalog')
  return { ok: true }
}
