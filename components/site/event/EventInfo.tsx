import { useTranslations } from 'next-intl'
import { RichText } from '@/components/ui/Section'
import { ACUMIN } from '@/components/ui/tokens'
import type { EventDetailVM } from '@/lib/types/site'

const MONO = '"Space Mono", monospace'
const SANS = '"Source Sans 3", sans-serif'

export function EventFacts({ event }: { event: EventDetailVM }) {
  const t = useTranslations('event.facts')
  const facts = [
    { label: t('date'), value: event.fullDate },
    { label: t('time'), value: event.timeRange },
    { label: t('venue'), value: event.venue },
    { label: t('access'), value: event.access },
  ]
  return (
    <div style={{ background: '#ffffff', borderBottom: '1px solid rgba(20,18,12,0.1)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '34px 40px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 28 }} className="iho-datos-grid">
        {facts.map(({ label, value }) => (
          <div key={label}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '1.4px', color: '#ef483d', marginBottom: 8 }}>{label}</div>
            <div style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.5, color: '#17150f' }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function EventAbout({ event }: { event: EventDetailVM }) {
  const t = useTranslations('event.about')
  const title = event.aboutTitle.trim() || t('title')
  const agendaHeading = event.agendaHeading.trim() || t('agenda')
  return (
    <section style={{ background: '#faf7f1', padding: '88px 40px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: event.agenda.length ? '1.15fr 0.85fr' : '1fr', gap: 64, alignItems: 'start' }} className="iho-sobre-grid">
        <div>
          <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '1.5px', color: '#ef483d', marginBottom: 18 }}>{t('label')}</div>
          <h2 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 48, lineHeight: 0.98, letterSpacing: '-0.5px', textTransform: 'uppercase', margin: '0 0 34px' }}>
            <RichText text={title} />
          </h2>
          {event.description.map((p, i) => (
            <p key={i} style={{ fontFamily: SANS, fontSize: 17, lineHeight: 1.7, color: '#4a463d', margin: i < event.description.length - 1 ? '0 0 20px' : 0, textWrap: 'pretty' } as React.CSSProperties}>{p}</p>
          ))}
        </div>
        {event.agenda.length > 0 && (
          <div style={{ background: '#ffffff', border: '1px solid rgba(20,18,12,0.1)', borderRadius: 4, padding: 34 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '1.2px', color: '#8a8478', marginBottom: 16, textTransform: 'uppercase' }}>{agendaHeading}</div>
            {event.agenda.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 18, alignItems: 'flex-start', borderTop: '1px solid rgba(20,18,12,0.08)', padding: '16px 0' }}>
                <span style={{ fontFamily: MONO, fontSize: 11, color: '#ef483d', flexShrink: 0, marginTop: 2 }}>{item.num}</span>
                <span style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.55, color: '#2c2920' }}>{item.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
