import 'server-only'
import { COUNTRY_CODES } from '@/config/countries'
import { cacheTags } from '@/lib/cache-tags'
import { MEDIA_SELECT, type MediaRef } from '@/lib/media'
import { cachedQuery, maybe, media, must } from './core'

export function getCountries() {
  return cachedQuery(['countries'], [cacheTags.countries], async ({ db }) =>
    must(
      await db
        .from('countries')
        .select('code, name_es, name_en, domain, is_hq, timezone, currency, phone, whatsapp, email, sort')
        .eq('is_active', true)
        .order('sort'),
      'countries',
    ),
  )
}

export function getCountry(code: string) {
  return getCountries().then(rows => rows.find(c => c.code === code) ?? null)
}

/** Missing row means the country uses the global page. */
export function getPageChoice(code: string, pageKey: string) {
  return cachedQuery(
    ['page-choice', code, pageKey],
    [cacheTags.country(code, 'pages'), cacheTags.country(code, 'settings')],
    async ({ db }) =>
      maybe(
        await db.from('country_page_choices').select('uses_global').eq('country_code', code).eq('page_key', pageKey).maybeSingle(),
        'country_page_choices',
      ),
  )
}

export function getSitePage(pageKey: string) {
  return cachedQuery(['site-page', pageKey], [cacheTags.site], async ({ db }) =>
    maybe(
      await db
        .from('site_pages')
        .select(
          `*, hero_video:${media('site_pages_hero_video_media_id_fkey')}, hero_image:${media('site_pages_hero_image_media_id_fkey')}, contact_image:${media('site_pages_contact_image_media_id_fkey')}` as const,
        )
        .eq('page_key', pageKey)
        .maybeSingle(),
      'site_pages',
    ),
  )
}

export function getCountryPage(code: string, pageKey: string) {
  return cachedQuery(['country-page', code, pageKey], [cacheTags.country(code, 'pages')], async ({ db }) =>
    maybe(
      await db
        .from('country_pages')
        .select(
          `*, hero_image:${media('country_pages_hero_image_media_id_fkey')}` as const,
        )
        .eq('country_code', code)
        .eq('page_key', pageKey)
        .maybeSingle(),
      'country_pages',
    ),
  )
}

export function getCountrySettings(code: string) {
  return cachedQuery(['country-settings', code], [cacheTags.country(code, 'settings')], async ({ db }) =>
    maybe(
      await db
        .from('country_settings')
        .select(
          `*, hero_video:${media('country_settings_hero_video_media_id_fkey')}, hero_image:${media('country_settings_hero_image_media_id_fkey')}, contact_image:${media('country_settings_contact_image_media_id_fkey')}` as const,
        )
        .eq('country_code', code)
        .maybeSingle(),
      'country_settings',
    ),
  )
}

export function getSiteSettings() {
  return cachedQuery(['site-settings'], [cacheTags.site], async ({ db }) =>
    maybe(await db.from('site_settings').select('stats').eq('id', 'global').maybeSingle(), 'site_settings'),
  )
}

export function getOffices() {
  return cachedQuery(['offices'], COUNTRY_CODES.map(c => cacheTags.country(c, 'offices')), async ({ db }) =>
    must(await db.from('offices').select('id, country_code, city, address, maps_url, phone, email, is_main, sort, latitude, longitude').order('sort'), 'offices'),
  )
}

export function getSocialAccounts(code: string) {
  return cachedQuery(['socials', code], [cacheTags.country(code, 'socials')], async ({ db }) =>
    must(
      await db.from('social_accounts').select('id, platform, handle, url, sort').eq('country_code', code).eq('is_active', true).order('sort'),
      'social_accounts',
    ),
  )
}

export function getTeam(code: string) {
  return cachedQuery(['team', code], [cacheTags.country(code, 'team')], async ({ db, draft }) => {
    let query = db
      .from('team_members')
      .select(`id, slug, full_name, role_es, role_en, bio_es, bio_en, email, phone, photo_position, linkedin_url, sort, photo:${media('team_members_photo_media_id_fkey')}` as const)
      .eq('country_code', code)
    if (!draft) query = query.eq('is_published', true)
    return must(await query.order('sort'), 'team_members')
  })
}

export function getBusinessLines() {
  return cachedQuery(['business-lines', 'story-lighting'], [cacheTags.taxonomies], async ({ db }) =>
    must(
      await db
        .from('business_lines')
        .select(`id, slug, slug_en, name_es, name_en, description_es, description_en, sort, page_content, cover:${media('business_lines_cover_media_id_fkey')}` as const)
        .order('sort'),
      'business_lines',
    ),
  )
}

export function getSectors() {
  return cachedQuery(['sectors', 'catalog-order'], [cacheTags.taxonomies], async ({ db }) =>
    must(
      await db
        .from('sectors')
        .select(`id, slug, slug_en, name_es, name_en, description_es, description_en, sort, cover:${media('sectors_cover_media_id_fkey')}` as const)
        .order('sort'),
      'sectors',
    ),
  )
}

/** Media used inside a solution page, in no particular order. */
export function getSolutionMedia(ids: readonly string[]) {
  const unique = [...new Set(ids)].sort()
  return cachedQuery(['solution-media', unique.join(',')], [cacheTags.taxonomies], async ({ db }) => {
    if (!unique.length) return [] as MediaRef[]
    return must(await db.from('media_assets').select(MEDIA_SELECT).in('id', unique), 'media_assets')
  })
}

/** One row per solution and space: the sentence and photo shared by both public pages. */
export function getSolutionSpaceFits() {
  return cachedQuery(['solution-space-fits'], [cacheTags.taxonomies], async ({ db }) =>
    must(
      await db
        .from('solution_space_fits')
        .select(`business_line_id, sector_id, body_es, body_en, image:${media('solution_space_fits_image_media_id_fkey')}` as const),
      'solution_space_fits',
    ),
  )
}
