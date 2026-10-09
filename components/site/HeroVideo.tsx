'use client'
import { useEffect, useRef } from 'react'

export function HeroVideo({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null)

  // React doesn't reflect `muted` to the DOM attribute, which blocks autoplay in some browsers.
  useEffect(() => {
    if (ref.current) ref.current.muted = true
  }, [])

  return (
    <video ref={ref} autoPlay muted loop playsInline preload="auto" poster={poster} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}>
      <source src={src} type="video/mp4" />
    </video>
  )
}
