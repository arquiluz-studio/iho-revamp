import { useTranslations } from 'next-intl'
import { MediaImage } from '@/components/ui/MediaImage'
import type { ProductCardVM } from '@/lib/types/site'

type Props = { product: ProductCardVM; showCategory?: boolean; ariaHidden?: boolean }

export function ProductCard({ product, showCategory = false, ariaHidden }: Props) {
  const t = useTranslations('pages.products')
  const category = showCategory ? product.category : undefined
  const eyebrow = product.brand || category
  return (
    <a
      href={product.href}
      aria-hidden={ariaHidden || undefined}
      tabIndex={ariaHidden ? -1 : undefined}
      className="iho-prod-card"
      style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
    >
      <div style={{ width: '100%', aspectRatio: '1/1', background: '#f1ece3', borderRadius: 4, overflow: 'hidden' }}>
        <MediaImage
          image={product.image}
          alt={ariaHidden ? '' : product.name}
          sizes="(max-width: 599px) 50vw, (max-width: 899px) 33vw, 300px"
          className="iho-prod-img"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
      {eyebrow && (
        <div style={{ marginTop: 14 }}>
          {product.brand && (
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, letterSpacing: '1.2px', color: '#8a8478', textTransform: 'uppercase' }}>
              {product.brand}
            </div>
          )}
          {category && (
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, letterSpacing: '1.2px', color: '#8a8478', marginTop: product.brand ? 4 : 0 }}>
              {category}
            </div>
          )}
        </div>
      )}
      <div style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 16, color: '#17150f', marginTop: eyebrow ? 5 : 16 }}>
        {product.name}
      </div>
      {(product.price || product.inquiry) && (
        <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, letterSpacing: '0.5px', color: '#17150f', marginTop: 6, display: 'flex', gap: 10, alignItems: 'baseline' }}>
          {product.price && <span>{product.price}</span>}
          {!product.price && product.inquiry && <span style={{ color: '#ef483d', textTransform: 'uppercase' }}>{t('quote')} →</span>}
        </div>
      )}
    </a>
  )
}
