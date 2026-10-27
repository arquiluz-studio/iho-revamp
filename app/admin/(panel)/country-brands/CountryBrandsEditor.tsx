'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { saveCountryBrands } from '@/app/admin/actions/country-brands'
import { MediaThumb } from '@/components/admin/MediaUpload'
import { Badge, Button, Checkbox, Input, Notice, PageHeader, cn } from '@/components/admin/ui'
import type { AdminMedia } from '@/lib/admin/media'

type Row = {
  brandId: string
  name: string
  isActive: boolean
  logo: AdminMedia | null
  isVisible: boolean
  isExclusive: boolean
  isFeatured: boolean
  sort: number
}

export function CountryBrandsEditor({
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

  const patch = (brandId: string, value: Partial<Row>) => {
    setRows(prev => prev.map(r => (r.brandId === brandId ? { ...r, ...value } : r)))
    setDirty(true)
  }

  const withPositions = (list: Row[]) => list.map((row, index) => ({ ...row, sort: index + 1 }))

  const moveBrand = (fromId: string, toId: string) => {
    if (fromId === toId) return
    setRows(prev => {
      const from = prev.findIndex(row => row.brandId === fromId)
      const to = prev.findIndex(row => row.brandId === toId)
      if (from < 0 || to < 0) return prev
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return withPositions(next)
    })
    setDirty(true)
  }

  const alphabetize = () => {
    setRows(prev => {
      const visible = prev
        .filter(row => row.isVisible)
        .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }) || a.brandId.localeCompare(b.brandId))
      let index = 0
      const next = prev.map(row => (row.isVisible ? visible[index++] : row))
      return withPositions(next)
    })
    setDirty(true)
    setMessage(null)
  }

  const save = () =>
    startTransition(async () => {
      const result = await saveCountryBrands(
        countryCode,
        rows.map(({ brandId, isVisible, isExclusive, isFeatured, sort }) => ({ brandId, isVisible, isExclusive, isFeatured, sort })),
      )
      setMessage(result.ok ? { tone: 'green', text: 'Marcas guardadas.' } : { tone: 'red', text: result.error })
      if (result.ok) {
        setDirty(false)
        router.refresh()
      }
    })

  return (
    <div className="space-y-3">
      <PageHeader
        title="Marcas del país"
        description={description}
        actions={
          canEdit && (
            <>
              <Button variant="outline" disabled={pending} onClick={alphabetize}>
                Ordenar alfabéticamente
              </Button>
              <Button disabled={pending || !dirty} onClick={save}>
                {pending ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </>
          )
        }
      />
      {message && <Notice tone={message.tone}>{message.text}</Notice>}
      {!canEdit && <Notice tone="amber">Solo un administrador del país puede cambiar la selección de marcas.</Notice>}
      {canEdit && (
        <p className="text-sm text-zinc-500">
          Arrastra una fila para cambiar el orden, o edita el número. Ordenar alfabéticamente reordena solo las marcas visibles y deja las demás donde están. El número es la posición en la lista.
        </p>
      )}
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="w-10 px-2 py-2.5 font-medium"><span className="sr-only">Mover</span></th>
              <th className="px-4 py-2.5 font-medium">Marca</th>
              <th className="px-4 py-2.5 font-medium">Visible en el país</th>
              <th className="px-4 py-2.5 font-medium">En el home</th>
              <th className="px-4 py-2.5 font-medium">Exclusiva</th>
              <th className="px-4 py-2.5 font-medium">Orden</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map(row => (
              <tr
                key={row.brandId}
                onDragOver={event => {
                  if (canEdit && dragId) event.preventDefault()
                }}
                onDrop={() => {
                  if (dragId) moveBrand(dragId, row.brandId)
                  setDragId(null)
                }}
                className={cn(!row.isVisible && 'bg-zinc-50/60 text-zinc-500', dragId === row.brandId && 'opacity-50')}
              >
                <td className="px-2 py-2">
                  <button
                    type="button"
                    draggable={canEdit}
                    disabled={!canEdit}
                    aria-label={`Mover ${row.name}`}
                    onDragStart={event => {
                      setDragId(row.brandId)
                      event.dataTransfer.effectAllowed = 'move'
                      event.dataTransfer.setData('text/plain', row.brandId)
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
                  <div className="flex items-center gap-3">
                    <MediaThumb media={row.logo} className="h-10 w-20 bg-white p-1" />
                    <span className="font-medium">{row.name}</span>
                    {!row.isActive && <Badge>Inactiva global</Badge>}
                  </div>
                </td>
                <td className="px-4 py-2">
                  <Checkbox
                    checked={row.isVisible}
                    disabled={!canEdit}
                    onChange={e => patch(row.brandId, { isVisible: e.target.checked, ...(e.target.checked ? {} : { isFeatured: false }) })}
                  />
                </td>
                <td className="px-4 py-2">
                  <Checkbox
                    checked={row.isFeatured}
                    disabled={!canEdit || !row.isVisible}
                    onChange={e => patch(row.brandId, { isFeatured: e.target.checked })}
                  />
                </td>
                <td className="px-4 py-2">
                  <Checkbox checked={row.isExclusive} disabled={!canEdit} onChange={e => patch(row.brandId, { isExclusive: e.target.checked })} />
                </td>
                <td className="px-4 py-2">
                  <Input
                    className="h-8 w-20"
                    inputMode="numeric"
                    value={row.sort}
                    disabled={!canEdit}
                    onChange={e => patch(row.brandId, { sort: Number(e.target.value.replace(/\D/g, '') || 0) })}
                    onBlur={event => {
                      const desired = Number(event.currentTarget.value.replace(/\D/g, '') || 1)
                      setRows(prev => {
                        const from = prev.findIndex(item => item.brandId === row.brandId)
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
