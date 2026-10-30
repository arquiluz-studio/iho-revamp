'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { RichText } from '@/components/ui/Section'
import { ACUMIN, SANS } from '@/components/ui/tokens'
import type { HeroSlideVM } from '@/lib/types/site'
import { HeroCtas } from './HeroCtas'

const FADE = 'opacity 0.7s cubic-bezier(0.2, 0, 0.2, 1)'

export function Hero({ slides }: { slides: HeroSlideVM[] }) {
  const t = useTranslations('hero')
  const tc = useTranslations('common')
  const count = slides.length
  const [index, setIndex] = useState(0)
  const [epoch, setEpoch] = useState(0)
  const [hidden, setHidden] = useState(false)
  const [reduced, setReduced] = useState(false)
  const current = count === 0 ? 0 : index % count
  const many = count > 1
  const fade = reduced ? 'none' : FADE

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const applyMotion = () => setReduced(motion.matches)
    const applyHidden = () => setHidden(document.hidden)
    applyMotion()
    applyHidden()
    motion.addEventListener('change', applyMotion)
    document.addEventListener('visibilitychange', applyHidden)
    return () => {
      motion.removeEventListener('change', applyMotion)
      document.removeEventListener('visibilitychange', applyHidden)
    }
  }, [])

  const go = (direction: 1 | -1) => {
    if (!many) return
    setIndex(value => (value + direction + count) % count)
    setEpoch(value => value + 1)
  }

  const advance = useCallback(() => {
    setIndex(value => (value + 1) % count)
  }, [count])

  useEffect(() => {
    const slide = slides[current]
    if (!slide || !many || reduced || hidden || slide.kind === 'video') return
    const seconds = slide.durationSeconds ?? 6
    const timer = window.setTimeout(advance, seconds * 1000)
    return () => window.clearTimeout(timer)
  }, [advance, current, epoch, hidden, many, reduced, slides])

  return (
    <section
      className="iho-hero"
      aria-roledescription="carousel"
      aria-label={slides[current]?.title.replace(/\n/g, ' ') || undefined}
      onKeyDown={event => {
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          go(1)
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          go(-1)
        }
      }}
      style={{ position: 'relative', height: '100vh', minHeight: 640, width: '100%', overflow: 'hidden', background: '#0e0e0e' }}
    >
      {slides.map((slide, i) => (
        <div key={`media-${i}`} className="iho-hero-layer" aria-hidden={i !== current} style={{ position: 'absolute', inset: 0, opacity: i === current ? 1 : 0, transition: fade, zIndex: i === current ? 1 : 0 }}>
          <SlideMedia slide={slide} active={i === current} loop={!many} play={i === current && !reduced && !hidden} preload={i === current || i === (current + 1) % count} onEnded={advance} />
        </div>
      ))}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(8,8,8,0.8) 0%, rgba(8,8,8,0.5) 42%, rgba(8,8,8,0.08) 74%, rgba(8,8,8,0) 100%)', pointerEvents: 'none', zIndex: 2 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,8,8,0.6) 0%, rgba(8,8,8,0) 26%)', pointerEvents: 'none', zIndex: 2 }} />
      {slides.map((slide, i) => {
        const active = i === current
        const Title = active ? 'h1' : 'p'
        return (
          <div key={`copy-${i}`} className="iho-hero-layer" aria-hidden={!active} inert={active ? undefined : true} style={{ position: 'absolute', inset: 0, opacity: active ? 1 : 0, transition: fade, zIndex: active ? 3 : 2, pointerEvents: 'none' }}>
            <div className="iho-hero-overlay" style={{ maxWidth: 1240, height: '100%', margin: '0 auto', padding: '0 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {slide.eyebrow && <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 13, letterSpacing: '2.5px', color: 'rgba(255,255,255,0.85)', marginBottom: 26 }}>{slide.eyebrow}</div>}
              {slide.title && (
                <Title className="iho-hero-title" style={{ fontFamily: ACUMIN, fontWeight: 800, color: '#fff', fontSize: 88, lineHeight: 0.9, letterSpacing: '-1px', margin: slide.subtitle ? '0 0 20px' : '0 0 36px', textTransform: 'uppercase' }}>
                  <RichText text={slide.title} />
                </Title>
              )}
              {slide.subtitle && (
                <p style={{ fontFamily: SANS, fontSize: 18, lineHeight: 1.55, color: 'rgba(255,255,255,0.82)', maxWidth: 560, margin: '0 0 36px' }}>
                  <RichText text={slide.subtitle} />
                </p>
              )}
              <HeroCtas actions={slide.actions} />
            </div>
          </div>
        )
      })}
      {many && (
        <div className="iho-hero-nav">
          <button type="button" className="iho-hero-chevron" aria-label={tc('previous')} onClick={() => go(-1)}>
            <Chevron flip />
          </button>
          <button type="button" className="iho-hero-chevron" aria-label={tc('next')} onClick={() => go(1)}>
            <Chevron />
          </button>
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 34, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, pointerEvents: 'none', zIndex: 3 }}>
        <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, letterSpacing: '2px', color: 'rgba(255,255,255,0.6)' }}>{t('scroll')}</div>
        <div style={{ width: 1, height: 44, background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 100%)' }} />
      </div>
    </section>
  )
}

function Chevron({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" aria-hidden className={flip ? 'is-flip' : undefined}>
      <path d="M9 5.5 16 12l-7 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SlideMedia({
  slide,
  active,
  loop,
  play,
  preload,
  onEnded,
}: {
  slide: HeroSlideVM
  active: boolean
  loop: boolean
  play: boolean
  preload: boolean
  onEnded: () => void
}) {
  if (slide.kind === 'video' && slide.src) {
    return <SlideVideo src={slide.src} poster={slide.poster} active={active} loop={loop} play={play} preload={preload} onEnded={onEnded} />
  }
  if (!slide.src) return null
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={slide.src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  )
}

function SlideVideo({
  src,
  poster,
  active,
  loop,
  play,
  preload,
  onEnded,
}: {
  src: string
  poster: string | null
  active: boolean
  loop: boolean
  play: boolean
  preload: boolean
  onEnded: () => void
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const started = useRef(false)
  const onEndedRef = useRef(onEnded)
  onEndedRef.current = onEnded

  useEffect(() => {
    const video = ref.current
    if (!video) return
    video.muted = true
    if (!active) {
      video.pause()
      started.current = false
      return
    }
    if (!started.current) {
      video.currentTime = 0
      started.current = true
    }
    if (play) void video.play().catch(() => {})
    else video.pause()
  }, [active, play, src])

  useEffect(() => {
    if (!active || !play || loop) return
    const video = ref.current
    let timer = 0
    const arm = (seconds: number) => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => onEndedRef.current(), Math.max(seconds, 1) * 1000 + 500)
    }
    arm(30)
    const sync = () => {
      const duration = video?.duration
      if (duration && Number.isFinite(duration) && duration > 0) arm(duration)
    }
    video?.addEventListener('loadedmetadata', sync)
    video?.addEventListener('durationchange', sync)
    sync()
    return () => {
      window.clearTimeout(timer)
      video?.removeEventListener('loadedmetadata', sync)
      video?.removeEventListener('durationchange', sync)
    }
  }, [active, loop, play, src])

  return (
    <video
      ref={ref}
      muted
      loop={loop}
      playsInline
      preload={preload ? 'auto' : 'metadata'}
      poster={poster ?? undefined}
      onEnded={() => {
        if (!loop) onEndedRef.current()
      }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    >
      <source src={src} type="video/mp4" />
    </video>
  )
}
