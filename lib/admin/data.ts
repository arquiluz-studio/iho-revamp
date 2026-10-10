import 'server-only'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ADMIN_MEDIA_SELECT, toAdminMedia, type AdminMedia } from './media'
import type { Option, ReferenceSource, ResourceConfig } from './resources'

type Supabase = Awaited<ReturnType<typeof createSupabaseServerClient>>
type AnyRow = Record<string, unknown>

/**
 * The resource tables are only known at runtime (from the config), so queries go through this
 * loosely-typed view of the client. Validation happens in the zod schema built from the same config.
 */
export function untypedFrom(supabase: Supabase, table: string) {
  return (supabase as unknown as { from: (t: string) => ReturnType<Supabase['from']> }).from(table as 'events')
}

export async function listRecords(config: ResourceConfig, countryCode: string | null): Promise<AnyRow[]> {
  const supabase = await createSupabaseServerClient()
  let query = untypedFrom(supabase, config.table).select('*')
  if (config.scope === 'country' && countryCode) query = query.eq('country_code', countryCode)
  for (const { column, ascending } of config.order) query = query.order(column, { ascending })
  const { data } = await query.limit(1000)
  return (data ?? []) as AnyRow[]
}

export async function loadRecord(
  config: ResourceConfig,
  id: string,
  countryCode: string | null,
): Promise<{ row: AnyRow; bridges: Record<string, string[]> } | null> {
  const supabase = await createSupabaseServerClient()
  let query = untypedFrom(supabase, config.table).select('*').eq(config.pk, id)
  if (config.scope === 'country' && countryCode && !config.singleton) query = query.eq('country_code', countryCode)
  const { data: row } = await query.maybeSingle()
  if (!row) return null

  const bridges: Record<string, string[]> = {}
  for (const field of config.fields) {
    if (field.type !== 'multi') continue
    const { data } = await untypedFrom(supabase, field.through.table).select(field.through.otherKey).eq(field.through.selfKey, id)
    bridges[field.name] = ((data ?? []) as unknown as AnyRow[]).map(r => String(r[field.through.otherKey]))
  }
  return { row: row as AnyRow, bridges }
}

const SOURCES: Record<ReferenceSource, { table: string; label: string; order: string }> = {
  brands: { table: 'brands', label: 'name', order: 'name' },
  business_lines: { table: 'business_lines', label: 'name_es', order: 'sort' },
  sectors: { table: 'sectors', label: 'name_es', order: 'sort' },
  products: { table: 'products', label: 'name_es', order: 'name_es' },
}

export async function loadOptions(config: ResourceConfig): Promise<Record<string, Option[]>> {
  const supabase = await createSupabaseServerClient()
  const options: Record<string, Option[]> = {}
  const sources = new Set(
    config.fields.flatMap(f => (f.type === 'reference' || f.type === 'multi' ? [[f.name, f.source] as const] : [])),
  )
  await Promise.all(
    [...sources].map(async ([name, source]) => {
      const { table, label, order } = SOURCES[source]
      const { data } = await untypedFrom(supabase, table).select(`id, ${label}`).order(order)
      options[name] = ((data ?? []) as unknown as AnyRow[]).map(r => ({ value: String(r.id), label: String(r[label]) }))
    }),
  )
  return options
}

export async function loadMedia(ids: (string | null | undefined)[]): Promise<Record<string, AdminMedia>> {
  const unique = [...new Set(ids.filter((id): id is string => Boolean(id)))]
  if (!unique.length) return {}
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('media_assets').select(ADMIN_MEDIA_SELECT).in('id', unique)
  return Object.fromEntries((data ?? []).map(row => [row.id, toAdminMedia(row)]))
}

export function mediaIdsOf(config: ResourceConfig, row: AnyRow | null): string[] {
  if (!row) return []
  return config.fields.filter(f => f.type === 'media').map(f => row[f.name] as string)
}
