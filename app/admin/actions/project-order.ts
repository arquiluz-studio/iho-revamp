'use server'

import { z } from 'zod'
import { PROJECT_LINES, type ProjectLineSlug } from '@/lib/admin/project-order'
import { revalidateCountry } from '@/lib/admin/revalidate'
import { getAdminSession, hasRole } from '@/lib/admin/session'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { EXPIRED, FORBIDDEN, dbError, type ActionResult } from './result'

const rowSchema = z.object({
  id: z.uuid(),
  sort: z.number().int().min(0).max(10000),
  home: z.boolean(),
  lines: z.object({
    mobiliario: z.boolean().nullable(),
    architectural: z.boolean().nullable(),
    lighting: z.boolean().nullable(),
  }),
})

/** Saves the country's project order and which pages feature each project. */
export async function saveProjectOrder(countryCode: string, rows: z.input<typeof rowSchema>[]): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return EXPIRED
  if (!hasRole(session, countryCode, 'editor')) return FORBIDDEN
  const parsed = z.array(rowSchema).max(500).safeParse(rows)
  if (!parsed.success) return { ok: false, error: 'Datos inválidos.' }

  const supabase = await createSupabaseServerClient()
  const ids = parsed.data.map(row => row.id)
  const { data: owned, error: ownedError } = await supabase.from('projects').select('id').eq('country_code', countryCode).in('id', ids)
  if (ownedError) return dbError(ownedError)
  const allowed = new Set((owned ?? []).map(row => row.id))
  const safe = parsed.data.filter(row => allowed.has(row.id))

  const projectUpdates = await Promise.all(
    safe.map(row => supabase.from('projects').update({ sort: row.sort, is_featured: row.home }).eq('id', row.id).eq('country_code', countryCode)),
  )
  const projectError = projectUpdates.find(result => result.error)?.error
  if (projectError) return dbError(projectError)

  const { data: lines, error: linesError } = await supabase.from('business_lines').select('id, slug').in('slug', PROJECT_LINES.map(line => line.slug))
  if (linesError) return dbError(linesError)
  const lineId = new Map((lines ?? []).map(line => [line.slug, line.id]))

  for (const slug of PROJECT_LINES.map(line => line.slug)) {
    const id = lineId.get(slug)
    if (!id) continue
    const error = await setLineFeatured(supabase, id, safe, slug)
    if (error) return dbError(error)
  }

  revalidateCountry(countryCode, 'projects')
  return { ok: true }
}

async function setLineFeatured(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  lineId: string,
  rows: z.output<typeof rowSchema>[],
  slug: ProjectLineSlug,
) {
  const on = rows.filter(row => row.lines[slug] === true).map(row => row.id)
  const off = rows.filter(row => row.lines[slug] === false).map(row => row.id)
  if (on.length) {
    const { error } = await supabase.from('project_business_lines').update({ is_featured: true }).eq('business_line_id', lineId).in('project_id', on)
    if (error) return error
  }
  if (off.length) {
    const { error } = await supabase.from('project_business_lines').update({ is_featured: false }).eq('business_line_id', lineId).in('project_id', off)
    if (error) return error
  }
  return null
}
