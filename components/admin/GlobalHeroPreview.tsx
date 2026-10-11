import { MediaThumb } from '@/components/admin/MediaUpload'
import { Card, Notice, PageHeader } from '@/components/admin/ui'
import { loadMedia } from '@/lib/admin/data'
import { contentPage, type ContentPageKey } from '@/lib/content/static-pages'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const PAGE_FIELDS = [
  ['Antetítulo', 'hero_eyebrow_es', 'hero_eyebrow_en'],
  ['Título', 'hero_title_es', 'hero_title_en'],
  ['Introducción', 'hero_intro_es', 'hero_intro_en'],
  ['Párrafo extra', 'hero_extra_es', 'hero_extra_en'],
] as const

const HOME_FIELDS = [
  ['Antetítulo', 'hero_eyebrow_es', 'hero_eyebrow_en'],
  ['Título', 'hero_title_es', 'hero_title_en'],
  ['Subtítulo', 'hero_subtitle_es', 'hero_subtitle_en'],
  ['SEO · título', 'seo_title_es', 'seo_title_en'],
  ['SEO · descripción', 'seo_description_es', 'seo_description_en'],
] as const

/** Read-only view of the global hero a country is currently publishing. */
export async function GlobalHeroPreview({ pageKey }: { pageKey: ContentPageKey }) {
  const page = contentPage(pageKey)
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('site_pages').select('*').eq('page_key', pageKey).maybeSingle()
  const media = await loadMedia([data?.hero_image_media_id, data?.hero_video_media_id, data?.contact_image_media_id])
  const fields = pageKey === 'home' ? HOME_FIELDS : PAGE_FIELDS
  const filled = fields.filter(([, es, en]) => data?.[es] || data?.[en])
  const images: { label: string; id: string }[] = []
  if (pageKey === 'home' && data?.hero_video_media_id) images.push({ label: 'Video', id: data.hero_video_media_id })
  if (data?.hero_image_media_id) images.push({ label: 'Imagen', id: data.hero_image_media_id })
  if (pageKey === 'home' && data?.contact_image_media_id) images.push({ label: 'Imagen de contacto', id: data.contact_image_media_id })

  return (
    <>
      <PageHeader title={page?.label ?? 'Página'} description="Contenido global en solo lectura. Se edita en Contenido - Global." />
      {!data || (filled.length === 0 && images.length === 0) ? (
        <Notice>El contenido global de esta página está vacío.</Notice>
      ) : (
        <Card className="space-y-5 p-5">
          {filled.map(([label, es, en]) => (
            <div key={label}>
              <p className="text-xs font-medium text-zinc-500">{label}</p>
              {data[es] && <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-900">{data[es]}</p>}
              {data[en] && <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-500">{data[en]}</p>}
            </div>
          ))}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {images.map(({ label, id }) => (
                <div key={label}>
                  <p className="mb-1 text-xs font-medium text-zinc-500">{label}</p>
                  <MediaThumb media={media[id]} className="h-24 w-36" />
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </>
  )
}
