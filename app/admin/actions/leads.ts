'use server'

import { z } from 'zod'
import { getAdminSession } from '@/lib/admin/session'
import { Constants } from '@/lib/supabase/database.types'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { EXPIRED, FORBIDDEN, dbError, type ActionResult } from './result'

export async function updateLeadStatus(id: string, status: string): Promise<ActionResult> {
  if (!(await getAdminSession())) return EXPIRED
  const parsed = z.enum(Constants.public.Enums.lead_status).safeParse(status)
  if (!parsed.success || !z.uuid().safeParse(id).success) return { ok: false, error: 'Datos inválidos.' }
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from('contact_leads').update({ status: parsed.data }).eq('id', id).select('id').maybeSingle()
  if (error) return dbError(error)
  return data ? { ok: true } : FORBIDDEN
}

export async function deleteLead(id: string): Promise<ActionResult> {
  if (!(await getAdminSession())) return EXPIRED
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from('contact_leads').delete().eq('id', id).select('id').maybeSingle()
  if (error) return dbError(error)
  return data ? { ok: true } : FORBIDDEN
}
