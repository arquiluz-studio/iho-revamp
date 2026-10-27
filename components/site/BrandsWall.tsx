import { useTranslations } from 'next-intl'
import { MediaImage } from '@/components/ui/MediaImage'
import { DisplayTitle, RichText, SectionLabel } from '@/components/ui/Section'
import type { BrandVM } from '@/lib/types/site'

const COLS = 4

export function BrandsWall({ brands }: { brands: BrandVM[] }) {
  const t = useTranslations('home.brands')
  if (brands.length === 0) return null
  const lastRowStart = brands.length - (brands.length % COLS || COLS)
  return (
    <section id="marcas" style={{ background: '#f1ece3' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '84px 40px', display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: 60, alignItems: 'start' }}>
        <div>
          <SectionLabel style={{ marginBottom: 22 }}>{t('label')}</SectionLabel>
          <DisplayTitle style={{ margin: '0 0 22px' }}><RichText text={t('title')} /></DisplayTitle>
          <p style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 15, lineHeight: 1.65, color: '#5a554b', maxWidth: 320, margin: 0 }}>{t('intro')}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, borderLeft: '1px solid rgba(20,18,12,0.12)' }}>
          {brands.map((b, i) => {
            const logo = <MediaImage image={b.logo} alt={b.name} style={{ maxWidth: '100%', maxHeight: b.thin ? 104 : 60, objectFit: 'contain', opacity: 0.92, width: 'auto', height: 'auto' }} />
            const cellStyle: React.CSSProperties = { height: 120, borderRight: '1px solid rgba(20,18,12,0.12)', borderBottom: i < lastRowStart ? '1px solid rgba(20,18,12,0.12)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: b.thin ? 8 : 22 }
            return b.href
              ? <a key={b.slug} href={b.href} style={cellStyle} aria-label={b.name}>{logo}</a>
              : <div key={b.slug} style={cellStyle}>{logo}</div>
          })}
        </div>
      </div>
    </section>
  )
}
