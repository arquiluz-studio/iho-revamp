import { useTranslations } from 'next-intl'
import { Arrow, ButtonArrow } from '@/components/ui/Arrow'
import { MediaImage } from '@/components/ui/MediaImage'
import { DisplayTitle, RichText, SectionLabel } from '@/components/ui/Section'
import { ACUMIN } from '@/components/ui/tokens'
import type { SolutionCardVM } from '@/lib/types/site'
import { StaggerGrid } from './StaggerGrid'

export function SolutionsGrid({ solutions, ctaHref, heading = true, background = '#f1ece3' }: { solutions: SolutionCardVM[]; ctaHref?: string; heading?: boolean; background?: string }) {
  const t = useTranslations('home.solutions')
  // In a 3-column grid the first card spans 2 columns when that fills the last row.
  const firstSpans = solutions.length % 3 === 2
  return (
    <section id={heading ? 'soluciones' : undefined} style={{ background }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: heading ? '88px 40px' : '72px 40px' }}>
        {heading && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 44 }}>
            <div>
              <SectionLabel>{t('label')}</SectionLabel>
              <DisplayTitle><RichText text={t('title')} /></DisplayTitle>
            </div>
            {ctaHref && (
              <a href={ctaHref} className="iho-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#ef483d', color: '#fff', padding: '13px 24px', borderRadius: 32, fontFamily: '"Source Sans 3", sans-serif', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                {t('cta')}
                <ButtonArrow w={14} h={12} />
              </a>
            )}
          </div>
        )}
        <StaggerGrid id="iho-solutions-grid" delay={120} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {solutions.map((a, i) => (
            <div key={`${a.num}-${a.title}`} className="iho-stagger" style={i === 0 && firstSpans ? { gridColumn: 'span 2' } : {}}>
              <a href={a.href} className="iho-solution-card" style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}>
                <MediaImage image={a.image} sizes="(max-width: 768px) 100vw, 66vw" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 38%, rgba(0,0,0,0.62) 100%)', pointerEvents: 'none' }} />
                <div className="ac-wash" />
                <div className="ac-num">{a.num}</div>
                <div style={{ position: 'absolute', left: 22, right: 56, bottom: 20 }}>
                  <div style={{ fontFamily: ACUMIN, fontWeight: 700, fontSize: 26, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{a.title}</div>
                  <div className="ac-desc">{a.description}</div>
                </div>
                <div className="ac-arrow"><Arrow w={22} h={19} /></div>
              </a>
            </div>
          ))}
        </StaggerGrid>
      </div>
    </section>
  )
}
