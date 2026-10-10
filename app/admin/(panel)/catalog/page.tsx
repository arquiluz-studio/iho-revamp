import type { Metadata } from 'next'
import { ButtonLink, PageHeader } from '@/components/admin/ui'
import { loadMedia } from '@/lib/admin/data'
import { hasRole, requireCountry } from '@/lib/admin/session'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { CountryProductsEditor } from './CountryProductsEditor'

export const metadata: Metadata = { title: 'Catálogo del país' }

export default async function CountryCatalogPage() {
  const { session, country } = await requireCountry('viewer')
  const supabase = await createSupabaseServerClient()
  const [{ data: products }, { data: selection }] = await Promise.all([
    supabase.from('products').select('id, name_es, status, cover_media_id, brand:brands(name)').neq('status', 'archived').order('name_es'),
    supabase
      .from('country_products')
      .select('product_id, is_visible, is_purchasable, is_featured, lead_time_days, sort')
      .eq('country_code', country.code),
  ])
  const byProduct = new Map((selection ?? []).map(s => [s.product_id, s]))
  const covers = await loadMedia((products ?? []).map(p => p.cover_media_id))
  const canEdit = hasRole(session, country.code, 'admin')

  const rows = (products ?? [])
    .map(product => {
      const current = byProduct.get(product.id)
      return {
        productId: product.id,
        name: product.name_es,
        brand: product.brand?.name ?? '',
        status: product.status,
        cover: product.cover_media_id ? (covers[product.cover_media_id] ?? null) : null,
        isVisible: current?.is_visible ?? false,
        isPurchasable: current?.is_purchasable ?? false,
        isFeatured: current?.is_featured ?? false,
        leadTimeDays: current?.lead_time_days ?? null,
        sort: current?.sort ?? 0,
      }
    })
    .sort((a, b) => Number(b.isVisible) - Number(a.isVisible) || a.sort - b.sort || a.name.localeCompare(b.name, 'es'))

  return (
    <>
      <PageHeader
        title="Catálogo del país"
        description={`Productos del catálogo global que se muestran en el sitio de ${country.name_es}. Sin "Con precio", el sitio ofrece cotizar.`}
        actions={
          canEdit && (
            <>
              <ButtonLink href="/admin/price-lists" variant="outline">
                Listas de precios
              </ButtonLink>
              <ButtonLink href="/admin/warehouses" variant="outline">
                Inventario
              </ButtonLink>
            </>
          )
        }
      />
      <CountryProductsEditor countryCode={country.code} initialRows={rows} canEdit={canEdit} />
    </>
  )
}
