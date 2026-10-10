import type { AppLocale } from '@/config/countries'

type Row = Record<string, unknown>

/** Localized column value: `${field}_en` when the locale is English and it has content, otherwise `${field}_es`. */
export function t(row: Row | null | undefined, field: string, locale: AppLocale | string): string {
  if (!row) return ''
  const en = row[`${field}_en`]
  if (locale === 'en' && typeof en === 'string' && en.trim()) return en
  const es = row[`${field}_es`]
  return typeof es === 'string' ? es : ''
}

/** URL slug for the locale: `slug` is Spanish, `slug_en` the optional English one. */
export function localSlug(row: { slug: string; slug_en?: string | null }, locale: AppLocale | string): string {
  return (locale === 'en' && row.slug_en) || row.slug
}

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

/**
 * Row addressed by a URL slug: the one whose slug for this locale matches, else one matching in the other
 * language (the page then redirects to the canonical slug).
 */
export function pickBySlug<T extends { slug: string; slug_en?: string | null }>(rows: readonly T[], slug: string, locale: AppLocale | string): T | null {
  return rows.find(r => localSlug(r, locale) === slug) ?? rows.find(r => r.slug === slug || r.slug_en === slug) ?? null
}

/** Splits a multi-paragraph text column into paragraphs (blank-line separated). */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
}
