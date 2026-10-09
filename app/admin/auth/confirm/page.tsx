'use client'

import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

/**
 * Invitation links (sent with the service role) return the session in the URL hash, which only the
 * browser can read. Stores it in the cookie session and opens the panel.
 */
export default function ConfirmInvitePage() {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1))
    const accessToken = hash.get('access_token')
    const refreshToken = hash.get('refresh_token')
    if (!accessToken || !refreshToken) {
      setFailed(true)
      return
    }
    createSupabaseBrowserClient()
      .auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) setFailed(true)
        else window.location.replace('/admin')
      })
  }, [])

  return (
    <main className="flex min-h-dvh items-center justify-center p-6 text-sm text-zinc-600">
      {failed ? (
        <p>
          La invitación no es válida o ya expiró.{' '}
          <a className="font-medium text-zinc-900 underline" href="/admin/login">
            Inicia sesión con tu email
          </a>
          .
        </p>
      ) : (
        <p>Confirmando tu acceso…</p>
      )}
    </main>
  )
}
