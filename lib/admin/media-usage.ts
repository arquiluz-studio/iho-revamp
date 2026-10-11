import 'server-only'
import { cacheTags } from '@/lib/cache-tags'
import type { createSupabaseServerClient } from '@/lib/supabase/server'
import { untypedFrom } from './data'

type Supabase = Awaited<ReturnType<typeof createSupabaseServerClient>>
type AnyRow = Record<string, unknown>

export type MediaUsage = { label: string; where: string; href: string; tags: string[] }

type Reference = {
  table: string
  column: string
  /** Columns to select for labels / links. */
  select: string
  where: string
  describe: (row: AnyRow) => Omit<MediaUsage, 'where'>
}

const countryTag = (row: AnyRow, section: Parameters<typeof cacheTags.country>[1]) =>
  row.country_code ? [cacheTags.country(String(row.country_code), section)] : []

/** Every column that can point to a media asset. Bridge tables are listed with their owner's labels. */
export const MEDIA_REFERENCES: Reference[] = [
  {
    table: 'brands',
    column: 'logo_media_id',
    select: 'id, name',
    where: 'Logo de marca',
    describe: r => ({ label: String(r.name), href: `/admin/global/brands/${r.id}`, tags: [cacheTags.brands, cacheTags.brand(String(r.id))] }),
  },
  ...(['portrait_media_id', 'cover_media_id'] as const).map(column => ({
    table: 'designers',
    column,
    select: 'id, name',
    where: column === 'portrait_media_id' ? 'Retrato de diseñador' : 'Portada de diseñador',
    describe: (r: AnyRow) => ({ label: String(r.name), href: `/admin/global/designers/${r.id}`, tags: [cacheTags.designers] }),
  })),
  {
    table: 'products',
    column: 'cover_media_id',
    select: 'id, name_es',
    where: 'Foto principal de producto',
    describe: r => ({ label: String(r.name_es), href: `/admin/global/products/${r.id}`, tags: [cacheTags.products, cacheTags.product(String(r.id))] }),
  },
  {
    table: 'business_lines',
    column: 'cover_media_id',
    select: 'id, name_es',
    where: 'Portada de solución',
    describe: r => ({ label: String(r.name_es), href: `/admin/global/solutions/${r.id}`, tags: [cacheTags.taxonomies] }),
  },
  {
    table: 'sectors',
    column: 'cover_media_id',
    select: 'id, name_es',
    where: 'Portada de espacio',
    describe: r => ({ label: String(r.name_es), href: `/admin/global/spaces/${r.id}`, tags: [cacheTags.taxonomies] }),
  },
  ...(['hero_video_media_id', 'hero_image_media_id', 'contact_image_media_id'] as const).map(column => ({
    table: 'country_settings',
    column,
    select: 'country_code',
    where: column === 'contact_image_media_id' ? 'Imagen de contacto' : 'Hero del home',
    describe: (r: AnyRow) => ({ label: `Home ${String(r.country_code).toUpperCase()}`, href: '/admin/home', tags: countryTag(r, 'settings') }),
  })),
  {
    table: 'events',
    column: 'cover_media_id',
    select: 'id, title_es, country_code',
    where: 'Portada de evento',
    describe: r => ({ label: String(r.title_es), href: `/admin/events/${r.id}`, tags: [...countryTag(r, 'events'), cacheTags.event(String(r.id))] }),
  },
  {
    table: 'projects',
    column: 'cover_media_id',
    select: 'id, title_es, country_code',
    where: 'Portada de proyecto',
    describe: r => ({
      label: String(r.title_es),
      href: `/admin/projects/${r.id}`,
      tags: [...countryTag(r, 'projects'), cacheTags.project(String(r.id))],
    }),
  },
  {
    table: 'team_members',
    column: 'photo_media_id',
    select: 'id, full_name, country_code',
    where: 'Foto de equipo',
    describe: r => ({ label: String(r.full_name), href: `/admin/team/${r.id}`, tags: countryTag(r, 'team') }),
  },
  {
    table: 'event_media',
    column: 'media_id',
    select: 'event_id, events(title_es, country_code)',
    where: 'Galería de evento',
    describe: r => {
      const event = (r.events ?? {}) as AnyRow
      return {
        label: String(event.title_es ?? ''),
        href: `/admin/events/${r.event_id}`,
        tags: [...countryTag(event, 'events'), cacheTags.event(String(r.event_id))],
      }
    },
  },
  {
    table: 'project_media',
    column: 'media_id',
    select: 'project_id, projects(title_es, country_code)',
    where: 'Galería de proyecto',
    describe: r => {
      const project = (r.projects ?? {}) as AnyRow
      return {
        label: String(project.title_es ?? ''),
        href: `/admin/projects/${r.project_id}`,
        tags: [...countryTag(project, 'projects'), cacheTags.project(String(r.project_id))],
      }
    },
  },
  {
    table: 'product_media',
    column: 'media_id',
    select: 'product_id, products(name_es)',
    where: 'Galería de producto',
    describe: r => ({
      label: String(((r.products ?? {}) as AnyRow).name_es ?? ''),
      href: `/admin/global/products/${r.product_id}`,
      tags: [cacheTags.products, cacheTags.product(String(r.product_id))],
    }),
  },
]

export async function findMediaUsages(supabase: Supabase, mediaId: string): Promise<MediaUsage[]> {
  const results = await Promise.all(
    MEDIA_REFERENCES.map(async ref => {
      const { data } = await untypedFrom(supabase, ref.table).select(ref.select).eq(ref.column, mediaId)
      return ((data ?? []) as unknown as AnyRow[]).map(row => ({ ...ref.describe(row), where: ref.where }))
    }),
  )
  return results.flat()
}

export async function repointMediaUsages(supabase: Supabase, fromId: string, toId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  for (const ref of MEDIA_REFERENCES) {
    const { error } = await untypedFrom(supabase, ref.table)
      .update({ [ref.column]: toId } as never)
      .eq(ref.column, fromId)
    if (error) return { ok: false, error: `No se pudo actualizar ${ref.where.toLowerCase()}: ${error.message}` }
  }
  return { ok: true }
}
