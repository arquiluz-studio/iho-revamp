import { MediaImage } from '@/components/ui/MediaImage'
import { RichText, SectionLabel } from '@/components/ui/Section'
import { ACUMIN, MONO, SANS } from '@/components/ui/tokens'
import type { BrandVM, DesignerCardVM, EventVM, ImageVM, NavLink, ProjectCardVM } from '@/lib/types/site'
import type { SiteChrome } from '../HomeView'

export function PageShell({ chrome, children }: { chrome: SiteChrome; children: React.ReactNode }) {
  return (
    <div style={{ width: '100%', overflowX: 'hidden', background: '#faf7f1' }}>
      {chrome.banner}
      {chrome.header}
      <main>{children}</main>
      {chrome.footer}
    </div>
  )
}

export function PageHero({
  label,
  title,
  intro,
  image,
  children,
}: {
  label: string
  title: string
  intro?: string
  image?: ImageVM | null
  children?: React.ReactNode
}) {
  return (
    <section className="iho-page-hero">
      {image && <MediaImage image={image} priority sizes="100vw" />}
      <div className="iho-page-hero__inner">
        {label && <SectionLabel>{label}</SectionLabel>}
        {title && (
          <h1
            style={{
              fontFamily: ACUMIN,
              fontWeight: 800,
              fontSize: 'clamp(48px, 7vw, 86px)',
              lineHeight: 0.92,
              letterSpacing: '-1px',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            <RichText text={title} />
          </h1>
        )}
        {intro && (
          <p style={{ fontFamily: SANS, fontSize: 17, lineHeight: 1.6, color: 'rgba(255,255,255,0.82)', maxWidth: 620, margin: '24px 0 0' }}>
            <RichText text={intro} />
          </p>
        )}
        {children}
      </div>
    </section>
  )
}

export function HeroExtra({ children }: { children: string }) {
  return (
    <p style={{ fontFamily: SANS, fontSize: 17, lineHeight: 1.6, color: 'rgba(255,255,255,0.82)', maxWidth: 620, margin: '16px 0 0' }}>
      <RichText text={children} />
    </p>
  )
}

export function SectionHeading({ label, title }: { label: string; title?: string }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <SectionLabel>{label}</SectionLabel>
      {title && (
        <h2 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 44, lineHeight: 0.96, textTransform: 'uppercase', margin: 0, color: '#17150f' }}>
          <RichText text={title} />
        </h2>
      )}
    </div>
  )
}

export function ProjectCards({ projects, twoColumns }: { projects: ProjectCardVM[]; twoColumns?: boolean }) {
  return (
    <div className={twoColumns ? 'iho-card-grid iho-card-grid--two' : 'iho-card-grid'}>
      {projects.map(p => (
        <a key={p.key} href={p.href} style={{ display: 'block', color: 'inherit' }}>
          <div className="iho-proj-card">
            <MediaImage image={p.image} sizes="(max-width: 768px) 100vw, 33vw" />
            <div className="pc-grad" />
            <div style={{ position: 'absolute', left: 22, right: 22, bottom: 20, pointerEvents: 'none' }}>
              {p.meta && (
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '1.2px', color: '#ef483d', marginBottom: 8 }}>{p.meta}</div>
              )}
              <div
                className="pc-title"
                style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 24, lineHeight: 1, color: '#fff', textTransform: 'uppercase' }}
              >
                {p.title}
              </div>
              {p.description && (
                <div className="pc-desc" style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,0.9)' }}>
                  {p.description}
                </div>
              )}
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}

export function EventRow({ event }: { event: EventVM }) {
  return (
    <a href={event.href} className="iho-event-row">
      <div style={{ fontFamily: ACUMIN, fontWeight: 800, lineHeight: 0.9, color: event.isPast ? '#8a8478' : '#17150f' }}>
        <div style={{ fontSize: 56 }}>{event.day}</div>
        <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '1.5px', fontWeight: 400, marginTop: 6 }}>{event.month}</div>
      </div>
      <div>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '1.3px', color: '#ef483d', marginBottom: 8 }}>{event.typeLabel}</div>
        <h3 style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 32, lineHeight: 1, textTransform: 'uppercase', margin: '0 0 8px', color: '#17150f', transition: 'color 0.3s' }}>{event.title}</h3>
        <div style={{ fontFamily: SANS, fontSize: 14, color: '#7a756a' }}>{event.meta}</div>
      </div>
      <div style={{ height: 130, borderRadius: 4, overflow: 'hidden' }}>
        <MediaImage image={event.image} sizes="220px" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: event.isPast ? 'grayscale(0.4)' : undefined }} />
      </div>
    </a>
  )
}

export function DesignerCards({ designers }: { designers: DesignerCardVM[] }) {
  return (
    <div className="iho-product-grid">
      {designers.map(d => (
        <a key={d.key} href={d.href} className="iho-prod-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
          <div style={{ width: '100%', aspectRatio: '3/4', background: '#f1ece3', borderRadius: 4, overflow: 'hidden' }}>
            <MediaImage
              image={d.image}
              sizes="(max-width: 599px) 50vw, (max-width: 899px) 33vw, 300px"
              className="iho-prod-img"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          <div style={{ fontFamily: ACUMIN, fontWeight: 800, fontSize: 22, lineHeight: 1, textTransform: 'uppercase', color: '#17150f', marginTop: 16 }}>
            {d.name}
          </div>
          {d.meta && <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '1.2px', color: '#8a8478', marginTop: 8 }}>{d.meta}</div>}
        </a>
      ))}
    </div>
  )
}

export function BrandLogos({ brands }: { brands: BrandVM[] }) {
  return (
    <div className="iho-logo-grid">
      {brands.map(b => {
        const logo = (
          <MediaImage
            image={b.logo}
            alt={b.name}
            style={{ maxWidth: '100%', maxHeight: b.thin ? 104 : 60, objectFit: 'contain', width: 'auto', height: 'auto', opacity: 0.92 }}
          />
        )
        return b.href ? (
          <a key={b.slug} href={b.href} aria-label={b.name}>
            {logo}
          </a>
        ) : (
          <div key={b.slug}>{logo}</div>
        )
      })}
    </div>
  )
}

export function Chips({ links, current }: { links: NavLink[]; current?: string }) {
  if (!links.length) return null
  return (
    <div className="iho-chip-row">
      {links.map(l => (
        <a key={l.href} href={l.href} aria-current={l.href === current ? 'page' : undefined}>
          {l.label}
        </a>
      ))}
    </div>
  )
}

export function Facts({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  const visible = items.filter(i => i.value)
  if (!visible.length) return null
  return (
    <dl style={{ margin: 0, display: 'grid', gap: 18, borderTop: '1px solid rgba(20,18,12,0.12)', paddingTop: 22 }}>
      {visible.map(i => (
        <div key={i.label}>
          <dt style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '1.2px', color: '#8a8478', marginBottom: 6, textTransform: 'uppercase' }}>
            {i.label}
          </dt>
          <dd style={{ margin: 0, fontFamily: SANS, fontSize: 16, color: '#2c2920' }}>{i.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Prose({ paragraphs }: { paragraphs: string[] }) {
  if (!paragraphs.length) return null
  return (
    <div className="iho-prose">
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  )
}

export function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p style={{ fontFamily: SANS, fontSize: 16, color: '#8a8478', margin: 0 }}>{children}</p>
}
