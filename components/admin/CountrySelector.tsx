'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { setActiveCountry } from '@/app/admin/actions/session'
import { ADMIN_GLOBAL_SCOPE } from '@/lib/admin/roles'
import { CheckIcon, ChevronIcon } from './Dropdown'
import { cn } from './ui'

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden>
      <circle cx="10" cy="10" r="7.25" />
      <path d="M2.75 10h14.5M10 2.75c2 2.1 3 4.5 3 7.25s-1 5.15-3 7.25c-2-2.1-3-4.5-3-7.25s1-5.15 3-7.25z" strokeLinejoin="round" />
    </svg>
  )
}

function CountryBadge({ code }: { code: string }) {
  return (
    <span className="inline-flex h-5 w-7 shrink-0 items-center justify-center rounded bg-zinc-100 text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
      {code}
    </span>
  )
}

export function CountrySelector({
  countries,
  active,
  showGlobal = false,
}: {
  countries: { code: string; name: string }[]
  active: string
  showGlobal?: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const options = [
    ...countries.map(c => ({ value: c.code, label: c.name, global: false })),
    ...(showGlobal ? [{ value: ADMIN_GLOBAL_SCOPE, label: 'Global', global: true }] : []),
  ]
  const current = options.find(o => o.value === active)
  const disabled = pending || options.length < 2

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const select = (code: string) => {
    setOpen(false)
    if (code === active) return
    const switchesWorkspace = (code === ADMIN_GLOBAL_SCOPE) !== (active === ADMIN_GLOBAL_SCOPE)
    startTransition(async () => {
      await setActiveCountry(code)
      if (switchesWorkspace) router.push('/admin')
      router.refresh()
    })
  }

  return (
    <div ref={rootRef} className="relative">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">País activo</span>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex h-10 w-full items-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-2.5 text-left text-sm font-medium text-zinc-900 transition-colors',
          'hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900',
          'disabled:cursor-default disabled:hover:border-zinc-200 disabled:hover:bg-white',
          open && 'border-zinc-300 bg-zinc-50',
          pending && 'opacity-60',
        )}
      >
        {current?.global ? <GlobeIcon className="size-5 shrink-0 text-zinc-500" /> : current && <CountryBadge code={current.value} />}
        <span className="min-w-0 flex-1 truncate">{current?.label ?? 'Selecciona'}</span>
        {options.length > 1 && <ChevronIcon className={cn('size-4 shrink-0 text-zinc-400 transition-transform', open && 'rotate-180')} />}
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-zinc-200 bg-white p-1 shadow-lg shadow-zinc-900/5"
        >
          {options.map(option => {
            const selected = option.value === active
            return (
              <li key={option.value} role="option" aria-selected={selected}>
                {option.global && countries.length > 0 && <div className="mx-1 my-1 border-t border-zinc-100" />}
                <button
                  type="button"
                  onClick={() => select(option.value)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                    selected ? 'bg-zinc-100 font-medium text-zinc-900' : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900',
                  )}
                >
                  {option.global ? <GlobeIcon className="size-5 shrink-0 text-zinc-500" /> : <CountryBadge code={option.value} />}
                  <span className="flex-1 truncate">{option.label}</span>
                  {selected && <CheckIcon className="size-4 shrink-0 text-zinc-900" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
