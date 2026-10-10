/** Event titles use line breaks and `*highlight*` markers for the hero; calendars and emails get plain text. */
export const plainTitle = (title: string) => title.replace(/[\n*]/g, ' ').replace(/\s+/g, ' ').trim()

const escapeText = (value: string) => value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

const utcStamp = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

/** RFC 5545 folding: lines longer than 75 characters continue on the next line after a space. */
function fold(line: string): string {
  const parts: string[] = []
  for (let i = 0; i < line.length; i += 74) parts.push(line.slice(i, i + 74))
  return parts.join('\r\n ')
}

export type IcsEvent = {
  id: string
  title: string
  description?: string | null
  location?: string | null
  url?: string | null
  startsAt: string
  endsAt?: string | null
}

const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000

export function buildIcs(event: IcsEvent): string {
  const start = new Date(event.startsAt)
  const end = event.endsAt ? new Date(event.endsAt) : new Date(start.getTime() + DEFAULT_DURATION_MS)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Grupo IHO//Eventos//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@iho.com.mx`,
    `DTSTAMP:${utcStamp(new Date())}`,
    `DTSTART:${utcStamp(start)}`,
    `DTEND:${utcStamp(end)}`,
    `SUMMARY:${escapeText(plainTitle(event.title))}`,
    event.description && `DESCRIPTION:${escapeText(event.description)}`,
    event.location && `LOCATION:${escapeText(event.location)}`,
    event.url && `URL:${event.url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter((l): l is string => Boolean(l))
  return `${lines.map(fold).join('\r\n')}\r\n`
}
