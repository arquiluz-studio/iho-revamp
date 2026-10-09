'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { setActiveCountry } from '@/app/admin/actions/session'
import { Select } from './ui'

export function CountrySelector({
  countries,
  active,
}: {
  countries: { code: string; name: string; role: string }[]
  active: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">País activo</span>
      <Select
        value={active}
        disabled={pending || countries.length < 2}
        onChange={event => {
          const code = event.target.value
          startTransition(async () => {
            await setActiveCountry(code)
            router.refresh()
          })
        }}
      >
        {countries.map(c => (
          <option key={c.code} value={c.code}>
            {c.name} · {c.role}
          </option>
        ))}
      </Select>
    </label>
  )
}
