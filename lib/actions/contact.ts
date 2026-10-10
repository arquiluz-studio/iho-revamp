'use server'
import { z } from 'zod'
import { COUNTRIES, isCountryCode, isLocale } from '@/config/countries'
import { detailsHtml, detailsText, notificationInbox, sendEmail } from '@/lib/email'
import { isRateLimited, verifyTurnstile } from '@/lib/security/spam'
import { createSupabaseAdminClient, hasServiceRole } from '@/lib/supabase/admin'

const optional = (max: number) => z.string().trim().max(max).optional().transform(v => v || null)

const schema = z.object({
  countryCode: z.string().refine(isCountryCode),
  locale: z.string().refine(isLocale),
  firstName: z.string().trim().min(1).max(80),
  lastName: optional(80),
  email: z.email().max(200),
  phone: optional(40),
  company: optional(160),
  message: z.string().trim().min(1).max(4000),
  source: z.enum(['contact', 'product_inquiry']).default('contact'),
  sourceRef: z.uuid().optional(),
  consentMarketing: z.boolean().optional(),
  website: z.string().max(0).optional(),
  turnstileToken: z.string().nullish(),
})

export type ContactInput = z.input<typeof schema>
export type ContactResult = { ok: true } | { ok: false; errors?: Record<string, string>; message?: 'spam' | 'server' }

/** Public contact form: validated, spam-checked, stored with the service role and forwarded to the country inbox. */
export async function submitContact(input: ContactInput): Promise<ContactResult> {
  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    const errors: Record<string, string> = {}
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] = issue.code
    return { ok: false, errors }
  }
  const data = parsed.data
  // Honeypot filled: pretend success so bots don't retry.
  if (data.website) return { ok: true }
  if ((await isRateLimited('contact')) || !(await verifyTurnstile(data.turnstileToken))) return { ok: false, message: 'spam' }
  if (!hasServiceRole()) {
    console.error('[contact] SUPABASE_SERVICE_ROLE_KEY is not set; lead not stored')
    return { ok: false, message: 'server' }
  }

  const admin = createSupabaseAdminClient()
  const { error } = await admin.from('contact_leads').insert({
    country_code: data.countryCode,
    locale: data.locale,
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email.toLowerCase(),
    phone: data.phone,
    company: data.company,
    message: data.message,
    source: data.source,
    source_ref: data.sourceRef ?? null,
    consent_marketing: data.consentMarketing ?? false,
  })
  if (error) {
    console.error('[contact] insert failed', error.message)
    return { ok: false, message: 'server' }
  }

  const { data: country } = await admin.from('countries').select('email').eq('code', data.countryCode).maybeSingle()
  const inbox = notificationInbox(country?.email)
  if (inbox) {
    const isInquiry = data.source === 'product_inquiry'
    const product =
      isInquiry && data.sourceRef ? (await admin.from('products').select('name_es, slug').eq('id', data.sourceRef).maybeSingle()).data : null
    const title = `${isInquiry ? 'Nueva cotización' : 'Nuevo contacto'} · IHO ${COUNTRIES[data.countryCode as keyof typeof COUNTRIES].name.es}`
    const rows: [string, string | null][] = [
      ['Producto', product ? `${product.name_es} (${product.slug})` : null],
      ['Nombre', [data.firstName, data.lastName].filter(Boolean).join(' ')],
      ['Correo', data.email],
      ['Teléfono', data.phone],
      ['Empresa', data.company],
      ['Origen', isInquiry ? 'Cotización de producto' : 'Formulario de contacto'],
      ['Mensaje', data.message],
    ]
    await sendEmail({ to: inbox, subject: title, text: detailsText(title, rows), html: detailsHtml(title, rows), replyTo: data.email })
  }
  return { ok: true }
}
