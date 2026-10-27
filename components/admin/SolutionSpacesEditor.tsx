'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { getMediaByIds } from '@/app/admin/actions/media'
import { saveSolutionSpaceFits } from '@/app/admin/actions/solution-spaces'
import type { AdminMedia } from '@/lib/admin/media'
import { Button, Card, CardHeader, Notice, PageHeader, Textarea } from './ui'
import { MediaThumb, UploadButton } from './MediaUpload'

export type SolutionSpaceRow = {
  businessLineId: string
  sectorId: string
  spaceName: string
  bodyEs: string
  bodyEn: string
  imageId: string | null
}

type Group = { id: string; name: string; rows: SolutionSpaceRow[] }

export function SolutionSpacesEditor({ groups, media, canEdit }: { groups: Group[]; media: AdminMedia[]; canEdit: boolean }) {
  const router = useRouter()
  const [rows, setRows] = useState(groups.flatMap(group => group.rows))
  const [library, setLibrary] = useState(() => new Map(media.map(item => [item.id, item])))
  const [dirty, setDirty] = useState(false)
  const [message, setMessage] = useState<{ tone: 'green' | 'red'; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  const patch = (businessLineId: string, sectorId: string, value: Partial<SolutionSpaceRow>) => {
    setRows(prev => prev.map(row => (row.businessLineId === businessLineId && row.sectorId === sectorId ? { ...row, ...value } : row)))
    setDirty(true)
    setMessage(null)
  }

  const save = () =>
    startTransition(async () => {
      const result = await saveSolutionSpaceFits(
        rows.map(({ businessLineId, sectorId, bodyEs, bodyEn, imageId }) => ({ businessLineId, sectorId, bodyEs, bodyEn, imageId })),
      )
      setMessage(result.ok ? { tone: 'green', text: 'Cambios guardados.' } : { tone: 'red', text: result.error })
      if (result.ok) {
        setDirty(false)
        router.refresh()
      }
    })

  return (
    <>
      <PageHeader
        title="Soluciones por espacio"
        description="La foto y el texto de cada fila se muestran en la página de la solución y en la del espacio."
        actions={
          canEdit ? (
            <Button disabled={!dirty || pending} onClick={save}>
              {pending ? 'Guardando…' : 'Guardar'}
            </Button>
          ) : null
        }
      />
      {message && (
        <div className="mb-4">
          <Notice tone={message.tone}>{message.text}</Notice>
        </div>
      )}
      <div className="flex flex-col gap-6">
        {groups.map(group => (
          <Card key={group.id}>
            <CardHeader title={group.name} />
            <ul className="divide-y divide-zinc-100">
              {group.rows.map(seed => {
                const row = rows.find(item => item.businessLineId === seed.businessLineId && item.sectorId === seed.sectorId) ?? seed
                const current = row.imageId ? library.get(row.imageId) : null
                return (
                  <li key={row.sectorId} className="grid gap-4 px-5 py-4 lg:grid-cols-[180px_160px_minmax(0,1fr)] lg:items-start">
                    <p className="pt-1 text-sm font-medium text-zinc-900">{row.spaceName}</p>
                    <div className="flex flex-col items-start gap-2">
                      <MediaThumb media={current ?? (row.imageId ? undefined : null)} className="h-20 w-32" />
                      {canEdit && (
                        <UploadButton
                          kind="generic"
                          countryCode={null}
                          disabled={pending}
                          label={row.imageId ? 'Reemplazar imagen' : 'Subir imagen'}
                          onUploaded={async ids => {
                            const [uploaded] = await getMediaByIds(ids)
                            if (!uploaded) return
                            setLibrary(prev => new Map(prev).set(uploaded.id, uploaded))
                            patch(row.businessLineId, row.sectorId, { imageId: uploaded.id })
                          }}
                        />
                      )}
                      {canEdit && row.imageId && (
                        <Button variant="ghost" size="sm" disabled={pending} onClick={() => patch(row.businessLineId, row.sectorId, { imageId: null })}>
                          Quitar
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-800">
                        Español
                        <Textarea
                          rows={3}
                          maxLength={600}
                          disabled={!canEdit || pending}
                          value={row.bodyEs}
                          onChange={event => patch(row.businessLineId, row.sectorId, { bodyEs: event.target.value })}
                        />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-800">
                        English
                        <Textarea
                          rows={3}
                          maxLength={600}
                          disabled={!canEdit || pending}
                          value={row.bodyEn}
                          onChange={event => patch(row.businessLineId, row.sectorId, { bodyEn: event.target.value })}
                        />
                      </label>
                    </div>
                  </li>
                )
              })}
            </ul>
          </Card>
        ))}
      </div>
    </>
  )
}
