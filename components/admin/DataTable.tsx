'use client'

import {
  columnFilteringFeature,
  createFilteredRowModel,
  createSortedRowModel,
  filterFn_includesString,
  flexRender,
  globalFilteringFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  tableFeatures,
  useTable,
  type ColumnDef,
} from '@tanstack/react-table'
import Link from 'next/link'
import { useMemo, useState, type ReactNode } from 'react'
import { formatDateTime } from '@/lib/admin/format'
import type { Column } from '@/lib/admin/resources'
import { Badge, EmptyState, Input, STATUS_TONES, cn } from './ui'

type Row = Record<string, unknown>

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic, datetime: sortFn_datetime },
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
})

export function renderCell(column: Column, value: unknown, row: Row, timeZone?: string): ReactNode {
  switch (column.format) {
    case 'datetime':
      return formatDateTime(value, (row.timezone as string) || timeZone)
    case 'boolean':
      return value ? <Badge tone="green">Sí</Badge> : <span className="text-zinc-400">No</span>
    case 'status':
    case 'enum': {
      const label = column.options?.find(o => o.value === value)?.label ?? String(value ?? '—')
      return column.format === 'status' ? <Badge tone={STATUS_TONES[String(value)] ?? 'neutral'}>{label}</Badge> : label
    }
    case 'number':
      return value === null || value === undefined ? '—' : String(value)
    default:
      return value === null || value === undefined || value === '' ? <span className="text-zinc-400">—</span> : String(value)
  }
}

export function DataTable({
  columns,
  rows,
  rowKey,
  hrefBase,
  timeZone,
  searchPlaceholder = 'Buscar…',
  toolbar,
  empty = 'Todavía no hay registros.',
}: {
  columns: Column[]
  rows: Row[]
  rowKey: string
  hrefBase?: string
  timeZone?: string
  searchPlaceholder?: string
  toolbar?: ReactNode
  empty?: ReactNode
}) {
  const [filter, setFilter] = useState('')

  const columnDefs = useMemo<ColumnDef<typeof features, Row>[]>(
    () =>
      columns.map(column => ({
        id: column.key,
        accessorFn: row => row[column.key] as string,
        header: column.label,
        cell: info => renderCell(column, info.getValue(), info.row.original, timeZone),
        sortingFn: column.format === 'number' ? 'basic' : column.format === 'datetime' ? 'datetime' : 'alphanumeric',
      })),
    [columns, timeZone],
  )

  const table = useTable({
    features,
    data: rows,
    columns: columnDefs,
    state: { globalFilter: filter },
    onGlobalFilterChange: setFilter,
    globalFilterFn: 'includesString',
  })

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input className="max-w-xs" placeholder={searchPlaceholder} value={filter} onChange={e => setFilter(e.target.value)} />
        <span className="text-xs text-zinc-500">{table.getFilteredRowModel().rows.length} registros</span>
        <div className="ml-auto flex items-center gap-2">{toolbar}</div>
      </div>
      {rows.length === 0 ? (
        <EmptyState>{empty}</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
              {table.getHeaderGroups().map(group => (
                <tr key={group.id}>
                  {group.headers.map(header => {
                    const sorted = header.column.getIsSorted()
                    return (
                      <th key={header.id} className="px-4 py-2.5 font-medium">
                        <button className="inline-flex items-center gap-1 hover:text-zinc-900" onClick={header.column.getToggleSortingHandler()}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span className="text-[10px]">{sorted === 'asc' ? '▲' : sorted === 'desc' ? '▼' : ''}</span>
                        </button>
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {table.getRowModel().rows.map(row => {
                const href = hrefBase ? `${hrefBase}/${encodeURIComponent(String(row.original[rowKey]))}` : null
                return (
                  <tr key={row.id} className={cn(href && 'hover:bg-zinc-50')}>
                    {row.getAllCells().map((cell, index) => (
                      <td key={cell.id} className="max-w-xs truncate px-4 py-2.5 text-zinc-700">
                        {href && index === 0 ? (
                          <Link href={href} className="font-medium text-zinc-900 hover:underline">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </Link>
                        ) : (
                          flexRender(cell.column.columnDef.cell, cell.getContext())
                        )}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
