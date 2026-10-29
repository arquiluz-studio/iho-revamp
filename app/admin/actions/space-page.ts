'use server'

import { z } from 'zod'
import { revalidateTags } from '@/lib/admin/revalidate'
import { getAdminSession } from '@/lib/admin/session'
import { cacheTags } from '@/lib/cache-tags'
import type { SpacePageContent } from '@/lib/content/space-page'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { EXPIRED, FORBIDDEN, dbError, type ActionResult } from './result'

const short = z.string().trim().max(200)
const long = z.string().trim().max(2000)
const copyShort = z.object({ es: short, en: short })
const copyLong = z.object({ es: long, en: long })
const imageId = z.uuid().nullable()

const contentSchema = z.object({
  hero: z.object({ intro: copyLong, ctaLabel: copyShort }),
  intro: z.object({ eyebrow: copyShort, title: copyShort, body: copyLong, ctaLabel: copyShort, imageId }),
  banner: z.object({ title: copyShort, text: copyLong }),
  elements: z.object({
    eyebrow: copyShort,
    title: copyShort,
    intro: copyLong,
    moreLabel: copyShort,
    items: z.array(z.object({ title: copyShort, text: copyLong, imageId })).max(8),
  }),
  projects: z.object({ eyebrow: copyShort, title: copyShort, intro: copyLong, moreLabel: copyShort }),
  quote: z.object({ text: copyLong, attribution: copyLong }),
  process: z.object({
    eyebrow: copyShort,
    title: copyShort,
    intro: copyLong,
    steps: z.array(z.object({ title: copyShort, text: copyLong })).max(8),
  }),
  brands: z.object({ eyebrow: copyShort }),
  close: z.object({ eyebrow: copyShort, title: copyShort, body: copyLong, ctaLabel: copyShort }),
})

/** Saves the bilingual layout of one space page. */
export async function saveSpacePage(id: string, content: SpacePageContent): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return EXPIRED
  if (!session.canManageCatalog) return FORBIDDEN
  const parsedId = z.uuid().safeParse(id)
  const parsed = contentSchema.safeParse(content)
  if (!parsedId.success || !parsed.success) return { ok: false, error: 'Datos inválidos.' }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('sectors').update({ page_content: parsed.data }).eq('id', parsedId.data)
  if (error) return dbError(error)

  revalidateTags([cacheTags.taxonomies])
  return { ok: true }
}
