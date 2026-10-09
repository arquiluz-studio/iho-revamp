import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import type { Database } from '@/lib/supabase/database.types'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ADMIN_COUNTRY_COOKIE, ROLE_RANK, type CountryRole } from './roles'

type Profile = Database['public']['Tables']['profiles']['Row']
type CountryRow = Pick<Database['public']['Tables']['countries']['Row'], 'code' | 'name_es' | 'timezone' | 'currency' | 'domain'>

export type AdminSession = {
  userId: string
  email: string
  profile: Profile
  isSuperAdmin: boolean
  isCatalogAdmin: boolean
  canManageCatalog: boolean
  /** Countries the user can work on, with their effective role (super admins are admin everywhere). */
  countries: (CountryRow & { role: CountryRole })[]
  activeCountry: (CountryRow & { role: CountryRole }) | null
}

/** Resolves the signed-in staff member once per request. Returns null when there is no valid staff session. */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const supabase = await createSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return null

  const [{ data: profile }, { data: roles }, { data: countries }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', auth.user.id).maybeSingle(),
    supabase.from('user_country_roles').select('country_code, role').eq('user_id', auth.user.id),
    supabase.from('countries').select('code, name_es, timezone, currency, domain').order('sort'),
  ])
  if (!profile || !profile.is_active) return null

  const isSuperAdmin = profile.global_role === 'super_admin'
  const isCatalogAdmin = profile.global_role === 'catalog_admin'
  const roleByCountry = new Map((roles ?? []).map(r => [r.country_code, r.role]))
  const allowed = (countries ?? [])
    .map(c => ({ ...c, role: (isSuperAdmin ? 'admin' : roleByCountry.get(c.code)) as CountryRole | undefined }))
    .filter((c): c is CountryRow & { role: CountryRole } => Boolean(c.role))

  const preferred = (await cookies()).get(ADMIN_COUNTRY_COOKIE)?.value
  const activeCountry = allowed.find(c => c.code === preferred) ?? allowed[0] ?? null

  return {
    userId: auth.user.id,
    email: profile.email,
    profile,
    isSuperAdmin,
    isCatalogAdmin,
    canManageCatalog: isSuperAdmin || isCatalogAdmin,
    countries: allowed,
    activeCountry,
  }
})

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  return session
}

/** Active country with at least `minRole`; otherwise sends the user to the dashboard. */
export async function requireCountry(minRole: CountryRole = 'viewer') {
  const session = await requireAdminSession()
  const country = session.activeCountry
  if (!country || ROLE_RANK[country.role] < ROLE_RANK[minRole]) redirect('/admin')
  return { session, country }
}

export async function requireCatalogAccess() {
  const session = await requireAdminSession()
  if (!session.canManageCatalog) redirect('/admin')
  return session
}

export async function requireSuperAdmin() {
  const session = await requireAdminSession()
  if (!session.isSuperAdmin) redirect('/admin')
  return session
}

export function hasRole(session: AdminSession, countryCode: string, minRole: CountryRole): boolean {
  const country = session.countries.find(c => c.code === countryCode)
  return Boolean(country && ROLE_RANK[country.role] >= ROLE_RANK[minRole])
}
