import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ButtonLink, STATUS_TONES, cn } from './ui'

const DAY = 'yyyy-MM-dd'
const TONE_CLASSES: Record<string, string> = {
  green: 'border-emerald-500 bg-emerald-50 text-emerald-900',
  amber: 'border-amber-500 bg-amber-50 text-amber-900',
  neutral: 'border-zinc-400 bg-zinc-100 text-zinc-600',
}

export type CalendarParams = { range?: string; date?: string }

export async function EventsCalendar({
  country,
  params,
  basePath,
}: {
  country: { code: string; timezone: string }
  params: CalendarParams
  basePath: string
}) {
  const range = params.range === 'week' ? 'week' : 'month'
  const tz = country.timezone
  const today = formatInTimeZone(new Date(), tz, DAY)
  const anchor = parseISO(/^\d{4}-\d{2}-\d{2}$/.test(params.date ?? '') ? params.date! : today)

  const rangeStart = range === 'month' ? startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 }) : startOfWeek(anchor, { weekStartsOn: 1 })
  const rangeEnd = range === 'month' ? endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 }) : endOfWeek(anchor, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd })

  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('events')
    .select('id, title_es, starts_at, ends_at, timezone, status, city, is_online')
    .eq('country_code', country.code)
    .lt('starts_at', fromZonedTime(`${format(addDays(rangeEnd, 1), DAY)}T00:00`, tz).toISOString())
    .or(`ends_at.gte.${fromZonedTime(`${format(rangeStart, DAY)}T00:00`, tz).toISOString()},starts_at.gte.${fromZonedTime(`${format(rangeStart, DAY)}T00:00`, tz).toISOString()}`)
    .order('starts_at')

  const byDay = new Map<string, NonNullable<typeof data>>()
  for (const event of data ?? []) {
    const first = formatInTimeZone(event.starts_at, tz, DAY)
    const last = event.ends_at ? formatInTimeZone(event.ends_at, tz, DAY) : first
    for (const day of eachDayOfInterval({ start: parseISO(first), end: parseISO(last < first ? first : last) })) {
      const key = format(day, DAY)
      byDay.set(key, [...(byDay.get(key) ?? []), event])
    }
  }

  const step = (direction: 1 | -1) => format(range === 'month' ? addMonths(anchor, direction) : addWeeks(anchor, direction), DAY)
  const href = (patch: { range?: string; date?: string }) => {
    const next = new URLSearchParams({ view: 'calendar', range, date: format(anchor, DAY), ...patch })
    return `${basePath}?${next.toString()}`
  }
  const title =
    range === 'month'
      ? format(anchor, "MMMM 'de' yyyy", { locale: es })
      : `${format(rangeStart, "d 'de' MMM", { locale: es })} – ${format(rangeEnd, "d 'de' MMM yyyy", { locale: es })}`

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <ButtonLink href={href({ date: step(-1) })} variant="outline" size="sm" aria-label="Anterior">
          ←
        </ButtonLink>
        <ButtonLink href={href({ date: today })} variant="outline" size="sm">
          Hoy
        </ButtonLink>
        <ButtonLink href={href({ date: step(1) })} variant="outline" size="sm" aria-label="Siguiente">
          →
        </ButtonLink>
        <h2 className="ml-2 text-base font-semibold first-letter:uppercase">{title}</h2>
        <span className="text-xs text-zinc-500">· horario {tz.replace('America/', '').replace('_', ' ')}</span>
        <div className="ml-auto flex overflow-hidden rounded-md border border-zinc-300 text-xs">
          {(['month', 'week'] as const).map(r => (
            <Link key={r} href={href({ range: r })} className={cn('px-3 py-1.5', range === r ? 'bg-zinc-900 text-white' : 'bg-white hover:bg-zinc-50')}>
              {r === 'month' ? 'Mes' : 'Semana'}
            </Link>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50 text-center text-xs font-medium uppercase tracking-wide text-zinc-500">
          {days.slice(0, 7).map(day => (
            <div key={day.toISOString()} className="py-2">
              {format(day, 'EEE', { locale: es })}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map(day => {
            const key = format(day, DAY)
            const events = byDay.get(key) ?? []
            const muted = range === 'month' && !isSameMonth(day, anchor)
            return (
              <div
                key={key}
                className={cn(
                  'border-b border-r border-zinc-100 p-1.5',
                  range === 'month' ? 'min-h-28' : 'min-h-80',
                  muted && 'bg-zinc-50/70',
                )}
              >
                <p
                  className={cn(
                    'mb-1 inline-flex size-6 items-center justify-center rounded-full text-xs',
                    key === today ? 'bg-zinc-900 font-semibold text-white' : muted ? 'text-zinc-400' : 'text-zinc-700',
                  )}
                >
                  {format(day, 'd')}
                </p>
                <ul className="space-y-1">
                  {events.map(event => (
                    <li key={event.id}>
                      <Link
                        href={`${basePath}/${event.id}`}
                        className={cn(
                          'block truncate rounded border-l-2 px-1.5 py-0.5 text-xs hover:opacity-80',
                          TONE_CLASSES[STATUS_TONES[event.status] ?? 'neutral'] ?? TONE_CLASSES.neutral,
                        )}
                        title={event.title_es}
                      >
                        <span className="font-medium">{formatInTimeZone(event.starts_at, event.timezone || tz, 'HH:mm')}</span> {event.title_es}
                        {range === 'week' && (
                          <span className="block truncate text-[11px] opacity-75">{event.is_online ? 'En línea' : (event.city ?? '')}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
      <p className="mt-3 text-xs text-zinc-500">Verde = publicado · Ámbar = borrador · Gris = archivado.</p>
    </>
  )
}
