'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { deleteMedia, getMediaUsages, replaceMedia, retryProcessing, updateMedia } from '@/app/admin/actions/media'
import { Dialog } from '@/components/admin/Dialog'
import { MediaThumb, UploadButton } from '@/components/admin/MediaPicker'
import { Badge, Button, Checkbox, EmptyState, FieldShell, Input, Notice, STATUS_TONES, Select, cn } from '@/components/admin/ui'
import { MEDIA_KIND_LABELS, type AdminMedia } from '@/lib/admin/media'
import type { MediaUsage } from '@/lib/admin/media-usage'
import type { MediaKind } from '@/lib/admin/resources'
import { ACCEPT_IMAGES, ACCEPT_VIDEO } from '@/lib/admin/upload'

type Filters = { kind: MediaKind | null; status: string | null; scope: 'country' | 'global'; q: string }

function filterHref(filters: Filters, patch: Partial<Filters>) {
  const next = { ...filters, ...patch }
  const params = new URLSearchParams()
  if (next.kind) params.set('kind', next.kind)
  if (next.status) params.set('status', next.status)
  if (next.scope === 'global') params.set('scope', 'global')
  if (next.q) params.set('q', next.q)
  const query = params.toString()
  return `/admin/media${query ? `?${query}` : ''}`
}

const KINDS = Object.keys(MEDIA_KIND_LABELS) as MediaKind[]

