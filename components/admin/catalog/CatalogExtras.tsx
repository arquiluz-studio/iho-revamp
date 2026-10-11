import { ADMIN_MEDIA_SELECT, toAdminMedia } from '@/lib/admin/media'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { GalleryEditor } from '../GalleryEditor'
import { VariantsEditor } from './VariantsEditor'

const amountText = (value: number | null | undefined) => (value === null || value === undefined ? '' : String(value))

export async function ProductExtras({
  productId,
  countryCode,
  coverId,
  canEdit,
}: {
  productId: string
  countryCode: string
  coverId: string | null
  canEdit: boolean
}) {
  const supabase = await createSupabaseServerClient()
  const [{ data: variants }, { data: gallery }] = await Promise.all([
    supabase
      .from('product_variants')
      .select('id, sku, name_es, name_en, options, erp_ref, is_active, variant_prices(cost, price)')
      .eq('product_id', productId)
      .order('sort'),
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
          erpRef: v.erp_ref ?? '',
          cost: amountText(v.variant_prices?.cost),
          price: amountText(v.variant_prices?.price),
          isActive: v.is_active,
        }))}
      />
      <GalleryEditor
        owner="product"
        ownerId={productId}
        countryCode={countryCode}
        initialCoverId={coverId}
        canEdit={canEdit}
        initialItems={(gallery ?? [])
          .filter(r => r.media_assets)
          .map(r => ({ media: toAdminMedia(r.media_assets!), captionEs: '', captionEn: '', isDownloadable: false }))}
      />
    </>
  )
}
