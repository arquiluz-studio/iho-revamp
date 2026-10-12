'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { savePreviousEditions } from '@/app/admin/actions/content'
import { Badge, Button, Card, CardHeader, Notice, cn } from './ui'

export type PreviousEditionOption = {
  id: string
  title: string
  startsAt: string
  when: string
  status: string
  thumbUrl: string | null
  past: boolean
}

const STATUS_LABEL: Record<string, string> = { draft: 'Borrador', published: 'Publicado', archived: 'Archivado' }

export function PreviousEditionsEditor({
  eventId,
  options,
  initialIds,
  canEdit,
}: {
  eventId: string
  options: PreviousEditionOption[]
  initialIds: string[]
  canEdit: boolean
}) {
  const router = useRouter()
  const byId = new Map(options.map(option => [option.id, option]))
  const [ids, setIds] = useState(initialIds)
  const [pick, setPick] = useState('')
  const [message, setMessage] = useState<{ tone: 'green' | 'red'; text: string } | null>(null)
  const [pending, startTransition] = useTransition()
  const dirty = ids.length !== initialIds.length || ids.some(id => !initialIds.includes(id))

  const chosen = ids
    .flatMap(id => {
      const option = byId.get(id)
      return option ? [option] : []
    })
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())
  const available = options
    .filter(option => option.past && !ids.includes(option.id))
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())

  const add = () => {
    if (!pick || ids.includes(pick)) return
    setIds([...ids, pick])
    setPick('')
  }

  return (
    <Card>
      <CardHeader
        title="Ediciones anteriores"
        description="Enlaces a eventos de este país que ya ocurrieron. En la página salen por fecha, del más reciente al más viejo. Si no eliges ninguno, la sección no aparece."
      />
      <div className="space-y-3 p-5">
        {chosen.length === 0 ? (
          <p className="text-sm text-zinc-500">Ninguna edición anterior.</p>
        ) : (
          <ul className="space-y-2">
            {chosen.map(option => (
              <li key={option.id} className="flex items-center gap-3 rounded-md border border-zinc-200 p-2">
                <div className="size-14 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                  {option.thumbUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={option.thumbUrl} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-zinc-900">{option.title}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
                    <span>{option.when}</span>
                    {option.status !== 'published' && <Badge tone={option.status === 'draft' ? 'amber' : 'neutral'}>{STATUS_LABEL[option.status] ?? option.status}</Badge>}
                    {!option.past && <Badge tone="amber">Aún no ocurre</Badge>}
                  </div>
                </div>
                {canEdit && (
                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setIds(ids.filter(id => id !== option.id))}>
                    Quitar
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
        {canEdit && available.length > 0 && (
          <div className="flex gap-2">
            <select
              value={pick}
              onChange={event => setPick(event.target.value)}
              className={cn(
                'h-9 min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-xs focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900',
              )}
            >
              <option value="">Elegir un evento pasado</option>
              {available.map(option => (
                <option key={option.id} value={option.id}>
                  {option.when} · {option.title}
                </option>
              ))}
            </select>
            <Button variant="outline" disabled={!pick} onClick={add}>
              Agregar
            </Button>
          </div>
        )}
        {message && <Notice tone={message.tone}>{message.text}</Notice>}
        {canEdit && (
          <div className="flex justify-end">
            <Button
              disabled={pending || !dirty}
              onClick={() =>
                startTransition(async () => {
                  const result = await savePreviousEditions(eventId, ids)
                  setMessage(result.ok ? { tone: 'green', text: 'Ediciones anteriores guardadas.' } : { tone: 'red', text: result.error })
                  if (result.ok) router.refresh()
                })
              }
            >
              {pending ? 'Guardando…' : 'Guardar ediciones'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
