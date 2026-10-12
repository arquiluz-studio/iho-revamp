import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { MEDIA_SELECT } from '@/lib/media'
import { createSupabaseAdminClient, hasServiceRole } from '@/lib/supabase/admin'
import type { Database } from '@/lib/supabase/database.types'
import { createSupabasePublicClient } from '@/lib/supabase/server'

export type Db = SupabaseClient<Database>
export type QueryContext = { db: Db; draft: boolean }

/** Embedded media columns for PostgREST selects, e.g. `cover:${media('events_cover_media_id_fkey')}`. */
export const media = <F extends string>(fk: F) => `media_assets!${fk}(${MEDIA_SELECT})` as const

/** Content statuses visible in the current mode: drafts are only shown in Draft Mode. */
export const visibleStatuses = (draft: boolean) => (draft ? (['draft', 'published'] as const) : (['published'] as const))

/** Daily safety net; content changes purge their tags immediately from the admin. */
const REVALIDATE_SECONDS = 60 * 60 * 24

async function isDraft(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled
  } catch {
    // Outside a request (generateStaticParams, build-time routes).
    return false
  }
}

/** The data cache outlives deployments, so entries are scoped per commit: a changed select never reads an old row shape. The local fallback changes with the cached shape. */
const CACHE_NAMESPACE = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? 'local-previous-editions'

/**
 * Runs a public read. Normally it's cached under `tags` with the anonymous client (RLS: published content
 * only). In Draft Mode it skips the cache and uses the service role so editors can preview drafts.
 */
export async function cachedQuery<T>(
  key: (string | number | boolean | null | undefined)[],
  tags: string[],
  run: (ctx: QueryContext) => Promise<T>,
  revalidate = REVALIDATE_SECONDS,
): Promise<T> {
  if (await isDraft()) {
    const db = hasServiceRole() ? createSupabaseAdminClient() : createSupabasePublicClient()
    return run({ db, draft: true })
  }
  const cached = unstable_cache(() => run({ db: createSupabasePublicClient(), draft: false }), ['q', CACHE_NAMESPACE, ...key.map(k => String(k ?? ''))], {
    tags,
    revalidate,
  })
  return cached()
}

/** Throws on PostgREST errors so failures surface instead of rendering empty pages. */
export function must<T>(result: { data: T | null; error: { message: string } | null }, label: string): T {
  if (result.error) throw new Error(`${label}: ${result.error.message}`)
  return result.data as T
}

/** `must` for `maybeSingle()` reads: keeps `null` for "not found". */
export function maybe<T>(result: { data: T; error: { message: string } | null }, label: string): T {
  if (result.error) throw new Error(`${label}: ${result.error.message}`)
  return result.data
}
