'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { setPageSource } from '@/app/admin/actions/page-source'
import { Notice, cn } from './ui'

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
        <div className="flex items-center gap-3">
          <span className={cn('text-sm', viewingIsLive ? 'font-medium text-emerald-700' : 'text-zinc-600')}>
            {pending ? 'Activando…' : viewingIsLive ? 'Activo' : 'Activar'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={viewingIsLive}
            aria-label={viewingIsLive ? 'Esta versión está activa' : 'Activar esta versión'}
            disabled={pending}
            onClick={activate}
            className={cn(
              'relative h-[30px] w-[52px] shrink-0 rounded-full transition-colors duration-200',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900',
              viewingIsLive ? 'bg-emerald-500' : 'bg-zinc-300 hover:bg-zinc-400',
              pending && 'opacity-60',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'absolute top-[3px] left-[3px] size-6 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-transform duration-200',
                viewingIsLive && 'translate-x-[22px]',
              )}
            />
          </button>
        </div>
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
