'use server'

import { z } from 'zod'
import { adminOrigin } from '@/lib/admin/origin'
import { getAdminSession, hasRole } from '@/lib/admin/session'
import { createSupabaseAdminClient, hasServiceRole } from '@/lib/supabase/admin'
import { Constants } from '@/lib/supabase/database.types'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { EXPIRED, FORBIDDEN, dbError, type ActionResult } from './result'

const countryRole = z.enum(Constants.public.Enums.country_role)
const globalRole = z.enum(Constants.public.Enums.global_role)

const inviteSchema = z.object({
  email: z.email('Email inválido').max(200),
  fullName: z.string().trim().max(160),
  countryCode: z.string().regex(/^[a-z]{2}$/),
  role: countryRole.nullable(),
  globalRole: globalRole.nullable(),
})

/**
 * Invites a staff member (or reuses an existing account) and grants the role. The service role is only
 * used to create the auth user; the role grant goes through RLS with the inviter's session, so a country
 * admin can't grant roles outside their country and only super admins can grant global roles.
 */
export async function inviteUser(input: z.input<typeof inviteSchema>): Promise<ActionResult<{ invited: boolean }>> {
  const session = await getAdminSession()
  if (!session) return EXPIRED
  const parsed = inviteSchema.safeParse({ ...input, email: input.email.trim().toLowerCase() })
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
  const { email, fullName, countryCode, role, globalRole: global } = parsed.data
  if (!hasRole(session, countryCode, 'admin')) return FORBIDDEN
  if (global && !session.isSuperAdmin) return FORBIDDEN
  if (!role && !global) return { ok: false, error: 'Elige un rol.' }
  if (!hasServiceRole()) return { ok: false, error: 'Falta SUPABASE_SERVICE_ROLE_KEY en el servidor para enviar invitaciones.' }

  const admin = createSupabaseAdminClient()
  let userId: string | null = null
  let invited = false
  const { data: existing } = await admin.from('profiles').select('id').eq('email', email).maybeSingle()
  if (existing) {
    userId = existing.id
  } else {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName },
      redirectTo: `${await adminOrigin()}/admin/auth/confirm`,
    })
    if (error || !data.user) return { ok: false, error: `No se pudo enviar la invitación: ${error?.message ?? 'error'}` }
    userId = data.user.id
    invited = true
  }

  const supabase = await createSupabaseServerClient()
  if (role) {
    const { error } = await supabase
      .from('user_country_roles')
      .upsert({ user_id: userId, country_code: countryCode, role }, { onConflict: 'user_id,country_code' })
    if (error) return dbError(error)
  }
  if (global || fullName) {
    const patch: { global_role?: typeof global; full_name?: string } = {}
    if (global) patch.global_role = global
    if (fullName && invited) patch.full_name = fullName
    if (Object.keys(patch).length && session.isSuperAdmin) {
      const { error } = await supabase.from('profiles').update(patch).eq('id', userId)
      if (error) return dbError(error)
    }
  }
  return { ok: true, invited }
}

export async function setCountryRole(userId: string, countryCode: string, role: string | null): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return EXPIRED
  if (!hasRole(session, countryCode, 'admin')) return FORBIDDEN
  if (userId === session.userId && !session.isSuperAdmin) return { ok: false, error: 'No puedes cambiar tu propio rol.' }
  const supabase = await createSupabaseServerClient()

  if (role === null) {
    const { error } = await supabase.from('user_country_roles').delete().eq('user_id', userId).eq('country_code', countryCode)
    return error ? dbError(error) : { ok: true }
  }
  const parsed = countryRole.safeParse(role)
  if (!parsed.success) return { ok: false, error: 'Rol inválido.' }
  const { error } = await supabase
    .from('user_country_roles')
    .upsert({ user_id: userId, country_code: countryCode, role: parsed.data }, { onConflict: 'user_id,country_code' })
  return error ? dbError(error) : { ok: true }
}

export async function setGlobalRole(userId: string, role: string | null): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return EXPIRED
  if (!session.isSuperAdmin) return FORBIDDEN
  if (userId === session.userId) return { ok: false, error: 'No puedes quitarte tu propio rol de super admin.' }
  const parsed = globalRole.nullable().safeParse(role)
  if (!parsed.success) return { ok: false, error: 'Rol inválido.' }
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from('profiles').update({ global_role: parsed.data }).eq('id', userId).select('id').maybeSingle()
  if (error) return dbError(error)
  return data ? { ok: true } : FORBIDDEN
}

export async function setUserActive(userId: string, isActive: boolean): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return EXPIRED
  if (!session.isSuperAdmin) return FORBIDDEN
  if (userId === session.userId) return { ok: false, error: 'No puedes desactivar tu propia cuenta.' }
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from('profiles').update({ is_active: isActive }).eq('id', userId).select('id').maybeSingle()
  if (error) return dbError(error)
  return data ? { ok: true } : FORBIDDEN
}
