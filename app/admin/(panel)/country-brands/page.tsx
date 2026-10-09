import type { Metadata } from 'next'
import { PageHeader } from '@/components/admin/ui'
import { loadMedia } from '@/lib/admin/data'
import { hasRole, requireCountry } from '@/lib/admin/session'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { CountryBrandsEditor } from './CountryBrandsEditor'

export const metadata: Metadata = { title: 'Marcas del país' }

export default async function CountryBrandsPage() {
  const { session, country } = await requireCountry('viewer')
  const supabase = await createSupabaseServerClient()
  const [{ data: brands }, { data: selection }] = await Promise.all([
    supabase.from('brands').select('id, name, logo_media_id, is_active').order('name'),
    supabase.from('country_brands').select('brand_id, is_visible, is_exclusive, sort').eq('country_code', country.code),
  ])
  const byBrand = new Map((selection ?? []).map(s => [s.brand_id, s]))
  const logos = await loadMedia((brands ?? []).map(b => b.logo_media_id))

  const rows = (brands ?? [])
    .map(brand => {
      const current = byBrand.get(brand.id)
      return {
        brandId: brand.id,
        name: brand.name,
        isActive: brand.is_active,
        logo: brand.logo_media_id ? (logos[brand.logo_media_id] ?? null) : null,
        isVisible: current?.is_visible ?? false,
        isExclusive: current?.is_exclusive ?? false,
        sort: current?.sort ?? 0,
      }
    })
    .sort((a, b) => Number(b.isVisible) - Number(a.isVisible) || a.sort - b.sort || a.name.localeCompare(b.name))

  return (
    <>
      <PageHeader
        title="Marcas del país"
        description={`Marcas del catálogo global que se muestran en el sitio de ${country.name_es}. Las marcas nuevas se crean en Global → Marcas.`}
      />
      <CountryBrandsEditor countryCode={country.code} initialRows={rows} canEdit={hasRole(session, country.code, 'admin')} />
    </>
  )
}
