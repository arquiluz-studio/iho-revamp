import type { AppLocale } from '@/config/countries'
import { localSlug, t } from '@/lib/i18n-fields'
import type { MediaRef } from '@/lib/media'
import type { getBusinessLines, getSectors, getSolutionSpaceFits } from '@/lib/queries/site'
import { legacyMedia } from './legacy-media'
import type { SitePaths } from './paths'
import { imageOrNull } from './site'

type Line = Awaited<ReturnType<typeof getBusinessLines>>[number]
type Sector = Awaited<ReturnType<typeof getSectors>>[number]
type Fit = Awaited<ReturnType<typeof getSolutionSpaceFits>>[number]

function sentence(fit: Fit | undefined, fallback: string, locale: AppLocale) {
  return t(fit, 'body', locale) || fallback
}

function photo(fit: Fit | undefined, cover: MediaRef | null, locale: AppLocale, alt: string, fallback: string | null) {
  return imageOrNull(fit?.image ?? cover, locale, alt, fallback, 'md')
}

/** Spaces a solution serves, in the order of the spaces catalog. */
export function spacesForSolution(line: Line, sectors: Sector[], fits: Fit[], locale: AppLocale, paths: SitePaths) {
  return sectors.map(sector => {
    const fit = fits.find(row => row.business_line_id === line.id && row.sector_id === sector.id)
    const title = t(sector, 'name', locale)
    return {
      key: sector.id,
      title,
      text: sentence(fit, t(sector, 'description', locale), locale),
      href: paths.space(localSlug(sector, locale)),
      image: photo(fit, sector.cover, locale, title, legacyMedia.sectorCover(sector.slug)),
    }
  })
}

/** Solutions offered in a space, in the order of the solutions catalog. */
export function solutionsForSpace(sector: Sector, lines: Line[], fits: Fit[], locale: AppLocale, paths: SitePaths) {
  return lines.map(line => {
    const fit = fits.find(row => row.business_line_id === line.id && row.sector_id === sector.id)
    const title = t(line, 'name', locale)
    return {
      key: line.id,
      title,
      text: sentence(fit, t(line, 'description', locale), locale),
      href: paths.solution(localSlug(line, locale)),
      image: photo(fit, line.cover, locale, title, legacyMedia.businessLineCover(line.slug)),
    }
  })
}
