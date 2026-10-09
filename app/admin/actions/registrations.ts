'use server'

import { z } from 'zod'
import { revalidateTags } from '@/lib/admin/revalidate'
import { getAdminSession } from '@/lib/admin/session'
import { cacheTags } from '@/lib/cache-tags'
import { Constants } from '@/lib/supabase/database.types'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { EXPIRED, FORBIDDEN, dbError, type ActionResult } from './result'

const patchSchema = z.union([
  z.object({ status: z.enum(Constants.public.Enums.registration_status) }),
  z.object({ checkedIn: z.boolean() }),
])

/** Status change or check-in. RLS limits updates to editors of the event's country. */
export async function updateRegistration(id: string, patch: z.input<typeof patchSchema>): Promise<ActionResult<{ checkedInAt: string | null }>> {
  if (!(await getAdminSession())) return EXPIRED
  const parsed = patchSchema.safeParse(patch)
  if (!parsed.success || !z.uuid().safeParse(id).success) return { ok: false, error: 'Datos inválidos.' }

  const update =
    'status' in parsed.data
      ? { status: parsed.data.status }
      : parsed.data.checkedIn
        ? { checked_in_at: new Date().toISOString(), status: 'attended' as const }
        : { checked_in_at: null, status: 'confirmed' as const }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('event_registrations')
    .update(update)
    .eq('id', id)
    .select('event_id, checked_in_at')
    .maybeSingle()
  if (error) return dbError(error)
  if (!data) return FORBIDDEN
  // Seat counts are shown on the public event page.
  revalidateTags([cacheTags.event(data.event_id)])
  return { ok: true, checkedInAt: data.checked_in_at }
}

export async function deleteRegistration(id: string): Promise<ActionResult> {
  if (!(await getAdminSession())) return EXPIRED
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from('event_registrations').delete().eq('id', id).select('event_id').maybeSingle()
  if (error) return dbError(error)
  if (!data) return FORBIDDEN
  revalidateTags([cacheTags.event(data.event_id)])
  return { ok: true }
}
