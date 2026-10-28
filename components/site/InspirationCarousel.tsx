'use client'

import { useEffect, useRef, useState } from 'react'
import { MediaImage } from '@/components/ui/MediaImage'
import type { ImageVM } from '@/lib/types/site'

export type ReelPhoto = {
  key: string
  image: ImageVM
  caption?: string
}

const SLOTS = [-2, -1, 0, 1, 2] as const

/** Slides one step and grows whichever photo arrives in the center. */
export function InspirationCarousel({
  photos,
  previousLabel,
  nextLabel,
}: {
  photos: ReelPhoto[]
  previousLabel: string
  nextLabel: string
}) {
  const [index, setIndex] = useState(0)
  const [shift, setShift] = useState<-1 | 0 | 1>(0)
  const [instant, setInstant] = useState(false)
  const shiftRef = useRef(0)
  const count = photos.length
  const finishRef = useRef(() => {})
  finishRef.current = () => {
    const dir = shiftRef.current
    if (dir === 0) return
    shiftRef.current = 0
    setInstant(true)
    setIndex(current => (current + dir + count) % count)
    setShift(0)
  }

  useEffect(() => {
    if (shift === 0) return
    const timer = window.setTimeout(() => finishRef.current(), 900)
    return () => window.clearTimeout(timer)
  }, [shift])

  if (count === 0) return null

  const finish = () => finishRef.current()

  const go = (dir: -1 | 1) => {
    if (shiftRef.current !== 0 || count < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIndex(current => (current + dir + count) % count)
      return
    }
    shiftRef.current = dir
    setInstant(false)
    window.setTimeout(() => setShift(dir), 40)
  }

  if (count === 1) {
    const photo = photos[0]!
    return (
      <div className="iho-brand-reel is-single">
        <figure className="iho-brand-reel__slide is-center">
          <MediaImage image={photo.image} alt={photo.caption || photo.image.alt} sizes="(max-width: 768px) 100vw, 60vw" />
        </figure>
      </div>
    )
  }

  const centerSlot = 2 + shift
  const frameClass = ['iho-brand-reel', instant ? 'is-instant' : '', shift === 1 ? 'is-next' : '', shift === -1 ? 'is-prev' : ''].filter(Boolean).join(' ')

  return (
    <div className={frameClass}>
      <div className="iho-brand-reel__track" onTransitionEnd={event => {
        if (event.target === event.currentTarget && event.propertyName === 'transform') finish()
      }}>
        {SLOTS.map((offset, slot) => {
          const photo = photos[(index + offset + count) % count]!
          const centered = slot === centerSlot
          const dir = slot === 1 ? -1 : slot === 3 ? 1 : 0
          const image = <MediaImage image={photo.image} alt={centered ? photo.caption || photo.image.alt : ''} sizes={centered ? '(max-width: 768px) 100vw, 60vw' : '30vw'} />
          if (!dir) {
            return (
              <div key={slot} className={centered ? 'iho-brand-reel__slide is-center' : 'iho-brand-reel__slide'} aria-hidden={!centered}>
                {image}
              </div>
            )
          }
          return (
            <button key={slot} type="button" className={centered ? 'iho-brand-reel__slide is-center' : 'iho-brand-reel__slide'} aria-label={dir === -1 ? previousLabel : nextLabel} onClick={() => go(dir)}>
              {image}
            </button>
          )
        })}
      </div>
      <div className="iho-brand-reel__nav">
        <button type="button" onClick={() => go(-1)} aria-label={previousLabel}>
          <svg aria-hidden="true" width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.4}>
            <path d="M9 2.5 4.5 7 9 11.5" />
          </svg>
        </button>
        <button type="button" onClick={() => go(1)} aria-label={nextLabel}>
          <svg aria-hidden="true" width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.4}>
            <path d="M5 2.5 9.5 7 5 11.5" />
          </svg>
        </button>
      </div>
    </div>
  )
}
