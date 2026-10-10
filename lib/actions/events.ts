'use server'
import { getTranslations } from 'next-intl/server'
import { z } from 'zod'
import type { RegistrationResult } from '@/components/site/event/EventRegistration'
import { countryOrigin, isCountryCode, isLocale, type AppLocale } from '@/config/countries'
import { longDate, timeRange, type Locale } from '@/lib/dates'
import { detailsHtml, detailsText, notificationInbox, sendEmail } from '@/lib/email'
import { plainTitle } from '@/lib/events/ics'
import { t } from '@/lib/i18n-fields'
import { isRateLimited, verifyTurnstile } from '@/lib/security/spam'
import { buildAlternates } from '@/lib/seo'
import { createSupabaseAdminClient, hasServiceRole } from '@/lib/supabase/admin'

const optional = (max: number) => z.string().trim().max(max).optional().transform(v => v || null)

const schema = z.object({
  eventId: z.uuid(),
  locale: z.string().refine(isLocale),
  fullName: z.string().trim().min(1).max(160),
  company: optional(160),
  email: z.email().max(200),
  phone: z.string().trim().min(1).max(40),
  passType: z.enum(['general', 'guided', 'press']).default('general'),
  companions: z.coerce.number().int().min(0).max(2).default(0),
  consentPrivacy: z.literal('on'),
  consentMarketing: z.string().optional().transform(v => v === 'on'),
  website: z.string().max(0).optional(),
  'cf-turnstile-response': z.string().nullish(),
})

/**
 * Public event registration: validated and spam-checked here, then `register_for_event` (service role only)
 * assigns confirmed / waitlist under a row lock so capacity can't be overbooked. Emails the registrant and
 * the country inbox; email failures never fail the registration.
 */
export async function registerForEvent(formData: FormData): Promise<RegistrationResult> {
  const parsed = schema.safeParse(Object.fromEntries(formData))
  const locale: AppLocale = isLocale(String(formData.get('locale'))) ? (String(formData.get('locale')) as AppLocale) : 'es'
  const tr = await getTranslations({ locale, namespace: 'event.registration' })
  const tc = await getTranslations({ locale, namespace: 'common' })
  if (!parsed.success) {
    const errors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0])
      errors[key] = key === 'email' ? tc('invalidEmail') : key === 'consentPrivacy' ? tr('consentRequired') : tc('requiredField')
    }
    return { ok: false, errors, message: tc('genericError') }
  }
  const data = parsed.data
  if (data.website) return { ok: true, status: 'confirmed' }
  if ((await isRateLimited('event-registration')) || !(await verifyTurnstile(data['cf-turnstile-response']))) {
    return { ok: false, message: tc('genericError') }
  }
  if (!hasServiceRole()) {
    console.error('[registration] SUPABASE_SERVICE_ROLE_KEY is not set; registration not stored')
    return { ok: false, message: tc('genericError') }
  }

  const admin = createSupabaseAdminClient()
  const { data: rows, error } = await admin.rpc('register_for_event', {
    p_event_id: data.eventId,
    p_full_name: data.fullName,
    p_company: data.company as string,
    p_email: data.email,
    p_phone: data.phone,
    p_pass_type: data.passType,
    p_companions: data.companions,
    p_locale: data.locale,
    p_consent_marketing: data.consentMarketing,
  })
  if (error) {
    if (error.code === '23505') return { ok: false, errors: { email: tr('duplicate') }, message: tr('duplicate') }
    if (error.message.includes('registration_closed')) return { ok: false, message: tr('closed') }
    if (error.message.includes('registration_unavailable')) return { ok: false, message: tr('unavailable') }
    console.error('[registration] failed', error.message)
    return { ok: false, message: tc('genericError') }
  }
  const status = rows?.[0]?.registration_status === 'waitlist' ? 'waitlist' : 'confirmed'

  await notify(admin, data, locale, status).catch(e => console.error('[registration] email failed', e))
  return { ok: true, status }
}

async function notify(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  data: z.infer<typeof schema>,
  locale: AppLocale,
  status: 'confirmed' | 'waitlist',
) {
  const { data: event } = await admin
    .from('events')
    .select('id, slug, country_code, title_es, title_en, starts_at, ends_at, timezone, venue_name, address, city, is_online, online_url, countries(email, name_es)')
    .eq('id', data.eventId)
    .maybeSingle()
  if (!event || !isCountryCode(event.country_code)) return

  const te = await getTranslations({ locale, namespace: 'event.registration.confirmationEmail' })
  const title = plainTitle(t(event, 'title', locale))
  const when = `${longDate(event.starts_at, event.timezone, locale as Locale)} · ${timeRange(event.starts_at, event.ends_at, event.timezone)}`
  const where = event.is_online ? event.online_url : [event.venue_name, event.address, event.city].filter(Boolean).join(', ')
  const eventUrl = String(
    buildAlternates({ href: { pathname: '/events/[slug]', params: { slug: event.slug } }, country: event.country_code, locale, availableIn: [event.country_code] })
      .canonical,
  )
  const icsUrl = `${countryOrigin(event.country_code)}/api/events/${event.id}/ics?lang=${locale}`

  const subject = te(status === 'waitlist' ? 'waitlistSubject' : 'confirmedSubject', { event: title })
  const intro = te(status === 'waitlist' ? 'waitlistBody' : 'confirmedBody', { event: title })
  const rows: [string, string | null][] = [
    [te('when'), when],
    [te('where'), where],
    [te('details'), eventUrl],
    ...(status === 'confirmed' ? ([[te('calendar'), icsUrl]] as [string, string][]) : []),
  ]
  const heading = `${te('greeting', { name: data.fullName })}\n${intro}`
  await sendEmail({
    to: data.email,
    subject,
    text: `${detailsText(heading, rows)}\n\n${te('signature')}`,
    html: `${detailsHtml(heading, rows)}<p style="font-family:Arial,sans-serif;font-size:14px;color:#2c2920">${te('signature')}</p>`,
  })

  const inbox = notificationInbox(event.countries?.email)
  if (!inbox) return
  const staffTitle = `${status === 'waitlist' ? 'Lista de espera' : 'Nuevo registro'} · ${plainTitle(event.title_es)}`
  const staffRows: [string, string | null][] = [
    ['Nombre', data.fullName],
    ['Correo', data.email],
    ['Teléfono', data.phone],
    ['Empresa', data.company],
    ['Pase', data.passType],
    ['Acompañantes', String(data.companions)],
    ['Estado', status === 'waitlist' ? 'Lista de espera' : 'Confirmado'],
  ]
  await sendEmail({ to: inbox, subject: staffTitle, text: detailsText(staffTitle, staffRows), html: detailsHtml(staffTitle, staffRows), replyTo: data.email })
}
