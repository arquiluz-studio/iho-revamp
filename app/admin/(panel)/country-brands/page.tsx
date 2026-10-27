import type { Metadata } from 'next'
import { loadMedia } from '@/lib/admin/data'
import { hasRole, requireCountry } from '@/lib/admin/session'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { CountryBrandsEditor } from './CountryBrandsEditor'
import { compareCountryBrands } from './order'

export const metadata: Metadata = { title: 'Marcas del país' }

export default async function CountryBrandsPage() {
  const { session, country } = await requireCountry('viewer')
  const supabase = await createSupabaseServerClient()
  const [{ data: brands }, { data: selection }] = await Promise.all([
    supabase.from('brands').select('id, name, logo_media_id, is_active').order('name'),
    supabase.from('country_brands').select('brand_id, is_visible, is_exclusive, is_featured, sort').eq('country_code', country.code),
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
        isFeatured: current?.is_featured ?? false,
        sort: current?.sort ?? 0,
      }
    })
    .sort(compareCountryBrands)

  return (
    <>
      <CountryBrandsEditor
        countryCode={country.code}
        description={`Marcas del catálogo global que maneja ${country.name_es}. Visible las muestra en el directorio. En el home marca las que salen en la portada.`}
        initialRows={rows}
        canEdit={hasRole(session, country.code, 'admin')}
      />
    </>
  )
}
