import 'server-only'
import { COUNTRY_CODES } from '@/config/countries'
import { cacheTags } from '@/lib/cache-tags'
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

export function getOffices() {
  return cachedQuery(['offices'], COUNTRY_CODES.map(c => cacheTags.country(c, 'offices')), async ({ db }) =>
    must(await db.from('offices').select('id, country_code, city, address, maps_url, phone, email, is_main, sort').order('sort'), 'offices'),
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
      .select(`id, full_name, role_es, role_en, photo_position, linkedin_url, sort, photo:${media('team_members_photo_media_id_fkey')}` as const)
      .eq('country_code', code)
    if (!draft) query = query.eq('is_published', true)
    return must(await query.order('sort'), 'team_members')
  })
}

export function getBusinessLines() {
  return cachedQuery(['business-lines'], [cacheTags.taxonomies], async ({ db }) =>
    must(
      await db
        .from('business_lines')
        .select(`id, slug, name_es, name_en, description_es, description_en, sort, cover:${media('business_lines_cover_media_id_fkey')}` as const)
        .order('sort'),
      'business_lines',
    ),
  )
}

export function getSectors() {
  return cachedQuery(['sectors'], [cacheTags.taxonomies], async ({ db }) =>
    must(
      await db
        .from('sectors')
        .select(`id, slug, name_es, name_en, description_es, description_en, sort, cover:${media('sectors_cover_media_id_fkey')}` as const)
        .order('sort'),
      'sectors',
    ),
  )
}
