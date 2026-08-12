'use client'

type Props = {
  name: string
  image: string
  category?: string
  href?: string
  ariaHidden?: boolean
}

export function ProductCard({ name, image, category, href = '#productos', ariaHidden }: Props) {
  return (
    <a
      href={href}
      aria-hidden={ariaHidden || undefined}
      tabIndex={ariaHidden ? -1 : undefined}
      className="iho-prod-card"
      style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
    >
      <div style={{ width: '100%', aspectRatio: '1/1', background: '#f1ece3', borderRadius: 4, overflow: 'hidden' }}>
        <img
          alt={ariaHidden ? '' : name}
          src={image}
          className="iho-prod-img"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
      {category && (
        <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, letterSpacing: '1.2px', color: '#8a8478', marginTop: 14 }}>
          {category}
        </div>
      )}
      <div style={{ fontFamily: '"Source Sans 3", sans-serif', fontSize: 16, color: '#17150f', marginTop: category ? 5 : 16 }}>
        {name}
      </div>
    </a>
  )
}
