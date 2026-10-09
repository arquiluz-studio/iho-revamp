import type { EmailOtpType } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/** Lands magic links (PKCE `code`) and token-hash email templates, then opens the panel. */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const tokenHash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type') as EmailOtpType | null
  const supabase = await createSupabaseServerClient()

  let ok = false
  if (code) ok = !(await supabase.auth.exchangeCodeForSession(code)).error
  else if (tokenHash && type) ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error

  const origin = `${request.headers.get('x-forwarded-proto') ?? url.protocol.replace(':', '')}://${request.headers.get('x-forwarded-host') ?? url.host}`
  return NextResponse.redirect(new URL(ok ? '/admin' : '/admin/login?error=link', origin))
}
