'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useRef, useState, useTransition } from 'react'
import { importInventoryCsv, importPricesCsv, saveInventory, savePriceItems, type CsvImportResult } from '@/app/admin/actions/catalog'
import { Button, Card, CardHeader, Input, Notice, cn } from '../ui'

export type VariantValueRow = {
  variantId: string
  sku: string | null
  product: string
  variant: string
  brand: string
  /** Prices: amount / compare-at. Inventory: on hand / reserved. */
  first: string
  second: string
}

const MODES = {
  prices: {
    title: 'Precios por variante',
    description: 'Deja el precio vacío para quitar la variante de esta lista. "Antes" se muestra tachado.',
    columns: ['Precio', 'Antes (opcional)'],
    csvHeader: 'sku,amount,compare_at_amount',
    csvHelp: 'Columnas: sku, amount, compare_at_amount (opcional). Acepta coma o punto y coma como separador.',
    save: savePriceItems,
    importCsv: importPricesCsv,
  },
  inventory: {
    title: 'Inventario por variante',
    description: 'Existencia física y unidades apartadas. Disponible = existencia − apartado.',
    columns: ['Existencia', 'Apartado'],
    csvHeader: 'sku,on_hand,reserved',
    csvHelp: 'Columnas: sku, on_hand, reserved (opcional). Acepta coma o punto y coma como separador.',
    save: saveInventory,
    importCsv: importInventoryCsv,
  },
} as const

const toNumber = (text: string) => (text.trim() === '' ? null : Number(text.replace(',', '.')))

function importSummary(result: Extract<CsvImportResult, { ok: true }>) {
  const parts = [`${result.saved} filas importadas.`]
  if (result.unknownSkus.length)
    parts.push(`SKUs no encontrados: ${result.unknownSkus.slice(0, 10).join(', ')}${result.unknownSkus.length > 10 ? '…' : ''}.`)
  if (result.invalidRows.length) parts.push(`Filas con valores inválidos: ${result.invalidRows.slice(0, 10).join(', ')}.`)
  return parts.join(' ')
}

export function VariantValuesEditor({
  mode,
  ownerId,
  currency,
  initialRows,
  canEdit,
}: {
  mode: keyof typeof MODES
  ownerId: string
  currency?: string
  initialRows: VariantValueRow[]
  canEdit: boolean
}) {
  const config = MODES[mode]
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState(initialRows)
  const [changed, setChanged] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState<{ tone: 'green' | 'red' | 'amber'; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(r => [r.sku, r.product, r.variant, r.brand].some(v => v?.toLowerCase().includes(q)))
  }, [rows, search])

  const patch = (variantId: string, value: Partial<VariantValueRow>) => {
    setRows(prev => prev.map(r => (r.variantId === variantId ? { ...r, ...value } : r)))
    setChanged(prev => new Set(prev).add(variantId))
  }

  const save = () =>
    startTransition(async () => {
      const dirty = rows.filter(r => changed.has(r.variantId))
      const invalid = dirty.find(r => [toNumber(r.first), toNumber(r.second)].some(n => n !== null && (Number.isNaN(n) || n < 0)))
      if (invalid) return setMessage({ tone: 'red', text: `Valor inválido en ${invalid.sku ?? invalid.product}.` })
      const result =
        mode === 'prices'
          ? await MODES.prices.save(
              ownerId,
              dirty.map(r => ({ variantId: r.variantId, amount: toNumber(r.first), compareAt: toNumber(r.second) })),
            )
          : await MODES.inventory.save(
              ownerId,
              dirty.map(r => ({ variantId: r.variantId, onHand: Math.trunc(toNumber(r.first) ?? 0), reserved: Math.trunc(toNumber(r.second) ?? 0) })),
            )
      setMessage(result.ok ? { tone: 'green', text: `${result.saved} variantes guardadas.` } : { tone: 'red', text: result.error })
      if (result.ok) {
        setChanged(new Set())
        router.refresh()
      }
    })

  const importFile = (file: File) =>
    startTransition(async () => {
      const result = await config.importCsv(ownerId, await file.text())
      if (fileRef.current) fileRef.current.value = ''
      if (!result.ok) return setMessage({ tone: 'red', text: result.error })
      setMessage({ tone: result.unknownSkus.length || result.invalidRows.length ? 'amber' : 'green', text: importSummary(result) })
      setChanged(new Set())
      router.refresh()
    })

  const downloadTemplate = () => {
    const lines = [config.csvHeader, ...rows.filter(r => r.sku).map(r => [r.sku, r.first, r.second].join(','))]
    const url = URL.createObjectURL(new Blob([`\uFEFF${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8' }))
    const link = Object.assign(document.createElement('a'), { href: url, download: `${mode}-${ownerId.slice(0, 8)}.csv` })
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader
        title={config.title}
        description={config.description}
        actions={
          <div className="flex items-start gap-2">
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              Descargar CSV
            </Button>
            {canEdit && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && importFile(e.target.files[0])}
                />
                <Button variant="outline" size="sm" disabled={pending} onClick={() => fileRef.current?.click()}>
                  Importar CSV
                </Button>
              </>
            )}
          </div>
        }
      />
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-4">
          <Input className="h-8 max-w-xs" placeholder="Buscar por SKU, producto o marca" value={search} onChange={e => setSearch(e.target.value)} />
          <p className="text-xs text-zinc-500">{config.csvHelp}</p>
        </div>
        <div className="max-h-[60vh] overflow-auto rounded-md border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="sticky top-0 border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-3 py-2 font-medium">SKU</th>
                <th className="px-3 py-2 font-medium">Producto</th>
                <th className="px-3 py-2 font-medium">Variante</th>
                {config.columns.map(c => (
                  <th key={c} className="px-3 py-2 font-medium">
                    {c}
                    {mode === 'prices' && currency ? ` (${currency})` : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {visible.map(row => (
                <tr key={row.variantId} className={cn(changed.has(row.variantId) && 'bg-amber-50/60')}>
                  <td className="px-3 py-1.5 font-mono text-xs">{row.sku ?? '—'}</td>
                  <td className="px-3 py-1.5">
                    <span className="font-medium">{row.product}</span>
                    <span className="ml-2 text-xs text-zinc-500">{row.brand}</span>
                  </td>
                  <td className="px-3 py-1.5 text-zinc-600">{row.variant}</td>
                  <td className="px-3 py-1.5">
                    <Input
                      className="h-8 w-28"
                      inputMode="decimal"
                      value={row.first}
                      disabled={!canEdit}
                      onChange={e => patch(row.variantId, { first: e.target.value })}
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <Input
                      className="h-8 w-28"
                      inputMode="decimal"
                      value={row.second}
                      disabled={!canEdit}
                      onChange={e => patch(row.variantId, { second: e.target.value })}
                    />
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-zinc-500">
                    Sin variantes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {message && <Notice tone={message.tone}>{message.text}</Notice>}
        {canEdit && (
          <div className="flex justify-end">
            <Button onClick={save} disabled={pending || changed.size === 0}>
              {pending ? 'Guardando…' : `Guardar cambios${changed.size ? ` (${changed.size})` : ''}`}
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
