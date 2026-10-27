import type { Metadata } from 'next'
import { Notice, PageHeader } from '@/components/admin/ui'
import { mayDeleteUser } from '@/lib/admin/delete-user'
import { requireAdminSession, requireCountry } from '@/lib/admin/session'
import { createSupabaseAdminClient, hasServiceRole } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { UsersManager, type StaffUser } from './UsersManager'

export const metadata: Metadata = { title: 'Usuarios' }

export default async function UsersPage() {
  const adminSession = await requireAdminSession()
  const globalView = adminSession.isGlobalScope && adminSession.isSuperAdmin
  const { session, country } = globalView ? { session: adminSession, country: null } : await requireCountry('admin')
  const supabase = await createSupabaseServerClient()

  // RLS: super admins see every profile; country admins see users with a role in their countries.
  const { data } = await supabase
    .from('profiles')
    .select('id, email, full_name, global_role, is_active, created_at, user_country_roles(country_code, role)')
    .order('email')

  const visible = (data ?? []).filter(p => session.isSuperAdmin || (country && p.user_country_roles?.some(r => r.country_code === country.code)))
  const access = await staffAccess(visible.map(p => p.id))
  const users: StaffUser[] = visible.map(p => {
    const roles = Object.fromEntries((p.user_country_roles ?? []).map(r => [r.country_code, r.role]))
    const full = access?.get(p.id)
    return {
      id: p.id,
      email: p.email,
      fullName: p.full_name ?? '',
      globalRole: p.global_role,
      isActive: p.is_active,
      roles,
      canDelete: full
        ? mayDeleteUser(session, { id: p.id, globalRole: full.globalRole, countryCodes: full.countryCodes })
        : false,
    }
  })

  const editableCountries = country
    ? [{ code: country.code, name: country.name_es }]
    : session.countries.map(c => ({ code: c.code, name: c.name_es }))

  return (
    <>
      <PageHeader
        title="Usuarios"
        description={
          !country
            ? 'Todos los usuarios del panel y su rol en cada país.'
            : session.isSuperAdmin
              ? 'Todos los usuarios del panel. El rol editable es el del país activo.'
              : `Personas con acceso a ${country.name_es}.`
        }
      />
      {!hasServiceRole() && (
        <div className="mb-4">
          <Notice tone="amber">Las invitaciones y la eliminación de cuentas requieren SUPABASE_SERVICE_ROLE_KEY en el servidor. Los cambios de rol funcionan sin ella.</Notice>
        </div>
      )}
      <UsersManager
        users={users}
        currentUserId={session.userId}
        countries={editableCountries}
        showOtherCountries={Boolean(country)}
        isSuperAdmin={session.isSuperAdmin}
      />
    </>
  )
}

/** Full country roles, including countries the signed-in admin cannot see. Needed so a country admin cannot delete someone who also belongs to another country. */
async function staffAccess(ids: string[]) {
  if (!hasServiceRole() || ids.length === 0) return null
  const admin = createSupabaseAdminClient()
  const [profiles, roles] = await Promise.all([
    admin.from('profiles').select('id, global_role').in('id', ids),
    admin.from('user_country_roles').select('user_id, country_code').in('user_id', ids),
  ])
  const byUser = new Map<string, { globalRole: string | null; countryCodes: string[] }>()
  for (const profile of profiles.data ?? []) byUser.set(profile.id, { globalRole: profile.global_role, countryCodes: [] })
  for (const role of roles.data ?? []) {
    const current = byUser.get(role.user_id) ?? { globalRole: null, countryCodes: [] }
    current.countryCodes.push(role.country_code)
    byUser.set(role.user_id, current)
  }
  return byUser
}
