import type { Json } from '@/lib/supabase/database.types'
import { createSupabaseServerClient } from '@/lib/supabase/server'

type StoredSlide = { kind: string; media_id: string }
type Client = Awaited<ReturnType<typeof createSupabaseServerClient>>

function isVideo(mimeType: string | null, paths: Json) {
  if (mimeType?.startsWith('video/')) return true
  return Boolean(paths && typeof paths === 'object' && !Array.isArray(paths) && typeof (paths as { video?: unknown }).video === 'string')
}

/** Confirms each slide's file exists and matches photo or video. */
export async function slideMediaError(supabase: Client, slides: StoredSlide[]): Promise<string | null> {
  if (!slides.length) return null
  const ids = [...new Set(slides.map(slide => slide.media_id))]
  const { data, error } = await supabase.from('media_assets').select('id, mime_type, public_paths').in('id', ids)
  if (error) return 'No se pudieron comprobar los archivos del hero.'
  const byId = new Map((data ?? []).map(row => [row.id, row]))
  for (const slide of slides) {
    const row = byId.get(slide.media_id)
    if (!row) return 'Una diapositiva usa un archivo que ya no existe.'
    const video = isVideo(row.mime_type, row.public_paths)
    if (slide.kind === 'video' && !video) return 'Una diapositiva de video tiene una foto.'
    if (slide.kind === 'image' && video) return 'Una diapositiva de foto tiene un video.'
  }
  return null
}
