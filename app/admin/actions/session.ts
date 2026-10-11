'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_COUNTRY_COOKIE, ADMIN_GLOBAL_SCOPE } from '@/lib/admin/roles'
import { getAdminSession } from '@/lib/admin/session'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function setActiveCountry(code: string) {
  const session = await getAdminSession()
  if (!session) return
  const allowed = code === ADMIN_GLOBAL_SCOPE ? session.canManageCatalog : session.countries.some(c => c.code === code)
  if (!allowed) return
  ;(await cookies()).set(ADMIN_COUNTRY_COOKIE, code, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax', httpOnly: true })
}

export async function signOut() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
