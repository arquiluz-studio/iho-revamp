'use server'

import { z } from 'zod'
import { untypedFrom } from '@/lib/admin/data'
import { buildSchema, toRow } from '@/lib/admin/form-schema'
import { getResource, singletonId, type ResourceConfig } from '@/lib/admin/resources'
import { revalidateResource } from '@/lib/admin/revalidate'
import { getAdminSession, hasRole, type AdminSession } from '@/lib/admin/session'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { EXPIRED, FORBIDDEN, dbError, type ActionResult } from './result'

function canWrite(session: AdminSession, config: ResourceConfig, countryCode: string | null): boolean {
  if (config.scope === 'country') return Boolean(countryCode && hasRole(session, countryCode, config.writeRole ?? 'editor'))
  return config.globalWrite === 'super' ? session.isSuperAdmin : session.canManageCatalog
}

/**
 * Creates or updates any resource described in `lib/admin/resources.ts`. Runs with the user's session,
 * so RLS is the real gatekeeper; the role check above only gives a clearer error message.
 */
export async function saveResource(
  key: string,
  id: string | null,
  countryCode: string | null,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const config = getResource(key)
  if (!config) return { ok: false, error: 'Recurso desconocido.' }
  const session = await getAdminSession()
  if (!session) return EXPIRED
  if (!canWrite(session, config, countryCode)) return FORBIDDEN

  const parsed = buildSchema(config).safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Revisa los campos marcados.', fieldErrors: z.flattenError(parsed.error).fieldErrors }
  }

  const timezone = session.countries.find(c => c.code === countryCode)?.timezone ?? 'America/Mexico_City'
  const { row, bridges } = toRow(config, parsed.data, timezone)
  if (config.scope === 'country') row.country_code = countryCode

  const supabase = await createSupabaseServerClient()
  const table = untypedFrom(supabase, config.table)
  let savedId: string

  if (config.singleton) {
    const key = singletonId(config, countryCode)
    if (!key) return FORBIDDEN
    row[config.pk] = key
    const { data, error } = await table.update(row as never).eq(config.pk, key).select(config.pk)
    if (error) return dbError(error)
    if (!data?.length) {
      const inserted = await untypedFrom(supabase, config.table).insert(row as never)
      if (inserted.error) return dbError(inserted.error)
    }
    savedId = key
  } else if (id) {
    delete row[config.pk]
    let query = table.update(row as never).eq(config.pk, id)
    if (config.scope === 'country') query = query.eq('country_code', countryCode!)
    const { data, error } = await query.select(config.pk).maybeSingle()
    if (error) return dbError(error)
    if (!data) return FORBIDDEN
    savedId = id
  } else {
    const { data, error } = await table.insert(row as never).select(config.pk).single()
    if (error) return dbError(error)
    savedId = String((data as unknown as Record<string, unknown>)[config.pk])
  }

  for (const field of config.fields) {
    if (field.type !== 'multi') continue
    const { table: bridge, selfKey, otherKey } = field.through
    const removed = await untypedFrom(supabase, bridge).delete().eq(selfKey, savedId)
    if (removed.error) return dbError(removed.error)
    const ids = bridges[field.name] ?? []
    if (ids.length) {
      const added = await untypedFrom(supabase, bridge).insert(ids.map(other => ({ [selfKey]: savedId, [otherKey]: other })) as never)
      if (added.error) return dbError(added.error)
    }
  }

  revalidateResource(config, countryCode, savedId)
  return { ok: true, id: savedId }
}

export async function deleteResource(key: string, id: string, countryCode: string | null): Promise<ActionResult> {
  const config = getResource(key)
  if (!config || config.singleton) return { ok: false, error: 'Recurso desconocido.' }
  const session = await getAdminSession()
  if (!session) return EXPIRED
  if (!canWrite(session, config, countryCode)) return FORBIDDEN

  const supabase = await createSupabaseServerClient()
  let query = untypedFrom(supabase, config.table).delete().eq(config.pk, id)
  if (config.scope === 'country') query = query.eq('country_code', countryCode!)
  const { data, error } = await query.select(config.pk)
  if (error) return dbError(error)
  if (!data?.length) return FORBIDDEN

  revalidateResource(config, countryCode, id)
  return { ok: true }
}
