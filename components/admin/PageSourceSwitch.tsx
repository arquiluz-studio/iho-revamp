'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { setPageSource } from '@/app/admin/actions/page-source'
import { Notice, cn } from './ui'

function Check({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2.25} className={cn('size-4', className)} aria-hidden>
      <path d="M4.5 10.5 8 14l7.5-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function PageSourceSwitch({
  countryCode,
  pageKey,
  usesGlobal,
  viewingGlobal,
}: {
  countryCode: string
  pageKey: string
  usesGlobal: boolean
  viewingGlobal: boolean
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const viewingIsLive = viewingGlobal === usesGlobal

  const activate = () => {
    if (viewingIsLive || pending) return
    startTransition(async () => {
      setError(null)
      const result = await setPageSource(countryCode, pageKey, viewingGlobal)
      if (!result.ok) {
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex overflow-hidden rounded-md border border-zinc-300 text-sm">
          {(
            [
              [true, 'Global'],
              [false, 'De este país'],
            ] as const
          ).map(([global, label]) => {
            const live = usesGlobal === global
            const open = viewingGlobal === global
            return (
              <Link
                key={label}
                href={`/admin/content/${pageKey}?fuente=${global ? 'global' : 'pais'}`}
                className={cn(
                  'inline-flex h-9 items-center gap-2 px-3',
                  open ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-700 hover:bg-zinc-50',
                )}
                aria-current={open ? 'page' : undefined}
                aria-label={live ? `${label}, en uso` : label}
              >
                {live && (
                  <span className={cn('size-2 shrink-0 rounded-full', open ? 'bg-emerald-400' : 'bg-emerald-500')} aria-hidden />
                )}
                {label}
              </Link>
            )
          })}
        </div>
        <button
          type="button"
          className={cn(
            'inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors',
            viewingIsLive
              ? 'cursor-default bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/15'
              : 'bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-400',
          )}
          disabled={viewingIsLive || pending}
          aria-pressed={viewingIsLive}
          onClick={activate}
        >
          {viewingIsLive ? <Check className="text-emerald-600" /> : <span className="size-4 rounded-full border border-white/50" aria-hidden />}
          {pending ? 'Activando…' : 'Activar'}
        </button>
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        {viewingIsLive ? 'Esta versión es la que se publica.' : 'Estás viendo esta versión. Actívala para publicarla.'}
      </p>
      {error && (
        <div className="mt-2">
          <Notice tone="red">{error}</Notice>
        </div>
      )}
    </div>
  )
}
