import { useTranslations } from 'next-intl'
import { MediaImage } from '@/components/ui/MediaImage'
import { SectionLabel } from '@/components/ui/Section'
import { ACUMIN } from '@/components/ui/tokens'
import type { ImageVM, OfficeVM } from '@/lib/types/site'
import { ContactForm } from './ContactForm'

export function ContactSection({ offices, image, countryCode }: { offices: OfficeVM[]; image: ImageVM | null; countryCode: string }) {
  const t = useTranslations('contact')
  return (
    <section id="contacto" style={{ background: '#f1ece3' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '84px 40px', display: 'grid', gridTemplateColumns: image ? '1.05fr 0.95fr' : '1fr', gap: 56, alignItems: 'stretch' }}>
        <div>
          <SectionLabel>{t('label')}</SectionLabel>
          <h2 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 48, lineHeight: 0.98, letterSpacing: '-0.5px', textTransform: 'uppercase', margin: '0 0 34px', color: '#000' }}>{t('title')}</h2>
          <ContactForm countryCode={countryCode} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 54, paddingTop: 30, borderTop: '1px solid rgba(20,18,12,0.12)' }}>
            {offices.map(a => (
              <div key={a.city}>
                <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, letterSpacing: '1px', color: a.muted ? '#8a8478' : '#17150f', fontWeight: a.muted ? 400 : 700, marginBottom: 10 }}>{a.city}</div>
                <div style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 13, lineHeight: 1.6, color: a.muted ? '#8a8478' : '#17150f', fontWeight: a.muted ? 400 : 700 }}>{a.address}</div>
              </div>
            ))}
          </div>
        </div>
        {image && (
          <div style={{ position: 'relative', borderRadius: 6, overflow: 'hidden' }}>
            <MediaImage image={image} alt={t('imageAlt')} sizes="(max-width: 1024px) 100vw, 560px" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        )}
      </div>
    </section>
  )
}
