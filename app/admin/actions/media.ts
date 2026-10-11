'use server'

import { z } from 'zod'
import { ADMIN_MEDIA_SELECT, toAdminMedia, type AdminMedia } from '@/lib/admin/media'
import { getAdminSession } from '@/lib/admin/session'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const idsSchema = z.array(z.uuid()).min(1).max(100)

/** Freshly uploaded assets, in the order of `ids`, so forms and galleries can show them right away. */
export async function getMediaByIds(ids: string[]): Promise<AdminMedia[]> {
  const parsed = idsSchema.safeParse(ids)
  if (!(await getAdminSession()) || !parsed.success) return []
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('media_assets').select(ADMIN_MEDIA_SELECT).in('id', parsed.data)
  const byId = new Map((data ?? []).map(row => [row.id, toAdminMedia(row)]))
  return parsed.data.flatMap(id => byId.get(id) ?? [])
}
