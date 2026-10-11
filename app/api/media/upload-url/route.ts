import { NextResponse } from 'next/server'
import { z } from 'zod'
import { ACCEPTED_MIME_TYPES, originalLocation } from '@/lib/media'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const MEDIA_KINDS = ['project_photo', 'product_photo', 'event_photo', 'brand_logo', 'team_photo', 'designer_photo', 'hero', 'generic'] as const

const bodySchema = z.object({
  countryCode: z.string().regex(/^[a-z]{2}$/).nullable(),
  kind: z.enum(MEDIA_KINDS),
  mimeType: z.enum(ACCEPTED_MIME_TYPES as [string, ...string[]]),
  bytes: z.number().int().positive().max(100 * 1024 * 1024),
  projectId: z.uuid().nullish(),
  altEs: z.string().max(300).nullish(),
  altEn: z.string().max(300).nullish(),
  credit: z.string().max(200).nullish(),
  isDownloadable: z.boolean().optional(),
})

/**
 * Step 1 of an admin upload: creates the pending media_assets row and a signed upload URL so the browser
 * uploads the original straight to Storage (no Vercel body limit). Runs with the user's session, so RLS
 * decides whether the user may create media for that country.
 */
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body', issues: parsed.error.issues }, { status: 400 })
  const input = parsed.data

  const mediaId = crypto.randomUUID()
  const { bucket, path } = originalLocation({ mediaId, ...input })

  const { error: insertError } = await supabase.from('media_assets').insert({
    id: mediaId,
    country_code: input.countryCode,
    kind: input.kind,
    original_bucket: bucket,
    original_path: path,
    mime_type: input.mimeType,
    bytes: input.bytes,
    alt_es: input.altEs ?? null,
    alt_en: input.altEn ?? null,
    credit: input.credit ?? null,
    is_downloadable: input.kind === 'project_photo' ? (input.isDownloadable ?? true) : false,
    processing_status: 'pending',
  })
  if (insertError) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const { data: signed, error: signError } = await supabase.storage.from(bucket).createSignedUploadUrl(path)
  if (signError || !signed) {
    await supabase.from('media_assets').delete().eq('id', mediaId)
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  return NextResponse.json({ mediaId, bucket, path, token: signed.token, signedUrl: signed.signedUrl })
}
