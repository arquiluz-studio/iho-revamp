'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { saveCountryProducts } from '@/app/admin/actions/catalog'
import { MediaThumb } from '@/components/admin/MediaUpload'
import { Badge, Button, Checkbox, Input, Notice, cn } from '@/components/admin/ui'
import type { AdminMedia } from '@/lib/admin/media'

type Row = {
  productId: string
  name: string
  brand: string
  status: string
  cover: AdminMedia | null
  isVisible: boolean
  isPurchasable: boolean
  isFeatured: boolean
  leadTimeDays: number | null
  sort: number
}

export function CountryProductsEditor({ countryCode, initialRows, canEdit }: { countryCode: string; initialRows: Row[]; canEdit: boolean }) {
  const router = useRouter()
  const [rows, setRows] = useState(initialRows)
  const [dirty, setDirty] = useState(false)
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState<{ tone: 'green' | 'red'; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? rows.filter(r => r.name.toLowerCase().includes(q) || r.brand.toLowerCase().includes(q)) : rows
  }, [rows, search])

  const patch = (productId: string, value: Partial<Row>) => {
    setRows(prev => prev.map(r => (r.productId === productId ? { ...r, ...value } : r)))
    setDirty(true)
  }

  return (
    <div className="space-y-3">
      {!canEdit && <Notice tone="amber">Solo un administrador del país puede cambiar el catálogo del país.</Notice>}
      <Input className="h-9 max-w-xs" placeholder="Buscar producto o marca" value={search} onChange={e => setSearch(e.target.value)} />
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-2.5 font-medium">Producto</th>
              <th className="px-4 py-2.5 font-medium">Visible</th>
              <th className="px-4 py-2.5 font-medium" title="Muestra el precio; si no, el sitio ofrece cotizar.">
                Con precio
              </th>
              <th className="px-4 py-2.5 font-medium">Destacado</th>
              <th className="px-4 py-2.5 font-medium">Entrega (días)</th>
              <th className="px-4 py-2.5 font-medium">Orden</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {visible.map(row => (
              <tr key={row.productId} className={cn(!row.isVisible && 'bg-zinc-50/60 text-zinc-500')}>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    <MediaThumb media={row.cover} className="h-10 w-10" />
                    <div>
                      <a href={`/admin/global/products/${row.productId}`} className="font-medium hover:underline">
                        {row.name}
                      </a>
                      <p className="text-xs text-zinc-500">{row.brand}</p>
                    </div>
                    {row.status !== 'published' && <Badge>{row.status === 'draft' ? 'Borrador global' : 'Archivado'}</Badge>}
                  </div>
                </td>
                <td className="px-4 py-2">
                  <Checkbox checked={row.isVisible} disabled={!canEdit} onChange={e => patch(row.productId, { isVisible: e.target.checked })} />
                </td>
                <td className="px-4 py-2">
                  <Checkbox
                    checked={row.isPurchasable}
                    disabled={!canEdit}
                    onChange={e => patch(row.productId, { isPurchasable: e.target.checked })}
                  />
                </td>
                <td className="px-4 py-2">
                  <Checkbox checked={row.isFeatured} disabled={!canEdit} onChange={e => patch(row.productId, { isFeatured: e.target.checked })} />
                </td>
                <td className="px-4 py-2">
                  <Input
                    className="h-8 w-20"
                    inputMode="numeric"
                    value={row.leadTimeDays ?? ''}
                    disabled={!canEdit}
                    onChange={e => {
                      const digits = e.target.value.replace(/\D/g, '')
                      patch(row.productId, { leadTimeDays: digits ? Number(digits) : null })
                    }}
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    className="h-8 w-20"
                    inputMode="numeric"
                    value={row.sort}
                    disabled={!canEdit}
                    onChange={e => patch(row.productId, { sort: Number(e.target.value.replace(/\D/g, '') || 0) })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {message && <Notice tone={message.tone}>{message.text}</Notice>}
      {canEdit && (
        <div className="flex justify-end">
          <Button
            disabled={pending || !dirty}
            onClick={() =>
              startTransition(async () => {
                const result = await saveCountryProducts(
                  countryCode,
                  rows.map(({ productId, isVisible, isPurchasable, isFeatured, leadTimeDays, sort }) => ({
                    productId,
                    isVisible,
                    isPurchasable,
                    isFeatured,
                    leadTimeDays,
                    sort,
                  })),
                )
                setMessage(result.ok ? { tone: 'green', text: 'Catálogo guardado.' } : { tone: 'red', text: result.error })
                if (result.ok) {
                  setDirty(false)
                  router.refresh()
                }
              })
            }
          >
            {pending ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </div>
      )}
    </div>
  )
}
