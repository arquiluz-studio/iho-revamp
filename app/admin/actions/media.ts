'use server'

import { z } from 'zod'
import { ADMIN_MEDIA_SELECT, toAdminMedia, type AdminMedia } from '@/lib/admin/media'
import { findMediaUsages, repointMediaUsages, type MediaUsage } from '@/lib/admin/media-usage'
import { getAdminSession } from '@/lib/admin/session'
import { revalidateTags } from '@/lib/admin/revalidate'
import { cacheTags } from '@/lib/cache-tags'
import { MEDIA_BUCKET, publicPaths } from '@/lib/media'
import { processMediaAsset } from '@/lib/media/pipeline'
import { createSupabaseAdminClient, hasServiceRole } from '@/lib/supabase/admin'
import { Constants } from '@/lib/supabase/database.types'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { EXPIRED, FORBIDDEN, dbError, type ActionResult } from './result'

const listSchema = z.object({
  countryCode: z.string().regex(/^[a-z]{2}$/).nullable(),
  kind: z.enum(Constants.public.Enums.media_kind).nullish(),
  includeGlobal: z.boolean().optional(),
  search: z.string().max(100).optional(),
  status: z.enum(Constants.public.Enums.media_processing_status).nullish(),
  limit: z.number().int().min(1).max(500).optional(),
})

export async function listMedia(input: z.input<typeof listSchema>): Promise<AdminMedia[]> {
  const session = await getAdminSession()
  const params = listSchema.safeParse(input)
  if (!session || !params.success) return []
  const { countryCode, kind, includeGlobal, search, status, limit } = params.data

  const supabase = await createSupabaseServerClient()
  let query = supabase.from('media_assets').select(ADMIN_MEDIA_SELECT).order('created_at', { ascending: false }).limit(limit ?? 200)
  if (countryCode && includeGlobal) query = query.or(`country_code.eq.${countryCode},country_code.is.null`)
  else if (countryCode) query = query.eq('country_code', countryCode)
  else query = query.is('country_code', null)
  if (kind) query = query.eq('kind', kind)
  if (status) query = query.eq('processing_status', status)
  if (search) {
    const term = search.replace(/[%,()]/g, ' ').trim()
    if (term) query = query.or(`alt_es.ilike.%${term}%,alt_en.ilike.%${term}%,credit.ilike.%${term}%`)
  }
  const { data } = await query
  return (data ?? []).map(toAdminMedia)
}

const updateSchema = z.object({
  altEs: z.string().trim().max(300),
  altEn: z.string().trim().max(300),
  credit: z.string().trim().max(200),
  isDownloadable: z.boolean(),
})

export async function updateMedia(id: string, input: z.input<typeof updateSchema>): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return EXPIRED
  const parsed = updateSchema.safeParse(input)
  if (!parsed.success || !z.uuid().safeParse(id).success) return { ok: false, error: 'Datos inválidos.' }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('media_assets')
    .update({
      alt_es: parsed.data.altEs || null,
      alt_en: parsed.data.altEn || null,
      credit: parsed.data.credit || null,
      is_downloadable: parsed.data.isDownloadable,
    })
    .eq('id', id)
    .select('id, country_code')
    .maybeSingle()
  if (error) return dbError(error)
  if (!data) return FORBIDDEN
  await revalidateUsages(id)
  return { ok: true }
}

export async function getMediaUsages(id: string): Promise<MediaUsage[]> {
  if (!(await getAdminSession()) || !z.uuid().safeParse(id).success) return []
  return findMediaUsages(await createSupabaseServerClient(), id)
}

/** Points every usage of `oldId` to `newId` (the replacement upload) and deletes the old asset. */
export async function replaceMedia(oldId: string, newId: string): Promise<ActionResult<{ moved: number }>> {
  const session = await getAdminSession()
  if (!session) return EXPIRED
  if (!z.uuid().safeParse(oldId).success || !z.uuid().safeParse(newId).success) return { ok: false, error: 'Datos inválidos.' }

  const supabase = await createSupabaseServerClient()
  const { data: previous } = await supabase.from('media_assets').select('alt_es, alt_en, credit').eq('id', oldId).maybeSingle()
  if (previous) await supabase.from('media_assets').update(previous).eq('id', newId)
  const usages = await findMediaUsages(supabase, oldId)
  const moved = await repointMediaUsages(supabase, oldId, newId)
  if (!moved.ok) return moved
  revalidateTags(usages.flatMap(u => u.tags))
  const removed = await deleteMedia(oldId)
  return removed.ok ? { ok: true, moved: usages.length } : removed
}

export async function deleteMedia(id: string): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return EXPIRED
  if (!z.uuid().safeParse(id).success) return { ok: false, error: 'Datos inválidos.' }

  const supabase = await createSupabaseServerClient()
  const usages = await findMediaUsages(supabase, id)
  if (usages.length) return { ok: false, error: `Está en uso en ${usages.length} lugar(es). Quítala primero o usa "Reemplazar".` }

  const { data, error } = await supabase
    .from('media_assets')
    .delete()
    .eq('id', id)
    .select('original_bucket, original_path, public_paths')
    .maybeSingle()
  if (error) return dbError(error)
  if (!data) return FORBIDDEN

  // Storage objects have no delete policy for staff: the row delete above was the permission check.
  if (hasServiceRole()) {
    const admin = createSupabaseAdminClient()
    const files = Object.values(publicPaths(data)).filter((p): p is string => Boolean(p))
    if (files.length) await admin.storage.from(MEDIA_BUCKET).remove([...new Set(files)])
    if (data.original_bucket && data.original_path) await admin.storage.from(data.original_bucket).remove([data.original_path])
  }
  revalidateTags([cacheTags.media(id)])
  return { ok: true }
}

export async function retryProcessing(id: string): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return EXPIRED
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('media_assets').update({ processing_status: 'pending' }).eq('id', id).select('id').maybeSingle()
  if (!data) return FORBIDDEN
  if (!hasServiceRole()) return { ok: false, error: 'Falta SUPABASE_SERVICE_ROLE_KEY en el servidor para procesar imágenes.' }
  const result = await processMediaAsset(id)
  if (!result.ok) return { ok: false, error: `No se pudo procesar (${result.error}).` }
  await revalidateUsages(id)
  return { ok: true }
}

async function revalidateUsages(id: string) {
  const usages = await findMediaUsages(await createSupabaseServerClient(), id)
  revalidateTags([cacheTags.media(id), ...usages.flatMap(u => u.tags)])
}
