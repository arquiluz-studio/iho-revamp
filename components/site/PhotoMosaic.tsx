'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { useTranslations } from 'next-intl'
import { DownloadButton } from '@/components/site/DownloadButton'
import { MediaImage } from '@/components/ui/MediaImage'
import type { ImageVM } from '@/lib/types/site'

export type MosaicPhoto = {
  key: string
  image: ImageVM
  caption?: string
  /** Private original (lead form) or the published file. */
  download?: { mediaId: string; countryCode: string } | { src: string } | null
}

export function PhotoMosaic({ photos }: { photos: MosaicPhoto[] }) {
  const [open, setOpen] = useState<number | null>(null)
  if (photos.length === 0) return null
  return (
    <>
      <div className="iho-galeria-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {photos.map((photo, index) => (
          <button
            key={photo.key}
            type="button"
            onClick={() => setOpen(index)}
            aria-label={photo.caption || photo.image.alt}
            style={{
              gridColumn: index === 0 ? 'span 2' : undefined,
              gridRow: index === 0 ? 'span 2' : undefined,
              aspectRatio: '1/1',
              borderRadius: 4,
              overflow: 'hidden',
              background: '#e7e2d8',
              border: 0,
              padding: 0,
              cursor: 'pointer',
              display: 'block',
              width: '100%',
            }}
          >
            <MediaImage
              image={photo.image}
              alt=""
              sizes={index === 0 ? '(max-width: 768px) 100vw, 600px' : '(max-width: 768px) 50vw, 300px'}
              className="iho-gallery-img"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s cubic-bezier(0.2,0,0.2,1)' }}
            />
          </button>
        ))}
      </div>
      {open != null && <PhotoViewer photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </>
  )
}

function PhotoViewer({
  photos,
  index,
  onIndex,
  onClose,
}: {
  photos: MosaicPhoto[]
  index: number
  onIndex: (index: number) => void
  onClose: () => void
}) {
  const t = useTranslations('event.gallery')
  const photo = photos[index]
  const several = photos.length > 1

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') onIndex((index + 1) % photos.length)
      if (event.key === 'ArrowLeft') onIndex((index - 1 + photos.length) % photos.length)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [index, onClose, onIndex, photos.length])

  const step = (delta: number) => onIndex((index + delta + photos.length) % photos.length)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.caption || photo.image.alt}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(20,18,12,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 64px' }}
    >
      <button type="button" onClick={onClose} aria-label={t('close')} style={{ ...chromeButton(16, undefined), right: 16 }}>
        <ViewerIcon name="close" />
      </button>
      {several && (
        <button type="button" onClick={event => { event.stopPropagation(); step(-1) }} aria-label={t('previous')} style={chromeButton(undefined, 16)}>
          <ViewerIcon name="previous" />
        </button>
      )}
      <figure onClick={event => event.stopPropagation()} style={{ position: 'relative', margin: 0, width: 'fit-content', maxWidth: 'calc(100vw - 128px)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.image.src} alt={photo.caption || photo.image.alt} style={{ display: 'block', maxWidth: '100%', maxHeight: 'calc(100vh - 16px)', objectFit: 'contain' }} />
        {photo.download && (
          <div style={{ position: 'absolute', top: 12, right: 12 }}>
            {'mediaId' in photo.download
              ? <DownloadButton mediaId={photo.download.mediaId} countryCode={photo.download.countryCode} label={t('download')} icon />
              : <PublicDownload src={photo.download.src} name={fileName(photo)} label={t('download')} />}
          </div>
        )}
        {photo.caption && (
          <figcaption style={{ position: 'absolute', left: 12, right: 60, bottom: 12, color: '#fff', fontFamily: '"Source Sans 3", sans-serif', fontSize: 14, textShadow: '0 1px 8px rgba(0,0,0,0.6)', textAlign: 'left' }}>
            {photo.caption}
          </figcaption>
        )}
      </figure>
      {several && (
        <button type="button" onClick={event => { event.stopPropagation(); step(1) }} aria-label={t('next')} style={{ ...chromeButton(undefined, undefined), right: 16 }}>
          <ViewerIcon name="next" />
        </button>
      )}
    </div>
  )
}

function PublicDownload({ src, name, label }: { src: string; name: string; label: string }) {
  const save = async () => {
    try {
      const response = await fetch(src)
      if (!response.ok) throw new Error('download')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = name
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      window.open(src, '_blank', 'noopener')
    }
  }
  return (
    <button type="button" onClick={save} className="iho-btn" aria-label={label} style={{ width: 40, height: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 0, borderRadius: 20, padding: 0, cursor: 'pointer', color: '#fff', background: 'rgba(23,21,15,0.55)' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 4v11" />
        <path d="M7 11l5 5 5-5" />
        <path d="M5 20h14" />
      </svg>
    </button>
  )
}

function fileName(photo: MosaicPhoto): string {
  const base = (photo.caption || photo.image.alt || 'iho').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `${base || 'iho'}.webp`
}

function ViewerIcon({ name }: { name: 'close' | 'previous' | 'next' }) {
  const path = name === 'close' ? 'M6 6l12 12M18 6L6 18' : name === 'previous' ? 'M15 5L8 12l7 7' : 'M9 5l7 7-7 7'
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function chromeButton(top: number | undefined, left: number | undefined): CSSProperties {
  return {
    position: 'absolute',
    top: top ?? '50%',
    left,
    transform: top == null ? 'translateY(-50%)' : undefined,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    padding: 0,
    border: 0,
    borderRadius: 0,
    background: 'transparent',
    color: '#fff',
    cursor: 'pointer',
    filter: 'drop-shadow(0 1px 6px rgba(0,0,0,0.45))',
  }
}
