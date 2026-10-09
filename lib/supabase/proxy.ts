import { createServerClient } from '@supabase/ssr'
import type { NextRequest, NextResponse } from 'next/server'
import type { Database } from './database.types'
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from './env'

/**
 * Refreshes the Supabase session for admin requests. `makeResponse` is called again when cookies change
 * so the refreshed tokens reach both the browser and the server components rendering this request.
 */
export async function withRefreshedSession(
  request: NextRequest,
  makeResponse: () => NextResponse,
): Promise<NextResponse> {
  let response = makeResponse()
  if (!isSupabaseConfigured) return response

  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: toSet => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = makeResponse()
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })
  await supabase.auth.getUser()
  return response
}
