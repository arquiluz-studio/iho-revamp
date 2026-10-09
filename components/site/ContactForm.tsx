'use client'
import { useTranslations } from 'next-intl'
import { ButtonArrow } from '@/components/ui/Arrow'

const inputStyle: React.CSSProperties = { border: 'none', borderBottom: '1px solid rgba(20,18,12,0.28)', background: 'transparent', padding: '10px 2px', fontSize: 15, fontFamily: 'inherit', color: '#17150f' }

export function ContactForm({ countryCode }: { countryCode: string }) {
  const t = useTranslations('contact')
  return (
    <form onSubmit={e => e.preventDefault()} data-country={countryCode} style={{ fontFamily: '"Source Sans 3", sans-serif' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26, marginBottom: 26 }}>
        <input type="text" name="firstName" placeholder={t('firstName')} style={inputStyle} />
        <input type="text" name="lastName" placeholder={t('lastName')} style={inputStyle} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26, marginBottom: 26 }}>
        <input type="email" name="email" placeholder={t('email')} style={inputStyle} />
        <input type="tel" name="phone" placeholder={t('phone')} style={inputStyle} />
      </div>
      <textarea name="message" placeholder={t('message')} rows={2} style={{ ...inputStyle, width: '100%', resize: 'none', marginBottom: 30 }} />
      <button type="submit" className="iho-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#ef483d', color: '#fff', border: 'none', padding: '14px 30px', borderRadius: 32, fontFamily: 'inherit', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
        {t('submit')}
        <ButtonArrow />
      </button>
    </form>
  )
}
