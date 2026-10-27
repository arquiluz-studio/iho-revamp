import type { Metadata } from 'next'
import { SolutionSpacesEditor } from '@/components/admin/SolutionSpacesEditor'
import { ADMIN_MEDIA_SELECT, toAdminMedia } from '@/lib/admin/media'
import { requireCatalogAccess } from '@/lib/admin/session'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Soluciones por espacio' }

export default async function SolutionSpacesPage() {
  const session = await requireCatalogAccess()
  const supabase = await createSupabaseServerClient()
  const [{ data: lines }, { data: sectors }, { data: fits }] = await Promise.all([
    supabase.from('business_lines').select('id, name_es, sort').order('sort'),
    supabase.from('sectors').select('id, name_es, sort').order('sort'),
    supabase.from('solution_space_fits').select('business_line_id, sector_id, body_es, body_en, image_media_id'),
  ])

  const byPair = new Map((fits ?? []).map(fit => [`${fit.business_line_id}:${fit.sector_id}`, fit]))
  const groups = (lines ?? []).map(line => ({
    id: line.id,
    name: line.name_es,
    rows: (sectors ?? []).map(sector => {
      const fit = byPair.get(`${line.id}:${sector.id}`)
      return {
        businessLineId: line.id,
        sectorId: sector.id,
        spaceName: sector.name_es,
        bodyEs: fit?.body_es ?? '',
        bodyEn: fit?.body_en ?? '',
        imageId: fit?.image_media_id ?? null,
      }
    }),
  }))

  const imageIds = [...new Set(groups.flatMap(group => group.rows.flatMap(row => (row.imageId ? [row.imageId] : []))))]
  const { data: media } = imageIds.length
    ? await supabase.from('media_assets').select(ADMIN_MEDIA_SELECT).in('id', imageIds)
    : { data: [] }

  return <SolutionSpacesEditor groups={groups} media={(media ?? []).map(toAdminMedia)} canEdit={session.canManageCatalog} />
}
