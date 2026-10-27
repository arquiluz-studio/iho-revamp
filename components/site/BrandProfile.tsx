import { MediaImage } from '@/components/ui/MediaImage'
import type { ImageVM } from '@/lib/types/site'
import type { ProfilePiece } from './DesignerProfile'

export type BrandDesigner = {
  slug: string
  name: string
  href: string
  portrait: ImageVM | null
}

export function BrandProfile({
  brandsHref,
  brandsLabel,
  name,
  kicker,
  description,
  website,
  exclusive,
  solutions,
  logo,
  thin,
  exploreHref,
  exploreLabel,
  designersLabel,
  designersTitle,
  photoPending,
  productsLabel,
  productsTitle,
  pricePending,
  imagePending,
  detailLabel,
  designers,
  pieces,
}: {
  brandsHref: string
  brandsLabel: string
  name: string
  kicker?: string
  description: string[]
  website?: { href: string; label: string } | null
  exclusive?: string | null
  solutions: { href: string; label: string }[]
  logo: ImageVM | null
  thin?: boolean
  exploreHref?: string
  exploreLabel: string
  designersLabel: string
  designersTitle: string
  photoPending: string
  productsLabel: string
  productsTitle: string
  pricePending: string
  imagePending: string
  detailLabel: string
  designers: BrandDesigner[]
  pieces: ProfilePiece[]
}) {
  return (
    <article className="iho-designer">
      <p className="iho-crumb">
        <a href={brandsHref}>{brandsLabel}</a>
        <span aria-hidden="true"> / </span>
        <span>{name}</span>
      </p>

      <div className="iho-designer-hero">
        <div>
          {kicker && <p className="iho-designer-kicker">{kicker}</p>}
          <h1>{name}</h1>
          {description.map(paragraph => (
            <p key={paragraph} className="iho-designer-bio">
              {paragraph}
            </p>
          ))}
          {website && (
            <a className="iho-designer-site" href={website.href} target="_blank" rel="noopener noreferrer">
              {website.label}
            </a>
          )}
          {exclusive && <p className="iho-designer-bio">{exclusive}</p>}
          {solutions.length > 0 && (
            <p className="iho-brand-solutions">
              {solutions.map(solution => (
                <a key={solution.href} href={solution.href}>
                  {solution.label}
                </a>
              ))}
            </p>
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
        <div className={thin ? 'iho-designer-portrait iho-designer-portrait--logo iho-designer-portrait--thin' : 'iho-designer-portrait iho-designer-portrait--logo'}>
          {logo ? <MediaImage image={logo} alt={name} sizes="(max-width: 768px) 100vw, 520px" /> : <span>{name}</span>}
        </div>
      </div>

      {designers.length > 0 && (
        <section id="disenadores" className="iho-designer-block" aria-labelledby="disenadores-title">
          <div className="iho-designer-heading">
            <p className="iho-designer-kicker">{designersLabel}</p>
            <h2 id="disenadores-title">{designersTitle}</h2>
          </div>
          <div className="iho-brand-cards">
            {designers.map(designer => (
              <a key={designer.slug} href={designer.href} className={designer.portrait ? 'iho-brand-tile iho-brand-tile--photo' : 'iho-brand-tile'}>
                <div className="iho-brand-tile__mark">
                  {designer.portrait ? (
                    <MediaImage image={designer.portrait} alt="" sizes="(max-width: 768px) 50vw, 240px" />
                  ) : (
                    <span className="iho-brand-tile__word iho-brand-tile__word--name">{photoPending}</span>
                  )}
                </div>
                <span className="iho-brand-tile__meta">
                  <span>{designer.name}</span>
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
            <p className="iho-designer-kicker">{productsLabel}</p>
            <h2 id="piezas-title">{productsTitle}</h2>
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
