import type { Metadata } from 'next'
import Link from 'next/link'
import { formatDateTime } from '@/lib/admin/format'
import { Badge, Card, CardHeader, Notice, PageHeader, STATUS_TONES } from '@/components/admin/ui'
import { LEAD_SOURCE_LABELS } from '@/lib/admin/leads'
import { requireAdminSession } from '@/lib/admin/session'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Dashboard' }

function Empty({ children }: { children: string }) {
  return <p className="px-5 py-4 text-sm text-zinc-400">{children}</p>
}

export default async function DashboardPage() {
  const session = await requireAdminSession()
  const country = session.activeCountry

  if (!country) {
    return (
      <>
        <PageHeader title={`Hola, ${session.profile.full_name || session.email}`} />
        {session.canManageCatalog ? (
          <Notice>
            Tienes acceso al catálogo global. Usa el menú <strong>Global</strong> para editar marcas, áreas y espacios.
          </Notice>
        ) : (
          <Notice tone="amber">Aún no tienes países asignados. Pide a un administrador que te dé acceso.</Notice>
        )}
      </>
    )
  }

  const supabase = await createSupabaseServerClient()
  const now = new Date().toISOString()
  const [upcoming, registrations, leads, newLeads, draftEvents, draftProjects] = await Promise.all([
    supabase
      .from('events')
      .select('id, title_es, starts_at, timezone, status, city, capacity, event_registrations(count)')
      .eq('country_code', country.code)
      .gte('starts_at', now)
      .order('starts_at')
      .limit(6),
    supabase
      .from('event_registrations')
      .select('id, full_name, company, status, created_at, event_id, events!inner(title_es, country_code)')
      .eq('events.country_code', country.code)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('contact_leads')
      .select('id, first_name, last_name, company, source, created_at')
      .eq('country_code', country.code)
      .eq('status', 'new')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.from('contact_leads').select('id', { count: 'exact', head: true }).eq('country_code', country.code).eq('status', 'new'),
    supabase.from('events').select('id, title_es, updated_at').eq('country_code', country.code).eq('status', 'draft').order('updated_at', { ascending: false }).limit(5),
    supabase.from('projects').select('id, title_es, updated_at').eq('country_code', country.code).eq('status', 'draft').order('updated_at', { ascending: false }).limit(5),
  ])
  const drafts = [
    ...(draftEvents.data ?? []).map(d => ({ ...d, href: `/admin/events/${d.id}`, kind: 'Evento' })),
    ...(draftProjects.data ?? []).map(d => ({ ...d, href: `/admin/projects/${d.id}`, kind: 'Proyecto' })),
  ].sort((a, b) => b.updated_at.localeCompare(a.updated_at))

  return (
    <>
      <PageHeader title={`Hola, ${session.profile.full_name?.split(' ')[0] || session.email}`} description={`Resumen de ${country.name_es}`} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Próximos eventos"
            actions={
              <Link className="text-xs text-zinc-500 hover:text-zinc-900" href="/admin/calendar">
                Calendario →
              </Link>
            }
          />
          {upcoming.data?.length ? (
            <ul className="divide-y divide-zinc-100">
              {upcoming.data.map(event => {
                const count = (event.event_registrations as unknown as { count: number }[])?.[0]?.count ?? 0
                return (
                  <li key={event.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <Link href={`/admin/events/${event.id}`} className="block truncate text-sm font-medium hover:underline">
                        {event.title_es}
                      </Link>
                      <p className="text-xs text-zinc-500">
                        {formatDateTime(event.starts_at, event.timezone)}
                        {event.city && ` · ${event.city}`}
                      </p>
                    </div>
                    <Link href={`/admin/registrations/${event.id}`} className="text-xs text-zinc-600 hover:underline">
                      {count}
                      {event.capacity ? `/${event.capacity}` : ''} registros
                    </Link>
                    <Badge tone={STATUS_TONES[event.status]}>{event.status === 'published' ? 'Publicado' : 'Borrador'}</Badge>
                  </li>
                )
              })}
            </ul>
          ) : (
            <Empty>No hay eventos próximos.</Empty>
          )}
        </Card>

        <Card>
          <CardHeader
            title={`Leads nuevos${newLeads.count ? ` (${newLeads.count})` : ''}`}
            actions={
              <Link className="text-xs text-zinc-500 hover:text-zinc-900" href="/admin/leads?status=new">
                Bandeja →
              </Link>
            }
          />
          {leads.data?.length ? (
            <ul className="divide-y divide-zinc-100">
              {leads.data.map(lead => (
                <li key={lead.id} className="px-5 py-3">
                  <p className="text-sm font-medium">
                    {lead.first_name} {lead.last_name}
                    {lead.company && <span className="font-normal text-zinc-500"> · {lead.company}</span>}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {LEAD_SOURCE_LABELS[lead.source] ?? lead.source} · {formatDateTime(lead.created_at, country.timezone)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Sin leads nuevos.</Empty>
          )}
        </Card>

        <Card>
          <CardHeader title="Registros recientes" />
          {registrations.data?.length ? (
            <ul className="divide-y divide-zinc-100">
              {registrations.data.map(r => (
                <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {r.full_name}
                      {r.company && <span className="font-normal text-zinc-500"> · {r.company}</span>}
                    </p>
                    <Link href={`/admin/registrations/${r.event_id}`} className="block truncate text-xs text-zinc-500 hover:underline">
                      {r.events.title_es} · {formatDateTime(r.created_at, country.timezone)}
                    </Link>
                  </div>
                  <Badge tone={STATUS_TONES[r.status]}>{r.status}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Sin registros todavía.</Empty>
          )}
        </Card>

        <Card>
          <CardHeader title="Borradores pendientes" />
          {drafts.length ? (
            <ul className="divide-y divide-zinc-100">
              {drafts.map(d => (
                <li key={d.href} className="flex items-center gap-3 px-5 py-3">
                  <Badge>{d.kind}</Badge>
                  <Link href={d.href} className="min-w-0 flex-1 truncate text-sm hover:underline">
                    {d.title_es}
                  </Link>
                  <span className="text-xs text-zinc-400">{formatDateTime(d.updated_at, country.timezone, false)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No hay borradores.</Empty>
          )}
        </Card>
      </div>
    </>
  )
}
