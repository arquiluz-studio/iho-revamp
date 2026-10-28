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
        {members.map(member => (
          <div key={member.name} className="iho-team-card">
            <div style={{ aspectRatio: '3/4', borderRadius: 4, overflow: 'hidden', background: '#e7e2d9', position: 'relative' }}>
              <MediaImage image={member.photo} sizes="(max-width: 768px) 50vw, 240px" style={{ objectPosition: member.objectPosition }} />
              <div className="tc-tint" style={{ position: 'absolute', inset: 0, background: '#ef483d', mixBlendMode: 'multiply', opacity: 0, transition: 'opacity 0.6s ease', pointerEvents: 'none' }} />
            </div>
            <div className="iho-team-id">
              <div style={{ fontFamily: ACUMIN, fontWeight: 700, fontSize: 18, textTransform: 'uppercase', color: '#17150f', lineHeight: 1 }}>{member.name}</div>
              <LinkedInButton href={member.linkedin} label={`${t('linkedin')}, ${member.name}`} />
            </div>
            <div className="tc-bar" style={{ height: 2, background: '#ef483d', width: 0, marginTop: 6, transition: 'width 0.45s cubic-bezier(0.2,0,0.2,1)' }} />
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, letterSpacing: '1px', color: '#ef483d', marginTop: 7 }}>{member.role}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function LinkedInButton({ href, label }: { href?: string | null; label: string }) {
  const icon = (
    <svg aria-hidden="true" width={12} height={12} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V24h-4V8.5zM8.5 8.5h3.8v2.1h.05c.53-1 1.84-2.1 3.79-2.1 4.05 0 4.8 2.67 4.8 6.14V24h-4v-7.7c0-1.84-.03-4.2-2.56-4.2-2.56 0-2.95 2-2.95 4.06V24h-4V8.5z" />
    </svg>
  )
  if (!href) return <span className="iho-team-linkedin" aria-hidden="true">{icon}</span>
  return (
    <a className="iho-team-linkedin" href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
      {icon}
    </a>
  )
}
