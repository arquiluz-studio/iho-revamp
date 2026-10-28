'use client'

import { useState } from 'react'
import { SectionLabel } from '@/components/ui/Section'
import { MediaImage } from '@/components/ui/MediaImage'
import type { ImageVM } from '@/lib/types/site'

export type ProductVariantChoice = {
  id: string
  name: string
  sku: string | null
  price: string | null
  image: ImageVM
}

/** Large photo follows the chosen variant. Usage photos stay underneath. */
export function ProductView({
  variants,
  usage,
  variantsLabel,
  children,
}: {
  variants: ProductVariantChoice[]
  usage: ImageVM[]
  variantsLabel: string
  children: React.ReactNode
}) {
  const [active, setActive] = useState(0)
  const photo = variants[active]?.image ?? variants[0]?.image
  return (
    <div className="iho-product-detail">
      <div>
        {photo && (
          <div className="iho-product-photo">
            <MediaImage image={photo} priority sizes="(max-width: 1024px) 100vw, 55vw" />
          </div>
        )}
        {usage.length > 0 && (
          <div className="iho-gallery-grid iho-product-gallery">
            {usage.map(img => (
              <div key={img.src} className="iho-product-photo">
                <MediaImage image={img} sizes="(max-width: 768px) 100vw, 28vw" />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="iho-product-buy-col">
        {children}
        {variants.length > 1 && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <SectionLabel>{variantsLabel}</SectionLabel>
            </div>
            <ul className="iho-product-variants">
              {variants.map((variant, index) => (
                <li key={variant.id}>
                  <button type="button" className={index === active ? 'is-selected' : undefined} aria-pressed={index === active} onClick={() => setActive(index)}>
                    <span>
                      {variant.name}
                      {variant.sku && <span className="is-sku"> · {variant.sku}</span>}
                    </span>
                    {variant.price && <span>{variant.price}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
