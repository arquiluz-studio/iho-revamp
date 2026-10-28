'use server'

import { z } from 'zod'
import { revalidateTags } from '@/lib/admin/revalidate'
import { getAdminSession } from '@/lib/admin/session'
import { cacheTags } from '@/lib/cache-tags'
import type { SolutionPageContent } from '@/lib/content/solution-page'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { EXPIRED, FORBIDDEN, dbError, type ActionResult } from './result'

const short = z.string().trim().max(200)
const long = z.string().trim().max(2000)
const copyShort = z.object({ es: short, en: short })
const copyLong = z.object({ es: long, en: long })
const imageId = z.uuid().nullable()

const contentSchema = z.object({
  hero: z.object({ eyebrow: copyShort, intro: copyLong, ctaLabel: copyShort }),
  intro: z.object({ eyebrow: copyShort, title: copyShort, body: copyLong, ctaLabel: copyShort, imageId }),
  banner: z.object({ text: copyLong }),
  elements: z.object({
    eyebrow: copyShort,
    title: copyShort,
    intro: copyLong,
    items: z.array(z.object({ title: copyShort, text: copyLong, imageId })).max(8),
  }),
  categories: z.array(z.object({ label: copyShort })).max(12),
  spaces: z.object({ eyebrow: copyShort, title: copyShort, body: copyLong, imageId }),
  process: z.object({
    eyebrow: copyShort,
    title: copyShort,
    intro: copyLong,
    steps: z.array(z.object({ title: copyShort, text: copyLong })).max(8),
  }),
  quote: z.object({ text: copyLong, attribution: copyLong }),
  brands: z.object({
    eyebrow: copyShort,
    items: z.array(z.object({ label: copyShort, imageId })).max(12),
  }),
  gallery: z.object({
    eyebrow: copyShort,
    items: z.array(z.object({ caption: copyShort, text: copyLong, imageId })).max(8),
  }),
  close: z.object({ eyebrow: copyShort, title: copyShort, body: copyLong, ctaLabel: copyShort }),
})

/** Saves the bilingual layout of one solution page. */
export async function saveSolutionPage(id: string, content: SolutionPageContent): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return EXPIRED
  if (!session.canManageCatalog) return FORBIDDEN
  const parsedId = z.uuid().safeParse(id)
  const parsed = contentSchema.safeParse(content)
  if (!parsedId.success || !parsed.success) return { ok: false, error: 'Datos inválidos.' }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('business_lines').update({ page_content: parsed.data }).eq('id', parsedId.data)
  if (error) return dbError(error)

  revalidateTags([cacheTags.taxonomies])
  return { ok: true }
}
