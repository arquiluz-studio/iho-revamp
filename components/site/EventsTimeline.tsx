'use client'
import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { ButtonArrow } from '@/components/ui/Arrow'
import { RoundButton } from '@/components/ui/RoundButton'
import { DisplayTitle, RichText, SectionLabel } from '@/components/ui/Section'
import { ACUMIN } from '@/components/ui/tokens'
import { MediaImage } from '@/components/ui/MediaImage'
import { isPastDate, todayLabel, type Locale } from '@/lib/dates'
import type { EventVM } from '@/lib/types/site'

const MONO = '"Space Mono", monospace'

export function EventsTimeline({ events }: { events: EventVM[] }) {
  const t = useTranslations('home.events')
  const tc = useTranslations('common')
  const locale = useLocale() as Locale

  const firstFutureIdx = events.findIndex(e => !isPastDate(e.startsAt))
  const todayMarkerPosition = firstFutureIdx === -1 ? events.length : firstFutureIdx
  const defaultActive = firstFutureIdx === -1 ? events.length - 1 : firstFutureIdx
  const [active, setActive] = useState(defaultActive)

  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const todayMarkerRef = useRef<HTMLDivElement>(null)
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([])
  const fadeLeftRef = useRef<HTMLDivElement>(null)
  const fadeRightRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({ dragging: false, startX: 0, scrollLeft: 0 })

  const startAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current)
    const firstFuture = firstFutureIdx === -1 ? events.length - 1 : firstFutureIdx
    autoplayRef.current = setInterval(() => {
      setActive(i => (i + 1 >= events.length ? firstFuture : i + 1))
    }, 7000)
  }, [firstFutureIdx, events.length])

  useEffect(() => {
    startAutoplay()
    return () => { if (autoplayRef.current) clearInterval(autoplayRef.current) }
  }, [startAutoplay])

  useEffect(() => {
    const strip = stripRef.current
    const marker = todayMarkerRef.current
    if (strip && marker) strip.scrollLeft = Math.max(0, marker.offsetLeft - 120)
  }, [])

  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current.dragging) return
      e.preventDefault()
      strip.scrollLeft = dragRef.current.scrollLeft - (e.pageX - dragRef.current.startX)
    }
    const onUp = () => {
      if (!dragRef.current.dragging) return
      dragRef.current.dragging = false
      strip.style.cursor = 'grab'
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return
    const update = () => {
      const atStart = strip.scrollLeft <= 6
      const atEnd = strip.scrollLeft >= strip.scrollWidth - strip.clientWidth - 6
      if (fadeLeftRef.current) fadeLeftRef.current.style.opacity = atStart ? '0' : '1'
      if (fadeRightRef.current) fadeRightRef.current.style.opacity = atEnd ? '0' : '1'
    }
    strip.addEventListener('scroll', update, { passive: true })
    update()
    return () => strip.removeEventListener('scroll', update)
  }, [])

  function scrollToChip(idx: number) {
    const strip = stripRef.current
    const chip = chipRefs.current[idx]
    if (!strip || !chip) return
    const target = strip.scrollLeft + chip.getBoundingClientRect().left - strip.getBoundingClientRect().left - (strip.clientWidth - chip.offsetWidth) / 2
    const to = Math.max(0, Math.min(target, strip.scrollWidth - strip.clientWidth))
    const from = strip.scrollLeft
    if (Math.abs(to - from) < 1) return
    const duration = 480
    const t0 = performance.now()
    const animate = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      strip.scrollLeft = from + (to - from) * (1 - Math.pow(1 - p, 3))
      if (p < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }

  function select(idx: number) {
    setActive(idx)
    startAutoplay()
    scrollToChip(idx)
  }

  if (events.length === 0) return null

  const todayMarker = (
    <div ref={todayMarkerRef} style={{ display: 'flex', alignItems: 'center', padding: '0 22px', borderLeft: '2px solid #ef483d', flexShrink: 0 }}>
      <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '1.5px', color: '#ef483d', whiteSpace: 'nowrap' }}>{t('today', { date: todayLabel(locale) })}</span>
    </div>
  )

  return (
    <section id="eventos" style={{ background: '#f1ece3' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '88px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 38 }}>
          <div>
            <SectionLabel>{t('label')}</SectionLabel>
            <DisplayTitle><RichText text={t('title')} /></DisplayTitle>
          </div>
          <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
            <RoundButton onClick={() => select((active - 1 + events.length) % events.length)} label={tc('previous')} flip size={46} border="1px solid rgba(20,18,12,0.2)" arrowSize={16} />
            <RoundButton onClick={() => select((active + 1) % events.length)} label={tc('next')} size={46} border="1px solid rgba(20,18,12,0.2)" arrowSize={16} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'stretch', borderTop: '1px solid rgba(20,18,12,0.14)', borderBottom: '1px solid rgba(20,18,12,0.14)', marginBottom: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', fontFamily: MONO, fontSize: 11, letterSpacing: '1.5px', color: '#8a8478', paddingRight: 24, flexShrink: 0 }}>{new Date(events[active]?.startsAt ?? Date.now()).getFullYear()}</div>
          <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
            <div ref={fadeLeftRef} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 64, background: 'linear-gradient(90deg, #f1ece3 12%, rgba(241,236,227,0) 100%)', pointerEvents: 'none', zIndex: 1, opacity: 0, transition: 'opacity 0.25s ease' }} />
            <div ref={fadeRightRef} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 64, background: 'linear-gradient(270deg, #f1ece3 12%, rgba(241,236,227,0) 100%)', pointerEvents: 'none', zIndex: 1, opacity: 1, transition: 'opacity 0.25s ease' }} />
            <div
              ref={stripRef}
              onMouseDown={e => {
                const s = stripRef.current
                if (!s) return
                dragRef.current = { dragging: true, startX: e.pageX, scrollLeft: s.scrollLeft }
                s.style.cursor = 'grabbing'
              }}
              style={{ display: 'flex', height: '100%', overflowX: 'auto', scrollbarWidth: 'none', cursor: 'grab', userSelect: 'none' }}
              className="iho-no-scrollbar"
            >
              {events.map((ev, i) => {
                const past = isPastDate(ev.startsAt)
                const isActive = active === i
                return (
                  <Fragment key={ev.slug}>
                    {i === todayMarkerPosition && todayMarker}
                    <button
                      ref={el => { chipRefs.current[i] = el }}
                      onClick={() => select(i)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3,
                        padding: '16px 26px', border: 'none', borderLeft: '1px solid rgba(20,18,12,0.14)',
                        background: isActive ? '#ef483d' : 'transparent',
                        color: isActive ? '#ffffff' : (past ? '#a8a297' : '#17150f'),
                        opacity: !isActive && past ? 0.85 : 1,
                        cursor: 'pointer', minWidth: 148, flexShrink: 0,
                        transition: 'background 0.3s ease, color 0.3s ease, opacity 0.3s ease',
                      }}
                    >
                      <span style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 30, lineHeight: 1 }}>{ev.day}</span>
                      <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '1.2px', opacity: 0.72 }}>{ev.month} · {ev.city}</span>
                    </button>
                  </Fragment>
                )
              })}
              {todayMarkerPosition >= events.length && todayMarker}
            </div>
          </div>
        </div>

        <div style={{ position: 'relative', height: 520, borderRadius: 4, overflow: 'hidden', background: '#0e0e0e' }}>
          {events.map((ev, i) => {
            const past = isPastDate(ev.startsAt)
            return (
              <div key={ev.slug} style={{ position: 'absolute', inset: 0, opacity: active === i ? 1 : 0, transition: 'opacity 0.7s ease', pointerEvents: active === i ? 'auto' : 'none' }}>
                <MediaImage image={ev.image} sizes="(max-width: 1240px) 100vw, 1160px" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: past ? 'grayscale(0.55)' : undefined }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(15,13,11,0.88) 0%, rgba(15,13,11,0.4) 45%, rgba(15,13,11,0) 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, display: 'flex' }}>
                  <div style={{ background: past ? '#17150f' : '#ef483d', color: '#fff', padding: '12px 18px', fontFamily: MONO, fontSize: 12, letterSpacing: '1.5px' }}>
                    {past ? t('done') : t('saveTheDate')}
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.92)', color: '#17150f', padding: '12px 18px', fontFamily: MONO, fontSize: 12, letterSpacing: '1.5px' }}>
                    {ev.typeLabel}
                  </div>
                </div>
                <div style={{ position: 'absolute', left: 40, right: 40, bottom: 40 }}>
                  <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '1px', color: 'rgba(255,255,255,0.72)', marginBottom: 12 }}>{ev.meta}</div>
                  <h3 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 56, lineHeight: 0.94, letterSpacing: '-0.5px', margin: '0 0 24px', color: '#fff', textTransform: 'uppercase' }}>{ev.title}</h3>
                  <a
                    href={ev.href}
                    className="iho-btn"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 10,
                      background: past ? 'rgba(255,255,255,0.14)' : '#ef483d',
                      color: '#fff', padding: '14px 26px', borderRadius: 32,
                      fontFamily: '"Source Sans 3", sans-serif', fontWeight: 600, fontSize: 15,
                      textDecoration: 'none',
                      border: past ? '1px solid rgba(255,255,255,0.22)' : 'none',
                    }}
                  >
                    {past ? t('viewGallery') : t('viewEvent')}
                    <ButtonArrow />
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
