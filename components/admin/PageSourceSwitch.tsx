'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { setPageSource } from '@/app/admin/actions/page-source'
import { Notice, cn } from './ui'

export function PageSourceSwitch({
  countryCode,
  pageKey,
  usesGlobal,
}: {
  countryCode: string
  pageKey: string
  usesGlobal: boolean
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const choose = (global: boolean) => {
    if (global === usesGlobal || pending) return
    startTransition(async () => {
      setError(null)
      const result = await setPageSource(countryCode, pageKey, global)
      if (!result.ok) {
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="mb-6">
      <p className="mb-2 text-sm font-medium text-zinc-800">Origen del contenido</p>
      <div className="flex w-fit overflow-hidden rounded-md border border-zinc-300 text-sm">
        {(
          [
            [true, 'Global'],
            [false, 'De este país'],
          ] as const
        ).map(([global, label]) => (
          <button
            key={label}
            type="button"
            disabled={pending}
            onClick={() => choose(global)}
            className={cn('px-3 py-1.5', usesGlobal === global ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-700 hover:bg-zinc-50')}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        {usesGlobal
          ? 'El sitio muestra el contenido global. Lo de este país se conserva, pero no se publica.'
          : 'El sitio muestra lo de este país. Un campo vacío usa el texto fijo, no el global.'}
      </p>
      {error && (
        <div className="mt-2">
          <Notice tone="red">{error}</Notice>
        </div>
      )}
    </div>
  )
}
