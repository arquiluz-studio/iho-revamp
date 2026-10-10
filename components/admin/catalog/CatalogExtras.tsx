import { ADMIN_MEDIA_SELECT, toAdminMedia } from '@/lib/admin/media'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { GalleryEditor } from '../GalleryEditor'
import { VariantsEditor } from './VariantsEditor'
import { VariantValuesEditor, type VariantValueRow } from './VariantValuesEditor'

type Supabase = Awaited<ReturnType<typeof createSupabaseServerClient>>

async function allVariants(supabase: Supabase) {
  const { data } = await supabase
    .from('product_variants')
    .select('id, sku, name_es, sort, product:products!inner(name_es, status, brand:brands(name))')
    .order('sort')
    .limit(20000)
  return (data ?? [])
    .filter(v => v.product.status !== 'archived')
    .sort((a, b) => a.product.name_es.localeCompare(b.product.name_es, 'es') || a.sort - b.sort)
}

const amountText = (value: number | null | undefined) => (value === null || value === undefined ? '' : String(value))

export async function ProductExtras({ productId, coverId, canEdit }: { productId: string; coverId: string | null; canEdit: boolean }) {
  const supabase = await createSupabaseServerClient()
  const [{ data: variants }, { data: gallery }] = await Promise.all([
    supabase.from('product_variants').select('id, sku, name_es, name_en, options, is_active').eq('product_id', productId).order('sort'),
    supabase.from('product_media').select(`sort, media_assets(${ADMIN_MEDIA_SELECT})`).eq('product_id', productId).order('sort'),
  ])
  return (
    <>
      <VariantsEditor
        productId={productId}
        canEdit={canEdit}
        initialVariants={(variants ?? []).map(v => ({
          id: v.id,
          sku: v.sku ?? '',
          nameEs: v.name_es,
          nameEn: v.name_en ?? '',
          options: Object.entries((v.options ?? {}) as Record<string, unknown>)
            .map(([k, value]) => `${k}: ${String(value)}`)
            .join('\n'),
          isActive: v.is_active,
        }))}
      />
      <GalleryEditor
        owner="product"
        ownerId={productId}
        countryCode={null}
        initialCoverId={coverId}
        canEdit={canEdit}
        initialItems={(gallery ?? [])
          .filter(r => r.media_assets)
          .map(r => ({ media: toAdminMedia(r.media_assets!), captionEs: '', captionEn: '', isDownloadable: false }))}
      />
    </>
  )
}

export async function PriceListExtras({ priceListId, currency, canEdit }: { priceListId: string; currency: string; canEdit: boolean }) {
  const supabase = await createSupabaseServerClient()
  const [variants, { data: items }] = await Promise.all([
    allVariants(supabase),
    supabase.from('price_list_items').select('variant_id, amount, compare_at_amount').eq('price_list_id', priceListId).limit(20000),
  ])
  const byVariant = new Map((items ?? []).map(i => [i.variant_id, i]))
  const rows: VariantValueRow[] = variants.map(v => ({
    variantId: v.id,
    sku: v.sku,
    product: v.product.name_es,
    variant: v.name_es,
    brand: v.product.brand?.name ?? '',
    first: amountText(byVariant.get(v.id)?.amount),
    second: amountText(byVariant.get(v.id)?.compare_at_amount),
  }))
  return <VariantValuesEditor mode="prices" ownerId={priceListId} currency={currency} initialRows={rows} canEdit={canEdit} />
}

export async function WarehouseExtras({ warehouseId, canEdit }: { warehouseId: string; canEdit: boolean }) {
  const supabase = await createSupabaseServerClient()
  const [variants, { data: levels }] = await Promise.all([
    allVariants(supabase),
    supabase.from('inventory_levels').select('variant_id, on_hand, reserved').eq('warehouse_id', warehouseId).limit(20000),
  ])
  const byVariant = new Map((levels ?? []).map(l => [l.variant_id, l]))
  const rows: VariantValueRow[] = variants.map(v => ({
    variantId: v.id,
    sku: v.sku,
    product: v.product.name_es,
    variant: v.name_es,
    brand: v.product.brand?.name ?? '',
    first: amountText(byVariant.get(v.id)?.on_hand),
    second: amountText(byVariant.get(v.id)?.reserved),
  }))
  return <VariantValuesEditor mode="inventory" ownerId={warehouseId} initialRows={rows} canEdit={canEdit} />
}
