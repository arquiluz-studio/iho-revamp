'use client'

import { useEffect, useRef } from 'react'
import type { ImageVM, Playback } from '@/lib/types/site'
import { MediaImage } from './MediaImage'

type Props = {
  kind: Playback['kind']
  src: string
  image: ImageVM
  /** Videos play while this is true and pause otherwise. */
  active?: boolean
  controls?: boolean
  sizes?: string
  priority?: boolean
  className?: string
  style?: React.CSSProperties
  alt?: string
}

/** Still image, animated GIF, or muted looping video. */
export function MotionMedia({ kind, src, image, active = true, controls = false, sizes, priority, className, style, alt }: Props) {
  if (kind === 'video' && src) {
    return <MotionVideo src={src} poster={image.src} active={active} controls={controls} className={className} style={style} />
  }
  if (kind === 'gif' && src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt ?? image.alt} className={className} style={style} />
    )
  }
  return <MediaImage image={image} sizes={sizes} priority={priority} className={className} style={style} alt={alt} />
}

function MotionVideo({
  src,
  poster,
  active,
  controls,
  className,
  style,
}: {
  src: string
  poster: string
  active: boolean
  controls: boolean
  className?: string
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    video.muted = true
    if (active) void video.play().catch(() => {})
    else video.pause()
  }, [active, src])

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      controls={controls}
      preload={active ? 'auto' : 'metadata'}
      poster={poster || undefined}
      className={className}
      style={style}
    />
  )
}
