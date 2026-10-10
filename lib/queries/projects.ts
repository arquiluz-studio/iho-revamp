import 'server-only'
import { cacheTags } from '@/lib/cache-tags'
import { MEDIA_SELECT } from '@/lib/media'
import { cachedQuery, maybe, media, must, visibleStatuses } from './core'

const PROJECT_LIST_SELECT = `id, slug, title_es, title_en, summary_es, summary_en, client_name, city, year, is_featured, sort, published_at,
  cover:${media('projects_cover_media_id_fkey')},
  sector:sectors(id, slug, name_es, name_en),
  business_lines:project_business_lines(business_line:business_lines(id, slug, name_es, name_en)),
  brands:project_brands(brand_id)` as const

export type ProjectFilters = { featured?: boolean; sector?: string; businessLine?: string; brandId?: string }

export async function getProjects(country: string, filters: ProjectFilters = {}) {
  const rows = await cachedQuery(['projects', country], [cacheTags.country(country, 'projects')], async ({ db, draft }) =>
    must(
      await db
        .from('projects')
        .select(PROJECT_LIST_SELECT)
        .eq('country_code', country)
        .in('status', visibleStatuses(draft))
        .order('sort')
        .order('published_at', { ascending: false, nullsFirst: false }),
      'projects',
    ),
  )
  return rows.filter(
    p =>
      (!filters.featured || p.is_featured) &&
      (!filters.sector || p.sector?.slug === filters.sector) &&
      (!filters.businessLine || p.business_lines.some(b => b.business_line?.slug === filters.businessLine)) &&
      (!filters.brandId || p.brands.some(b => b.brand_id === filters.brandId)),
  )
}

export function getProjectBySlug(country: string, slug: string) {
  return cachedQuery(['project', country, slug], [cacheTags.country(country, 'projects')], async ({ db, draft }) => {
    const project = maybe(
      await db
        .from('projects')
        .select(
          `*, cover:${media('projects_cover_media_id_fkey')},
          sector:sectors(id, slug, name_es, name_en),
          business_lines:project_business_lines(business_line:business_lines(id, slug, name_es, name_en)),
          brands:project_brands(brand:brands(id, slug, name, logo_is_thin, is_active, logo:${media('brands_logo_media_id_fkey')})),
          gallery:project_media(sort, caption_es, caption_en, media:media_assets!project_media_media_id_fkey(${MEDIA_SELECT}, is_downloadable))` as const,
        )
        .eq('country_code', country)
        .eq('slug', slug)
        .in('status', visibleStatuses(draft))
        .maybeSingle(),
      'project',
    )
    if (!project) return null
    return { ...project, gallery: [...project.gallery].sort((a, b) => a.sort - b.sort) }
  })
}

export type ProjectListRow = Awaited<ReturnType<typeof getProjects>>[number]
export type ProjectDetailRow = NonNullable<Awaited<ReturnType<typeof getProjectBySlug>>>
