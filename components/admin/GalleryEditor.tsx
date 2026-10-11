'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { getMediaByIds } from '@/app/admin/actions/media'
import { saveProductGallery } from '@/app/admin/actions/catalog'
import { saveGallery } from '@/app/admin/actions/content'
import type { AdminMedia } from '@/lib/admin/media'
import { MediaThumb, UploadButton } from './MediaUpload'
import { Button, Card, CardHeader, Checkbox, Input, Notice, cn } from './ui'

export type GalleryItem = { media: AdminMedia; captionEs: string; captionEn: string; isDownloadable: boolean }

/** Ordered gallery with drag & drop, cover selection (projects, products) and project captions + per-photo download toggle. */
export function GalleryEditor({
  owner,
  ownerId,
  countryCode,
  initialItems,
  initialCoverId,
  canEdit,
}: {
  owner: 'event' | 'project' | 'product'
  ownerId: string
  countryCode: string | null
  initialItems: GalleryItem[]
  initialCoverId: string | null
  canEdit: boolean
}) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [coverId, setCoverId] = useState(initialCoverId)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dirty, setDirty] = useState(false)
  const [message, setMessage] = useState<{ tone: 'green' | 'red'; text: string } | null>(null)
  const [pending, startTransition] = useTransition()
  const isProject = owner === 'project'
  const hasCover = owner !== 'event'
  const kind = owner === 'project' ? 'project_photo' : owner === 'product' ? 'product_photo' : 'event_photo'

  const update = (next: GalleryItem[]) => {
    setItems(next)
    setDirty(true)
  }
  const add = (media: AdminMedia[]) => {
    const existing = new Set(items.map(i => i.media.id))
    const fresh = media.filter(m => !existing.has(m.id))
    if (!fresh.length) return
    const next = [...items, ...fresh.map(m => ({ media: m, captionEs: '', captionEn: '', isDownloadable: m.isDownloadable }))]
    update(next)
    if (hasCover && !coverId) setCoverId(fresh[0].id)
  }
  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= items.length) return
    const next = [...items]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    update(next)
  }
  const patch = (index: number, value: Partial<GalleryItem>) => update(items.map((item, i) => (i === index ? { ...item, ...value } : item)))

  const save = () =>
    startTransition(async () => {
      const result =
        owner === 'product'
          ? await saveProductGallery(
              ownerId,
              items.map(i => i.media.id),
              coverId,
            )
          : await saveGallery(
              owner,
              ownerId,
              items.map(i => ({
                mediaId: i.media.id,
                captionEs: i.captionEs,
                captionEn: i.captionEn,
                isDownloadable: i.isDownloadable,
              })),
              isProject ? coverId : undefined,
            )
      setMessage(result.ok ? { tone: 'green', text: 'Galería guardada.' } : { tone: 'red', text: result.error })
      if (result.ok) {
        setDirty(false)
        router.refresh()
      }
    })

  return (
    <Card>
      <CardHeader
        title="Galería"
        description={
          isProject
            ? 'Arrastra para ordenar. La estrella marca la portada. "Descargable" permite bajar la foto en alta resolución tras dejar sus datos.'
            : hasCover
              ? 'Arrastra para ordenar. La estrella marca la foto principal.'
              : 'Arrastra para ordenar. La portada del evento se elige en el formulario.'
        }
        actions={
          canEdit && (
            <UploadButton
              kind={kind}
              countryCode={countryCode}
              projectId={isProject ? ownerId : null}
              multiple
              label="Subir fotos"
              onUploaded={async ids => {
                if (ids.length) add(await getMediaByIds(ids))
              }}
            />
          )
        }
      />
      <div className="space-y-3 p-5">
        {items.length === 0 ? (
          <p className="text-sm text-zinc-500">Sin fotos todavía.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => (
              <li
                key={item.media.id}
                draggable={canEdit}
                onDragStart={() => setDragIndex(index)}
                onDragOver={event => event.preventDefault()}
                onDrop={() => {
                  if (dragIndex !== null) move(dragIndex, index)
                  setDragIndex(null)
                }}
                className={cn('rounded-md border border-zinc-200 bg-white p-2', canEdit && 'cursor-grab', dragIndex === index && 'opacity-50')}
              >
                <div className="relative">
                  <MediaThumb media={item.media} className="aspect-[4/3] w-full" />
                  {hasCover && (
                    <button
                      type="button"
                      disabled={!canEdit}
                      onClick={() => {
                        setCoverId(item.media.id)
                        setDirty(true)
                      }}
                      className={cn(
                        'absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
                        coverId === item.media.id ? 'bg-amber-400 text-zinc-900' : 'bg-white/90 text-zinc-600 hover:bg-white',
                      )}
                      title="Usar como portada"
                    >
                      {coverId === item.media.id ? '★ Portada' : '☆'}
                    </button>
                  )}
                  <span className="absolute right-1.5 top-1.5 rounded bg-zinc-900/70 px-1.5 text-xs text-white">{index + 1}</span>
                </div>
                {isProject && (
                  <div className="mt-2 space-y-1.5">
                    <Input
                      className="h-8 text-xs"
                      placeholder="Pie de foto ES"
                      value={item.captionEs}
                      disabled={!canEdit}
                      onChange={e => patch(index, { captionEs: e.target.value })}
                    />
                    <Input
                      className="h-8 text-xs"
                      placeholder="Caption EN"
                      value={item.captionEn}
                      disabled={!canEdit}
                      onChange={e => patch(index, { captionEn: e.target.value })}
                    />
                    <label className="flex items-center gap-2 text-xs text-zinc-700">
                      <Checkbox
                        checked={item.isDownloadable}
                        disabled={!canEdit}
                        onChange={e => patch(index, { isDownloadable: e.target.checked })}
                      />
                      Descargable en alta resolución
                    </label>
                  </div>
                )}
                {canEdit && (
                  <div className="mt-2 flex justify-between">
                    <div className="flex">
                      <Button variant="ghost" size="sm" onClick={() => move(index, index - 1)} disabled={index === 0} aria-label="Mover antes">
                        ←
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => move(index, index + 1)}
                        disabled={index === items.length - 1}
                        aria-label="Mover después"
                      >
                        →
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => {
                        update(items.filter((_, i) => i !== index))
                        if (coverId === item.media.id) setCoverId(null)
                      }}
                    >
                      Quitar
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        {message && <Notice tone={message.tone}>{message.text}</Notice>}
        {canEdit && (
          <div className="flex justify-end">
            <Button onClick={save} disabled={pending || !dirty}>
              {pending ? 'Guardando…' : 'Guardar galería'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
