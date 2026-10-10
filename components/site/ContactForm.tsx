'use client'
import { useState, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { ButtonArrow } from '@/components/ui/Arrow'
import { Turnstile } from '@/components/ui/Turnstile'
import { submitContact } from '@/lib/actions/contact'

const inputStyle: React.CSSProperties = { border: 'none', borderBottom: '1px solid rgba(20,18,12,0.28)', background: 'transparent', padding: '10px 2px', fontSize: 15, fontFamily: 'inherit', color: '#17150f' }

type Status = { kind: 'idle' } | { kind: 'sent' } | { kind: 'error'; message: string }

export function ContactForm({ countryCode }: { countryCode: string }) {
  const t = useTranslations('contact')
  const tc = useTranslations('common')
  const locale = useLocale()
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [pending, startTransition] = useTransition()

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const field = (name: string) => String(data.get(name) ?? '')
    startTransition(async () => {
      const result = await submitContact({
        countryCode,
        locale,
        firstName: field('firstName'),
        lastName: field('lastName'),
        email: field('email'),
        phone: field('phone'),
        message: field('message'),
        website: field('website'),
        turnstileToken: (data.get('cf-turnstile-response') as string | null) ?? null,
      })
      if (result.ok) {
        form.reset()
        setStatus({ kind: 'sent' })
      } else if (result.errors) {
        setStatus({ kind: 'error', message: result.errors.email ? tc('invalidEmail') : tc('requiredField') })
      } else {
        setStatus({ kind: 'error', message: tc('genericError') })
      }
    })
  }

  return (
    <form onSubmit={submit} data-country={countryCode} style={{ fontFamily: '"Source Sans 3", sans-serif' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26, marginBottom: 26 }}>
        <input type="text" name="firstName" required autoComplete="given-name" placeholder={t('firstName')} aria-label={t('firstName')} style={inputStyle} />
        <input type="text" name="lastName" autoComplete="family-name" placeholder={t('lastName')} aria-label={t('lastName')} style={inputStyle} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26, marginBottom: 26 }}>
        <input type="email" name="email" required autoComplete="email" placeholder={t('email')} aria-label={t('email')} style={inputStyle} />
        <input type="tel" name="phone" autoComplete="tel" placeholder={t('phone')} aria-label={t('phone')} style={inputStyle} />
      </div>
      <textarea name="message" required placeholder={t('message')} aria-label={t('message')} rows={2} style={{ ...inputStyle, width: '100%', resize: 'none', marginBottom: 30 }} />
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />
      <Turnstile />
      <button type="submit" disabled={pending} className="iho-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#ef483d', color: '#fff', border: 'none', padding: '14px 30px', borderRadius: 32, fontFamily: 'inherit', fontWeight: 600, fontSize: 15, cursor: pending ? 'wait' : 'pointer' }}>
        {pending ? tc('sending') : t('submit')}
        <ButtonArrow />
      </button>
      {status.kind !== 'idle' && (
        <p role="status" style={{ margin: '18px 0 0', fontSize: 14, color: status.kind === 'sent' ? '#2c2920' : '#ef483d' }}>
          {status.kind === 'sent' ? t('success') : status.message}
        </p>
      )}
    </form>
  )
}
