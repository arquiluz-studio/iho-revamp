import type { Metadata } from 'next'
import { listMedia } from '@/app/admin/actions/media'
import { PageHeader } from '@/components/admin/ui'
import { hasRole, requireCountry } from '@/lib/admin/session'
import { Constants } from '@/lib/supabase/database.types'
import { MediaLibrary } from './MediaLibrary'

export const metadata: Metadata = { title: 'Biblioteca de media' }

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ kind?: string; scope?: string; status?: string; q?: string }> }) {
  const { session, country } = await requireCountry('viewer')
  const params = await searchParams
  const kind = Constants.public.Enums.media_kind.find(k => k === params.kind) ?? null
  const status = Constants.public.Enums.media_processing_status.find(s => s === params.status) ?? null
  const global = params.scope === 'global' && session.canManageCatalog
  const scopeCountry = global ? null : country.code

  const items = await listMedia({ countryCode: scopeCountry, kind, status, search: params.q, limit: 500 })

  return (
    <>
      <PageHeader
        title="Biblioteca de media"
        description={global ? 'Archivos globales (logos de marcas, productos, áreas y espacios).' : `Archivos de ${country.name_es}.`}
      />
      <MediaLibrary
        key={`${scopeCountry}-${kind}-${status}-${params.q ?? ''}`}
        items={items}
        countryCode={scopeCountry}
        filters={{ kind, status, scope: global ? 'global' : 'country', q: params.q ?? '' }}
        canEdit={global ? session.canManageCatalog : hasRole(session, country.code, 'editor')}
        canSeeGlobal={session.canManageCatalog}
      />
    </>
  )
}
