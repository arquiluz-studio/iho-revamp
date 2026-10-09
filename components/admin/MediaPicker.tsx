'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { listMedia } from '@/app/admin/actions/media'
import type { AdminMedia } from '@/lib/admin/media'
import type { MediaKind } from '@/lib/admin/resources'
import { ACCEPT_IMAGES, ACCEPT_VIDEO, uploadMedia, type UploadStage } from '@/lib/admin/upload'
import { Dialog } from './Dialog'
import { Badge, Button, EmptyState, Input, Notice, STATUS_TONES, cn } from './ui'

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

/** Uploads one or more files and reports progress; used by the picker, galleries and the library. */
export function UploadButton({
  kind,
  countryCode,
  projectId,
  video,
  multiple,
  accept,
  label = 'Subir archivo',
  onUploaded,
}: {
  kind: MediaKind
  countryCode: string | null
  projectId?: string | null
  video?: boolean
  multiple?: boolean
  accept?: string
  label?: string
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
      <Button variant="outline" size="sm" disabled={Boolean(stage)} onClick={() => input.current?.click()}>
        {stage ?? label}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function MediaPicker({
  open,
  onClose,
  onSelect,
  countryCode,
  kind,
  video,
  projectId,
}: {
  open: boolean
  onClose: () => void
  onSelect: (media: AdminMedia) => void
  countryCode: string | null
  kind: MediaKind
  video?: boolean
  projectId?: string | null
}) {
  const [items, setItems] = useState<AdminMedia[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [onlyKind, setOnlyKind] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const media = await listMedia({ countryCode, kind: onlyKind ? kind : null, includeGlobal: true, search: search || undefined })
    setItems(media.filter(m => (video ? Boolean(m.videoUrl) || m.mimeType === 'video/mp4' : m.mimeType !== 'video/mp4')))
    setLoading(false)
  }, [countryCode, kind, onlyKind, search, video])

  useEffect(() => {
    if (open) void load()
  }, [open, load])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={video ? 'Elegir video' : 'Elegir imagen'}
      size="xl"
      footer={
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input className="max-w-xs" placeholder="Buscar por texto alternativo…" value={search} onChange={e => setSearch(e.target.value)} />
        <label className="flex items-center gap-2 text-sm text-zinc-600">
          <input type="checkbox" checked={onlyKind} onChange={e => setOnlyKind(e.target.checked)} /> Solo de este tipo
        </label>
        <div className="ml-auto">
          <UploadButton
            kind={kind}
            countryCode={countryCode}
            projectId={projectId}
            video={video}
            label={video ? 'Subir video' : 'Subir imagen'}
            onUploaded={async ids => {
              const fresh = await listMedia({ countryCode, includeGlobal: true, limit: 50 })
              const uploaded = fresh.find(m => m.id === ids[0])
              if (uploaded) onSelect(uploaded)
              else void load()
            }}
          />
        </div>
      </div>
      {!countryCode && <Notice tone="neutral">Archivos globales (catálogo).</Notice>}
      {loading ? (
        <p className="py-10 text-center text-sm text-zinc-500">Cargando…</p>
      ) : items.length === 0 ? (
        <EmptyState>No hay archivos. Sube uno nuevo.</EmptyState>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {items.map(media => (
            <button
              key={media.id}
              className="group text-left"
              onClick={() => onSelect(media)}
              title={media.altEs || media.id}
            >
              <MediaThumb media={media} className="aspect-square w-full ring-zinc-900 group-hover:ring-2" />
              <div className="mt-1 flex items-center gap-1">
                {media.status !== 'ready' && <Badge tone={STATUS_TONES[media.status]}>{media.status}</Badge>}
                <span className="truncate text-xs text-zinc-500">{media.altEs || '—'}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </Dialog>
  )
}
