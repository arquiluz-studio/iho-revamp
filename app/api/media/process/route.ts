import { NextResponse } from 'next/server'
import { z } from 'zod'
import { processMediaAsset } from '@/lib/media/pipeline'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 120

const bodySchema = z.object({ mediaId: z.uuid() })

/** Step 2 of an admin upload: generates the WebP variants for an uploaded original. */
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body' }, { status: 400 })

  // The user must be allowed to edit this asset (RLS): a no-op update returns the row only in that case.
  const { data: editable } = await supabase
    .from('media_assets')
    .update({ processing_status: 'pending' })
    .eq('id', parsed.data.mediaId)
    .select('id')
    .maybeSingle()
  if (!editable) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const result = await processMediaAsset(parsed.data.mediaId)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 })
  return NextResponse.json({ ok: true })
}
