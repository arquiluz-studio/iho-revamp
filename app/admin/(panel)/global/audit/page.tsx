import type { Metadata } from 'next'
import Link from 'next/link'
import { formatDateTime } from '@/lib/admin/format'
import { Badge, EmptyState, PageHeader, cn } from '@/components/admin/ui'
import { requireSuperAdmin } from '@/lib/admin/session'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Auditoría' }

const ACTION_TONES = { insert: 'green', update: 'blue', delete: 'red' } as const

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ table?: string; country?: string }> }) {
  await requireSuperAdmin()
  const { table, country } = await searchParams
  const supabase = await createSupabaseServerClient()

  let query = supabase
    .from('audit_log')
    .select('id, created_at, action, table_name, row_id, country_code, diff, profiles(email, full_name)')
    .order('created_at', { ascending: false })
    .limit(300)
  if (table) query = query.eq('table_name', table)
  if (country) query = query.eq('country_code', country)
  const { data } = await query

  const filter = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams(Object.entries({ table, country, ...patch }).filter((e): e is [string, string] => Boolean(e[1])))
    return `/admin/global/audit${params.size ? `?${params}` : ''}`
  }

  return (
    <>
      <PageHeader title="Auditoría" description="Últimos 300 cambios en el contenido, registros y leads." />
      {(table || country) && (
        <p className="mb-3 text-sm">
          Filtro: {table && <Badge>{table}</Badge>} {country && <Badge>{country.toUpperCase()}</Badge>}{' '}
          <Link className="text-zinc-500 underline" href="/admin/global/audit">
            quitar
          </Link>
        </p>
      )}
      {!data?.length ? (
        <EmptyState>Sin cambios registrados.</EmptyState>
      ) : (
        <ul className="divide-y divide-zinc-100 overflow-hidden rounded-lg border border-zinc-200 bg-white text-sm">
          {data.map(entry => {
            const diff = entry.diff as { new?: Record<string, unknown>; old?: Record<string, unknown> }
            const changed = Object.keys(diff?.new ?? {}).filter(k => k !== 'updated_at')
            return (
              <li key={entry.id}>
                <details className="group">
                  <summary className="flex cursor-pointer flex-wrap items-center gap-3 px-4 py-2.5 hover:bg-zinc-50">
                    <Badge tone={ACTION_TONES[entry.action as keyof typeof ACTION_TONES] ?? 'neutral'}>{entry.action}</Badge>
                    <Link className="font-mono text-xs text-zinc-700 hover:underline" href={filter({ table: entry.table_name })}>
                      {entry.table_name}
                    </Link>
                    {entry.country_code && (
                      <Link className="text-xs text-zinc-500 hover:underline" href={filter({ country: entry.country_code })}>
                        {entry.country_code.toUpperCase()}
                      </Link>
                    )}
                    <span className={cn('min-w-0 flex-1 truncate text-xs text-zinc-500')}>
                      {entry.action === 'update' ? changed.join(', ') : entry.row_id}
                    </span>
                    <span className="text-xs text-zinc-600">{entry.profiles?.full_name || entry.profiles?.email || 'sistema'}</span>
                    <span className="text-xs text-zinc-400">{formatDateTime(entry.created_at)}</span>
                  </summary>
                  <pre className="max-h-80 overflow-auto bg-zinc-50 px-4 py-3 text-xs text-zinc-700">{JSON.stringify(diff, null, 2)}</pre>
                </details>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
