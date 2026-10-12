import { useTranslations } from 'next-intl'
import { Arrow } from '@/components/ui/Arrow'
import { MediaImage } from '@/components/ui/MediaImage'
import { RichText } from '@/components/ui/Section'
import { ACUMIN } from '@/components/ui/tokens'
import type { BrandVM, DesignerCardVM, ImageVM, ProductCardVM } from '@/lib/types/site'
import { ProductCard } from '../ProductCard'

const MONO = '"Space Mono", monospace'
const titleStyle: React.CSSProperties = { fontFamily: ACUMIN, fontWeight: 800, fontSize: 54, lineHeight: 0.96, letterSpacing: '-0.5px', textTransform: 'uppercase', margin: 0 }
const labelStyle: React.CSSProperties = { fontFamily: MONO, fontSize: 12, letterSpacing: '1.5px', color: '#ef483d', marginBottom: 18 }

export function EventBrands({ brands }: { brands: BrandVM[] }) {
  const t = useTranslations('event.brands')
  if (brands.length === 0) return null
  return (
    <section style={{ background: '#ffffff', padding: '64px 40px 0' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div style={labelStyle}>{t('label')}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', borderTop: '1px solid rgba(20,18,12,0.12)', borderLeft: '1px solid rgba(20,18,12,0.12)' }}>
          {brands.map(b => (
            <a key={b.slug} href={b.href} aria-label={b.name} style={{ width: 200, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: b.thin ? 8 : 22, borderRight: '1px solid rgba(20,18,12,0.12)', borderBottom: '1px solid rgba(20,18,12,0.12)' }}>
              <MediaImage image={b.logo} alt={b.name} style={{ maxWidth: '100%', maxHeight: b.thin ? 94 : 54, objectFit: 'contain', width: 'auto', height: 'auto' }} />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export function EventDesigners({ designers }: { designers: DesignerCardVM[] }) {
  const t = useTranslations('event.designers')
  if (designers.length === 0) return null
  return (
    <section style={{ background: '#ffffff', padding: '64px 40px 0' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div style={labelStyle}>{t('label')}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {designers.map(d => (
            <a key={d.key} href={d.href} className="iho-prod-card" style={{ width: 200, display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ aspectRatio: '3/4', background: '#f1ece3', borderRadius: 4, overflow: 'hidden' }}>
                <MediaImage image={d.image} sizes="200px" className="iho-prod-img" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
              <div style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 20, lineHeight: 1, textTransform: 'uppercase', color: '#17150f', marginTop: 14 }}>{d.name}</div>
              {d.meta && <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '1.2px', color: '#8a8478', marginTop: 6 }}>{d.meta}</div>}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export function EventProducts({ products }: { products: ProductCardVM[] }) {
  const t = useTranslations('event.products')
  if (products.length === 0) return null
  return (
    <section id="productos" style={{ background: '#ffffff', padding: '88px 40px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 44 }}>
          <div>
            <div style={labelStyle}>{t('label')}</div>
            <h2 style={titleStyle}><RichText text={t('title')} /></h2>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '1px', color: '#8a8478', flexShrink: 0 }}>{t('count', { count: products.length })}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '34px 24px' }} className="iho-productos-grid">
          {products.map(p => <ProductCard key={p.key} product={p} showCategory />)}
        </div>
      </div>
    </section>
  )
}

export function EventPreviousEditions({ editions }: { editions: { href: string; title: string; image: ImageVM; meta: string }[] }) {
  const t = useTranslations('event.gallery')
  if (editions.length === 0) return null
  return (
    <section id="ediciones" style={{ background: '#f1ece3', padding: '88px 40px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ marginBottom: 44 }}>
          <div style={labelStyle}>{t('label')}</div>
          <h2 style={titleStyle}><RichText text={t('title')} /></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }} className="iho-galeria-grid">
          {editions.map(edition => (
            <a key={edition.href} href={edition.href} className="iho-prod-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ aspectRatio: '1/1', borderRadius: 4, overflow: 'hidden', background: '#e7e2d8' }}>
                <MediaImage image={edition.image} alt={edition.title} sizes="(max-width: 768px) 50vw, 300px" className="iho-gallery-img" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s cubic-bezier(0.2,0,0.2,1)' }} />
              </div>
              <div style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 20, lineHeight: 1, textTransform: 'uppercase', color: '#17150f', marginTop: 14 }}>{edition.title}</div>
              {edition.meta && <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '1.2px', color: '#8a8478', marginTop: 6 }}>{edition.meta}</div>}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export function EventGallery({ images, past }: { images: ImageVM[]; past: boolean }) {
  const t = useTranslations('event.gallery')
  if (images.length === 0) return null
  return (
    <section id="galeria" style={{ background: '#f1ece3', padding: '88px 40px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ marginBottom: 44 }}>
          <div style={labelStyle}>{t('label')}</div>
          <h2 style={titleStyle}><RichText text={past ? t('pastTitle') : t('title')} /></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="iho-galeria-grid">
          {images.map((image, i) => (
            <div key={i} style={{ gridColumn: i === 0 ? 'span 2' : undefined, gridRow: i === 0 ? 'span 2' : undefined, aspectRatio: '1/1', borderRadius: 4, overflow: 'hidden', background: '#e7e2d8', cursor: 'pointer' }}>
              <MediaImage image={image} alt={image.alt || t('item', { n: i + 1 })} sizes={i === 0 ? '(max-width: 768px) 100vw, 600px' : '(max-width: 768px) 50vw, 300px'} className="iho-gallery-img" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s cubic-bezier(0.2,0,0.2,1)' }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function EventCta({ href }: { href: string }) {
  const t = useTranslations('event.cta')
  return (
    <div style={{ background: '#ef483d', padding: '70px 40px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 34, flexWrap: 'wrap' }} className="iho-cta-band">
        <h2 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 44, lineHeight: 0.98, letterSpacing: '-0.5px', textTransform: 'uppercase', color: '#fff', margin: 0 }}>
          <RichText text={t('title')} />
        </h2>
        <a href={href} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#17150f', color: '#fff', padding: '16px 30px', borderRadius: 32, fontFamily: '"Source Sans 3", sans-serif', fontWeight: 600, fontSize: 15, textDecoration: 'none', flexShrink: 0 }}>
          {t('button')}
          <Arrow />
        </a>
      </div>
    </div>
  )
}
