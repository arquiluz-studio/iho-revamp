import type { Database } from '@/lib/supabase/database.types'
import { SUPABASE_URL } from '@/lib/supabase/env'
import type { ImageVM } from '@/lib/types/site'

export type MediaRow = Database['public']['Tables']['media_assets']['Row']
export type MediaKind = Database['public']['Enums']['media_kind']
/** Columns needed to render a media asset on the public site. */
export type MediaRef = Pick<MediaRow, 'id' | 'public_paths' | 'width' | 'height' | 'lqip' | 'dominant_color' | 'alt_es' | 'alt_en'>
export const MEDIA_SELECT = 'id, public_paths, width, height, lqip, dominant_color, alt_es, alt_en'

export const MEDIA_BUCKET = 'media'
export const PROJECT_ORIGINALS_BUCKET = 'project-originals'
export const UPLOADS_BUCKET = 'uploads-tmp'

/** Long-edge sizes of the pre-generated WebP variants. */
export const IMAGE_VARIANTS = { thumb: 480, md: 1280, lg: 2400 } as const
export type ImageVariant = keyof typeof IMAGE_VARIANTS
export type PublicPaths = Partial<Record<ImageVariant | 'video' | 'svg', string>>

export function mediaFolder(countryCode: string | null): string {
  return countryCode ?? 'global'
}

export function publicMediaUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`
}

export function publicPaths(media: Pick<MediaRow, 'public_paths'>): PublicPaths {
  const value = media.public_paths
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as PublicPaths) : {}
}

/**
 * Builds the responsive image view model. `largest` caps the variant used as `src` / srcset
 * (grids → thumb, detail pages → md, heroes and lightboxes → lg).
 */
export function toImageVM(media: MediaRef, locale: string, largest: ImageVariant = 'lg', fallbackAlt = ''): ImageVM {
  const paths = publicPaths(media)
  const alt = (locale === 'en' && media.alt_en) || media.alt_es || fallbackAlt
  if (paths.svg) return { src: publicMediaUrl(paths.svg), alt, width: media.width, height: media.height }

  const order: ImageVariant[] = ['thumb', 'md', 'lg']
  const allowed = order.slice(0, order.indexOf(largest) + 1)
  const available = allowed.filter((v, i) => paths[v] && allowed.slice(0, i).every(prev => paths[prev] !== paths[v]))
  const longEdge = Math.max(media.width ?? 0, media.height ?? 0)
  const ratio = longEdge && media.width ? media.width / longEdge : 1
  const srcSet = available
    .map(v => `${publicMediaUrl(paths[v]!)} ${Math.round(Math.min(IMAGE_VARIANTS[v], longEdge || IMAGE_VARIANTS[v]) * ratio)}w`)
    .join(', ')
  const src = available.length ? publicMediaUrl(paths[available[available.length - 1]]!) : ''
  return {
    src,
    srcSet: available.length > 1 ? srcSet : undefined,
    alt,
    width: media.width,
    height: media.height,
    placeholder: media.lqip,
    color: media.dominant_color,
  }
}

export function videoUrl(media: Pick<MediaRow, 'public_paths'> | null | undefined): string | null {
  const path = media ? publicPaths(media).video : undefined
  return path ? publicMediaUrl(path) : null
}

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/tiff': 'tif',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
  'video/mp4': 'mp4',
}

export const ACCEPTED_MIME_TYPES = Object.keys(EXTENSIONS)

export function extensionFor(mimeType: string): string {
  return EXTENSIONS[mimeType] ?? 'bin'
}

/** Where the original upload lives before / after processing. */
export function originalLocation(input: {
  mediaId: string
  kind: MediaKind
  countryCode: string | null
  mimeType: string
  projectId?: string | null
}): { bucket: string; path: string } {
  const ext = extensionFor(input.mimeType)
  if (input.kind === 'project_photo' && input.countryCode) {
    return {
      bucket: PROJECT_ORIGINALS_BUCKET,
      path: `${input.countryCode}/${input.projectId ?? 'unassigned'}/${input.mediaId}/original.${ext}`,
    }
  }
  return { bucket: UPLOADS_BUCKET, path: `${mediaFolder(input.countryCode)}/${input.kind}/${input.mediaId}/original.${ext}` }
}
