'use client'

import { useState, useTransition } from 'react'
import { saveAgenda } from '@/app/admin/actions/content'
import { Button, Card, CardHeader, Input, Notice } from './ui'

export type AgendaRow = { time_label: string; text_es: string; text_en: string }

export function AgendaEditor({ eventId, initialItems, canEdit }: { eventId: string; initialItems: AgendaRow[]; canEdit: boolean }) {
  const [items, setItems] = useState(initialItems)
  const [message, setMessage] = useState<{ tone: 'green' | 'red'; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  const patch = (index: number, value: Partial<AgendaRow>) => setItems(items.map((item, i) => (i === index ? { ...item, ...value } : item)))
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return
    const next = [...items]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setItems(next)
  }

  return (
    <Card>
      <CardHeader title="Agenda" description="Puntos de Sobre el evento, en orden. El encabezado de la columna se edita en Español e English. La hora es texto libre (ej. 9:00, 10:30 – 11:00)." />
      <div className="space-y-2 p-5">
        {items.length === 0 && <p className="text-sm text-zinc-500">Sin agenda.</p>}
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-[100px_1fr_1fr_auto] items-center gap-2">
            <Input placeholder="Hora" value={item.time_label} disabled={!canEdit} onChange={e => patch(index, { time_label: e.target.value })} />
            <Input placeholder="Texto ES" value={item.text_es} disabled={!canEdit} onChange={e => patch(index, { text_es: e.target.value })} />
            <Input placeholder="Text EN" value={item.text_en} disabled={!canEdit} onChange={e => patch(index, { text_en: e.target.value })} />
            {canEdit && (
              <div className="flex">
                <Button variant="ghost" size="sm" onClick={() => move(index, index - 1)} aria-label="Subir">
                  ↑
                </Button>
                <Button variant="ghost" size="sm" onClick={() => move(index, index + 1)} aria-label="Bajar">
                  ↓
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setItems(items.filter((_, i) => i !== index))}>
                  ✕
                </Button>
              </div>
            )}
          </div>
        ))}
        {message && <Notice tone={message.tone}>{message.text}</Notice>}
        {canEdit && (
          <div className="flex justify-between pt-2">
            <Button variant="outline" size="sm" onClick={() => setItems([...items, { time_label: '', text_es: '', text_en: '' }])}>
              Agregar punto
            </Button>
            <Button
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await saveAgenda(eventId, items)
                  setMessage(result.ok ? { tone: 'green', text: 'Agenda guardada.' } : { tone: 'red', text: result.error })
                })
              }
            >
              {pending ? 'Guardando…' : 'Guardar agenda'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
