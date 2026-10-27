import 'server-only'
import type { AppLocale } from '@/config/countries'
import { cacheTags } from '@/lib/cache-tags'
import { pickBySlug, SLUG_PATTERN } from '@/lib/i18n-fields'
import { MEDIA_SELECT } from '@/lib/media'
import { cachedQuery, media, must, visibleStatuses } from './core'

const PROJECT_LIST_SELECT = `id, slug, slug_en, title_es, title_en, summary_es, summary_en, client_name, city, year, is_featured, sort, published_at,
  cover:${media('projects_cover_media_id_fkey')},
  sector:sectors(id, slug, slug_en, name_es, name_en),
  business_lines:project_business_lines(is_featured, business_line:business_lines(id, slug, slug_en, name_es, name_en)),
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

function projectsBySlug(country: string, slug: string) {
  return cachedQuery(['projects-by-slug', country, slug], [cacheTags.country(country, 'projects')], async ({ db, draft }) => {
    const rows = must(
      await db
        .from('projects')
        .select(
          `*, cover:${media('projects_cover_media_id_fkey')},
          sector:sectors(id, slug, slug_en, name_es, name_en),
          business_lines:project_business_lines(is_featured, business_line:business_lines(id, slug, slug_en, name_es, name_en)),
          brands:project_brands(brand:brands(id, slug, name, logo_is_thin, is_active, logo:${media('brands_logo_media_id_fkey')})),
          gallery:project_media(sort, caption_es, caption_en, media:media_assets!project_media_media_id_fkey(${MEDIA_SELECT}, is_downloadable))` as const,
        )
        .eq('country_code', country)
        .or(`slug.eq.${slug},slug_en.eq.${slug}`)
        .in('status', visibleStatuses(draft))
        .limit(2),
      'project',
    )
    return rows.map(project => ({ ...project, gallery: [...project.gallery].sort((a, b) => a.sort - b.sort) }))
  })
}

/** Project addressed by its Spanish or English slug (see `pickBySlug`). */
export async function getProjectBySlug(country: string, slug: string, locale: AppLocale) {
  if (!SLUG_PATTERN.test(slug)) return null
  return pickBySlug(await projectsBySlug(country, slug), slug, locale)
}

export type ProjectListRow = Awaited<ReturnType<typeof getProjects>>[number]
export type ProjectDetailRow = NonNullable<Awaited<ReturnType<typeof getProjectBySlug>>>
