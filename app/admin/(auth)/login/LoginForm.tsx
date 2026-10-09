'use client'

import { useState, useTransition } from 'react'
import { requestSignIn, verifySignInCode } from '@/app/admin/actions/auth'
import { Button, FieldShell, Input, Notice } from '@/components/admin/ui'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const send = () =>
    startTransition(async () => {
      setError(null)
      const result = await requestSignIn(email)
      if (result.ok) setSent(true)
      else setError(result.error)
    })

  const verify = () =>
    startTransition(async () => {
      setError(null)
      const result = await verifySignInCode(email, code)
      if (result && !result.ok) setError(result.error)
    })

  if (!sent) {
    return (
      <form
        className="space-y-4"
        onSubmit={event => {
          event.preventDefault()
          send()
        }}
      >
        <FieldShell label="Email" htmlFor="email" help="Solo cuentas invitadas por un administrador.">
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
        </FieldShell>
        {error && <Notice tone="red">{error}</Notice>}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Enviando…' : 'Enviar enlace de acceso'}
        </Button>
      </form>
    )
  }

  return (
    <form
      className="space-y-4"
      onSubmit={event => {
        event.preventDefault()
        verify()
      }}
    >
      <Notice tone="green">
        Si <strong>{email}</strong> tiene acceso, te enviamos un enlace y un código. Abre el enlace en este navegador o escribe el
        código aquí.
      </Notice>
      <FieldShell label="Código" htmlFor="code">
        <Input
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          value={code}
          onChange={e => setCode(e.target.value)}
        />
      </FieldShell>
      {error && <Notice tone="red">{error}</Notice>}
      <Button type="submit" className="w-full" disabled={pending || code.trim().length < 6}>
        {pending ? 'Verificando…' : 'Entrar'}
      </Button>
      <Button variant="ghost" className="w-full" onClick={() => setSent(false)}>
        Usar otro email
      </Button>
    </form>
  )
}
