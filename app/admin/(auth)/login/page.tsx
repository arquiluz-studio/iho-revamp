import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { signOut } from '@/app/admin/actions/session'
import { Button, Card, Notice } from '@/components/admin/ui'
import { getAdminSession } from '@/lib/admin/session'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = { title: 'Iniciar sesión' }

const ERRORS: Record<string, string> = {
  link: 'El enlace no es válido o ya expiró. Pide uno nuevo.',
  no_access: 'Tu cuenta no tiene acceso al panel.',
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  if (await getAdminSession()) redirect('/admin')

  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.auth.getUser()

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <Card className="w-full max-w-sm p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500">GRUPO IHO</p>
          <h1 className="mt-1 text-xl font-semibold">Panel de administración</h1>
        </div>
        {data.user ? (
          <div className="space-y-4">
            <Notice tone="amber">
              {data.user.email} no tiene acceso al panel. Pide a un administrador que te asigne un país.
            </Notice>
            <form action={signOut}>
              <Button type="submit" variant="outline" className="w-full">
                Cerrar sesión
              </Button>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            {error && ERRORS[error] && <Notice tone="red">{ERRORS[error]}</Notice>}
            <LoginForm />
          </div>
        )}
      </Card>
    </main>
  )
}
