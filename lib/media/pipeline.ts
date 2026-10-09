import 'server-only'
import sharp from 'sharp'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { Json } from '@/lib/supabase/database.types'
import { IMAGE_VARIANTS, MEDIA_BUCKET, UPLOADS_BUCKET, mediaFolder, type ImageVariant, type PublicPaths } from './index'

const IMMUTABLE = '31536000'
const WEBP_QUALITY = 80

type ProcessedImage = {
  variants: Record<ImageVariant, Buffer>
  width: number
  height: number
  lqip: string
  dominantColor: string
}

export async function processImage(input: Buffer): Promise<ProcessedImage> {
  // rotate() applies EXIF orientation; sharp drops all metadata unless asked to keep it.
  const base = sharp(input, { failOn: 'none' }).rotate()
  const meta = await base.metadata()
  const oriented = meta.orientation && meta.orientation >= 5
  const width = (oriented ? meta.height : meta.width) ?? 0
  const height = (oriented ? meta.width : meta.height) ?? 0

  const variants = {} as Record<ImageVariant, Buffer>
  for (const [name, size] of Object.entries(IMAGE_VARIANTS) as [ImageVariant, number][]) {
    variants[name] = await base
      .clone()
      .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY, alphaQuality: 90, effort: 5 })
      .toBuffer()
  }

  const tiny = await base.clone().resize(16, 16, { fit: 'inside' }).webp({ quality: 40 }).toBuffer()
  const { dominant } = await base.clone().resize(64, 64, { fit: 'inside' }).stats()
  const hex = (n: number) => n.toString(16).padStart(2, '0')

  return {
    variants,
    width,
    height,
    lqip: `data:image/webp;base64,${tiny.toString('base64')}`,
    dominantColor: `#${hex(dominant.r)}${hex(dominant.g)}${hex(dominant.b)}`,
  }
}

/**
 * Downloads the original of a pending media asset, generates the public variants and marks it ready.
 * Originals in `uploads-tmp` are deleted afterwards; project originals are kept for high-res downloads.
 */
export async function processMediaAsset(mediaId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = createSupabaseAdminClient()
  const { data: media, error } = await admin.from('media_assets').select('*').eq('id', mediaId).single()
  if (error || !media) return { ok: false, error: 'not_found' }
  if (!media.original_bucket || !media.original_path) return { ok: false, error: 'missing_original' }

  try {
    const download = await admin.storage.from(media.original_bucket).download(media.original_path)
    if (download.error) throw download.error
    const original = Buffer.from(await download.data.arrayBuffer())
    const folder = `${mediaFolder(media.country_code)}/${media.kind}/${media.id}`
    const paths: PublicPaths = {}
    const update: Partial<typeof media> = { bytes: original.byteLength }

    const upload = async (path: string, body: Buffer, contentType: string) => {
      const res = await admin.storage.from(MEDIA_BUCKET).upload(path, body, { contentType, cacheControl: IMMUTABLE, upsert: true })
      if (res.error) throw res.error
    }

    if (media.mime_type === 'video/mp4') {
      paths.video = `${folder}/video.mp4`
      await upload(paths.video, original, 'video/mp4')
    } else {
      if (media.mime_type === 'image/svg+xml') {
        paths.svg = `${folder}/logo.svg`
        await upload(paths.svg, original, 'image/svg+xml')
      }
      const processed = await processImage(original)
      const longEdge = Math.max(processed.width, processed.height)
      let previous: { path: string; size: number } | undefined
      for (const [name, size] of Object.entries(IMAGE_VARIANTS) as [ImageVariant, number][]) {
        // Variants are never upscaled: if the original already fit in the previous variant, reuse that file.
        if (previous && longEdge <= previous.size) {
          paths[name] = previous.path
          continue
        }
        paths[name] = `${folder}/${name}.webp`
        await upload(paths[name]!, processed.variants[name], 'image/webp')
        previous = { path: paths[name]!, size }
      }
      Object.assign(update, {
        width: processed.width,
        height: processed.height,
        lqip: processed.lqip,
        dominant_color: processed.dominantColor,
      })
    }

    const keepOriginal = media.original_bucket !== UPLOADS_BUCKET
    if (!keepOriginal) await admin.storage.from(media.original_bucket).remove([media.original_path])

    const { error: updateError } = await admin
      .from('media_assets')
      .update({
        ...update,
        public_paths: paths as Json,
        processing_status: 'ready',
        ...(keepOriginal ? {} : { original_bucket: null, original_path: null }),
      })
      .eq('id', media.id)
    if (updateError) throw updateError
    return { ok: true }
  } catch (e) {
    await admin.from('media_assets').update({ processing_status: 'failed' }).eq('id', media.id)
    return { ok: false, error: e instanceof Error ? e.message : 'processing_failed' }
  }
}
