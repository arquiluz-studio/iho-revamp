'use client'
import { useState, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { requestDownloadAccess } from '@/lib/actions/download-access'
import { DOWNLOAD_FLAG_COOKIE, downloadHref } from '@/lib/downloads'
import { SANS } from '@/components/ui/tokens'
import { Turnstile } from '@/components/ui/Turnstile'

const input: React.CSSProperties = {
  width: '100%', padding: '12px 14px', border: '1px solid rgba(20,18,12,0.15)', borderRadius: 8,
  fontFamily: SANS, fontSize: 15, background: '#fff', color: '#2c2920',
}

export function DownloadButton({ mediaId, countryCode, label }: { mediaId: string; countryCode: string; label: string }) {
  const t = useTranslations('download')
  const tc = useTranslations('common')
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const start = () => {
    if (document.cookie.split('; ').some(c => c === `${DOWNLOAD_FLAG_COOKIE}=1`)) {
      window.location.href = downloadHref(mediaId)
    } else {
      setOpen(true)
    }
  }

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const result = await requestDownloadAccess({
        mediaId,
        countryCode,
        locale,
        fullName: String(form.get('fullName') ?? ''),
        email: String(form.get('email') ?? ''),
        company: String(form.get('company') ?? ''),
        website: String(form.get('website') ?? ''),
        turnstileToken: (form.get('cf-turnstile-response') as string | null) ?? null,
      })
      if (result.ok) {
        setOpen(false)
        window.location.href = result.href
      } else {
        setError(result.errors ? tc('requiredField') : tc('genericError'))
      }
    })
  }

  return (
    <>
      <button type="button" onClick={start} className="iho-btn" style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, background: 'transparent', border: '1px solid currentColor', borderRadius: 30, padding: '8px 16px', cursor: 'pointer', color: 'inherit' }}>
        {label}
      </button>
      {open && (
        <div role="dialog" aria-modal="true" aria-label={t('title')} onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(20,18,12,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <form onSubmit={submit} onClick={e => e.stopPropagation()} style={{ background: '#faf7f1', borderRadius: 16, padding: 32, width: '100%', maxWidth: 440, display: 'grid', gap: 14, color: '#2c2920', fontFamily: SANS }}>
            <h3 style={{ margin: 0, fontSize: 22 }}>{t('title')}</h3>
            <p style={{ margin: 0, fontSize: 14, color: '#6b665c' }}>{t('intro')}</p>
            <input name="fullName" required placeholder={t('name')} aria-label={t('name')} style={input} />
            <input name="company" required placeholder={t('company')} aria-label={t('company')} style={input} />
            <input name="email" type="email" required placeholder={t('email')} aria-label={t('email')} style={input} />
            <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />
            <Turnstile />
            {error && <p role="alert" style={{ margin: 0, color: '#ef483d', fontSize: 14 }}>{error}</p>}
            <button type="submit" disabled={pending} className="iho-btn" style={{ background: '#ef483d', color: '#fff', border: 0, borderRadius: 30, padding: '12px 20px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
              {pending ? tc('sending') : t('submit')}
            </button>
          </form>
        </div>
      )}
    </>
  )
}
