import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { SUPABASE_URL } from './env'

/**
 * Service-role client. Bypasses RLS: only for user invitations and account deletion,
 * validated public form inserts and the media pipeline. Never import from client components.
 */
export function createSupabaseAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  return createClient<Database>(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export const hasServiceRole = () => Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
