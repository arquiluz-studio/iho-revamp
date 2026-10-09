import { publicMediaUrl, publicPaths, type MediaRow } from '@/lib/media'

/** Lightweight media shape used by the admin (pickers, galleries, library). */
export type AdminMedia = {
  id: string
  kind: MediaRow['kind']
  status: MediaRow['processing_status']
  countryCode: string | null
  thumbUrl: string | null
  largeUrl: string | null
  videoUrl: string | null
  width: number | null
  height: number | null
  altEs: string
  altEn: string
  credit: string
  mimeType: string | null
  bytes: number | null
  isDownloadable: boolean
  createdAt: string
}

export const ADMIN_MEDIA_SELECT =
  'id, kind, processing_status, country_code, public_paths, width, height, alt_es, alt_en, credit, mime_type, bytes, is_downloadable, created_at'

type AdminMediaRow = Pick<
  MediaRow,
  | 'id'
  | 'kind'
  | 'processing_status'
  | 'country_code'
  | 'public_paths'
  | 'width'
  | 'height'
  | 'alt_es'
  | 'alt_en'
  | 'credit'
  | 'mime_type'
  | 'bytes'
  | 'is_downloadable'
  | 'created_at'
>

export function toAdminMedia(row: AdminMediaRow): AdminMedia {
  const paths = publicPaths(row)
  const image = paths.svg ?? paths.thumb ?? paths.md
  const large = paths.svg ?? paths.lg ?? paths.md ?? paths.thumb
  return {
    id: row.id,
    kind: row.kind,
    status: row.processing_status,
    countryCode: row.country_code,
    thumbUrl: image ? publicMediaUrl(image) : null,
    largeUrl: large ? publicMediaUrl(large) : null,
    videoUrl: paths.video ? publicMediaUrl(paths.video) : null,
    width: row.width,
    height: row.height,
    altEs: row.alt_es ?? '',
    altEn: row.alt_en ?? '',
    credit: row.credit ?? '',
    mimeType: row.mime_type,
    bytes: row.bytes,
    isDownloadable: row.is_downloadable,
    createdAt: row.created_at,
  }
}

export const MEDIA_KIND_LABELS: Record<MediaRow['kind'], string> = {
  project_photo: 'Foto de proyecto',
  product_photo: 'Foto de producto',
  event_photo: 'Foto de evento',
  brand_logo: 'Logo de marca',
  team_photo: 'Foto de equipo',
  hero: 'Hero',
  generic: 'General',
}
