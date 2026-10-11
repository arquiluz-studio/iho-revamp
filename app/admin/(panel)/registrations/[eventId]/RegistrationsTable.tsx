'use client'

import { useMemo, useState, useTransition } from 'react'
import { deleteRegistration, updateRegistration } from '@/app/admin/actions/registrations'
import { formatDateTime } from '@/lib/admin/format'
import { Dropdown } from '@/components/admin/Dropdown'
import { Badge, Button, EmptyState, Input, Notice, STATUS_TONES } from '@/components/admin/ui'
import { Constants, type Database } from '@/lib/supabase/database.types'

type Status = Database['public']['Enums']['registration_status']
type Row = {
  id: string
  full_name: string
  company: string | null
  email: string
  phone: string | null
  pass_type: string | null
  companions: number
  status: Status
  checked_in_at: string | null
  created_at: string
  consent_marketing: boolean
}

export const REGISTRATION_STATUS_LABELS: Record<Status, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  waitlist: 'Lista de espera',
  cancelled: 'Cancelado',
  attended: 'Asistió',
}

const STATUS_OPTIONS = Constants.public.Enums.registration_status.map(s => ({ value: s, label: REGISTRATION_STATUS_LABELS[s] }))

export function RegistrationsTable({ rows: initial, timeZone, canEdit, canDelete }: { rows: Row[]; timeZone: string; canEdit: boolean; canDelete: boolean }) {
  const [rows, setRows] = useState(initial)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<Status | ''>('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter(
      r =>
        (!status || r.status === status) &&
        (!q || [r.full_name, r.email, r.company ?? '', r.phone ?? ''].some(v => v.toLowerCase().includes(q))),
    )
  }, [rows, query, status])

  const patchRow = (id: string, value: Partial<Row>) => setRows(prev => prev.map(r => (r.id === id ? { ...r, ...value } : r)))

  const run = (id: string, patch: { status: Status } | { checkedIn: boolean }) =>
    startTransition(async () => {
      setError(null)
      const result = await updateRegistration(id, patch)
      if (!result.ok) return setError(result.error)
      if ('status' in patch) patchRow(id, { status: patch.status })
      else patchRow(id, { checked_in_at: result.checkedInAt, status: patch.checkedIn ? 'attended' : 'confirmed' })
    })

  if (rows.length === 0) return <EmptyState>Todavía no hay registros para este evento.</EmptyState>

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input className="max-w-xs" placeholder="Buscar nombre, email, empresa…" value={query} onChange={e => setQuery(e.target.value)} />
        <Dropdown className="w-48" value={status} emptyLabel="Todos los estados" options={STATUS_OPTIONS} onChange={value => setStatus(value as Status | '')} />
        <span className="text-xs text-zinc-500">{visible.length} registros</span>
      </div>
      {error && <Notice tone="red">{error}</Notice>}
      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-2.5 font-medium">Nombre</th>
              <th className="px-4 py-2.5 font-medium">Contacto</th>
              <th className="px-4 py-2.5 font-medium">Pase</th>
              <th className="px-4 py-2.5 font-medium">Registro</th>
              <th className="px-4 py-2.5 font-medium">Estado</th>
              <th className="px-4 py-2.5 font-medium">Check-in</th>
              {canDelete && <th className="px-4 py-2.5" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {visible.map(r => (
              <tr key={r.id}>
                <td className="px-4 py-2.5">
                  <p className="font-medium text-zinc-900">{r.full_name}</p>
                  <p className="text-xs text-zinc-500">{r.company ?? '—'}</p>
                </td>
                <td className="px-4 py-2.5 text-xs">
                  <a className="text-zinc-900 hover:underline" href={`mailto:${r.email}`}>
                    {r.email}
                  </a>
                  <p className="text-zinc-500">{r.phone ?? ''}</p>
                </td>
                <td className="px-4 py-2.5 text-xs text-zinc-600">
                  {r.pass_type ?? '—'}
                  {r.companions > 0 && <p>+{r.companions} acompañante(s)</p>}
                </td>
                <td className="px-4 py-2.5 text-xs text-zinc-500">{formatDateTime(r.created_at, timeZone)}</td>
                <td className="px-4 py-2.5">
                  {canEdit ? (
                    <Dropdown
                      size="sm"
                      className="w-40"
                      value={r.status}
                      options={STATUS_OPTIONS}
                      disabled={pending}
                      onChange={value => run(r.id, { status: value as Status })}
                    />
                  ) : (
                    <Badge tone={STATUS_TONES[r.status]}>{REGISTRATION_STATUS_LABELS[r.status]}</Badge>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {r.checked_in_at ? (
                    <div className="flex items-center gap-2">
                      <Badge tone="green">{formatDateTime(r.checked_in_at, timeZone)}</Badge>
                      {canEdit && (
                        <Button variant="ghost" size="sm" disabled={pending} onClick={() => run(r.id, { checkedIn: false })}>
                          Deshacer
                        </Button>
                      )}
                    </div>
                  ) : canEdit && r.status !== 'cancelled' ? (
                    <Button variant="outline" size="sm" disabled={pending} onClick={() => run(r.id, { checkedIn: true })}>
                      Check-in
                    </Button>
                  ) : (
                    <span className="text-xs text-zinc-400">—</span>
                  )}
                </td>
                {canDelete && (
                  <td className="px-4 py-2.5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      disabled={pending}
                      onClick={() => {
                        if (!confirm(`¿Eliminar el registro de ${r.full_name}? (solicitud de borrado de datos)`)) return
                        startTransition(async () => {
                          const result = await deleteRegistration(r.id)
                          if (result.ok) setRows(prev => prev.filter(x => x.id !== r.id))
                          else setError(result.error)
                        })
                      }}
                    >
                      Eliminar
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
