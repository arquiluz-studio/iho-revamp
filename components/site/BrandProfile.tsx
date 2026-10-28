import { MediaImage } from '@/components/ui/MediaImage'
import type { ImageVM } from '@/lib/types/site'
import { InspirationCarousel, type ReelPhoto } from './InspirationCarousel'
import { Chips, PageHero } from './pages/PageParts'
import type { ProfilePiece } from './DesignerProfile'

export type BrandDesigner = {
  slug: string
  name: string
  href: string
}

export function BrandProfile({
  brandsLabel,
  name,
  description,
  website,
  websiteLabel,
  exclusive,
  solutions,
  cover,
  originLabel,
  origin,
  collaboratorsLabel,
  designers,
  photos,
  previousLabel,
  nextLabel,
  inspirationLabel,
  pricePending,
  imagePending,
  detailLabel,
  pieces,
}: {
  brandsLabel: string
  name: string
  description: string[]
  website?: { href: string; label: string } | null
  websiteLabel: string
  exclusive?: string | null
  solutions: { href: string; label: string }[]
  cover?: ImageVM | null
  originLabel: string
  origin?: string
  collaboratorsLabel: string
  designers: BrandDesigner[]
  photos: ReelPhoto[]
  previousLabel: string
  nextLabel: string
  inspirationLabel: string
  pricePending: string
  imagePending: string
  detailLabel: string
  pieces: ProfilePiece[]
}) {
  const hasFacts = Boolean(origin || designers.length > 0 || website)
  return (
    <article>
      <PageHero className="iho-brand-hero" label={brandsLabel} title={name} image={cover}>
        {solutions.length > 0 && (
          <div className="iho-chips-dark" style={{ marginTop: 26 }}>
            <Chips links={solutions} />
          </div>
        )}
      </PageHero>

      <section className={hasFacts ? 'iho-brand-story' : 'iho-brand-story iho-brand-story--solo'}>
        <div>
          <p className="iho-brand-wordmark">{name}</p>
          {description.map(paragraph => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {exclusive && <p>{exclusive}</p>}
        </div>
        {hasFacts && (
          <dl className="iho-brand-facts">
            {origin && (
              <>
                <dt>{originLabel}</dt>
                <dd>{origin}</dd>
              </>
            )}
            {designers.length > 0 && (
              <>
                <dt>{collaboratorsLabel}</dt>
                <dd>
                  {designers.map(designer => (
                    <a key={designer.slug} href={designer.href}>
                      {designer.name}
                    </a>
                  ))}
                </dd>
              </>
            )}
            {website && (
              <>
                <dt>{websiteLabel}</dt>
                <dd>
                  <a href={website.href} target="_blank" rel="noopener noreferrer">
                    {website.label}
                  </a>
                </dd>
              </>
            )}
          </dl>
        )}
      </section>

      {photos.length > 0 && (
        <section id="inspiracion" aria-label={inspirationLabel}>
          <InspirationCarousel photos={photos} previousLabel={previousLabel} nextLabel={nextLabel} />
        </section>
      )}

      {pieces.length > 0 && (
        <section id="piezas" className="iho-brand-products" aria-labelledby="piezas-title">
          <h2 id="piezas-title">{name}</h2>
          <div className="iho-piece-grid">
            {pieces.map(piece => (
              <a key={piece.key} href={piece.href} className="iho-piece">
                <div className="iho-piece__mark">
                  {piece.image ? <MediaImage image={piece.image} alt="" sizes="(max-width: 768px) 100vw, 380px" /> : <span>{imagePending}</span>}
                </div>
                <div className="iho-piece__price">{piece.price ?? pricePending}</div>
                <div className="iho-piece__name">{piece.name}</div>
                <span className="iho-piece__detail">
                  {detailLabel}
                  <svg aria-hidden="true" width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.4}>
                    <path d="M1.5 6h8M6.5 2.5 10 6 6.5 9.5" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
