import { csvResponse, toCsv } from '@/lib/admin/csv'
import { LEAD_SELECT } from '@/lib/admin/leads'
import { getAdminSession } from '@/lib/admin/session'
import { Constants } from '@/lib/supabase/database.types'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const session = await getAdminSession()
  const country = session?.activeCountry
  if (!country) return new Response('Unauthorized', { status: 401 })

  const status = Constants.public.Enums.lead_status.find(s => s === new URL(request.url).searchParams.get('status'))
  const supabase = await createSupabaseServerClient()
  let query = supabase.from('contact_leads').select(LEAD_SELECT).eq('country_code', country.code).order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)
  const { data } = await query

  const csv = toCsv(
    ['fecha', 'estado', 'origen', 'nombre', 'apellido', 'email', 'telefono', 'empresa', 'area', 'espacio', 'mensaje', 'idioma', 'acepta_marketing'],
    (data ?? []).map(l => [
      l.created_at,
      l.status,
      l.source,
      l.first_name,
      l.last_name,
      l.email,
      l.phone,
      l.company,
      l.business_lines?.name_es,
      l.sectors?.name_es,
      l.message,
      l.locale,
      l.consent_marketing ? 'si' : 'no',
    ]),
  )
  return csvResponse(`leads-${country.code}-${new Date().toISOString().slice(0, 10)}.csv`, csv)
}
