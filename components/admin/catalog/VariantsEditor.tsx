'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { saveVariants, type VariantInput } from '@/app/admin/actions/catalog'
import { Button, Card, CardHeader, Checkbox, Input, Notice, Textarea } from '../ui'

type Row = VariantInput & { key: string }

let counter = 0
const newKey = () => `new-${++counter}`

/** Variants (SKU, name, options) of a global product. Prices and stock per variant are set in each country. */
export function VariantsEditor({ productId, initialVariants, canEdit }: { productId: string; initialVariants: VariantInput[]; canEdit: boolean }) {
  const router = useRouter()
  const [rows, setRows] = useState<Row[]>(() => initialVariants.map(v => ({ ...v, key: v.id ?? newKey() })))
  const [dirty, setDirty] = useState(false)
  const [message, setMessage] = useState<{ tone: 'green' | 'red'; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  const update = (next: Row[]) => {
    setRows(next)
    setDirty(true)
  }
  const patch = (key: string, value: Partial<Row>) => update(rows.map(r => (r.key === key ? { ...r, ...value } : r)))
  const move = (from: number, to: number) => {
    if (to < 0 || to >= rows.length) return
    const next = [...rows]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    update(next)
  }

  const save = () =>
    startTransition(async () => {
      const result = await saveVariants(
        productId,
        rows.map(({ key: _key, ...v }) => v),
      )
      setMessage(result.ok ? { tone: 'green', text: 'Variantes guardadas.' } : { tone: 'red', text: result.error })
      if (result.ok) {
        setDirty(false)
        router.refresh()
      }
    })

  return (
    <Card>
      <CardHeader
        title="Variantes"
        description="Cada variante tiene su SKU, precio e inventario por país. Opciones: una por línea, formato «clave: valor» (ej. acabado: negro)."
        actions={
          canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => update([...rows, { key: newKey(), sku: '', nameEs: '', nameEn: '', options: '', isActive: true }])}
            >
              Agregar variante
            </Button>
          )
        }
      />
      <div className="space-y-3 p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="pb-2 pr-2 font-medium">SKU</th>
                <th className="pb-2 pr-2 font-medium">Nombre ES</th>
                <th className="pb-2 pr-2 font-medium">Name EN</th>
                <th className="pb-2 pr-2 font-medium">Opciones</th>
                <th className="pb-2 pr-2 font-medium">Activa</th>
                <th />
              </tr>
            </thead>
            <tbody className="align-top">
              {rows.map((row, index) => (
                <tr key={row.key}>
                  <td className="py-1 pr-2">
                    <Input
                      className="h-8 w-36 font-mono text-xs"
                      value={row.sku}
                      disabled={!canEdit}
                      onChange={e => patch(row.key, { sku: e.target.value })}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <Input className="h-8" value={row.nameEs} disabled={!canEdit} onChange={e => patch(row.key, { nameEs: e.target.value })} />
                  </td>
                  <td className="py-1 pr-2">
                    <Input className="h-8" value={row.nameEn} disabled={!canEdit} onChange={e => patch(row.key, { nameEn: e.target.value })} />
                  </td>
                  <td className="py-1 pr-2">
                    <Textarea
                      rows={1}
                      className="min-h-8 text-xs"
                      value={row.options}
                      disabled={!canEdit}
                      onChange={e => patch(row.key, { options: e.target.value })}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <Checkbox checked={row.isActive} disabled={!canEdit} onChange={e => patch(row.key, { isActive: e.target.checked })} />
                  </td>
                  <td className="whitespace-nowrap py-1">
                    {canEdit && (
                      <>
                        <Button variant="ghost" size="sm" disabled={index === 0} onClick={() => move(index, index - 1)} aria-label="Subir">
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          disabled={rows.length === 1}
                          onClick={() => update(rows.filter(r => r.key !== row.key))}
                          aria-label="Quitar"
                        >
                          ✕
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {message && <Notice tone={message.tone}>{message.text}</Notice>}
        {canEdit && (
          <div className="flex justify-end">
            <Button onClick={save} disabled={pending || !dirty}>
              {pending ? 'Guardando…' : 'Guardar variantes'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
