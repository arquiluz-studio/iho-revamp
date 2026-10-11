'use client'

import { useRef, useState } from 'react'
import type { AdminMedia } from '@/lib/admin/media'
import type { MediaKind } from '@/lib/admin/resources'
import { ACCEPT_IMAGES, ACCEPT_VIDEO, uploadMedia, type UploadStage } from '@/lib/admin/upload'
import { Button, cn } from './ui'

const STAGE_LABELS: Record<UploadStage, string> = {
  uploading: 'Subiendo…',
  processing: 'Generando versiones web…',
  done: 'Listo',
  failed: 'Error',
}

export function MediaThumb({ media, className }: { media: AdminMedia | null | undefined; className?: string }) {
  const base = cn('flex items-center justify-center overflow-hidden rounded-md bg-zinc-100 text-xs text-zinc-400', className)
  if (!media) return <div className={base}>Sin archivo</div>
  if (media.videoUrl) return <video className={cn(base, 'object-cover')} src={media.videoUrl} muted playsInline />
  if (media.thumbUrl) {
    return (
      <div className={base}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={media.thumbUrl} alt={media.altEs} className="h-full w-full object-contain" loading="lazy" />
      </div>
    )
  }
  return <div className={base}>{media.status === 'failed' ? 'Error al procesar' : 'Procesando…'}</div>
}

/** Uploads one or more files and reports progress; the only way to add media in the admin. */
export function UploadButton({
  kind,
  countryCode,
  projectId,
  video,
  multiple,
  accept,
  label = 'Subir archivo',
  disabled,
  onUploaded,
}: {
  kind: MediaKind
  countryCode: string | null
  projectId?: string | null
  video?: boolean
  multiple?: boolean
  accept?: string
  label?: string
  disabled?: boolean
  onUploaded: (ids: string[]) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const [stage, setStage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setError(null)
    const ids: string[] = []
    const list = [...files]
    for (const [index, file] of list.entries()) {
      const prefix = list.length > 1 ? `${index + 1}/${list.length} · ` : ''
      const result = await uploadMedia(file, { kind, countryCode, projectId }, s => setStage(prefix + STAGE_LABELS[s]))
      if (result.error) setError(result.error)
      if (result.mediaId) ids.push(result.mediaId)
    }
    setStage(null)
    if (input.current) input.current.value = ''
    onUploaded(ids)
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <input
        ref={input}
        type="file"
        hidden
        multiple={multiple}
        accept={accept ?? (video ? ACCEPT_VIDEO : ACCEPT_IMAGES)}
        onChange={e => handleFiles(e.target.files)}
      />
      <Button variant="outline" size="sm" disabled={disabled || Boolean(stage)} onClick={() => input.current?.click()}>
        {stage ?? label}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
