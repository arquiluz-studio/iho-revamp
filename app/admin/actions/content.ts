'use server'

import { z } from 'zod'
import { revalidateTags } from '@/lib/admin/revalidate'
import { getAdminSession, hasRole } from '@/lib/admin/session'
import { cacheTags } from '@/lib/cache-tags'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { EXPIRED, FORBIDDEN, dbError, type ActionResult } from './result'

type Owner = 'event' | 'project'

async function ownerCountry(owner: Owner, id: string): Promise<string | null> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from(owner === 'event' ? 'events' : 'projects')
    .select('country_code')
    .eq('id', id)
    .maybeSingle()
  return data?.country_code ?? null
}

function ownerTags(owner: Owner, id: string, country: string) {
  return owner === 'event'
    ? [cacheTags.event(id), cacheTags.country(country, 'events')]
    : [cacheTags.project(id), cacheTags.country(country, 'projects')]
}

const galleryItem = z.object({
  mediaId: z.uuid(),
  captionEs: z.string().trim().max(300).optional(),
  captionEn: z.string().trim().max(300).optional(),
  isDownloadable: z.boolean().optional(),
})

/**
 * Replaces the gallery of an event or project (order = array order). Projects pick their cover from the
 * gallery (`coverId`); events keep the cover in the main form and pass `undefined`.
 */
export async function saveGallery(
  owner: Owner,
  ownerId: string,
  rawItems: z.input<typeof galleryItem>[],
  coverId?: string | null,
): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return EXPIRED
  const items = z.array(galleryItem).max(200).safeParse(rawItems)
  if (!items.success || !z.uuid().safeParse(ownerId).success) return { ok: false, error: 'Datos inválidos.' }
  const country = await ownerCountry(owner, ownerId)
  if (!country || !hasRole(session, country, 'editor')) return FORBIDDEN

  const supabase = await createSupabaseServerClient()
  if (owner === 'event') {
    const removed = await supabase.from('event_media').delete().eq('event_id', ownerId)
    if (removed.error) return dbError(removed.error)
    if (items.data.length) {
      const added = await supabase
        .from('event_media')
        .insert(items.data.map((item, sort) => ({ event_id: ownerId, media_id: item.mediaId, sort })))
      if (added.error) return dbError(added.error)
    }
  } else {
    const removed = await supabase.from('project_media').delete().eq('project_id', ownerId)
    if (removed.error) return dbError(removed.error)
    if (items.data.length) {
      const added = await supabase.from('project_media').insert(
        items.data.map((item, sort) => ({
          project_id: ownerId,
          media_id: item.mediaId,
          sort,
          caption_es: item.captionEs || null,
          caption_en: item.captionEn || null,
        })),
      )
      if (added.error) return dbError(added.error)
      for (const downloadable of [true, false]) {
        const ids = items.data.filter(i => Boolean(i.isDownloadable) === downloadable).map(i => i.mediaId)
        if (ids.length) await supabase.from('media_assets').update({ is_downloadable: downloadable }).in('id', ids)
      }
    }
  }

  if (coverId !== undefined) {
    const cover = coverId && z.uuid().safeParse(coverId).success ? coverId : null
    const updated = await supabase
      .from(owner === 'event' ? 'events' : 'projects')
      .update({ cover_media_id: cover })
      .eq('id', ownerId)
    if (updated.error) return dbError(updated.error)
  }

  revalidateTags(ownerTags(owner, ownerId, country))
  return { ok: true }
}

const agendaItem = z.object({
  time_label: z.string().trim().max(40),
  text_es: z.string().trim().min(1, 'Requerido').max(300),
  text_en: z.string().trim().max(300),
})

export async function saveAgenda(eventId: string, rawItems: z.input<typeof agendaItem>[]): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return EXPIRED
  const items = z.array(agendaItem).max(60).safeParse(rawItems)
  if (!items.success) return { ok: false, error: 'Cada punto de la agenda necesita un texto en español.' }
  const country = await ownerCountry('event', eventId)
  if (!country || !hasRole(session, country, 'editor')) return FORBIDDEN

  const supabase = await createSupabaseServerClient()
  const removed = await supabase.from('event_agenda_items').delete().eq('event_id', eventId)
  if (removed.error) return dbError(removed.error)
  if (items.data.length) {
    const added = await supabase.from('event_agenda_items').insert(
      items.data.map((item, sort) => ({
        event_id: eventId,
        sort,
        time_label: item.time_label || null,
        text_es: item.text_es,
        text_en: item.text_en || null,
      })),
    )
    if (added.error) return dbError(added.error)
  }
  revalidateTags(ownerTags('event', eventId, country))
  return { ok: true }
}
