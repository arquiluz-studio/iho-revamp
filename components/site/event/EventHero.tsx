import { Fragment } from 'react'
import { useTranslations } from 'next-intl'
import { ButtonArrow } from '@/components/ui/Arrow'
import { MediaImage } from '@/components/ui/MediaImage'
import { ACUMIN } from '@/components/ui/tokens'
import type { EventDetailVM } from '@/lib/types/site'

const MONO = '"Space Mono", monospace'

function SplitTitle({ title }: { title: string }) {
  const words = title.split(' ')
  const breakAt = Math.floor(words.length / 2)
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={i}>
          {i === breakAt && i > 0 && <br />}
          {w}{' '}
        </Fragment>
      ))}
    </>
  )
}

export function EventHero({ event, showRegistration }: { event: EventDetailVM; showRegistration: boolean }) {
  const t = useTranslations('event')
  const th = useTranslations('home.events')
  const tn = useTranslations('nav')
  return (
    <section className="iho-event-hero" style={{ position: 'relative', height: '78vh', minHeight: 600, background: '#0e0e0e', overflow: 'hidden' }}>
      <MediaImage image={event.image} priority sizes="100vw" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: event.isPast ? 'grayscale(0.3)' : undefined }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(15,13,11,0.9) 0%, rgba(15,13,11,0.42) 48%, rgba(15,13,11,0.18) 100%)', pointerEvents: 'none' }} />

      <div style={{ position: 'absolute', top: 74, left: 0, right: 0 }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px', display: 'flex', gap: 0 }}>
          <div style={{ background: event.isPast ? '#17150f' : '#ef483d', color: '#fff', padding: '12px 18px', fontFamily: MONO, fontSize: 12, letterSpacing: '1.5px' }}>
            {event.isPast ? th('done') : th('saveTheDate')}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.92)', color: '#17150f', padding: '12px 18px', fontFamily: MONO, fontSize: 12, letterSpacing: '1.5px' }}>
            {event.typeLabel}
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px 56px' }}>
          <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '1.3px', color: 'rgba(255,255,255,0.75)', marginBottom: 16 }}>{event.locationLine}</div>
          <h1 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 86, lineHeight: 0.9, letterSpacing: '-1px', textTransform: 'uppercase', color: '#fff', margin: '0 0 28px' }}>
            <SplitTitle title={event.title} />
          </h1>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {showRegistration && (
              <a href="#registro" className="iho-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#ef483d', color: '#fff', padding: '14px 26px', borderRadius: 32, fontFamily: '"Source Sans 3", sans-serif', fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
                {tn('requestPass')}
                <ButtonArrow />
              </a>
            )}
            {event.products.length > 0 && (
              <a href="#productos" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '14px 26px', borderRadius: 32, fontFamily: '"Source Sans 3", sans-serif', fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
                {t('viewProducts')}
              </a>
            )}
            {event.icsHref && !event.isPast && (
              <a href={event.icsHref} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '14px 26px', borderRadius: 32, fontFamily: '"Source Sans 3", sans-serif', fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
                {t('addToCalendar')}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
