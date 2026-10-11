'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { saveCountryBrands } from '@/app/admin/actions/country-brands'
import { MediaThumb } from '@/components/admin/MediaUpload'
import { Badge, Button, Checkbox, Input, Notice, cn } from '@/components/admin/ui'
import type { AdminMedia } from '@/lib/admin/media'

type Row = {
  brandId: string
  name: string
  isActive: boolean
  logo: AdminMedia | null
  isVisible: boolean
  isExclusive: boolean
  sort: number
}

export function CountryBrandsEditor({ countryCode, initialRows, canEdit }: { countryCode: string; initialRows: Row[]; canEdit: boolean }) {
  const router = useRouter()
  const [rows, setRows] = useState(initialRows)
  const [dirty, setDirty] = useState(false)
  const [message, setMessage] = useState<{ tone: 'green' | 'red'; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  const patch = (brandId: string, value: Partial<Row>) => {
    setRows(prev => prev.map(r => (r.brandId === brandId ? { ...r, ...value } : r)))
    setDirty(true)
  }

  return (
    <div className="space-y-3">
      {!canEdit && <Notice tone="amber">Solo un administrador del país puede cambiar la selección de marcas.</Notice>}
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-2.5 font-medium">Marca</th>
              <th className="px-4 py-2.5 font-medium">Visible en el país</th>
              <th className="px-4 py-2.5 font-medium">Exclusiva</th>
              <th className="px-4 py-2.5 font-medium">Orden</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map(row => (
              <tr key={row.brandId} className={cn(!row.isVisible && 'bg-zinc-50/60 text-zinc-500')}>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    <MediaThumb media={row.logo} className="h-10 w-20 bg-white p-1" />
                    <span className="font-medium">{row.name}</span>
                    {!row.isActive && <Badge>Inactiva global</Badge>}
                  </div>
                </td>
                <td className="px-4 py-2">
                  <Checkbox checked={row.isVisible} disabled={!canEdit} onChange={e => patch(row.brandId, { isVisible: e.target.checked })} />
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
                const result = await saveCountryBrands(
                  countryCode,
                  rows.map(({ brandId, isVisible, isExclusive, sort }) => ({ brandId, isVisible, isExclusive, sort })),
                )
                setMessage(result.ok ? { tone: 'green', text: 'Marcas guardadas.' } : { tone: 'red', text: result.error })
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
