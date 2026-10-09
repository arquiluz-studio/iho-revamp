import { formatInTimeZone, toZonedTime } from 'date-fns-tz'
import { es, enUS } from 'date-fns/locale'

export type Locale = 'es' | 'en'

const SHORT_MONTHS: Record<Locale, string[]> = {
  es: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'],
  en: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
}

const dfLocale = (locale: Locale) => (locale === 'en' ? enUS : es)

export function isPastDate(iso: string, now: Date = new Date()): boolean {
  return new Date(iso) < now
}

export function todayLabel(locale: Locale, now: Date = new Date()): string {
  return `${now.getDate()} ${SHORT_MONTHS[locale][now.getMonth()]}`
}

export function shortMonth(iso: string, timeZone: string, locale: Locale): string {
  return SHORT_MONTHS[locale][toZonedTime(iso, timeZone).getMonth()]
}

export function dayOfMonth(iso: string, timeZone: string): string {
  return formatInTimeZone(iso, timeZone, 'dd')
}

/** 'Viernes 14 de agosto, 2026' / 'Friday, August 14, 2026' */
export function longDate(iso: string, timeZone: string, locale: Locale): string {
  const pattern = locale === 'en' ? 'EEEE, MMMM d, yyyy' : "EEEE d 'de' MMMM, yyyy"
  const s = formatInTimeZone(iso, timeZone, pattern, { locale: dfLocale(locale) })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** '6:00 PM' */
export function timeOfDay(iso: string, timeZone: string): string {
  return formatInTimeZone(iso, timeZone, 'h:mm a')
}

/** '6:00 PM — 10:00 PM' */
export function timeRange(startIso: string, endIso: string | null, timeZone: string): string {
  const start = timeOfDay(startIso, timeZone)
  return endIso ? `${start} — ${timeOfDay(endIso, timeZone)}` : start
}

export function yearOf(iso: string, timeZone: string): string {
  return formatInTimeZone(iso, timeZone, 'yyyy')
}
