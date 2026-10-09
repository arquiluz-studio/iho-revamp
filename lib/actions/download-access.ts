'use server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { isCountryCode, isLocale } from '@/config/countries'
import { DOWNLOAD_ACCESS_DAYS, DOWNLOAD_COOKIE, DOWNLOAD_FLAG_COOKIE, downloadHref } from '@/lib/downloads'
import { isRateLimited, verifyTurnstile } from '@/lib/security/spam'
import { createSignedValue } from '@/lib/security/signed-cookie'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const schema = z.object({
  mediaId: z.uuid(),
  countryCode: z.string().refine(isCountryCode),
  locale: z.string().refine(isLocale),
  fullName: z.string().trim().min(2).max(120),
  email: z.email().max(200),
  company: z.string().trim().min(1).max(160),
  website: z.string().max(0).optional(),
  turnstileToken: z.string().nullish(),
})

export type DownloadAccessResult = { ok: true; href: string } | { ok: false; errors?: Record<string, string>; message?: string }

/** Lead-gate for high-res downloads: stores a `project_download` lead and grants access for 30 days. */
export async function requestDownloadAccess(input: z.input<typeof schema>): Promise<DownloadAccessResult> {
  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    const errors: Record<string, string> = {}
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] = issue.code
    return { ok: false, errors }
  }
  const data = parsed.data
  if (data.website) return { ok: true, href: downloadHref(data.mediaId) }
  if ((await isRateLimited('download')) || !(await verifyTurnstile(data.turnstileToken))) {
    return { ok: false, message: 'spam' }
  }

  const admin = createSupabaseAdminClient()
  const { error } = await admin.from('contact_leads').insert({
    country_code: data.countryCode,
    locale: data.locale,
    first_name: data.fullName,
    email: data.email.toLowerCase(),
    company: data.company,
    source: 'project_download',
    source_ref: data.mediaId,
  })
  if (error) return { ok: false, message: 'server' }

  const maxAge = DOWNLOAD_ACCESS_DAYS * 24 * 60 * 60
  const jar = await cookies()
  jar.set(DOWNLOAD_COOKIE, createSignedValue({ email: data.email.toLowerCase() }, maxAge), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  })
  jar.set(DOWNLOAD_FLAG_COOKIE, '1', { sameSite: 'lax', path: '/', maxAge })
  return { ok: true, href: downloadHref(data.mediaId) }
}
