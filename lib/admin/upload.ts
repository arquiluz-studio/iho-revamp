'use client'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { MediaKind } from './resources'

export type UploadStage = 'uploading' | 'processing' | 'done' | 'failed'
export type UploadOptions = {
  kind: MediaKind
  countryCode: string | null
  projectId?: string | null
  altEs?: string
  isDownloadable?: boolean
}

/**
 * Admin upload: create the pending asset + signed URL, upload the original straight to Storage,
 * then ask the server to generate the public variants. Resolves with the media id only once the
 * asset is usable.
 */
export async function uploadMedia(
  file: File,
  options: UploadOptions,
  onStage?: (stage: UploadStage) => void,
): Promise<{ mediaId: string | null; error?: string }> {
  onStage?.('uploading')
  const created = await fetch('/api/media/upload-url', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      countryCode: options.countryCode,
      kind: options.kind,
      mimeType: file.type,
      bytes: file.size,
      projectId: options.projectId ?? null,
      altEs: options.altEs ?? file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
      isDownloadable: options.isDownloadable,
    }),
  })
  if (!created.ok) {
    onStage?.('failed')
    const reason = created.status === 400 ? 'Formato no soportado o archivo demasiado grande.' : 'No tienes permiso para subir aquí.'
    return { mediaId: null, error: reason }
  }
  const { mediaId, bucket, path, token } = (await created.json()) as { mediaId: string; bucket: string; path: string; token: string }

  const { error: uploadError } = await createSupabaseBrowserClient()
    .storage.from(bucket)
    .uploadToSignedUrl(path, token, file, { contentType: file.type })
  if (uploadError) {
    onStage?.('failed')
    return { mediaId: null, error: `Error al subir: ${uploadError.message}` }
  }

  onStage?.('processing')
  const processed = await fetch('/api/media/process', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mediaId }),
  })
  if (!processed.ok) {
    onStage?.('failed')
    return { mediaId: null, error: 'No se pudo procesar el archivo. Intenta subirlo de nuevo.' }
  }
  onStage?.('done')
  return { mediaId }
}

export const ACCEPT_IMAGES = 'image/jpeg,image/png,image/webp,image/tiff,image/avif,image/svg+xml'
export const ACCEPT_VIDEO = 'video/mp4'
