'use server'

import { z } from 'zod'
import { revalidateTags } from '@/lib/admin/revalidate'
import { getAdminSession } from '@/lib/admin/session'
import { cacheTags } from '@/lib/cache-tags'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { EXPIRED, FORBIDDEN, dbError, type ActionResult } from './result'

const rowSchema = z.object({
  businessLineId: z.uuid(),
  sectorId: z.uuid(),
  bodyEs: z.string().trim().max(600),
  bodyEn: z.string().trim().max(600),
  imageId: z.uuid().nullable(),
})

/** Saves the photo and the bilingual sentence for the pairs of one solution or one space. */
export async function saveSolutionSpaceFits(rows: z.input<typeof rowSchema>[]): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return EXPIRED
  if (!session.canManageCatalog) return FORBIDDEN
  const parsed = z.array(rowSchema).max(200).safeParse(rows)
  if (!parsed.success) return { ok: false, error: 'Datos inválidos.' }

  const supabase = await createSupabaseServerClient()
  const [{ data: lines, error: linesError }, { data: sectors, error: sectorsError }] = await Promise.all([
    supabase.from('business_lines').select('id'),
    supabase.from('sectors').select('id'),
  ])
  if (linesError) return dbError(linesError)
  if (sectorsError) return dbError(sectorsError)
  const lineIds = new Set((lines ?? []).map(line => line.id))
  const sectorIds = new Set((sectors ?? []).map(sector => sector.id))
  const safe = parsed.data.filter(row => lineIds.has(row.businessLineId) && sectorIds.has(row.sectorId))

  const { error } = await supabase.from('solution_space_fits').upsert(
    safe.map(row => ({
      business_line_id: row.businessLineId,
      sector_id: row.sectorId,
      body_es: row.bodyEs || null,
      body_en: row.bodyEn || null,
      image_media_id: row.imageId,
    })),
    { onConflict: 'business_line_id,sector_id' },
  )
  if (error) return dbError(error)

  revalidateTags([cacheTags.taxonomies])
  return { ok: true }
}
