import type { Database } from '@/lib/supabase/database.types'

export type CountryRole = Database['public']['Enums']['country_role']
export type GlobalRole = Database['public']['Enums']['global_role']

export const ROLE_RANK: Record<CountryRole, number> = { viewer: 1, editor: 2, admin: 3 }

export const ROLE_LABELS: Record<CountryRole, string> = { viewer: 'Lector', editor: 'Editor', admin: 'Administrador' }
export const GLOBAL_ROLE_LABELS: Record<GlobalRole, string> = {
  super_admin: 'Super admin',
  catalog_admin: 'Admin de catálogo',
}

export const ADMIN_COUNTRY_COOKIE = 'iho_admin_country'
/** Cookie value that selects the global (catalog) workspace instead of a country. */
export const ADMIN_GLOBAL_SCOPE = 'global'

export const atLeast = (role: CountryRole | undefined, min: CountryRole) => Boolean(role && ROLE_RANK[role] >= ROLE_RANK[min])
