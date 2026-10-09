import type { Metadata } from 'next'
import { PageHeader } from '@/components/admin/ui'
import { LEAD_SELECT } from '@/lib/admin/leads'
import { hasRole, requireCountry } from '@/lib/admin/session'
import { Constants } from '@/lib/supabase/database.types'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { LeadsInbox } from './LeadsInbox'

export const metadata: Metadata = { title: 'Leads' }

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { session, country } = await requireCountry('viewer')
  const { status } = await searchParams
  const supabase = await createSupabaseServerClient()

  let query = supabase.from('contact_leads').select(LEAD_SELECT).eq('country_code', country.code).order('created_at', { ascending: false }).limit(500)
  const statusFilter = Constants.public.Enums.lead_status.find(s => s === status)
  if (statusFilter) query = query.eq('status', statusFilter)
  const { data } = await query

  return (
    <>
      <PageHeader
        title="Leads"
        description={`Contactos recibidos en el sitio de ${country.name_es}.`}
        actions={
          <a
            className="inline-flex h-9 items-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium hover:bg-zinc-50"
            href={`/admin/leads/csv${statusFilter ? `?status=${statusFilter}` : ''}`}
          >
            Exportar CSV
          </a>
        }
      />
      <LeadsInbox
        key={statusFilter ?? 'all'}
        leads={(data ?? []).map(l => ({
          ...l,
          business_line: l.business_lines?.name_es ?? null,
          sector: l.sectors?.name_es ?? null,
        }))}
        status={statusFilter ?? ''}
        timeZone={country.timezone}
        canEdit={hasRole(session, country.code, 'editor')}
        canDelete={hasRole(session, country.code, 'admin')}
      />
    </>
  )
}
