import 'server-only'
import { revalidateTag } from 'next/cache'
import { cacheTags, type CountrySection } from '@/lib/cache-tags'
import type { ResourceConfig } from './resources'

/** Purges the public cache for whatever a save touched. Stale content is served while it regenerates. */
export function revalidateTags(tags: string[]) {
  for (const tag of new Set(tags)) revalidateTag(tag, 'max')
}

export function revalidateCountry(countryCode: string, ...sections: CountrySection[]) {
  revalidateTags(sections.map(section => cacheTags.country(countryCode, section)))
}

export function revalidateResource(config: ResourceConfig, countryCode: string | null, id: string | null) {
  const tags: string[] = []
  if (config.scope === 'country' && countryCode && config.section) tags.push(cacheTags.country(countryCode, config.section))
  if (config.globalTag) tags.push(cacheTags[config.globalTag])
  if (id) {
    if (config.table === 'events') tags.push(cacheTags.event(id))
    if (config.table === 'projects') tags.push(cacheTags.project(id))
    if (config.table === 'brands') tags.push(cacheTags.brand(id))
    if (config.table === 'products') tags.push(cacheTags.product(id))
  }
  revalidateTags(tags)
}
