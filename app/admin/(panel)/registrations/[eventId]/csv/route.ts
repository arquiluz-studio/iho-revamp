import { csvResponse, toCsv } from '@/lib/admin/csv'
import { getAdminSession } from '@/lib/admin/session'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(_request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  if (!(await getAdminSession())) return new Response('Unauthorized', { status: 401 })
  const { eventId } = await params
  const supabase = await createSupabaseServerClient()

  const { data: event } = await supabase.from('events').select('slug').eq('id', eventId).maybeSingle()
  if (!event) return new Response('Not found', { status: 404 })
  const { data } = await supabase
    .from('event_registrations')
    .select('full_name, company, email, phone, pass_type, companions, status, checked_in_at, consent_marketing, locale, created_at')
    .eq('event_id', eventId)
    .order('created_at')

  const csv = toCsv(
    ['nombre', 'empresa', 'email', 'telefono', 'pase', 'acompanantes', 'estado', 'check_in', 'acepta_marketing', 'idioma', 'registrado'],
    (data ?? []).map(r => [
      r.full_name,
      r.company,
      r.email,
      r.phone,
      r.pass_type,
      r.companions,
      r.status,
      r.checked_in_at,
      r.consent_marketing ? 'si' : 'no',
      r.locale,
      r.created_at,
    ]),
  )
  return csvResponse(`registros-${event.slug}.csv`, csv)
}
