export function formatDateTime(value: unknown, timeZone?: string, withTime = true): string {
  if (!value) return '—'
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: withTime ? 'short' : undefined,
    timeZone,
  }).format(date)
}
