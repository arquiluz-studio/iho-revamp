'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { setPageSource } from '@/app/admin/actions/page-source'
import { Button, Notice, cn } from './ui'

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
          ).map(([global, label]) => (
            <Link
              key={label}
              href={`/admin/content/${pageKey}?fuente=${global ? 'global' : 'pais'}`}
              className={cn(
                'inline-flex h-9 items-center gap-2 px-3',
                viewingGlobal === global ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-700 hover:bg-zinc-50',
              )}
              aria-current={viewingGlobal === global ? 'page' : undefined}
            >
              {label}
              {usesGlobal === global && <span className={cn('text-[10px] font-medium uppercase tracking-wide', viewingGlobal === global ? 'text-zinc-300' : 'text-zinc-400')}>En uso</span>}
            </Link>
          ))}
        </div>
        <Button size="sm" className="h-9" disabled={viewingIsLive || pending} onClick={activate}>
          {viewingIsLive ? 'En uso' : 'Activar'}
        </Button>
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
