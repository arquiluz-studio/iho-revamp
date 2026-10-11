import type { Metadata } from 'next'
import { Notice, PageHeader } from '@/components/admin/ui'
import { requireAdminSession, requireCountry } from '@/lib/admin/session'
import { hasServiceRole } from '@/lib/supabase/admin'
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

  const users: StaffUser[] = (data ?? [])
    .map(p => ({
      id: p.id,
      email: p.email,
      fullName: p.full_name ?? '',
      globalRole: p.global_role,
      isActive: p.is_active,
      roles: Object.fromEntries((p.user_country_roles ?? []).map(r => [r.country_code, r.role])),
    }))
    .filter(u => session.isSuperAdmin || (country && u.roles[country.code]))

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
          <Notice tone="amber">Las invitaciones requieren SUPABASE_SERVICE_ROLE_KEY en el servidor. Los cambios de rol funcionan sin ella.</Notice>
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
