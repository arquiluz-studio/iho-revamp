import { MediaThumb } from '@/components/admin/MediaUpload'
import { Card, Notice, PageHeader } from '@/components/admin/ui'
import { loadMedia } from '@/lib/admin/data'
import { contentPage, sitePage, type ContentPageKey } from '@/lib/content/static-pages'
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
] as const

const SEO_FIELDS = [
  ['SEO · título', 'seo_title_es', 'seo_title_en'],
  ['SEO · descripción', 'seo_description_es', 'seo_description_en'],
] as const

const STYLE_LABEL: Record<string, string> = { red: 'Rojo', outline: 'Contorno blanco', black: 'Negro' }

function previewCtas(raw: unknown) {
  if (!Array.isArray(raw)) return []
  return raw.flatMap(item => {
    if (!item || typeof item !== 'object') return []
    const row = item as Record<string, unknown>
    const labelEs = typeof row.label_es === 'string' ? row.label_es.trim() : ''
    const labelEn = typeof row.label_en === 'string' ? row.label_en.trim() : ''
    if (!labelEs && !labelEn) return []
    const destination =
      row.kind === 'page' && typeof row.page === 'string'
        ? (sitePage(row.page)?.label ?? row.page)
        : typeof row.url === 'string'
          ? row.url
          : ''
    return [
      {
        labelEs,
        labelEn,
        style: STYLE_LABEL[String(row.style)] ?? 'Rojo',
        destination,
        window: row.open_in === 'blank' ? 'Nueva ventana' : 'La misma ventana',
      },
    ]
  })
}

function textOf(row: Record<string, unknown>, key: string) {
  return typeof row[key] === 'string' ? row[key] : ''
}

function previewSlides(raw: unknown) {
  if (!Array.isArray(raw)) return []
  return raw.flatMap(item => {
    if (!item || typeof item !== 'object') return []
    const row = item as Record<string, unknown>
    return [
      {
        kind: row.kind === 'video' ? 'Video' : 'Foto',
        mediaId: typeof row.media_id === 'string' ? row.media_id : '',
        duration: typeof row.duration_seconds === 'number' ? row.duration_seconds : null,
        eyebrowEs: textOf(row, 'eyebrow_es'),
        eyebrowEn: textOf(row, 'eyebrow_en'),
        titleEs: textOf(row, 'title_es'),
        titleEn: textOf(row, 'title_en'),
        subtitleEs: textOf(row, 'subtitle_es'),
        subtitleEn: textOf(row, 'subtitle_en'),
        ctas: previewCtas(row.ctas),
      },
    ]
  })
}

/** Read-only view of the global hero a country is currently publishing. */
export async function GlobalHeroPreview({ pageKey }: { pageKey: ContentPageKey }) {
  const page = contentPage(pageKey)
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('site_pages').select('*').eq('page_key', pageKey).maybeSingle()
  const slides = pageKey === 'home' ? previewSlides(data?.hero_slides) : []
  const media = await loadMedia([
    data?.hero_image_media_id,
    data?.hero_video_media_id,
    data?.contact_image_media_id,
    ...slides.map(slide => slide.mediaId),
  ])
  const fields = pageKey === 'home' ? (slides.length ? SEO_FIELDS : [...HOME_FIELDS, ...SEO_FIELDS]) : PAGE_FIELDS
  const filled = fields.filter(([, es, en]) => data?.[es] || data?.[en])
  const images: { label: string; id: string }[] = []
  if (pageKey === 'home' && !slides.length && data?.hero_video_media_id) images.push({ label: 'Video', id: data.hero_video_media_id })
  if (!slides.length && data?.hero_image_media_id) images.push({ label: 'Imagen', id: data.hero_image_media_id })
  if (pageKey === 'home' && data?.contact_image_media_id) images.push({ label: 'Imagen de contacto', id: data.contact_image_media_id })
  const ctas = slides.length ? [] : previewCtas(data?.hero_ctas)
  const empty = !data || (filled.length === 0 && images.length === 0 && ctas.length === 0 && slides.length === 0)

  return (
    <>
      <PageHeader title={page?.label ?? 'Página'} description="Contenido global en solo lectura. Se edita en Contenido - Global." />
      {data?.hero_enabled === false && <Notice>El hero está apagado. Los países que publican este contenido tampoco lo muestran.</Notice>}
      {empty ? (
        <Notice>El contenido global de esta página está vacío.</Notice>
      ) : (
        <Card className="space-y-5 p-5">
          {slides.map((slide, index) => (
            <div key={index} className="space-y-2 border-b border-zinc-200 pb-4">
              <p className="text-xs font-medium text-zinc-500">
                Diapositiva {index + 1} · {slide.kind}
                {slide.duration ? ` · ${slide.duration}s` : ''}
              </p>
              {slide.mediaId && <MediaThumb media={media[slide.mediaId]} className="h-24 w-36" />}
              {slide.eyebrowEs && <p className="whitespace-pre-wrap text-sm text-zinc-900">{slide.eyebrowEs}</p>}
              {slide.eyebrowEn && <p className="whitespace-pre-wrap text-sm text-zinc-500">{slide.eyebrowEn}</p>}
              {slide.titleEs && <p className="whitespace-pre-wrap text-sm text-zinc-900">{slide.titleEs}</p>}
              {slide.titleEn && <p className="whitespace-pre-wrap text-sm text-zinc-500">{slide.titleEn}</p>}
              {slide.subtitleEs && <p className="whitespace-pre-wrap text-sm text-zinc-900">{slide.subtitleEs}</p>}
              {slide.subtitleEn && <p className="whitespace-pre-wrap text-sm text-zinc-500">{slide.subtitleEn}</p>}
              {slide.ctas.length > 0 && <p className="text-sm text-zinc-500">{slide.ctas.map(cta => cta.labelEs || cta.labelEn).join(' · ')}</p>}
            </div>
          ))}
          {filled.map(([label, es, en]) => (
            <div key={label}>
              <p className="text-xs font-medium text-zinc-500">{label}</p>
              {data[es] && <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-900">{data[es]}</p>}
              {data[en] && <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-500">{data[en]}</p>}
            </div>
          ))}
          <div>
            <p className="text-xs font-medium text-zinc-500">Botones</p>
            {ctas.length === 0 ? (
              <p className="mt-1 text-sm text-zinc-500">Ninguno</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {ctas.map((cta, index) => (
                  <li key={index} className="text-sm text-zinc-900">
                    <p>{cta.labelEs || cta.labelEn}</p>
                    {cta.labelEn && cta.labelEs && <p className="text-zinc-500">{cta.labelEn}</p>}
                    <p className="text-zinc-500">
                      {[cta.style, cta.destination, cta.window].filter(Boolean).join(' · ')}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
