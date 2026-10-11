'use server'

import { revalidateCountry } from '@/lib/admin/revalidate'
import { getAdminSession, hasRole } from '@/lib/admin/session'
import { isContentPageKey } from '@/lib/content/static-pages'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { EXPIRED, FORBIDDEN, dbError, type ActionResult } from './result'

/** Chooses whether one page of a country uses the global hero or its own. */
export async function setPageSource(countryCode: string, pageKey: string, usesGlobal: boolean): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return EXPIRED
  if (!isContentPageKey(pageKey) || !hasRole(session, countryCode, 'admin')) return FORBIDDEN

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('country_page_choices').upsert(
    { country_code: countryCode, page_key: pageKey, uses_global: usesGlobal },
    { onConflict: 'country_code,page_key' },
  )
  if (error) return dbError(error)

  revalidateCountry(countryCode, 'pages', 'settings')
  return { ok: true }
}
