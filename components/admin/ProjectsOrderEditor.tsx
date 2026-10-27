'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { saveProjectOrder } from '@/app/admin/actions/project-order'
import { PROJECT_LINES, type ProjectLineSlug } from '@/lib/admin/project-order'
import { Badge, Button, ButtonLink, Checkbox, Input, Notice, PageHeader, cn } from './ui'

type Lines = Record<ProjectLineSlug, boolean | null>

type Row = {
  id: string
  title: string
  year: number | null
  status: string
  sort: number
  home: boolean
  lines: Lines
}

const STATUS: Record<string, string> = { draft: 'Borrador', archived: 'Archivado' }

export function ProjectsOrderEditor({
  countryCode,
  description,
  initialRows,
  canEdit,
}: {
  countryCode: string
  description: string
  initialRows: Row[]
  canEdit: boolean
}) {
  const router = useRouter()
  const [rows, setRows] = useState(initialRows)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [message, setMessage] = useState<{ tone: 'green' | 'red'; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  const patch = (id: string, value: Partial<Row>) => {
    setRows(prev => prev.map(row => (row.id === id ? { ...row, ...value } : row)))
    setDirty(true)
  }

  const withPositions = (list: Row[]) => list.map((row, index) => ({ ...row, sort: index + 1 }))

  const moveProject = (fromId: string, toId: string) => {
    if (fromId === toId) return
    setRows(prev => {
      const from = prev.findIndex(row => row.id === fromId)
      const to = prev.findIndex(row => row.id === toId)
      if (from < 0 || to < 0) return prev
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return withPositions(next)
    })
    setDirty(true)
  }

  const reorder = (compare: (a: Row, b: Row) => number) => {
    setRows(prev => withPositions([...prev].sort(compare)))
    setDirty(true)
    setMessage(null)
  }

  const save = () =>
    startTransition(async () => {
      const result = await saveProjectOrder(
        countryCode,
        rows.map(({ id, sort, home, lines }) => ({ id, sort, home, lines })),
      )
      setMessage(result.ok ? { tone: 'green', text: 'Proyectos guardados.' } : { tone: 'red', text: result.error })
      if (result.ok) {
        setDirty(false)
        router.refresh()
      }
    })

  return (
    <div className="space-y-3">
      <PageHeader
        title="Proyectos"
        description={description}
        actions={
          canEdit && (
            <>
              <Button variant="outline" disabled={pending} onClick={() => reorder((a, b) => a.title.localeCompare(b.title, 'es', { sensitivity: 'base' }))}>
                Ordenar alfabéticamente
              </Button>
              <Button
                variant="outline"
                disabled={pending}
                onClick={() =>
                  reorder((a, b) => {
                    if (a.year == null && b.year == null) return a.title.localeCompare(b.title, 'es', { sensitivity: 'base' })
                    if (a.year == null) return 1
                    if (b.year == null) return -1
                    return b.year - a.year || a.title.localeCompare(b.title, 'es', { sensitivity: 'base' })
                  })
                }
              >
                Ordenar por fecha
              </Button>
              <ButtonLink href="/admin/projects/new">Nuevo proyecto</ButtonLink>
              <Button disabled={pending || !dirty} onClick={save}>
                {pending ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </>
          )
        }
      />
      {message && <Notice tone={message.tone}>{message.text}</Notice>}
      {!canEdit && <Notice tone="amber">Solo un editor del país puede cambiar el orden y los destacados.</Notice>}
      {canEdit && (
        <p className="text-sm text-zinc-500">
          Arrastra una fila o edita el número. La portada muestra hasta 6 marcados en Home. Cada solución muestra hasta 4, y solo si el proyecto tiene esa solución.
        </p>
      )}
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="w-10 px-2 py-2.5 font-medium"><span className="sr-only">Mover</span></th>
              <th className="px-4 py-2.5 font-medium">Proyecto</th>
              <th className="px-4 py-2.5 font-medium">Año</th>
              <th className="px-4 py-2.5 font-medium">Home</th>
              {PROJECT_LINES.map(line => (
                <th key={line.slug} className="px-4 py-2.5 font-medium">{line.label}</th>
              ))}
              <th className="px-4 py-2.5 font-medium">Orden</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map(row => (
              <tr
                key={row.id}
                onDragOver={event => {
                  if (canEdit && dragId) event.preventDefault()
                }}
                onDrop={() => {
                  if (dragId) moveProject(dragId, row.id)
                  setDragId(null)
                }}
                className={cn(row.status !== 'published' && 'bg-zinc-50/60 text-zinc-500', dragId === row.id && 'opacity-50')}
              >
                <td className="px-2 py-2">
                  <button
                    type="button"
                    draggable={canEdit}
                    disabled={!canEdit}
                    aria-label={`Mover ${row.title}`}
                    onDragStart={event => {
                      setDragId(row.id)
                      event.dataTransfer.effectAllowed = 'move'
                      event.dataTransfer.setData('text/plain', row.id)
                    }}
                    onDragEnd={() => setDragId(null)}
                    className={cn('grid grid-cols-2 gap-0.5 p-1 text-zinc-400', canEdit && 'cursor-grab active:cursor-grabbing')}
                  >
                    {Array.from({ length: 6 }, (_, dot) => (
                      <span key={dot} className="size-1 rounded-full bg-current" />
                    ))}
                  </button>
                </td>
                <td className="px-4 py-2">
                  <Link href={`/admin/projects/${row.id}`} className="font-medium text-zinc-900 hover:underline">
                    {row.title}
                  </Link>
                  {STATUS[row.status] && <Badge className="ml-2">{STATUS[row.status]}</Badge>}
                </td>
                <td className="px-4 py-2">{row.year ?? '—'}</td>
                <td className="px-4 py-2">
                  <Checkbox checked={row.home} disabled={!canEdit} onChange={event => patch(row.id, { home: event.target.checked })} />
                </td>
                {PROJECT_LINES.map(line => (
                  <td key={line.slug} className="px-4 py-2">
                    <Checkbox
                      checked={row.lines[line.slug] === true}
                      disabled={!canEdit || row.lines[line.slug] == null}
                      title={row.lines[line.slug] == null ? 'Asigna esta solución en la ficha del proyecto.' : undefined}
                      onChange={event => patch(row.id, { lines: { ...row.lines, [line.slug]: event.target.checked } })}
                    />
                  </td>
                ))}
                <td className="px-4 py-2">
                  <Input
                    className="h-8 w-20"
                    inputMode="numeric"
                    value={row.sort}
                    disabled={!canEdit}
                    onChange={event => patch(row.id, { sort: Number(event.target.value.replace(/\D/g, '') || 0) })}
                    onBlur={event => {
                      const desired = Number(event.currentTarget.value.replace(/\D/g, '') || 1)
                      setRows(prev => {
                        const from = prev.findIndex(item => item.id === row.id)
                        if (from < 0) return prev
                        const to = Math.min(Math.max(desired, 1), prev.length) - 1
                        const next = [...prev]
                        const [moved] = next.splice(from, 1)
                        next.splice(to, 0, moved)
                        return withPositions(next)
                      })
                      setDirty(true)
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
