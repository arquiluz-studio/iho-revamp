'use client'
import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { RoundButton } from '@/components/ui/RoundButton'
import { RichText, SectionLabel, DisplayTitle } from '@/components/ui/Section'
import type { ProductCardVM } from '@/lib/types/site'
import { ProductCard } from './ProductCard'

const GAP = 24
const EASE = 'transform 0.6s cubic-bezier(0.2,0,0.2,1)'

export function ProductsSlider({ products }: { products: ProductCardVM[] }) {
  const t = useTranslations('home.products')
  const tc = useTranslations('common')
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const progRef = useRef<HTMLDivElement>(null)
  const [containerW, setContainerW] = useState(0)
  const [page, setPage] = useState(0)
  const [busy, setBusy] = useState(false)

  const perPage = containerW >= 900 ? 4 : containerW >= 600 ? 3 : 2
  const numPages = Math.max(1, Math.ceil(products.length / perPage))
  const cards = [...products, ...products.slice(0, perPage)]

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setContainerW(el.clientWidth)
      setPage(0)
      if (trackRef.current) {
        trackRef.current.style.transition = 'none'
        trackRef.current.style.transform = 'translateX(0)'
      }
      if (progRef.current) {
        progRef.current.style.transition = 'none'
        progRef.current.style.transform = 'translateX(0)'
      }
    })
    ro.observe(el)
    setContainerW(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  function applyTransform(p: number, animate: boolean) {
    const track = trackRef.current
    const W = containerRef.current?.clientWidth ?? 0
    if (!track || W === 0) return
    track.style.transition = animate ? EASE : 'none'
    track.style.transform = `translateX(-${p * (W + GAP)}px)`
  }

  function applyProgress(p: number, animate: boolean) {
    const el = progRef.current
    if (!el) return
    el.style.transition = animate ? EASE : 'none'
    el.style.transform = `translateX(${p * 100}%)`
  }

  function next() {
    if (busy) return
    setBusy(true)
    const n = page + 1
    applyTransform(n, true)
    applyProgress(n < numPages ? n : 0, n < numPages)
    setTimeout(() => {
      if (n >= numPages) {
        applyTransform(0, false)
        applyProgress(0, false)
        setPage(0)
      } else {
        setPage(n)
      }
      setBusy(false)
    }, 620)
  }

  function prev() {
    if (busy) return
    setBusy(true)
    if (page === 0) {
      const track = trackRef.current
      const W = containerRef.current?.clientWidth ?? 0
      if (!track) return
      // Jump to the cloned page without animation, then slide back one page.
      track.style.transition = 'none'
      track.style.transform = `translateX(-${numPages * (W + GAP)}px)`
      void track.offsetWidth
      setTimeout(() => {
        track.style.transition = EASE
        track.style.transform = `translateX(-${(numPages - 1) * (W + GAP)}px)`
        applyProgress(numPages - 1, true)
        setPage(numPages - 1)
        setTimeout(() => setBusy(false), 620)
      }, 16)
    } else {
      applyTransform(page - 1, true)
      applyProgress(page - 1, true)
      setPage(p => p - 1)
      setTimeout(() => setBusy(false), 620)
    }
  }

  if (products.length === 0) return null

  return (
    <section id="productos" style={{ background: '#ffffff' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '88px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 44 }}>
          <div>
            <SectionLabel>{t('label')}</SectionLabel>
            <DisplayTitle><RichText text={t('title')} /></DisplayTitle>
          </div>
          <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
            <RoundButton onClick={prev} label={tc('previous')} flip size={56} border="2px solid rgba(20,18,12,0.14)" arrowSize={18} />
            <RoundButton onClick={next} label={tc('next')} size={56} border="2px solid rgba(20,18,12,0.14)" arrowSize={18} />
          </div>
        </div>

        <div ref={containerRef} style={{ overflow: 'hidden' }}>
          <div ref={trackRef} style={{ display: 'flex', gap: GAP, width: '100%', willChange: 'transform' }}>
            {cards.map((p, i) => (
              <div key={`${p.key}-${i}`} className="iho-prod-card-wrapper" aria-hidden={i >= products.length || undefined} style={{ flexShrink: 0 }}>
                <ProductCard product={p} ariaHidden={i >= products.length} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 34 }}>
          <div style={{ flex: 1, height: 2, background: 'rgba(20,18,12,0.12)', borderRadius: 2, overflow: 'hidden' }}>
            <div ref={progRef} style={{ height: '100%', width: `${100 / numPages}%`, background: '#ef483d', borderRadius: 2 }} />
          </div>
          <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, letterSpacing: '1.5px', color: '#8a8478', flexShrink: 0 }}>
            {String(page + 1).padStart(2, '0')} / {String(numPages).padStart(2, '0')}
          </div>
        </div>
      </div>
    </section>
  )
}
