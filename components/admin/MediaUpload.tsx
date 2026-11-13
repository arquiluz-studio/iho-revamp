'use client'

import { useEffect, useRef, useState } from 'react'
import type { AdminMedia } from '@/lib/admin/media'
import type { MediaKind } from '@/lib/admin/resources'
import { ACCEPT_IMAGES, ACCEPT_VIDEO, uploadMedia, type UploadStage } from '@/lib/admin/upload'
import { mimeForFile } from '@/lib/media'
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
  if (media.gifUrl) {
    return (
      <div className={base}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={media.gifUrl} alt={media.altEs} className="h-full w-full object-contain" loading="lazy" />
      </div>
    )
  }
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
  directory,
  accept,
  limit,
  label = 'Subir archivo',
  disabled,
  onUploaded,
}: {
  kind: MediaKind
  countryCode: string | null
  projectId?: string | null
  video?: boolean
  multiple?: boolean
  /** Opens a folder picker. Files that are not images, GIFs, or video are skipped. */
  directory?: boolean
  accept?: string
  /** Uploads at most this many of the chosen files. */
  limit?: number
  label?: string
  disabled?: boolean
  onUploaded: (ids: string[]) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const [stage, setStage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const allowed = accept ?? (video ? ACCEPT_VIDEO : ACCEPT_IMAGES)

  useEffect(() => {
    const node = input.current
    if (!node) return
    if (directory) {
      node.setAttribute('webkitdirectory', '')
      node.setAttribute('directory', '')
    } else {
      node.removeAttribute('webkitdirectory')
      node.removeAttribute('directory')
    }
  }, [directory])

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setError(null)
    setNote(null)
    const accepted = new Set(allowed.split(',').map(item => item.trim()).filter(Boolean))
    const usable: File[] = []
    let skipped = 0
    for (const file of files) {
      const mime = mimeForFile(file)
      if (!file.size || file.name.startsWith('.') || !mime || !accepted.has(mime)) {
        skipped += 1
        continue
      }
      usable.push(file)
    }
    const room = limit ?? usable.length
    const batch = usable.slice(0, Math.max(room, 0))
    const leftOut = usable.length - batch.length
    const ids: string[] = []
    for (const [index, file] of batch.entries()) {
      const prefix = batch.length > 1 ? `${index + 1}/${batch.length} · ` : ''
      const result = await uploadMedia(file, { kind, countryCode, projectId }, s => setStage(prefix + STAGE_LABELS[s]))
      if (result.error) setError(result.error)
      if (result.mediaId) ids.push(result.mediaId)
    }
    setStage(null)
    if (input.current) input.current.value = ''
    const notes: string[] = []
    if (skipped) notes.push(`Se omitieron ${skipped} ${skipped === 1 ? 'archivo' : 'archivos'} con un formato no permitido.`)
    if (leftOut) notes.push(`Se dejaron fuera ${leftOut} ${leftOut === 1 ? 'archivo' : 'archivos'} porque se llegó al máximo.`)
    if (notes.length) setNote(notes.join(' '))
    onUploaded(ids)
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <input
        ref={input}
        type="file"
        hidden
        multiple={Boolean(multiple || directory)}
        accept={allowed}
        onChange={e => handleFiles(e.target.files)}
      />
      <Button variant="outline" size="sm" disabled={disabled || Boolean(stage)} onClick={() => input.current?.click()}>
        {stage ?? label}
      </Button>
      {note && <p className="text-xs text-zinc-500">{note}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
