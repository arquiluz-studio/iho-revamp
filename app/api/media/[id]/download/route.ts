import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { PROJECT_ORIGINALS_BUCKET } from '@/lib/media'
import { DOWNLOAD_COOKIE } from '@/lib/downloads'
import { readSignedValue } from '@/lib/security/signed-cookie'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** High-res download: requires the signed lead-gate cookie, then redirects to a 60-second signed URL. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const access = readSignedValue<{ email: string }>((await cookies()).get(DOWNLOAD_COOKIE)?.value)
  if (!access) return NextResponse.json({ error: 'lead_required' }, { status: 403 })

  const admin = createSupabaseAdminClient()
  const { data: media } = await admin
    .from('media_assets')
    .select('id, is_downloadable, processing_status, original_bucket, original_path')
    .eq('id', id)
    .maybeSingle()
  if (
    !media ||
    !media.is_downloadable ||
    media.processing_status !== 'ready' ||
    media.original_bucket !== PROJECT_ORIGINALS_BUCKET ||
    !media.original_path
  ) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const fileName = `iho-${media.id.slice(0, 8)}.${media.original_path.split('.').pop()}`
  const { data: signed, error } = await admin.storage
    .from(media.original_bucket)
    .createSignedUrl(media.original_path, 60, { download: fileName })
  if (error || !signed) return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  return NextResponse.redirect(signed.signedUrl, 302)
}
