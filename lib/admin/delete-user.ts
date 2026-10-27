import { hasRole, type AdminSession } from './session'

/** Super admins can delete anyone else. A country admin can delete someone only when every country role that person has is in a country they administer, and the person has no global role. */
export function mayDeleteUser(session: AdminSession, target: { id: string; globalRole: string | null; countryCodes: string[] }): boolean {
  if (target.id === session.userId) return false
  if (session.isSuperAdmin) return true
  if (target.globalRole) return false
  if (target.countryCodes.length === 0) return false
  return target.countryCodes.every(code => hasRole(session, code, 'admin'))
}
