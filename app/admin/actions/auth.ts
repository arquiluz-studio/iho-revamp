'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { adminOrigin } from '@/lib/admin/origin'
import { isRateLimited } from '@/lib/security/spam'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { ActionResult } from './result'

const emailSchema = z.email().max(200)

/**
 * Sends a magic link + one-time code. Accounts are invite-only (`shouldCreateUser: false`); the response
 * is the same whether or not the email exists, so the form can't be used to enumerate staff.
 */
export async function requestSignIn(rawEmail: string): Promise<ActionResult> {
  const email = emailSchema.safeParse(rawEmail.trim().toLowerCase())
  if (!email.success) return { ok: false, error: 'Escribe un email válido.' }
  if (await isRateLimited(`admin-login:${email.data}`)) {
    return { ok: false, error: 'Demasiados intentos. Espera unos minutos.' }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: { shouldCreateUser: false, emailRedirectTo: `${await adminOrigin()}/admin/auth/callback` },
  })
  if (error && error.status === 429) return { ok: false, error: 'Demasiados intentos. Espera unos minutos.' }
  return { ok: true }
}

export async function verifySignInCode(rawEmail: string, rawCode: string): Promise<ActionResult> {
  const email = emailSchema.safeParse(rawEmail.trim().toLowerCase())
  const code = z.string().regex(/^\d{6,8}$/).safeParse(rawCode.replace(/\s/g, ''))
  if (!email.success || !code.success) return { ok: false, error: 'Código inválido.' }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.verifyOtp({ email: email.data, token: code.data, type: 'email' })
  if (error) return { ok: false, error: 'El código no es válido o ya expiró.' }
  redirect('/admin')
}
