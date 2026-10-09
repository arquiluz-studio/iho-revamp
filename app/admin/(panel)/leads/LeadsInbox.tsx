'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { deleteLead, updateLeadStatus } from '@/app/admin/actions/leads'
import { formatDateTime } from '@/lib/admin/format'
import { Badge, Button, EmptyState, Notice, STATUS_TONES, Select, cn } from '@/components/admin/ui'
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS, type LeadStatus } from '@/lib/admin/leads'

type Lead = {
  id: string
  created_at: string
  status: LeadStatus
  source: string
  first_name: string
  last_name: string | null
  email: string
  phone: string | null
  company: string | null
  message: string | null
  locale: string
  consent_marketing: boolean
  business_line: string | null
  sector: string | null
}

const STATUSES = Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]

export function LeadsInbox({
  leads: initial,
  status,
  timeZone,
  canEdit,
  canDelete,
}: {
  leads: Lead[]
  status: string
  timeZone: string
  canEdit: boolean
  canDelete: boolean
}) {
  const [leads, setLeads] = useState(initial)
  const [open, setOpen] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {['', ...STATUSES].map(s => (
          <Link
            key={s || 'all'}
            href={s ? `/admin/leads?status=${s}` : '/admin/leads'}
            className={cn(
              'rounded-full border px-3 py-1 text-xs',
              status === s ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50',
            )}
          >
            {s ? LEAD_STATUS_LABELS[s as LeadStatus] : 'Todos'}
          </Link>
        ))}
      </div>
      {error && <Notice tone="red">{error}</Notice>}
      {leads.length === 0 ? (
        <EmptyState>No hay leads{status ? ' con este estado' : ''}.</EmptyState>
      ) : (
        <ul className="divide-y divide-zinc-100 overflow-hidden rounded-lg border border-zinc-200 bg-white">
          {leads.map(lead => (
            <li key={lead.id}>
              <div className="flex flex-wrap items-center gap-4 px-4 py-3">
                <button className="min-w-0 flex-1 text-left" onClick={() => setOpen(open === lead.id ? null : lead.id)}>
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {lead.first_name} {lead.last_name}
                    {lead.company && <span className="font-normal text-zinc-500"> · {lead.company}</span>}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {LEAD_SOURCE_LABELS[lead.source] ?? lead.source} · {formatDateTime(lead.created_at, timeZone)}
                    {lead.message && ` · ${lead.message.slice(0, 90)}`}
                  </p>
                </button>
                {canEdit ? (
                  <Select
                    className="h-8 w-36 text-xs"
                    value={lead.status}
                    disabled={pending}
                    onChange={e => {
                      const next = e.target.value as LeadStatus
                      startTransition(async () => {
                        const result = await updateLeadStatus(lead.id, next)
                        if (result.ok) setLeads(prev => prev.map(l => (l.id === lead.id ? { ...l, status: next } : l)))
                        else setError(result.error)
                      })
                    }}
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s}>
                        {LEAD_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Badge tone={STATUS_TONES[lead.status]}>{LEAD_STATUS_LABELS[lead.status]}</Badge>
                )}
              </div>
              {open === lead.id && (
                <div className="grid gap-4 border-t border-zinc-100 bg-zinc-50 px-4 py-4 text-sm sm:grid-cols-[220px_1fr]">
                  <dl className="space-y-1 text-xs">
                    <div>
                      <dt className="text-zinc-500">Email</dt>
                      <dd>
                        <a className="text-zinc-900 underline" href={`mailto:${lead.email}`}>
                          {lead.email}
                        </a>
                      </dd>
                    </div>
                    {lead.phone && (
                      <div>
                        <dt className="text-zinc-500">Teléfono</dt>
                        <dd>{lead.phone}</dd>
                      </div>
                    )}
                    {(lead.business_line || lead.sector) && (
                      <div>
                        <dt className="text-zinc-500">Interés</dt>
                        <dd>{[lead.business_line, lead.sector].filter(Boolean).join(' · ')}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-zinc-500">Idioma · marketing</dt>
                      <dd>
                        {lead.locale.toUpperCase()} · {lead.consent_marketing ? 'Acepta comunicaciones' : 'No acepta comunicaciones'}
                      </dd>
                    </div>
                  </dl>
                  <div>
                    <p className="whitespace-pre-wrap text-zinc-800">{lead.message || <span className="text-zinc-400">Sin mensaje</span>}</p>
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3 -ml-3 text-red-600"
                        disabled={pending}
                        onClick={() => {
                          if (!confirm('¿Eliminar este lead definitivamente? (solicitud de borrado de datos)')) return
                          startTransition(async () => {
                            const result = await deleteLead(lead.id)
                            if (result.ok) setLeads(prev => prev.filter(l => l.id !== lead.id))
                            else setError(result.error)
                          })
                        }}
                      >
                        Eliminar lead
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
