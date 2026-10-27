import { useTranslations } from 'next-intl'
import { MediaImage } from '@/components/ui/MediaImage'
import { RichText, SectionLabel, SectionTitle } from '@/components/ui/Section'
import { ACUMIN } from '@/components/ui/tokens'
import type { TeamMemberVM } from '@/lib/types/site'

export function Team({ members }: { members: TeamMemberVM[] }) {
  const t = useTranslations('home.team')
  if (members.length === 0) return null
  return (
    <section id="equipo" style={{ maxWidth: 1240, margin: '0 auto', padding: '88px 40px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <SectionLabel>{t('label')}</SectionLabel>
        <SectionTitle><RichText text={t('title')} /></SectionTitle>
        <p style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 15, lineHeight: 1.6, color: '#7a756a', maxWidth: 430, margin: '0 auto' }}>{t('intro')}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        {members.map(m => (
          <div key={m.href} className="iho-team-card">
            <div style={{ aspectRatio: '3/4', borderRadius: 4, overflow: 'hidden', background: '#e7e2d9', position: 'relative' }}>
              <MediaImage image={m.photo} sizes="(max-width: 768px) 50vw, 240px" style={{ objectPosition: m.objectPosition }} />
              <div className="tc-tint" style={{ position: 'absolute', inset: 0, background: '#ef483d', mixBlendMode: 'multiply', opacity: 0, transition: 'opacity 0.6s ease', pointerEvents: 'none' }} />
            </div>
            <div style={{ fontFamily: ACUMIN, fontWeight: 700, fontSize: 18, textTransform: 'uppercase', color: '#17150f', lineHeight: 1, marginTop: 12 }}>{m.name}</div>
            <div className="tc-bar" style={{ height: 2, background: '#ef483d', width: 0, marginTop: 6, transition: 'width 0.45s cubic-bezier(0.2,0,0.2,1)' }} />
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, letterSpacing: '1px', color: '#ef483d', marginTop: 7 }}>{m.role}</div>
            <a href={m.href} className="iho-team-contact">{t('contact')}</a>
          </div>
        ))}
      </div>
    </section>
  )
}