export function MediaLibrary({
  items,
  countryCode,
  filters,
  canEdit,
  canSeeGlobal,
}: {
  items: AdminMedia[]
  countryCode: string | null
  filters: Filters
  canEdit: boolean
  canSeeGlobal: boolean
}) {
  const router = useRouter()
  const [selected, setSelected] = useState<AdminMedia | null>(null)
  const [uploadKind, setUploadKind] = useState<MediaKind>(filters.kind ?? (countryCode ? 'project_photo' : 'brand_logo'))
  const [search, setSearch] = useState(filters.q)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {canSeeGlobal && (
          <div className="mr-2 flex overflow-hidden rounded-md border border-zinc-300 text-xs">
            {(['country', 'global'] as const).map(scope => (
              <Link
                key={scope}
                href={filterHref(filters, { scope })}
                className={cn('px-3 py-1.5', filters.scope === scope ? 'bg-zinc-900 text-white' : 'bg-white hover:bg-zinc-50')}
              >
                {scope === 'country' ? 'País' : 'Global'}
              </Link>
            ))}
          </div>
        )}
        <Select className="w-48" value={filters.kind ?? ''} onChange={e => router.push(filterHref(filters, { kind: (e.target.value || null) as MediaKind | null }))}>
          <option value="">Todos los tipos</option>
          {KINDS.map(k => (
            <option key={k} value={k}>
              {MEDIA_KIND_LABELS[k]}
            </option>
          ))}
        </Select>
        <Select className="w-40" value={filters.status ?? ''} onChange={e => router.push(filterHref(filters, { status: e.target.value || null }))}>
          <option value="">Cualquier estado</option>
          <option value="ready">Listos</option>
          <option value="pending">Pendientes</option>
          <option value="failed">Con error</option>
        </Select>
        <form
          onSubmit={e => {
            e.preventDefault()
            router.push(filterHref(filters, { q: search }))
          }}
        >
          <Input className="w-56" placeholder="Buscar alt / crédito…" value={search} onChange={e => setSearch(e.target.value)} />
        </form>
        {canEdit && (
          <div className="ml-auto flex items-start gap-2">
            <Select className="h-8 w-44 text-xs" value={uploadKind} onChange={e => setUploadKind(e.target.value as MediaKind)}>
              {KINDS.map(k => (
                <option key={k} value={k}>
                  {MEDIA_KIND_LABELS[k]}
                </option>
              ))}
            </Select>
            <UploadButton
              kind={uploadKind}
              countryCode={countryCode}
              accept={uploadKind === 'hero' ? `${ACCEPT_IMAGES},${ACCEPT_VIDEO}` : undefined}
              multiple
              label="Subir archivos"
              onUploaded={() => router.refresh()}
            />
          </div>
        )}
      </div>
      <p className="text-xs text-zinc-500">{items.length} archivos</p>
      {items.length === 0 ? (
        <EmptyState>No hay archivos con estos filtros.</EmptyState>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-8">
          {items.map(media => (
            <button key={media.id} className="group text-left" onClick={() => setSelected(media)}>
              <MediaThumb media={media} className="aspect-square w-full bg-zinc-100 ring-zinc-900 group-hover:ring-2" />
              <div className="mt-1 flex items-center gap-1">
                {media.status !== 'ready' && <Badge tone={STATUS_TONES[media.status]}>{media.status}</Badge>}
                <span className="truncate text-xs text-zinc-600">{media.altEs || MEDIA_KIND_LABELS[media.kind]}</span>
              </div>
            </button>
          ))}
        </div>
      )}
      {selected && (
        <MediaDetail
          media={selected}
          countryCode={countryCode}
          canEdit={canEdit}
          onClose={() => setSelected(null)}
          onChanged={() => {
            setSelected(null)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}

function MediaDetail({
  media,
  countryCode,
  canEdit,
  onClose,
  onChanged,
}: {
  media: AdminMedia
  countryCode: string | null
  canEdit: boolean
  onClose: () => void
  onChanged: () => void
}) {
  const [values, setValues] = useState({ altEs: media.altEs, altEn: media.altEn, credit: media.credit, isDownloadable: media.isDownloadable })
  const [usages, setUsages] = useState<MediaUsage[] | null>(null)
  const [message, setMessage] = useState<{ tone: 'green' | 'red'; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    getMediaUsages(media.id).then(setUsages)
  }, [media.id])

  const run = (action: () => Promise<{ ok: boolean; error?: string }>, success: string, close = false) =>
    startTransition(async () => {
      const result = await action()
      if (!result.ok) return setMessage({ tone: 'red', text: result.error ?? 'Error.' })
      if (close) onChanged()
      else setMessage({ tone: 'green', text: success })
    })

  return (
    <Dialog
      open
      onClose={onClose}
      title={MEDIA_KIND_LABELS[media.kind]}
      size="lg"
      footer={
        canEdit && (
          <>
            <Button
              variant="ghost"
              className="mr-auto text-red-600"
              disabled={pending || Boolean(usages?.length)}
              title={usages?.length ? 'Está en uso' : undefined}
              onClick={() => confirm('¿Eliminar este archivo?') && run(() => deleteMedia(media.id), '', true)}
            >
              Eliminar
            </Button>
            <Button disabled={pending} onClick={() => run(() => updateMedia(media.id, values), 'Guardado.')}>
              Guardar
            </Button>
          </>
        )
      }
    >
      <div className="grid gap-5 md:grid-cols-[1fr_260px]">
        <div className="space-y-4">
          {media.videoUrl ? (
            <video src={media.videoUrl} controls className="w-full rounded-md bg-black" />
          ) : (
            <MediaThumb media={{ ...media, thumbUrl: media.largeUrl ?? media.thumbUrl }} className="aspect-[4/3] w-full" />
          )}
          <dl className="grid grid-cols-2 gap-2 text-xs text-zinc-600">
            <div>
              <dt className="text-zinc-400">Dimensiones</dt>
              <dd>{media.width && media.height ? `${media.width} × ${media.height}` : '—'}</dd>
            </div>
            <div>
              <dt className="text-zinc-400">Original</dt>
              <dd>
                {media.mimeType ?? '—'}
                {media.bytes ? ` · ${(media.bytes / 1024 / 1024).toFixed(1)} MB` : ''}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-400">Estado</dt>
              <dd>
                <Badge tone={STATUS_TONES[media.status]}>{media.status}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-zinc-400">Subido</dt>
              <dd>{new Date(media.createdAt).toLocaleString('es-MX')}</dd>
            </div>
          </dl>
          {media.status !== 'ready' && canEdit && (
            <Button variant="outline" size="sm" disabled={pending} onClick={() => run(() => retryProcessing(media.id), 'Procesado.', true)}>
              Reintentar procesamiento
            </Button>
          )}
        </div>
        <div className="space-y-3">
          <FieldShell label="Texto alternativo (ES)">
            <Input value={values.altEs} disabled={!canEdit} onChange={e => setValues({ ...values, altEs: e.target.value })} />
          </FieldShell>
          <FieldShell label="Alt text (EN)">
            <Input value={values.altEn} disabled={!canEdit} onChange={e => setValues({ ...values, altEn: e.target.value })} />
          </FieldShell>
          <FieldShell label="Crédito">
            <Input value={values.credit} disabled={!canEdit} onChange={e => setValues({ ...values, credit: e.target.value })} />
          </FieldShell>
          {media.kind === 'project_photo' && (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={values.isDownloadable}
                disabled={!canEdit}
                onChange={e => setValues({ ...values, isDownloadable: e.target.checked })}
              />
              Descargable en alta resolución
            </label>
          )}
          <div className="border-t border-zinc-100 pt-3">
            <p className="mb-1 text-xs font-semibold text-zinc-700">Dónde se usa</p>
            {usages === null ? (
              <p className="text-xs text-zinc-400">Buscando…</p>
            ) : usages.length === 0 ? (
              <p className="text-xs text-zinc-400">No se usa en ningún lugar.</p>
            ) : (
              <ul className="space-y-1 text-xs">
                {usages.map((u, i) => (
                  <li key={i}>
                    <Link className="text-zinc-900 underline" href={u.href}>
                      {u.label}
                    </Link>{' '}
                    <span className="text-zinc-500">· {u.where}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {canEdit && (
            <div className="border-t border-zinc-100 pt-3">
              <p className="mb-1 text-xs text-zinc-500">Reemplazar sube un archivo nuevo y lo pone en todos los lugares donde se usa este.</p>
              <UploadButton
                kind={media.kind}
                countryCode={countryCode}
                video={Boolean(media.videoUrl) || media.mimeType === 'video/mp4'}
                label="Reemplazar archivo"
                onUploaded={ids => ids[0] && run(() => replaceMedia(media.id, ids[0]), '', true)}
              />
            </div>
          )}
          {message && <Notice tone={message.tone}>{message.text}</Notice>}
        </div>
      </div>
    </Dialog>
  )
}
