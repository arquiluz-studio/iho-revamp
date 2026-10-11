import { useTranslations } from 'next-intl'
import { ButtonArrow } from '@/components/ui/Arrow'
import { RichText } from '@/components/ui/Section'
import { ACUMIN } from '@/components/ui/tokens'
import { HeroVideo } from './HeroVideo'

export function Hero({ eyebrow, title, videoSrc, poster, ctaHref }: {
  eyebrow: string
  title: string
  videoSrc: string | null
  poster?: string | null
  ctaHref: string
}) {
  const t = useTranslations('hero')
  return (
    <section style={{ position: 'relative', height: '100vh', minHeight: 640, width: '100%', overflow: 'hidden', background: '#0e0e0e' }}>
      {videoSrc ? (
        <HeroVideo src={videoSrc} poster={poster ?? undefined} />
      ) : (
        poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        )
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(8,8,8,0.8) 0%, rgba(8,8,8,0.5) 42%, rgba(8,8,8,0.08) 74%, rgba(8,8,8,0) 100%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,8,8,0.6) 0%, rgba(8,8,8,0) 26%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div className="iho-hero-overlay" style={{ maxWidth: 1240, height: '100%', margin: '0 auto', padding: '0 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 13, letterSpacing: '2.5px', color: 'rgba(255,255,255,0.85)', marginBottom: 26 }}>{eyebrow}</div>
          <h1 style={{ fontFamily: ACUMIN, fontWeight: 800, color: '#fff', fontSize: 88, lineHeight: 0.9, letterSpacing: '-1px', margin: '0 0 36px', textTransform: 'uppercase' }}>
            <RichText text={title} />
          </h1>
          <a href={ctaHref} className="iho-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#ef483d', color: '#fff', padding: '14px 26px', borderRadius: 32, fontFamily: '"Source Sans 3", sans-serif', fontWeight: 600, fontSize: 15, pointerEvents: 'auto', alignSelf: 'flex-start', textDecoration: 'none' }}>
            {t('cta')}
            <ButtonArrow />
          </a>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 34, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, pointerEvents: 'none' }}>
        <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, letterSpacing: '2px', color: 'rgba(255,255,255,0.6)' }}>{t('scroll')}</div>
        <div style={{ width: 1, height: 44, background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 100%)' }} />
      </div>
    </section>
  )
}
