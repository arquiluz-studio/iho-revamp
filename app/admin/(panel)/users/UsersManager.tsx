'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { inviteUser, setCountryRole, setGlobalRole, setUserActive } from '@/app/admin/actions/users'
import { Badge, Button, Card, CardHeader, Checkbox, FieldShell, Input, Notice, Select } from '@/components/admin/ui'
import { GLOBAL_ROLE_LABELS, ROLE_LABELS, type CountryRole, type GlobalRole } from '@/lib/admin/roles'

export type StaffUser = {
  id: string
  email: string
  fullName: string
  globalRole: GlobalRole | null
  isActive: boolean
  roles: Record<string, CountryRole>
}

const COUNTRY_ROLES = Object.keys(ROLE_LABELS) as CountryRole[]
const GLOBAL_ROLES = Object.keys(GLOBAL_ROLE_LABELS) as GlobalRole[]

export function UsersManager({
  users,
  currentUserId,
  country,
  isSuperAdmin,
}: {
  users: StaffUser[]
  currentUserId: string
  country: { code: string; name: string }
  isSuperAdmin: boolean
}) {
  const router = useRouter()
  const [message, setMessage] = useState<{ tone: 'green' | 'red'; text: string } | null>(null)
  const [pending, startTransition] = useTransition()
  const [invite, setInvite] = useState({ email: '', fullName: '', role: 'editor' as CountryRole | '', globalRole: '' as GlobalRole | '' })

  const run = (action: () => Promise<{ ok: boolean; error?: string }>, success: string) =>
    startTransition(async () => {
      const result = await action()
      setMessage(result.ok ? { tone: 'green', text: success } : { tone: 'red', text: result.error ?? 'Error.' })
      if (result.ok) router.refresh()
    })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Invitar persona" description={`Recibirá un correo para entrar al panel. El rol aplica a ${country.name}.`} />
        <form
          className="grid gap-3 p-5 sm:grid-cols-[1fr_1fr_180px_180px_auto] sm:items-end"
          onSubmit={e => {
            e.preventDefault()
            run(
              () =>
                inviteUser({
                  email: invite.email,
                  fullName: invite.fullName,
                  countryCode: country.code,
                  role: invite.role || null,
                  globalRole: invite.globalRole || null,
                }),
              'Invitación enviada / rol asignado.',
            )
            setInvite({ ...invite, email: '', fullName: '' })
          }}
        >
          <FieldShell label="Email">
            <Input type="email" required value={invite.email} onChange={e => setInvite({ ...invite, email: e.target.value })} />
          </FieldShell>
          <FieldShell label="Nombre">
            <Input value={invite.fullName} onChange={e => setInvite({ ...invite, fullName: e.target.value })} />
          </FieldShell>
          <FieldShell label={`Rol en ${country.name}`}>
            <Select value={invite.role} onChange={e => setInvite({ ...invite, role: e.target.value as CountryRole | '' })}>
              {isSuperAdmin && <option value="">Sin rol de país</option>}
              {COUNTRY_ROLES.map(r => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </Select>
          </FieldShell>
          {isSuperAdmin ? (
            <FieldShell label="Rol global">
              <Select value={invite.globalRole} onChange={e => setInvite({ ...invite, globalRole: e.target.value as GlobalRole | '' })}>
                <option value="">Ninguno</option>
                {GLOBAL_ROLES.map(r => (
                  <option key={r} value={r}>
                    {GLOBAL_ROLE_LABELS[r]}
                  </option>
                ))}
              </Select>
            </FieldShell>
          ) : (
            <div />
          )}
          <Button type="submit" disabled={pending}>
            Invitar
          </Button>
        </form>
      </Card>

      {message && <Notice tone={message.tone}>{message.text}</Notice>}

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-2.5 font-medium">Persona</th>
              <th className="px-4 py-2.5 font-medium">Rol en {country.name}</th>
              <th className="px-4 py-2.5 font-medium">Otros países</th>
              {isSuperAdmin && <th className="px-4 py-2.5 font-medium">Rol global</th>}
              {isSuperAdmin && <th className="px-4 py-2.5 font-medium">Activo</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {users.map(user => {
              const self = user.id === currentUserId
              const others = Object.entries(user.roles).filter(([code]) => code !== country.code)
              return (
                <tr key={user.id} className={user.isActive ? '' : 'opacity-50'}>
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-zinc-900">
                      {user.fullName || user.email}
                      {self && <span className="ml-1 text-xs text-zinc-400">(tú)</span>}
                    </p>
                    {user.fullName && <p className="text-xs text-zinc-500">{user.email}</p>}
                  </td>
                  <td className="px-4 py-2.5">
                    <Select
                      className="h-8 w-40 text-xs"
                      value={user.roles[country.code] ?? ''}
                      disabled={pending || (self && !isSuperAdmin)}
                      onChange={e => {
                        const role = e.target.value || null
                        if (!role && !confirm(`¿Quitar el acceso de ${user.email} a ${country.name}?`)) return
                        run(() => setCountryRole(user.id, country.code, role), 'Rol actualizado.')
                      }}
                    >
                      <option value="">Sin acceso</option>
                      {COUNTRY_ROLES.map(r => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {others.length === 0 && <span className="text-xs text-zinc-400">—</span>}
                      {others.map(([code, role]) => (
                        <Badge key={code}>
                          {code.toUpperCase()} · {ROLE_LABELS[role]}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  {isSuperAdmin && (
                    <td className="px-4 py-2.5">
                      <Select
                        className="h-8 w-44 text-xs"
                        value={user.globalRole ?? ''}
                        disabled={pending || self}
                        onChange={e => run(() => setGlobalRole(user.id, e.target.value || null), 'Rol global actualizado.')}
                      >
                        <option value="">Ninguno</option>
                        {GLOBAL_ROLES.map(r => (
                          <option key={r} value={r}>
                            {GLOBAL_ROLE_LABELS[r]}
                          </option>
                        ))}
                      </Select>
                    </td>
                  )}
                  {isSuperAdmin && (
                    <td className="px-4 py-2.5">
                      <Checkbox
                        checked={user.isActive}
                        disabled={pending || self}
                        onChange={e => run(() => setUserActive(user.id, e.target.checked), 'Cuenta actualizada.')}
                      />
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
