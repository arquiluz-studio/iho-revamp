import 'server-only'
import { cacheTags } from '@/lib/cache-tags'
import { cachedQuery, media, must } from './core'

/** Published designers (global), alphabetical. Their products are taken from each country's catalog. */
export function getDesigners() {
  return cachedQuery(['designers'], [cacheTags.designers], async ({ db }) =>
    must(
      await db
        .from('designers')
        .select(
          `id, slug, name, nationality_es, nationality_en, birth_year, death_year, website_url, bio_es, bio_en,
          portrait:${media('designers_portrait_media_id_fkey')},
          cover:${media('designers_cover_media_id_fkey')}` as const,
        )
        .eq('is_active', true)
        .order('name'),
      'designers',
    ),
  )
}

export async function getDesigner(slug: string) {
  const designers = await getDesigners()
  return designers.find(d => d.slug === slug) ?? null
}

export type DesignerRow = Awaited<ReturnType<typeof getDesigners>>[number]
