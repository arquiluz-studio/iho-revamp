import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { formatDateTime } from '@/lib/admin/format'
import { ButtonLink, Card, PageHeader } from '@/components/admin/ui'
import { hasRole, requireCountry } from '@/lib/admin/session'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { RegistrationsTable } from './RegistrationsTable'

export const metadata: Metadata = { title: 'Registros' }

export default async function RegistrationsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params
  const { session } = await requireCountry('viewer')
  const supabase = await createSupabaseServerClient()

  const { data: event } = await supabase
    .from('events')
    .select('id, title_es, starts_at, timezone, capacity, country_code, registration_enabled')
    .eq('id', eventId)
    .maybeSingle()
  if (!event || !hasRole(session, event.country_code, 'viewer')) notFound()

  const { data: registrations } = await supabase
    .from('event_registrations')
    .select('id, full_name, company, email, phone, pass_type, companions, status, checked_in_at, created_at, consent_marketing')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })

  const rows = registrations ?? []
  const count = (status: string) => rows.filter(r => r.status === status).length
  const seats = rows
    .filter(r => r.status === 'confirmed' || r.status === 'attended' || r.status === 'pending')
    .reduce((sum, r) => sum + 1 + (r.companions ?? 0), 0)
  const stats = [
    ['Confirmados', count('confirmed') + count('attended')],
    ['Asistieron', count('attended')],
    ['Lista de espera', count('waitlist')],
    ['Cancelados', count('cancelled')],
    ['Lugares ocupados', event.capacity ? `${seats} / ${event.capacity}` : seats],
  ] as const

  return (
    <>
      <PageHeader
        title={`Registros · ${event.title_es}`}
        description={formatDateTime(event.starts_at, event.timezone)}
        actions={
          <>
            <ButtonLink href={`/admin/events/${event.id}`} variant="ghost">
              ← Evento
            </ButtonLink>
            <a className="inline-flex h-9 items-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium hover:bg-zinc-50" href={`/admin/registrations/${event.id}/csv`}>
              Exportar CSV
            </a>
          </>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map(([label, value]) => (
          <Card key={label} className="px-4 py-3">
            <p className="text-xs text-zinc-500">{label}</p>
            <p className="text-lg font-semibold">{value}</p>
          </Card>
        ))}
      </div>
      <RegistrationsTable
        rows={rows}
        timeZone={event.timezone}
        canEdit={hasRole(session, event.country_code, 'editor')}
        canDelete={hasRole(session, event.country_code, 'admin')}
      />
    </>
  )
}
