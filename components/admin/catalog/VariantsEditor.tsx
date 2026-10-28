'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { getMediaByIds } from '@/app/admin/actions/media'
import { saveVariants, type VariantInput } from '@/app/admin/actions/catalog'
import type { AdminMedia } from '@/lib/admin/media'
import { MediaThumb, UploadButton } from '../MediaUpload'
import { Button, Card, CardHeader, Checkbox, Input, Notice, Textarea } from '../ui'

type Row = VariantInput & { key: string }

let counter = 0
const newKey = () => `new-${++counter}`

/** Variants of a country product: product photo, SKU, cost, sale price and the ERP item code. Cost is not published. */
export function VariantsEditor({
  productId,
  countryCode,
  initialVariants,
  initialMedia,
  canEdit,
}: {
  productId: string
  countryCode: string
  initialVariants: VariantInput[]
  initialMedia: AdminMedia[]
  canEdit: boolean
}) {
  const router = useRouter()
  const [rows, setRows] = useState<Row[]>(() => initialVariants.map(v => ({ ...v, key: v.id ?? newKey() })))
  const [media, setMedia] = useState(() => Object.fromEntries(initialMedia.map(item => [item.id, item])))
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
        description="Cada variante tiene su foto de producto, SKU, costo, precio de venta y código de artículo en el ERP. El costo no se publica. Opciones: una por línea, formato «clave: valor»."
        actions={
          canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => update([...rows, { key: newKey(), sku: '', nameEs: '', nameEn: '', options: '', erpRef: '', cost: '', price: '', imageMediaId: '', isActive: true }])}
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
                <th className="pb-2 pr-2 font-medium">Foto</th>
                <th className="pb-2 pr-2 font-medium">SKU</th>
                <th className="pb-2 pr-2 font-medium">Nombre ES</th>
                <th className="pb-2 pr-2 font-medium">Name EN</th>
                <th className="pb-2 pr-2 font-medium">Opciones</th>
                <th className="pb-2 pr-2 font-medium">ERP</th>
                <th className="pb-2 pr-2 font-medium">Costo</th>
                <th className="pb-2 pr-2 font-medium">Precio</th>
                <th className="pb-2 pr-2 font-medium">Activa</th>
                <th />
              </tr>
            </thead>
            <tbody className="align-top">
              {rows.map((row, index) => (
                <tr key={row.key}>
                  <td className="py-1 pr-2">
                    <div className="flex items-center gap-2">
                      <MediaThumb media={row.imageMediaId ? media[row.imageMediaId] : null} className="h-12 w-12 shrink-0" />
                      {canEdit && (
                        <UploadButton
                          kind="product_photo"
                          countryCode={countryCode}
                          label={row.imageMediaId ? 'Cambiar' : 'Subir'}
                          onUploaded={async ids => {
                            const [uploaded] = await getMediaByIds(ids)
                            if (!uploaded) return
                            setMedia(current => ({ ...current, [uploaded.id]: uploaded }))
                            setRows(current => current.map(item => (item.key === row.key ? { ...item, imageMediaId: uploaded.id } : item)))
                            setDirty(true)
                          }}
                        />
                      )}
                    </div>
                  </td>
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
                  <td className="py-1 pr-2">
                    <Input className="h-8 w-28 font-mono text-xs" value={row.erpRef} disabled={!canEdit} onChange={e => patch(row.key, { erpRef: e.target.value })} />
                  </td>
                  <td className="py-1 pr-2">
                    <Input className="h-8 w-28 font-mono text-xs" inputMode="decimal" value={row.cost} disabled={!canEdit} onChange={e => patch(row.key, { cost: e.target.value })} />
                  </td>
                  <td className="py-1 pr-2">
                    <Input className="h-8 w-28 font-mono text-xs" inputMode="decimal" value={row.price} disabled={!canEdit} onChange={e => patch(row.key, { price: e.target.value })} />
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
