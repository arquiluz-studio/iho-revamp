'use client'
import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { ButtonArrow } from '@/components/ui/Arrow'
import { RichText } from '@/components/ui/Section'
import { Turnstile } from '@/components/ui/Turnstile'
import { ACUMIN } from '@/components/ui/tokens'

const MONO = '"Space Mono", monospace'
const SANS = '"Source Sans 3", sans-serif'

export type RegistrationResult =
  | { ok: true; status: 'pending' | 'confirmed' | 'waitlist' }
  | { ok: false; errors?: Record<string, string>; message?: string }

type Props = {
  eventId?: string
  closed?: boolean
  privacyHref?: string
  action?: (formData: FormData) => Promise<RegistrationResult>
}

function DarkField({ label, name, type = 'text', value, onChange, error }: { label: string; name: string; type?: string; value: string; onChange: (v: string) => void; error?: string }) {
  const id = `reg-${name}`
  return (
    <div>
      <label htmlFor={id} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '1.4px', color: 'rgba(255,255,255,0.55)', display: 'block', marginBottom: 9 }}>{label}</label>
      <input
        id={id} name={name} type={type} value={value}
        onChange={e => onChange(e.target.value)}
        className="iho-dark-input"
        style={{ border: 'none', borderBottom: `1px solid ${error ? '#ef483d' : 'rgba(255,255,255,0.22)'}`, background: 'transparent', color: '#fff', padding: '10px 0', fontSize: 16, fontFamily: SANS, width: '100%' }}
      />
      {error && <div style={{ fontFamily: SANS, fontSize: 13, color: '#ef483d', marginTop: 4 }}>{error}</div>}
    </div>
  )
}

function DarkSelect({ label, name, value, onChange, options }: { label: string; name: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  const id = `reg-${name}`
  return (
    <div>
      <label htmlFor={id} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '1.4px', color: 'rgba(255,255,255,0.55)', display: 'block', marginBottom: 9 }}>{label}</label>
      <select id={id} name={name} value={value} onChange={e => onChange(e.target.value)} className="iho-dark-select" style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.22)', background: 'transparent', color: '#fff', padding: '10px 0', fontSize: 16, fontFamily: SANS, width: '100%', cursor: 'pointer' }}>
        {options.map(o => <option key={o.value} value={o.value} style={{ background: '#17150f', color: '#fff' }}>{o.label}</option>)}
      </select>
    </div>
  )
}

export function EventRegistration({ eventId, closed = false, privacyHref = '#', action }: Props) {
  const t = useTranslations('event.registration')
  const tc = useTranslations('common')
  const locale = useLocale()
  const [form, setForm] = useState({ fullName: '', company: '', email: '', phone: '', passType: 'general', companions: '0', website: '' })
  const [consentPrivacy, setConsentPrivacy] = useState(false)
  const [consentMarketing, setConsentMarketing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<'pending' | 'confirmed' | 'waitlist' | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const field = (key: keyof typeof form) => ({ value: form[key], onChange: (v: string) => setForm(f => ({ ...f, [key]: v })) })

  function validate() {
    const e: Record<string, string> = {}
    if (!form.fullName.trim()) e.fullName = tc('requiredField')
    if (!form.email.trim()) e.email = tc('requiredField')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = tc('invalidEmail')
    if (!form.phone.trim()) e.phone = tc('requiredField')
    if (!consentPrivacy) e.consentPrivacy = t('consentRequired')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setMessage(null)
    try {
      if (!action) {
        await new Promise(r => setTimeout(r, 1200))
        setResult('pending')
        return
      }
      const fd = new FormData(e.currentTarget)
      fd.set('consentPrivacy', consentPrivacy ? 'on' : '')
      fd.set('consentMarketing', consentMarketing ? 'on' : '')
      if (eventId) fd.set('eventId', eventId)
      fd.set('locale', locale)
      const res = await action(fd)
      if (res.ok) setResult(res.status)
      else {
        if (res.errors) setErrors(res.errors)
        setMessage(res.message ?? tc('genericError'))
      }
    } catch {
      setMessage(tc('genericError'))
    } finally {
      setSubmitting(false)
    }
  }

  const statusText = result === 'waitlist' ? t('waitlist') : t('success')

  return (
    <section id="registro" style={{ background: '#17150f', padding: '88px 40px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: 64, alignItems: 'start' }} className="iho-registro-grid">
        <div>
          <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '1.5px', color: '#ef483d', marginBottom: 18 }}>{t('label')}</div>
          <h2 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 48, lineHeight: 0.98, letterSpacing: '-0.5px', textTransform: 'uppercase', color: '#ffffff', margin: '0 0 24px' }}>
            <RichText text={t('title')} />
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', margin: 0 }}>{t('intro')}</p>
        </div>
        {closed ? (
          <p style={{ fontFamily: SANS, fontSize: 17, color: 'rgba(255,255,255,0.8)', margin: 0 }}>{t('closed')}</p>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '26px 28px', marginBottom: 26 }} className="iho-form-grid">
              <DarkField label={t('name')} name="fullName" {...field('fullName')} error={errors.fullName} />
              <DarkField label={t('company')} name="company" {...field('company')} />
              <DarkField label={t('email')} name="email" type="email" {...field('email')} error={errors.email} />
              <DarkField label={t('phone')} name="phone" type="tel" {...field('phone')} error={errors.phone} />
              <DarkSelect label={t('passType')} name="passType" {...field('passType')} options={(['general', 'guided', 'press'] as const).map(v => ({ value: v, label: t(`passTypes.${v}`) }))} />
              <DarkSelect label={t('companions')} name="companions" {...field('companions')} options={(['0', '1', '2'] as const).map(v => ({ value: v, label: t(`companionsOptions.${v}`) }))} />
            </div>
            {/* Honeypot: hidden from people, filled by bots. */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} aria-hidden />
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={consentPrivacy} onChange={e => setConsentPrivacy(e.target.checked)} style={{ width: 17, height: 17, accentColor: '#ef483d', marginTop: 2, flexShrink: 0, cursor: 'pointer' }} />
              <span style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.5, color: errors.consentPrivacy ? '#ef483d' : 'rgba(255,255,255,0.6)' }}>
                {t.rich('consent', { link: chunks => <a href={privacyHref} style={{ color: '#ef483d' }}>{chunks}</a> })}
              </span>
            </label>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 28, cursor: 'pointer' }}>
              <input type="checkbox" checked={consentMarketing} onChange={e => setConsentMarketing(e.target.checked)} style={{ width: 17, height: 17, accentColor: '#ef483d', marginTop: 2, flexShrink: 0, cursor: 'pointer' }} />
              <span style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.5, color: 'rgba(255,255,255,0.6)' }}>{t('marketing')}</span>
            </label>
            <Turnstile />
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <button type="submit" disabled={submitting || result !== null} className="iho-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#ef483d', color: '#fff', border: 'none', padding: '16px 30px', borderRadius: 32, fontFamily: SANS, fontWeight: 600, fontSize: 15, cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                {submitting ? tc('sending') : t('submit')}
                {!submitting && <ButtonArrow />}
              </button>
              <div role="status" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '1px', color: '#ef483d', opacity: result || message ? 1 : 0, transition: 'opacity 0.35s ease' }}>
                {message ?? statusText}
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
