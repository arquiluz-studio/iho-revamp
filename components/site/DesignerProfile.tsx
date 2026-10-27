import { MediaImage } from '@/components/ui/MediaImage'
import type { ImageVM } from '@/lib/types/site'

export type ProfileBrand = {
  slug: string
  name: string
  href: string
  logo: ImageVM | null
  thin?: boolean
}

export type ProfilePiece = {
  key: string
  name: string
  href: string
  price: string | null
  image: ImageVM | null
}

export function DesignerProfile({
  designersHref,
  designersLabel,
  name,
  kicker,
  bio,
  website,
  portrait,
  photoPending,
  exploreLabel,
  brandsLabel,
  collaborationsTitle,
  piecesLabel,
  piecesTitle,
  pricePending,
  imagePending,
  detailLabel,
  brands,
  pieces,
}: {
  designersHref: string
  designersLabel: string
  name: string
  kicker?: string
  bio: string[]
  website?: { href: string; label: string } | null
  portrait: ImageVM | null
  photoPending: string
  exploreLabel: string
  brandsLabel: string
  collaborationsTitle: string
  piecesLabel: string
  piecesTitle: string
  pricePending: string
  imagePending: string
  detailLabel: string
  brands: ProfileBrand[]
  pieces: ProfilePiece[]
}) {
  const exploreHref = brands.length > 0 ? '#colaboraciones' : pieces.length > 0 ? '#piezas' : undefined

  return (
    <article className="iho-designer">
      <p className="iho-crumb">
        <a href={designersHref}>{designersLabel}</a>
        <span aria-hidden="true"> / </span>
        <span>{name}</span>
      </p>

      <div className="iho-designer-hero">
        <div>
          {kicker && <p className="iho-designer-kicker">{kicker}</p>}
          <h1>{name}</h1>
          {bio.map(paragraph => (
            <p key={paragraph} className="iho-designer-bio">
              {paragraph}
            </p>
          ))}
          {website && (
            <a className="iho-designer-site" href={website.href} target="_blank" rel="noopener noreferrer">
              {website.label}
            </a>
          )}
          {exploreHref && (
            <a className="iho-explore" href={exploreHref}>
              {exploreLabel}
              <svg aria-hidden="true" width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.4}>
                <path d="M6 1.5v8M2.5 6.5 6 10l3.5-3.5" />
              </svg>
            </a>
          )}
        </div>
        <div className="iho-designer-portrait">
          {portrait ? (
            <MediaImage image={portrait} alt={name} sizes="(max-width: 768px) 100vw, 520px" />
          ) : (
            <span>{photoPending}</span>
          )}
        </div>
      </div>

      {brands.length > 0 && (
        <section id="colaboraciones" className="iho-designer-block" aria-labelledby="colaboraciones-title">
          <div className="iho-designer-heading">
            <p className="iho-designer-kicker">{brandsLabel}</p>
            <h2 id="colaboraciones-title">{collaborationsTitle}</h2>
          </div>
          <div className="iho-brand-cards">
            {brands.map(brand => (
              <a key={brand.slug} href={brand.href} className={brand.thin ? 'iho-brand-tile iho-brand-tile--thin' : 'iho-brand-tile'}>
                <div className="iho-brand-tile__mark">
                  {brand.logo ? <MediaImage image={brand.logo} alt="" /> : <span className="iho-brand-tile__word">{brand.name}</span>}
                </div>
                <span className="iho-brand-tile__meta">
                  <span>{brand.name}</span>
                  <svg aria-hidden="true" width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.4}>
                    <path d="M5 2.5 9.5 7 5 11.5" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {pieces.length > 0 && (
        <section id="piezas" className="iho-designer-block" aria-labelledby="piezas-title">
          <div className="iho-designer-heading">
            <p className="iho-designer-kicker">{piecesLabel}</p>
            <h2 id="piezas-title">{piecesTitle}</h2>
          </div>
          <div className="iho-piece-grid">
            {pieces.map(piece => (
              <a key={piece.key} href={piece.href} className="iho-piece">
                <div className="iho-piece__mark">
                  {piece.image ? <MediaImage image={piece.image} alt="" sizes="(max-width: 768px) 50vw, 280px" /> : <span>{imagePending}</span>}
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
