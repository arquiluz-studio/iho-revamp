import { redirect } from 'next/navigation'

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ view?: string; date?: string }> }) {
  const { view, date } = await searchParams
  const next = new URLSearchParams({ view: 'calendar' })
  if (view === 'week' || view === 'month') next.set('range', view)
  if (date) next.set('date', date)
  redirect(`/admin/events?${next.toString()}`)
}
